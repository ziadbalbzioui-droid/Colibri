import {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  useCallback,
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
  ) => Promise<{ error: string | null; role: UserRole | null; onboarding_complete: boolean | null }>;
  signInWithGoogle: (role: UserRole) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<Profile>) => Promise<{ error: string | null }>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/** Pure module-level fetch — no closure drift, no re-creation on render */
async function fetchProfileFromDB(uid: string): Promise<Profile | null> {
  console.log(`[DEBUG - DB] 📡 Lancement de la requête Supabase pour l'UID: ${uid}...`);
  const t0 = performance.now();
  
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", uid)
    .maybeSingle();
    
  const duration = Math.round(performance.now() - t0);
  
  return data ?? null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const initialised = useRef(false);
  const profileFetchedFor = useRef<string | null>(null);

  const applySession = useCallback(async (
    event: string,
    session: Session | null,
  ) => {
    console.log(`\n[DEBUG - EVENT] 🔔 Supabase a déclenché l'événement : ${event}`);
    console.log(`[DEBUG - STATE] 👤 Utilisateur présent dans la session ? ${!!session?.user}`);

    setSession(session);

    setUser((prev) => {
      if (prev?.id === session?.user?.id && prev?.email === session?.user?.email) return prev;
      return session?.user ?? null;
    });

    const shouldFetchProfile =
      session?.user &&
      (event === "SIGNED_IN" || event === "INITIAL_SESSION") &&
      profileFetchedFor.current !== session.user.id;
      
    console.log(`[DEBUG - LOGIC] 🤔 Doit-on fetcher le profil ? ${!!shouldFetchProfile}`);

    if (shouldFetchProfile && session?.user) {
      profileFetchedFor.current = session.user.id;
      
      try {
        const p = await fetchProfileFromDB(session.user.id);
        
        
        const pendingRole = localStorage.getItem("colibri_pending_role") as UserRole | null;
        if (pendingRole && event === "SIGNED_IN") {
          localStorage.removeItem("colibri_pending_role");
          const { error: ue } = await (supabase as any)
            .from("profiles")
            .update({ role: pendingRole })
            .eq("id", session.user.id);
          if (ue) console.error("[auth] update role error:", ue.message);
          setProfile(p ? { ...p, role: pendingRole } : null);
        } else {
          setProfile(p);
        }
      } finally {
        if (!initialised.current) {
          initialised.current = true;
          setLoading(false);
        }
      }
      return; 
    } 
    
    if (!session) {
      profileFetchedFor.current = null;
      setProfile(null);
    }

    if (!initialised.current) {
      initialised.current = true;
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(applySession);

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session && !initialised.current) {
        initialised.current = true;
        setLoading(false);
      }
    }).catch((err) => {
      if (!initialised.current) {
        initialised.current = true;
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [applySession]);

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
      options: {emailRedirectTo: `${window.location.origin}/onboarding`, data: { role, prenom, nom, ...extra } },
    });
    if (error) return { error: error.message };
    return { error: null };
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message, role: null, onboarding_complete: null };
    profileFetchedFor.current = data.user.id; 
    const p = await fetchProfileFromDB(data.user.id);
    setProfile(p);
    return {
      error: null,
      role: (p?.role as UserRole) ?? null,
      onboarding_complete: p?.onboarding_complete ?? null,
    };
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
    profileFetchedFor.current = null;
    setUser(null);
    setProfile(null);
    setSession(null);
    await supabase.auth.signOut();
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: "Non connecté" };
    const { error } = await (supabase as any)
      .from("profiles")
      .update(updates)
      .eq("id", user.id);
    if (error) {
      console.error("[updateProfile] error:", error.message, error);
      return { error: error.message };
    }
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