/// <reference types="vite/client" />
import { useState, useEffect, useCallback } from "react";
import { useNavigate, Link, useLocation } from "react-router";
import {
  CheckCircle, ChevronRight, Info, Loader2, AlertCircle,
  PartyPopper, Mail, RefreshCw, KeyRound,
} from "lucide-react";
import logo from "@/assets/colibri.svg";
import { useAuth } from "../../../lib/auth";
import { supabase } from "../../../lib/supabase";

// ─── Step indicator ───────────────────────────────────────────
function StepBar({ current }: { current: number }) {
  const steps = ["Accès élève", "État civil", "Légal", "Vérification", "Activation", "Confirmation"];
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

// ─── Step 1 : État civil ──────────────────────────────────────
interface EtatCivilData {
  civilite: "M." | "Mme";
  prenom: string;
  nom_naissance: string;
  nom_usage: string;
  date_naissance: string;
  lieu_naissance_cp: string;
  lieu_naissance_ville: string;
  lieu_naissance_pays: string;
  adresse_postale: string;
}

function Step1EtatCivil({
  onNext,
  defaultPrenom,
}: {
  onNext: (data: EtatCivilData) => void;
  defaultPrenom: string;
}) {
  const [civilite, setCivilite] = useState<"M." | "Mme">("M.");
  const [prenom, setPrenom] = useState(defaultPrenom);
  const [nomNaissance, setNomNaissance] = useState("");
  const [nomUsage, setNomUsage] = useState("");
  const [dateNaissance, setDateNaissance] = useState("");
  const [lieuCp, setLieuCp] = useState("");
  const [lieuVille, setLieuVille] = useState("");
  const [lieuPays, setLieuPays] = useState("France");
  const [adresse, setAdresse] = useState("");

  const isValid =
    prenom.trim() &&
    nomNaissance.trim() &&
    dateNaissance &&
    lieuCp.trim() &&
    lieuVille.trim() &&
    lieuPays.trim() &&
    adresse.trim();

  const maxDate = new Date(Date.now() - 18 * 365.25 * 24 * 3600 * 1000)
    .toISOString()
    .split("T")[0];

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-1">État civil</h2>
        <p className="text-sm text-muted-foreground">
          Ces informations sont transmises à l'Urssaf pour activer votre service
          d'avance immédiate.
        </p>
      </div>

      {/* Civilité */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Civilité
        </label>
        <div className="flex gap-3">
          {(["M.", "Mme"] as const).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCivilite(c)}
              className={`flex-1 py-2.5 rounded-lg border-2 text-sm font-medium transition-colors ${
                civilite === c
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-border text-muted-foreground hover:border-primary/30"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Prénom */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Prénom
        </label>
        <input
          type="text"
          value={prenom}
          onChange={(e) => setPrenom(e.target.value)}
          required
          className="w-full px-3 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {/* Nom naissance + usage */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Nom de naissance
          </label>
          <input
            type="text"
            value={nomNaissance}
            onChange={(e) => setNomNaissance(e.target.value)}
            placeholder="DUPONT"
            required
            className="w-full px-3 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Nom d'usage{" "}
            <span className="font-normal text-muted-foreground">(si différent)</span>
          </label>
          <input
            type="text"
            value={nomUsage}
            onChange={(e) => setNomUsage(e.target.value)}
            placeholder="MARTIN"
            className="w-full px-3 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      {/* Date de naissance */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Date de naissance
        </label>
        <input
          type="date"
          value={dateNaissance}
          onChange={(e) => setDateNaissance(e.target.value)}
          max={maxDate}
          required
          className="w-full px-3 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {/* Lieu de naissance */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Lieu de naissance
        </label>
        <div className="grid grid-cols-3 gap-2">
          <input
            type="text"
            value={lieuCp}
            onChange={(e) => setLieuCp(e.target.value)}
            placeholder="Code postal"
            maxLength={10}
            required
            className="px-3 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <input
            type="text"
            value={lieuVille}
            onChange={(e) => setLieuVille(e.target.value)}
            placeholder="Ville"
            required
            className="px-3 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <input
            type="text"
            value={lieuPays}
            onChange={(e) => setLieuPays(e.target.value)}
            placeholder="Pays"
            required
            className="px-3 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      {/* Adresse postale */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Adresse postale complète
        </label>
        <textarea
          value={adresse}
          onChange={(e) => setAdresse(e.target.value)}
          placeholder={"12 rue des Lilas\n75011 Paris\nFrance"}
          rows={3}
          required
          className="w-full px-3 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
        />
      </div>

      <button
        type="button"
        disabled={!isValid}
        onClick={() =>
          onNext({
            civilite,
            prenom: prenom.trim(),
            nom_naissance: nomNaissance.trim(),
            nom_usage: nomUsage.trim(),
            date_naissance: dateNaissance,
            lieu_naissance_cp: lieuCp.trim(),
            lieu_naissance_ville: lieuVille.trim(),
            lieu_naissance_pays: lieuPays.trim(),
            adresse_postale: adresse.trim(),
          })
        }
        className="w-full bg-primary text-white py-3 rounded-xl font-medium hover:bg-primary/90 disabled:opacity-40 flex items-center justify-center gap-2"
      >
        Étape suivante <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

// ─── Step 2 : Légal ───────────────────────────────────────────
function Step2Legal({ onNext }: { onNext: () => void }) {
  const [cgu, setCgu] = useState(false);
  const [mandat, setMandat] = useState(false);

  const allChecked = cgu && mandat;

  const items = [
    {
      key: "cgu",
      checked: cgu,
      set: setCgu,
      label: (
        <>
          J'accepte les{" "}
          <a href="#" className="text-primary underline hover:text-primary/80">
            CGU et la politique de confidentialité de Colibri
          </a>
        </>
      ),
      info: "Les CGU définissent les droits et obligations entre vous et Colibri. Elles couvrent la protection de vos données personnelles, les modalités d'utilisation du service et les conditions de résiliation.",
    },
    {
      key: "mandat",
      checked: mandat,
      set: setMandat,
      label: "Je donne expressément mandat à Colibri (Tiers de Prestation) pour me lier au service d'Avance Immédiate de l'Urssaf et transmettre mes demandes de paiement.",
      info: "En tant que Tiers de Prestation agréé par l'Urssaf, Colibri peut effectuer les démarches en votre nom pour bénéficier de l'Avance Immédiate du crédit d'impôt (Art. 199 sexdecies du CGI). Ce mandat est révocable à tout moment depuis votre espace personnel.",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-1">Aspects légaux</h2>
        <p className="text-sm text-muted-foreground">
          Lisez et acceptez les points suivants pour continuer.
        </p>
      </div>

      <div className="space-y-4">
        {items.map(({ key, checked, set, label, info }) => (
          <label
            key={key}
            className={`flex gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
              checked
                ? "border-primary/40 bg-primary/5"
                : "border-border hover:border-primary/20"
            }`}
          >
            <div className="mt-0.5 shrink-0">
              <input
                type="checkbox"
                className="hidden"
                checked={checked}
                onChange={(e) => set(e.target.checked)}
              />
              <div
                className={`w-5 h-5 rounded flex items-center justify-center border-2 transition-colors ${
                  checked ? "bg-primary border-primary" : "border-border"
                }`}
              >
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

// ─── Step 1 : Code d'accès de l'enfant ───────────────────────
function Step1CodeAcces({ onNext, initialCode }: { onNext: () => void; initialCode?: string }) {
  const [code, setCode] = useState(initialCode ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-submit if code was pre-filled from URL
  useEffect(() => {
    if (initialCode) {
      handleSubmit();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const cleaned = code.replace(/\s/g, "").toUpperCase();

  async function handleSubmit() {
    if (!cleaned) return;
    setLoading(true);
    setError(null);
    try {
      const { error: rpcError } = await (supabase as any).rpc("lier_parent_eleve", { code_secret: cleaned });
      if (rpcError) throw new Error("Code invalide ou déjà utilisé. Vérifiez avec votre professeur.");
      sessionStorage.removeItem("colibri_parent_code");
      onNext();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la vérification du code.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-1">Code d'accès de votre enfant</h2>
        <p className="text-sm text-muted-foreground">
          Votre professeur vous a communiqué un code d'accès. Saisissez-le pour lier votre
          compte à l'espace de votre enfant.
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3">
        <KeyRound className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <p className="text-sm text-blue-700">
          Ce code vous a été fourni par le professeur de votre enfant. Contactez-le si vous
          ne l'avez pas encore reçu.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Code d'accès
        </label>
        <input
          type="text"
          value={code}
          onChange={(e) => {
            setCode(e.target.value.replace(/\s/g, "").toUpperCase());
            setError(null);
          }}
          placeholder="EX : ABC123"
          maxLength={20}
          className="w-full px-3 py-3 border border-border rounded-lg text-center tracking-widest font-mono text-lg uppercase focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        {error && (
          <div className="mt-2 flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}
      </div>

      <button
        type="button"
        disabled={!cleaned || loading}
        onClick={handleSubmit}
        className="w-full bg-primary text-white py-3 rounded-xl font-medium hover:bg-primary/90 disabled:opacity-40 flex items-center justify-center gap-2"
      >
        {loading
          ? <><Loader2 className="w-4 h-4 animate-spin" /> Vérification...</>
          : <><ChevronRight className="w-4 h-4" /> Étape suivante</>}
      </button>
    </div>
  );
}

// ─── Step 4 : Vérification URSSAF (loading) ──────────────────
function Step3Loading({ onDone }: { onDone: (cas: "cas1" | "cas2") => void }) {
  const [progress, setProgress] = useState(0);
  const onDoneStable = useCallback(onDone, []); // eslint-disable-line

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) return 100;
        return p + 2;
      });
    }, 40);
    // Auto-advance after ~2.2s
    const timer = setTimeout(() => {
      clearInterval(interval);
      setProgress(100);
      // Production: replace 'cas2' with actual URSSAF API response
      onDoneStable("cas2");
    }, 2200);
    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [onDoneStable]);

  const steps = [
    "Connexion sécurisée à l'Urssaf...",
    "Vérification de votre identité...",
    "Analyse de vos droits...",
  ];
  const currentLabel = steps[Math.floor((progress / 100) * steps.length)] ?? steps[steps.length - 1];

  return (
    <div className="text-center space-y-6 py-8">
      <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Vérification de vos droits auprès de l'Urssaf
        </h2>
        <p className="text-sm text-muted-foreground">{currentLabel}</p>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2">
        <div
          className="bg-primary h-2 rounded-full transition-all duration-100"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-xs text-muted-foreground">Cela peut prendre quelques secondes</p>
    </div>
  );
}

// ─── Step 5 : Activation ─────────────────────────────────────
function Step4Activation({
  cas,
  onConfirm,
  onLater,
}: {
  cas: "cas1" | "cas2";
  onConfirm: () => void;
  onLater: () => void;
}) {
  const [resent, setResent] = useState(false);

  function handleResend() {
    setResent(true);
    // TODO: call resend endpoint
    setTimeout(() => setResent(false), 3000);
  }

  if (cas === "cas1") {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-1">Autorisez Colibri</h2>
          <p className="text-sm text-muted-foreground">
            Vous êtes déjà enregistré au service d'avance immédiate de l'Urssaf.
          </p>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-green-700 font-medium text-sm">
            <CheckCircle className="w-5 h-5 shrink-0" /> Compte Urssaf existant trouvé
          </div>
          <p className="text-sm text-gray-700 leading-relaxed">
            L'Urssaf vient de vous envoyer un mail/SMS de confirmation. Veuillez simplement{" "}
            <strong>autoriser Colibri à se lier à votre compte</strong> en cliquant sur le lien
            reçu.
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700">
          Une fois que vous avez cliqué sur le lien, votre compte sera automatiquement activé.
          Vous pouvez fermer cette page et revenir plus tard.
        </div>

        <button
          type="button"
          onClick={handleResend}
          disabled={resent}
          className="w-full flex items-center justify-center gap-2 border border-border rounded-xl py-2.5 text-sm text-muted-foreground hover:text-foreground hover:border-primary/30 disabled:opacity-60 transition-colors"
        >
          {resent ? (
            <><CheckCircle className="w-4 h-4 text-green-500" /> Mail/SMS renvoyé !</>
          ) : (
            <><RefreshCw className="w-4 h-4" /> Renvoyer le mail/SMS</>
          )}
        </button>

        <button
          type="button"
          onClick={onConfirm}
          className="w-full bg-primary text-white py-3 rounded-xl font-medium hover:bg-primary/90 flex items-center justify-center gap-2"
        >
          J'ai autorisé Colibri <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  // CAS 2 : nouveau compte
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-1">Activez votre compte Urssaf</h2>
        <p className="text-sm text-muted-foreground">
          Votre inscription au service d'avance immédiate a été initialisée.
        </p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 space-y-3">
        <div className="flex items-center gap-2 text-amber-700 font-medium text-sm">
          <Mail className="w-5 h-5 shrink-0" /> Email de l'Urssaf envoyé
        </div>
        <p className="text-sm text-gray-700 leading-relaxed">
          Nous avons initialisé votre compte Urssaf ! Veuillez consulter votre boîte mail :{" "}
          <strong>l'Urssaf vous a envoyé un lien sécurisé</strong> pour créer votre mot de passe
          et renseigner votre RIB (IBAN) afin de mettre en place le prélèvement automatique.
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700">
        Une fois votre compte Urssaf activé, Colibri sera notifié automatiquement et votre
        service sera pleinement opérationnel.
      </div>

      <button
        type="button"
        onClick={handleResend}
        disabled={resent}
        className="w-full flex items-center justify-center gap-2 border border-border rounded-xl py-2.5 text-sm text-muted-foreground hover:text-foreground hover:border-primary/30 disabled:opacity-60 transition-colors"
      >
        {resent ? (
          <><CheckCircle className="w-4 h-4 text-green-500" /> Email renvoyé !</>
        ) : (
          <><RefreshCw className="w-4 h-4" /> Renvoyer un email</>
        )}
      </button>

      <button
        type="button"
        onClick={onLater}
        className="w-full bg-primary/10 text-primary py-3 rounded-xl font-medium hover:bg-primary/20 flex items-center justify-center gap-2"
      >
        Continuer plus tard depuis mon tableau de bord
      </button>
    </div>
  );
}

// ─── Step 6 : Confirmation ────────────────────────────────────
function Step5Confirmation({ prenom }: { prenom: string }) {
  const navigate = useNavigate();

  return (
    <div className="text-center space-y-6">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
        <PartyPopper className="w-10 h-10 text-green-600" />
      </div>
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Félicitations, {prenom} !
        </h2>
        <p className="text-muted-foreground">
          Votre inscription est confirmée. Bienvenue dans le service d'avance immédiate Colibri.
        </p>
      </div>
      <div className="bg-gradient-to-r from-primary/5 to-blue-50 border border-primary/20 rounded-xl p-5 text-left">
        <p className="text-sm font-medium text-gray-900 mb-3">Et maintenant ?</p>
        <ul className="space-y-2.5 text-sm text-muted-foreground">
          {[
            "Suivez les cours de votre enfant en temps réel",
            "Payez vos factures avec le crédit d'impôt déduit automatiquement",
            "Accédez à votre historique de séances à tout moment",
          ].map((text) => (
            <li key={text} className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              {text}
            </li>
          ))}
        </ul>
      </div>
      <button
        onClick={() => navigate("/parent")}
        className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary/90 flex items-center justify-center gap-2"
      >
        Accéder à mon tableau de bord <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────
export function OnboardingParent() {
  const { user, profile, updateProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [urssafCase, setUrssafCase] = useState<"cas1" | "cas2" | null>(null);

  const prenom = profile?.prenom ?? user?.user_metadata?.prenom ?? "";

const initialCode =
    user?.user_metadata?.code_invitation || 
    "";
  
    console.log("Initial code from URL or metadata:", initialCode);


  // Step order: 1=Code d'accès, 2=État civil, 3=Légal, 4=URSSAF loading, 5=Activation, 6=Confirmation
  const getInitialStep = (): number => {
    if (profile?.urssaf_status === "activation_pending") return 5; 
    if (initialCode == "") return 1; 
    return location.state?.skipToStep || 1;
  };
  const [step, setStep] = useState<number>(getInitialStep);

  // If resuming at step 5 (URSSAF activation), default to cas2
  useEffect(() => {
    if (step === 5 && !urssafCase) {
      setUrssafCase("cas2");
    }
  }, [step, urssafCase]);

  async function save(updates: Record<string, unknown>, nextStep: number) {
    setSaving(true);
    setSaveError(null);
    try {
      const { error } = await updateProfile(updates as Parameters<typeof updateProfile>[0]);
      if (error) { setSaveError(error); return; }
      setStep(nextStep);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Erreur inattendue");
    } finally {
      setSaving(false);
    }
  }

  const handleCodeAccesDone = () => setStep(2);

  const handleEtatCivil = (data: EtatCivilData) =>
    save({ ...data }, 3);

  const handleLegal = () =>
    save({
      parent_cgu_accepted: true,
      parent_mandat_urssaf_accepted: true,
      parent_cgu_accepted_at: new Date().toISOString(),
      parent_mandat_accepted_at: new Date().toISOString(),
    }, 4);

  // Step 4 : URSSAF loading → step 5 activation
  const handleUrssafResult = (cas: "cas1" | "cas2") => {
    setUrssafCase(cas);
    save({ urssaf_status: "activation_pending" }, 5);
  };

  const handleActivationConfirm = () =>
    save({ onboarding_complete: true, urssaf_status: "active" }, 6);

  const handleActivationLater = () => {
    navigate("/parent");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E3F2FD] via-white to-[#F0F7FF] flex flex-col">
      <header className="p-6 flex items-center justify-between">
        <Link to="/parent" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <img src={logo} alt="Colibri" className="w-9 h-9 rounded-xl shadow-sm" />
          <span className="text-xl font-semibold text-primary">Colibri</span>
        </Link>
        {step < 4 && (
          <Link
            to="/parent"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Continuer plus tard →
          </Link>
        )}
      </header>

      <main className="flex-1 flex items-start justify-center px-4 py-8">
        <div className="w-full max-w-lg">
          <StepBar current={step} />

          <div className="bg-white rounded-2xl border border-border shadow-sm p-8 relative">
            {saving && (
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

            {step === 1 && <Step1CodeAcces onNext={handleCodeAccesDone} initialCode={initialCode} />}
            {step === 2 && <Step1EtatCivil onNext={handleEtatCivil} defaultPrenom={prenom} />}
            {step === 3 && <Step2Legal onNext={handleLegal} />}
            {step === 4 && <Step3Loading onDone={handleUrssafResult} />}
            {step === 5 && urssafCase && (
              <Step4Activation
                cas={urssafCase}
                onConfirm={handleActivationConfirm}
                onLater={handleActivationLater}
              />
            )}
            {step === 6 && <Step5Confirmation prenom={prenom} />}
          </div>

          {step < 6 && step !== 4 && (
            <p className="text-center text-xs text-muted-foreground mt-4">
              Étape {step} sur 6 — vous pouvez continuer plus tard depuis votre tableau de bord
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
