import { useAuth } from "../../lib/auth";
import { Navigate } from "react-router";
import { LoadingGuard } from "../components/LoadingGuard";

// Importe tes sous-composants (adapte les chemins selon ton arborescence)
import { OnboardingParent } from "./OnboardingParent";
import { OnboardingProf } from "./OnboardingProf";


export function Onboarding() {
  const { profile } = useAuth();

  // Sécurité 1 : Ceinture et bretelles. On s'assure que le profil est chargé.
  if (!profile) {
    return <LoadingGuard loading>{null}</LoadingGuard>;
  }

  // Sécurité 2 : Si l'utilisateur a déjà fini, on le jette dehors s'il tente de forcer l'URL.
  if (profile.onboarding_complete) {
     return <Navigate to={profile.role === "prof" ? "/app" : "/parent"} replace />;
  }

  // 🚨 L'AIGUILLEUR : On affiche le bon bloc selon le rôle
  return (
    <div className="min-h-screen bg-muted/30">
      {profile.role === "parent" ? (
        <OnboardingParent  />
      ) : (
        <OnboardingProf />
      )}
    </div>
  );
}