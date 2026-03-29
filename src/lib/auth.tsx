import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "./supabase";
import type { Profile, UserRole } from "./database.types";

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (
    email: string,
    password: string,
    role: UserRole,
    prenom: string,
    nom: string,
    extra?: Partial<Profile>,
  ) => Promise<{ error: string | null }>;
  signIn: (
    email: string,
    password: string,
  ) => Promise<{ error: string | null; role: UserRole | null }>;
  signInWithGoogle: (role: UserRole) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<Profile>) => Promise<{ error: string | null }>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (uid: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", uid)
      .maybeSingle();
    setProfile(data ?? null);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id).finally(() => setLoading(false));
      else setLoading(false);
    }).catch(() => setLoading(false));

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchProfile(session.user.id);
          // Après OAuth Google : appliquer le rôle sélectionné avant la redirection
          const pendingRole = localStorage.getItem("colibri_pending_role") as UserRole | null;
          if (pendingRole && event === "SIGNED_IN") {
            localStorage.removeItem("colibri_pending_role");
            await supabase.from("profiles").update({ role: pendingRole }).eq("id", session.user.id);
            setProfile((p) => (p ? { ...p, role: pendingRole } : null));
          }
        } else {
          setProfile(null);
        }
      },
    );

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (
    email: string,
    password: string,
    role: UserRole,
    prenom: string,
    nom: string,
    extra?: Partial<Profile>,
  ) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { role, prenom, nom, ...extra },
      },
    });
    if (error) return { error: error.message };
    return { error: null };
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) return { error: error.message, role: null };
    const role = (data.user.user_metadata?.role as UserRole) ?? null;
    return { error: null, role };
  };

  const signInWithGoogle = async (role: UserRole) => {
    localStorage.setItem("colibri_pending_role", role);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
    if (error) return { error: error.message };
    return { error: null };
  };

  const signOut = async () => {
    setUser(null);
    setProfile(null);
    setSession(null);
    await supabase.auth.signOut();
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: "Non connecté" };
    const { error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", user.id);
    if (error) return { error: error.message };
    setProfile((p) => (p ? { ...p, ...updates } : null));
    return { error: null };
  };

  return (
    <AuthContext.Provider
      value={{ session, user, profile, loading, signUp, signIn, signInWithGoogle, signOut, updateProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
