import { AlertTriangle, CreditCard } from "lucide-react";
import { useNavigate } from "react-router";
import { useAuth } from "../../lib/auth";

export function StripeBanner() {
  const { profile } = useAuth();
  const navigate = useNavigate();

  if (profile?.role !== "prof") return null;
  if (profile?.stripe_onboarding_complete === true) return null;
  if (!profile?.siret) return null;

  return (
    <div className="bg-amber-50 border-b border-amber-200 px-4 py-3">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-start gap-2 flex-1 min-w-0">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800">
            <span className="font-semibold">Paiements non configurés.</span>{" "}
            Connectez votre compte Stripe pour recevoir vos paiements et vérifier votre identité.
          </p>
        </div>
        <button
          onClick={() => navigate("/onboarding?step=4")}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors shrink-0"
        >
          <CreditCard className="w-3.5 h-3.5" />
          Connecter Stripe
        </button>
      </div>
    </div>
  );
}
