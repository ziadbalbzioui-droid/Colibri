/// <reference types="vite/client" />
import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router";
import {
  CheckCircle, ChevronRight, Info, Loader2, AlertCircle,
  Building2, FileCheck, CreditCard, PartyPopper, Share2,
} from "lucide-react";
import logo from "@/assets/colibri.png";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../lib/auth";

// ─── Step indicator ───────────────────────────────────────────
function StepBar({ current }: { current: number }) {
  const steps = ["Compte", "Légal",  "SIRET", "Paiement", "Confirmation"];
  return (
    <div className="flex items-center gap-1 mb-8">
      {steps.map((label, i) => {
        const idx = i + 1;
        const done = idx < current;
        const active = idx === current;
        return (
          <div key={label} className="flex items-center gap-1 flex-1">
            <div className="flex flex-col items-center flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
                done ? "bg-primary text-white" : active ? "bg-primary/10 text-primary border-2 border-primary" : "bg-muted text-muted-foreground"
              }`}>
                {done ? <CheckCircle className="w-4 h-4" /> : idx}
              </div>
              <span className={`text-xs mt-1 hidden sm:block ${active ? "text-primary font-medium" : "text-muted-foreground"}`}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`h-0.5 flex-1 mx-1 mb-4 rounded ${done ? "bg-primary" : "bg-border"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Info tooltip ─────────────────────────────────────────────
function InfoBubble({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative inline-block ml-1.5">
      <button type="button" onClick={() => setOpen(!open)}
        className="w-4 h-4 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center hover:bg-blue-200 transition-colors">
        <Info className="w-2.5 h-2.5" />
      </button>
      {open && (
        <div className="absolute z-10 bottom-6 left-1/2 -translate-x-1/2 w-64 bg-gray-900 text-white text-xs rounded-lg p-3 shadow-lg">
          {text}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
        </div>
      )}
    </div>
  );
}

// ─── Step 1 : déjà fait dans Welcome ──────────────────────────
// L'étape 1 (compte) est gérée dans Welcome.tsx

// ─── Step 2 : SIRET ───────────────────────────────────────────


// ─── Step 3 : Légal ───────────────────────────────────────────
function Step3Legal({ onNext }: { onNext: () => void }) {
  const [cgu, setCgu] = useState(false);
  const [mandat, setMandat] = useState(false);
  const [competence, setCompetence] = useState(false);

  const allChecked = cgu && mandat && competence;

  const items = [
    {
      key: "cgu", checked: cgu, set: setCgu,
      label: "J'accepte les Conditions Générales d'Utilisation",
      info: "Les CGU définissent les droits et obligations entre vous et Colibri. Elles couvrent notamment la protection de vos données, les modalités de résiliation et la propriété intellectuelle.",
    },
    {
      key: "mandat", checked: mandat, set: setMandat,
      label: "Je donne expressément mandat à Colibri pour générer mes factures en mon nom et encaisser les paiements via Stripe",
      info: "Le mandat de facturation (Art. 289 I-2 CGI) autorise Colibri à émettre des factures en votre nom. Vous restez juridiquement responsable et recevez une copie de chaque facture. Le mandat est révocable à tout moment.",
    },
    {
      key: "competence", checked: competence, set: setCompetence,
      label: "Je certifie détenir les compétences requises pour enseigner et disposer d'un extrait de casier judiciaire (B3) vierge",
      info: "La loi impose que toute personne travaillant auprès de mineurs dispose d'un casier judiciaire B3 vierge. Cette attestation sur l'honneur vous engage personnellement.",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-1">Aspect légal</h2>
        <p className="text-sm text-muted-foreground">Lisez et acceptez les 3 points suivants pour continuer.</p>
      </div>

      <div className="space-y-4">
        {items.map(({ key, checked, set, label, info }) => (
          <label key={key} className={`flex gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
            checked ? "border-primary/40 bg-primary/5" : "border-border hover:border-primary/20"
          }`}>
            <div className="mt-0.5 shrink-0">
              <input type="checkbox" className="hidden" checked={checked} onChange={(e) => set(e.target.checked)} />
              <div className={`w-5 h-5 rounded flex items-center justify-center border-2 transition-colors ${
                checked ? "bg-primary border-primary" : "border-border"
              }`}>
                {checked && <CheckCircle className="w-3.5 h-3.5 text-white" />}
              </div>
            </div>
            <div className="flex-1 text-sm text-gray-700 leading-relaxed">
              {label}
              <InfoBubble text={info} />
            </div>
          </label>
        ))}
      </div>

      <button
        type="button"
        disabled={!allChecked}
        onClick={onNext}
        className="w-full bg-primary text-white py-3 rounded-xl font-medium hover:bg-primary/90 disabled:opacity-40 flex items-center justify-center gap-2"
      >
        Étape suivante <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}


function Step2Siret({ onNext, onSkip, prenom }: { onNext: (data: { siret: string; nom_entreprise: string; adresse: string }) => void; onSkip: () => void; prenom: string }) {
  const [siret, setSiret] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ nom_entreprise: string; adresse: string } | null>(null);

  async function verifySiret() {
    const clean = siret.replace(/\s/g, "");
    if (clean.length !== 14) { setError("Le SIRET doit contenir 14 chiffres"); return; }
    setLoading(true);
    setError(null);
    try {
      const apiKey = import.meta.env.VITE_INSEE_API_KEY as string;
      if (!apiKey) throw new Error("Clé API INSEE manquante");

      const res = await fetch(`https://api.insee.fr/api-sirene/3.11/siret/${clean}`, {
        headers: {
          "Accept": "application/json",
          "X-INSEE-Api-Key-Integration": apiKey,
        },
      });
      if (res.status === 404) throw new Error("SIRET introuvable dans le répertoire Sirene");
      if (res.status === 403) throw new Error("SIRET non diffusible (entreprise protégée)");
      if (!res.ok) throw new Error(`Erreur API INSEE (${res.status})`);

      const json = await res.json();
      const etab = json.etablissement;
      const periodes = etab?.periodesEtablissement;
      const etat = periodes?.[0]?.etatAdministratifEtablissement;
      if (etat !== "A") throw new Error("Cette entreprise n'est pas au statut actif");

      const ul = etab?.uniteLegale;
      const nom_entreprise =
        ul?.denominationUniteLegale ??
        `${ul?.prenomUsuelUniteLegale ?? ul?.prenom1UniteLegale ?? ""} ${ul?.nomUniteLegale ?? ""}`.trim();

      const a = etab?.adresseEtablissement;
      const adresse = [
        a?.numeroVoieEtablissement,
        a?.typeVoieEtablissement,
        a?.libelleVoieEtablissement,
        a?.codePostalEtablissement,
        a?.libelleCommuneEtablissement,
      ].filter(Boolean).join(" ");

      setResult({ nom_entreprise, adresse });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur de vérification");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-1">Votre statut légal</h2>
        <p className="text-sm text-muted-foreground">
          Bonjour {prenom}, saisissez votre numéro SIRET auto-entrepreneur pour continuer.
        </p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-sm text-amber-800">
          Vous n'avez pas encore de statut auto-entrepreneur ?{" "}
          <a href="https://www.autoentrepreneur.urssaf.fr/portail/accueil/creer-mon-auto-entreprise.html"
            target="_blank" rel="noopener noreferrer" className="font-semibold underline hover:text-amber-900">
            Créez-le ici gratuitement →
          </a>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Numéro SIRET <span className="text-muted-foreground font-normal">(14 chiffres)</span>
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={siret}
            onChange={(e) => { setSiret(e.target.value); setResult(null); setError(null); }}
            placeholder="123 456 789 00012"
            maxLength={17}
            className="flex-1 px-3 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <button type="button" onClick={verifySiret} disabled={loading}
            className="px-4 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-60 flex items-center gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Vérifier"}
          </button>
        </div>
        {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
      </div>

      {result && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 space-y-1">
          <div className="flex items-center gap-2 text-green-700 font-medium text-sm mb-2">
            <CheckCircle className="w-4 h-4" /> Entreprise active trouvée
          </div>
          <p className="text-sm text-gray-900 font-medium">{result.nom_entreprise}</p>
          {result.adresse && <p className="text-sm text-muted-foreground">{result.adresse}</p>}
        </div>
      )}

      <button
        type="button"
        disabled={!result}
        onClick={() => result && onNext({ siret: siret.replace(/\s/g, ""), ...result })}
        className="w-full bg-primary text-white py-3 rounded-xl font-medium hover:bg-primary/90 disabled:opacity-40 flex items-center justify-center gap-2"
      >
        Étape suivante <ChevronRight className="w-4 h-4" />
      </button>

      <button type="button" onClick={onSkip}
        className="w-full text-sm text-muted-foreground hover:text-foreground py-2">
        Passer cette étape pour l'instant →
      </button>
    </div>
  );
}

// ─── Step 4 : Stripe ─────────────────────────────────────────
function Step4Stripe({ onNext, onSkip }: { onNext: () => void; onSkip: () => void }) {
  const [loading, setLoading] = useState(false);

  async function handleStripe() {
    setLoading(true);
    // TODO: appeler votre backend pour créer un Stripe Connect Express account
    // et rediriger vers l'URL d'onboarding Stripe
    // Pour l'instant on passe directement à l'étape suivante
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    onNext();
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-1">Configuration des paiements</h2>
        <p className="text-sm text-muted-foreground">
          Connectez votre compte bancaire via Stripe pour recevoir vos paiements et vérifier votre identité.
        </p>
      </div>

      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 rounded-2xl p-6 text-center">
        <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4">
          <CreditCard className="w-8 h-8 text-indigo-600" />
        </div>
        <h3 className="font-semibold text-gray-900 mb-2">Stripe Connect Express</h3>
        <p className="text-sm text-muted-foreground mb-1">Vérification d'identité sécurisée</p>
        <p className="text-sm text-muted-foreground">Renseignement de votre IBAN</p>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-xs text-blue-700 space-y-1">
        <p className="font-semibold">Ce que Stripe va vous demander :</p>
        <p>· Votre IBAN pour recevoir les paiements</p>
        <p>· Une pièce d'identité (carte nationale ou passeport)</p>
        <p>· Une photo de votre visage pour vérification</p>
      </div>

      <button
        type="button"
        onClick={handleStripe}
        disabled={loading}
        className="w-full bg-indigo-600 text-white py-3 rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-60 flex items-center justify-center gap-2"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Building2 className="w-4 h-4" />}
        Configurer mon compte bancaire et valider mon identité
      </button>

      <button type="button" onClick={onSkip}
        className="w-full text-sm text-muted-foreground hover:text-foreground py-2">
        Configurer plus tard →
      </button>
    </div>
  );
}

// ─── Step 5 : Confirmation ────────────────────────────────────
function Step5Confirmation({ prenom }: { prenom: string }) {
  const navigate = useNavigate();

  const shareText = encodeURIComponent("Je viens de rejoindre Colibri, la plateforme qui simplifie les cours particuliers ! Rejoins-moi 🎉");
  const shareUrl = encodeURIComponent("https://colibri.app");

  return (
    <div className="text-center space-y-6">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
        <PartyPopper className="w-10 h-10 text-green-600" />
      </div>

      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Bienvenue, {prenom} !</h2>
        <p className="text-muted-foreground">
          Votre inscription est confirmée. Tout est prêt pour commencer à gérer vos cours avec Colibri.
        </p>
      </div>

      <div className="bg-gradient-to-r from-primary/5 to-blue-50 border border-primary/20 rounded-xl p-5">
        <div className="flex items-center gap-2 text-primary font-medium text-sm mb-3">
          <Share2 className="w-4 h-4" /> Invitez vos collègues
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Partagez Colibri à vos collègues professeurs pour qu'ils profitent aussi de la plateforme.
        </p>
        <div className="flex gap-2 flex-wrap justify-center">
          <a
            href={`https://wa.me/?text=${shareText}%20${shareUrl}`}
            target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors"
          >
            WhatsApp
          </a>
          <a
            href={`sms:?body=${shareText}%20${shareUrl}`}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            SMS
          </a>
          <a
            href={`mailto:?subject=Découvre Colibri&body=${decodeURIComponent(shareText)}%20${decodeURIComponent(shareUrl)}`}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Email
          </a>
        </div>
      </div>

      <button
        onClick={() => navigate("/app")}
        className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary/90 flex items-center justify-center gap-2"
      >
        Accéder à mon dashboard <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

// ─── Main Onboarding ──────────────────────────────────────────
export function OnboardingProf() {
  const { user, profile, updateProfile } = useAuth();
  const [searchParams] = useSearchParams();
  const initialStep = Math.max(2, Math.min(5, Number(searchParams.get("step")) || 2));
  const [step, setStep] = useState(initialStep);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const prenom = profile?.prenom ?? user?.user_metadata?.prenom ?? "Prof";

  async function save(updates: Parameters<typeof updateProfile>[0], nextStep: number) {
    setSaving(true);
    setSaveError(null);
    try {
      const { error } = await updateProfile(updates);
      if (error) {
        console.error("[onboarding]", error);
        setSaveError(error);
        return;
      }
      setStep(nextStep);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erreur inattendue";
      console.error("[onboarding] exception:", msg, err);
      setSaveError(msg);
    } finally {
      setSaving(false);
    }
  }

  // Seul le SIRET est persisté en base, les autres étapes sont locales
  const handleSiretDone = (data: { siret: string; nom_entreprise: string; adresse: string }) =>
    save({ siret: data.siret }, 4);

  const handleSiretSkip = () =>
    setStep(4);

  const handleLegalDone = () => {
    setStep(3);
  };

  const handleStripeDone = () =>
    save({ onboarding_complete: true }, 5);

  const handleStripeSkip = () =>
    setStep(5);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E3F2FD] via-white to-[#F0F7FF] flex flex-col">
      <header className="p-6 flex items-center justify-between">
        <Link to="/app" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <img src={logo} alt="Colibri" className="w-9 h-9 rounded-xl shadow-sm" />
          <span className="text-xl font-semibold text-primary">Colibri</span>
        </Link>
      </header>

      <main className="flex-1 flex items-start justify-center px-4 py-8">
        <div className="w-full max-w-lg">
          <StepBar current={step} />

          <div className="bg-white rounded-2xl border border-border shadow-sm p-8 relative">
            {saving && step !== 5 && (
              <div className="absolute inset-0 bg-white/60 rounded-2xl flex items-center justify-center z-10">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            )}
            {saveError && (
              <div className="mb-4 flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {saveError}
              </div>
            )}

            {step === 2 && <Step3Legal onNext={handleLegalDone} />}
            {step === 3 && <Step2Siret onNext={handleSiretDone} onSkip={handleSiretSkip} prenom={prenom} />}
            {step === 4 && <Step4Stripe onNext={handleStripeDone} onSkip={handleStripeSkip} />}
            {step === 5 && <Step5Confirmation prenom={prenom} />}
          </div>

          {step < 5 && (
            <p className="text-center text-xs text-muted-foreground mt-4">
              Étape {step} sur 5 — vous pouvez continuer plus tard depuis votre profil
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
