import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "../../lib/auth";
import { LoadingGuard } from "./LoadingGuard";

/** Protects /app routes (Profs only) */
export function AuthGuard() {
  const { user, profile, loading } = useAuth();

  // 1. On attend que l'initialisation (session + profil) soit terminée
  if (loading) return <LoadingGuard loading>{null}</LoadingGuard>;
  
  // 2. Pas de compte ? Dehors.
  if (!user) return <Navigate to="/" replace />;

  // 3. LA SÉCURITÉ ANTI-CRASH AU F5
  // L'utilisateur est là, mais le profil n'a pas pu être chargé (erreur réseau ou DB)
  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-red-50 text-red-600 p-4">
        <h1 className="text-2xl font-bold mb-2">Profil introuvable</h1>
        <p className="mb-4">Impossible de charger vos données. Veuillez vous reconnecter.</p>
        <button 
          onClick={() => window.location.href = '/'} 
          className="bg-red-600 text-white px-4 py-2 rounded font-bold"
        >
          Retour à l'accueil
        </button>
      </div>
    );
  }

  // 4. Séparation des rôles : les parents n'entrent pas ici
  if (profile.role === "parent") return <Navigate to="/parent" replace />;

  // 5. Tout est parfait, on affiche le tableau de bord / les cours
  return <Outlet />;
}

/** Protects /parent routes (Parents only) */
export function ParentGuard() {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingGuard loading>{null}</LoadingGuard>;
  if (!user) return <Navigate to="/" replace />;

  // État transitoire entre setUser et setProfile — pas une erreur permanente
  if (!profile) return <LoadingGuard loading>{null}</LoadingGuard>;

  // Séparation des rôles : les profs n'entrent pas ici
  if (profile.role === "prof") return <Navigate to="/app" replace />;

  // Onboarding non complété → forcer l'onboarding (sauf si on y est déjà)
  //if (!profile.onboarding_complete && !location.pathname.includes("/parent/onboarding")) {
  //  return <Navigate to="/parent/onboarding" replace />;
  //}

  return <Outlet />;
}

/** Protects /onboarding */
export function OnboardingGuard() {
  const { user, profile, loading } = useAuth();

  if (loading) return <LoadingGuard loading>{null}</LoadingGuard>;
  if (!user) return <Navigate to="/" replace />;
  
if (!profile) {
    return <LoadingGuard loading>{null}</LoadingGuard>;
  }

  // Si l'onboarding est déjà fait, on le renvoie à sa place
  if (profile.onboarding_complete) {
    return <Navigate to={profile.role === "prof" ? "/app" : "/parent"} replace />;
  }

  return <Outlet />;
}