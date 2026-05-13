import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  ChevronLeft, Lock, CheckCircle2, AlertTriangle,
  ExternalLink, Mail, Loader2, Shield, Info,
} from "lucide-react";
import { useAuth } from "../../../lib/auth";
import { validateIban, formatIban } from "../../../lib/validateIban";
import urssafLogo from "../../../assets/Urssaf_Baseline-RVB.jpg";

// ─── Design tokens ────────────────────────────────────────────────────────────

const LBL = "block text-[11px] font-semibold text-[#6B7280] uppercase tracking-widest mb-2";
const INP = [
  "w-full h-[40px] px-3.5 rounded-md border border-[#D1D5DB] bg-white",
  "text-[13.5px] text-[#111827] placeholder:text-[#C4C9D4]",
  "focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/15 focus:border-[#1D4ED8]",
  "transition-colors font-sans",
].join(" ");

// URSSAF type de voie codes
const TYPES_VOIE = [
  { code: "ALL",  label: "Allée" },
  { code: "AV",   label: "Avenue" },
  { code: "BD",   label: "Boulevard" },
  { code: "CAR",  label: "Carrefour" },
  { code: "CHE",  label: "Chemin" },
  { code: "CHS",  label: "Chaussée" },
  { code: "CITE", label: "Cité" },
  { code: "COR",  label: "Corniche" },
  { code: "CRS",  label: "Cours" },
  { code: "DOM",  label: "Domaine" },
  { code: "DSC",  label: "Descente" },
  { code: "ECA",  label: "Ecart" },
  { code: "ESP",  label: "Esplanade" },
  { code: "FG",   label: "Faubourg" },
  { code: "GR",   label: "Grande Rue" },
  { code: "HAM",  label: "Hameau" },
  { code: "HLE",  label: "Halle" },
  { code: "IMP",  label: "Impasse" },
  { code: "LD",   label: "Lieu Dit" },
  { code: "LOT",  label: "Lotissement" },
  { code: "MAR",  label: "Marché" },
  { code: "MTE",  label: "Montée" },
  { code: "PAS",  label: "Passage" },
  { code: "PL",   label: "Place" },
  { code: "PLN",  label: "Plaine" },
  { code: "PLT",  label: "Plateau" },
  { code: "PRO",  label: "Promenade" },
  { code: "PRQ",  label: "Presqu'île" },
  { code: "QUA",  label: "Quartier" },
  { code: "QUAI", label: "Quai" },
  { code: "R",    label: "Rue" },
  { code: "RES",  label: "Résidence" },
  { code: "ROC",  label: "Rocade" },
  { code: "RPT",  label: "Rond Point" },
  { code: "RTE",  label: "Route" },
  { code: "SEN",  label: "Sentier" },
  { code: "SQ",   label: "Square" },
  { code: "TPL",  label: "Terre-plein" },
  { code: "TRA",  label: "Traverse" },
  { code: "VLA",  label: "Villa" },
  { code: "VLGE", label: "Village" },
  { code: "VOI",  label: "Voie" },
  { code: "ZA",   label: "Zone Artisanale" },
  { code: "ZAC",  label: "Zone d'Aménagement Concerté" },
  { code: "ZAD",  label: "Zone d'Aménagement Différé" },
  { code: "ZI",   label: "Zone Industrielle" },
  { code: "ZUP",  label: "Zone à Urbaniser en Priorité" },
];

// COG 5-digit country codes (most common)
const CODE_PAYS_FRANCE = "99100";

// ─── Field wrapper ────────────────────────────────────────────────────────────

function Field({ label, children, info, note, span2 = true, optional }: {
  label: string; children: React.ReactNode;
  info?: React.ReactNode; note?: React.ReactNode; span2?: boolean; optional?: boolean;
}) {
  return (
    <div className={span2 ? "col-span-2" : "col-span-1"}>
      <label className={LBL}>
        {label}
        {optional && <span className="ml-1.5 normal-case font-normal text-[#9CA3AF] tracking-normal">— optionnel</span>}
      </label>
      {children}
      {note && (
        <p className="mt-2 pl-3 border-l-2 border-[#D1D5DB] text-[12px] text-[#6B7280] leading-relaxed">{note}</p>
      )}
      {info && (
        <div className="mt-2 flex gap-2 items-start rounded-md bg-[#F0F4FF] border border-[#C7D7FA] px-3 py-2">
          <Info className="w-3.5 h-3.5 text-[#3B5BDB] shrink-0 mt-px" />
          <span className="text-[12px] text-[#2C3E8C] leading-relaxed">{info}</span>
        </div>
      )}
    </div>
  );
}

// ─── Step labels ──────────────────────────────────────────────────────────────

const STEP_LABELS = ["Identité", "Adresse", "Banque", "Signature"];

// ─── Trust sidebar ────────────────────────────────────────────────────────────

const TRUST_BULLETS = [
  { icon: Lock,         text: "Connexion chiffrée HTTPS / TLS 1.3" },
  { icon: Shield,       text: "Données transmises directement à l'URSSAF — Colibri ne conserve pas votre RIB complet" },
  { icon: CheckCircle2, text: "Conforme RGPD · conservation légale fiscale 6 ans" },
  { icon: Info,         text: "Opéré par l'URSSAF et la Direction générale des Finances publiques" },
];

const STEP_CONTEXT: Record<number, { title: string; body: React.ReactNode }> = {
  1: {
    title: "Pourquoi ces informations ?",
    body: (
      <p className="text-[13px] text-[#6B7280] leading-relaxed">
        L'URSSAF vérifie votre identité fiscale pour ouvrir votre espace sur{" "}
        <strong className="text-[#374151]">particulier.urssaf.fr</strong>.
        Ces données doivent correspondre exactement à celles connues de la DGFiP
        (votre dernière déclaration de revenus).
      </p>
    ),
  },
  2: {
    title: "Votre adresse postale",
    body: (
      <p className="text-[13px] text-[#6B7280] leading-relaxed">
        L'adresse doit correspondre à celle de votre dernière déclaration de revenus.
        Le code commune INSEE (5 chiffres) est différent du code postal — vous le trouverez
        sur <strong className="text-[#374151]">insee.fr</strong>.
      </p>
    ),
  },
  3: {
    title: "Votre IBAN, à quoi ça sert ?",
    body: (
      <>
        <p className="text-[13px] text-[#6B7280] leading-relaxed mb-4">
          L'URSSAF l'utilise <strong className="text-[#374151]">uniquement</strong> pour
          prélever votre reste à charge. Colibri n'effectue aucun prélèvement sur cet IBAN.
        </p>
        <div className="rounded-md border border-[#E5E7EB] overflow-hidden text-[12.5px]">
          {[
            { l: "Facture déclarée",    v: "60 €",   blue: false },
            { l: "Crédit d'impôt État", v: "− 30 €", blue: true  },
            { l: "Vous payez",          v: "30 €",   blue: false, bold: true },
          ].map(({ l, v, blue, bold }) => (
            <div key={l} className={`flex justify-between px-4 py-2.5 border-b border-[#F3F4F6] last:border-0 ${bold ? "bg-[#F9FAFB]" : ""}`}>
              <span className="text-[#6B7280]">{l}</span>
              <span className={`font-semibold ${blue ? "text-[#1D4ED8]" : "text-[#111827]"}`}>{v}</span>
            </div>
          ))}
        </div>
      </>
    ),
  },
  4: {
    title: "Ce qui va se passer",
    body: (
      <ol className="space-y-3">
        {[
          "Vos informations sont transmises à l'URSSAF.",
          "Vous recevez un e-mail d'activation sous 24–48 h (no-reply@urssaf.fr).",
          "Vous activez votre espace sur particulier.urssaf.fr.",
          "Votre accès complet à Colibri est ouvert.",
        ].map((t, i) => (
          <li key={i} className="flex gap-3 items-start">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-px
              ${i === 3 ? "bg-[#1D4ED8] text-white" : "bg-[#F3F4F6] text-[#6B7280]"}`}>
              {i + 1}
            </div>
            <p className="text-[12.5px] text-[#6B7280] leading-relaxed">{t}</p>
          </li>
        ))}
      </ol>
    ),
  },
};

// ─── Intro page ───────────────────────────────────────────────────────────────

const TIMELINE = [
  {
    title: "Colibri crée votre compte URSSAF.",
    body:  "Vous n'avez rien à faire. Dès votre inscription sur Colibri, nous créons votre espace auprès de l'URSSAF en votre nom.",
  },
  {
    title: "Vous activez votre espace et renseignez votre IBAN.",
    body:  <span>Vous recevez un e-mail de l'URSSAF. Vous activez votre compte sur <a href="https://particulier.urssaf.fr" target="_blank" rel="noopener noreferrer" className="text-[#1D4ED8] font-medium hover:underline inline-flex items-center gap-0.5">particulier.urssaf.fr <ExternalLink className="w-3 h-3" /></a>, puis renseignez vos coordonnées bancaires.</span>,
  },
  {
    title: "Chaque mois, vous validez la facture en 48 h.",
    body:  "Colibri émet la demande de paiement. Vous avez 48 heures pour valider ou contester. Sans action, la facture est acceptée automatiquement.",
  },
  {
    title: "L'URSSAF prélève uniquement vos 50 %.",
    body:  "L'URSSAF débite votre compte du seul reste à charge. L'État règle l'autre moitié directement. Aucune avance, aucun remboursement à attendre.",
  },
];

function IntroPage({ onStart, onBack }: { onStart: () => void; onBack: () => void }) {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <header className="bg-white border-b border-[#E5E7EB] h-14 px-6 flex items-center justify-between sticky top-0 z-20">
        <button onClick={onBack}
          className="flex items-center gap-1.5 text-[13px] font-semibold text-[#6B7280] hover:text-[#111827] transition-colors">
          <ChevronLeft className="w-4 h-4" />
          Tableau de bord
        </button>
        <img src={urssafLogo} alt="Urssaf" className="h-5 object-contain opacity-35" />
      </header>

      <div className="max-w-[680px] mx-auto px-6 py-12">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#1D4ED8] bg-[#EFF6FF] border border-[#C7D7FA] rounded-full px-3 py-1">
          <Lock className="w-3 h-3" />
          Dispositif officiel URSSAF · DGFiP
        </span>

        <h1 className="text-[28px] font-bold text-[#111827] mt-5 mb-3 leading-tight tracking-tight">
          Activer votre Avance Immédiate<br />de crédit d'impôt
        </h1>
        <p className="text-[14.5px] text-[#6B7280] leading-relaxed mb-10 max-w-[520px]">
          Pour ne payer que votre part en temps réel — sans avance de trésorerie —
          vous devez ouvrir un espace sur le service URSSAF. Colibri vous guide
          à travers 4 étapes simples.
        </p>

        <p className="text-[10.5px] font-semibold text-[#9CA3AF] uppercase tracking-widest mb-4">Pourquoi vous demande-t-on tout ça ?</p>
        <div className="space-y-2.5 mb-12">
          {[
            {
              q: "Votre état civil (nom, prénom, date et lieu de naissance…)",
              a: "L'URSSAF ne crée pas de compte sur simple demande : elle vérifie votre identité auprès de la DGFiP en croisant ces données avec votre dernière déclaration de revenus. Sans correspondance exacte, l'ouverture du compte est impossible.",
            },
            {
              q: "Votre adresse et vos coordonnées",
              a: "L'URSSAF en a besoin pour créer votre espace et vous contacter. L'adresse doit être identique à celle de votre dernière déclaration de revenus.",
            },
            {
              q: "Votre IBAN",
              a: "L'URSSAF en a besoin pour mettre en place le mandat SEPA : c'est elle qui prélèvera uniquement votre reste à charge (50 % de la facture). Colibri ne touche pas à cet IBAN.",
            },
            {
              q: "Pourquoi je ne peux pas régler directement à Colibri ?",
              a: "Pour que le crédit d'impôt soit déduit en temps réel — et non remboursé un an plus tard — il faut obligatoirement passer par l'URSSAF. Il n'existe pas d'autre moyen légal pour bénéficier de cette déduction immédiate.",
            },
          ].map(({ q, a }) => (
            <div key={q} className="bg-white border border-[#E5E7EB] rounded-xl px-6 py-5">
              <p className="text-[13.5px] font-semibold text-[#111827] mb-2">{q}</p>
              <p className="text-[13px] text-[#6B7280] leading-relaxed">{a}</p>
            </div>
          ))}
        </div>

        <p className="text-[10.5px] font-semibold text-[#9CA3AF] uppercase tracking-widest mb-6">Votre parcours en 4 étapes</p>
        <div className="space-y-0 mb-12">
          {TIMELINE.map((step, i) => (
            <div key={i} className="flex gap-5">
              <div className="flex flex-col items-center shrink-0">
                <div className="w-8 h-8 rounded-full border border-[#D1D5DB] bg-white flex items-center justify-center z-10">
                  <span className="text-[12px] font-semibold text-[#374151]">{i + 1}</span>
                </div>
                {i < TIMELINE.length - 1 && <div className="w-px flex-1 bg-[#E5E7EB] my-1 min-h-[20px]" />}
              </div>
              <div className={i < TIMELINE.length - 1 ? "pb-7" : ""}>
                <p className="text-[14px] font-semibold text-[#111827] mb-1.5 mt-1">{step.title}</p>
                <p className="text-[13px] text-[#6B7280] leading-relaxed">{step.body}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-[#F3F4F6]">
            <img src={urssafLogo} alt="Urssaf" className="h-5 object-contain flex-shrink-0 opacity-60" />
            <p className="text-[12.5px] text-[#6B7280] leading-relaxed">
              Dispositif national opéré par l'<strong className="text-[#374151]">URSSAF</strong> et
              la <strong className="text-[#374151]">Direction générale des Finances publiques (DGFiP)</strong>.
            </p>
          </div>
          <div className="grid grid-cols-2 divide-x divide-[#F3F4F6] text-[12px] text-[#6B7280]">
            <div className="px-6 py-4">
              <p className="font-semibold text-[#374151] mb-1">Service optionnel</p>
              <p className="leading-relaxed">Si vous refusez, vous avancez 100 % des frais et récupérez votre crédit d'impôt l'année suivante.</p>
            </div>
            <div className="px-6 py-4">
              <p className="font-semibold text-[#374151] mb-1">Conditions d'accès</p>
              <p className="leading-relaxed">Compte bancaire domicilié en zone SEPA et au moins une déclaration de revenus effectuée en France.</p>
            </div>
          </div>
        </div>

        <button onClick={onStart}
          className="w-full mt-8 bg-[#1D4ED8] hover:bg-[#1E40AF] active:bg-[#1E3A8A] text-white text-[15px] font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 py-4">
          Remplir le formulaire — 4 étapes
          <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
        <p className="text-[11.5px] text-[#9CA3AF] text-center mt-3">Environ 10 minutes · Données sécurisées · Aucune avance requise</p>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function ParentActivation() {
  const { profile, updateProfile, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const alreadyPending = profile?.urssaf_status === "activation_pending";
  const alreadyActive  = profile?.urssaf_status === "active";
  useEffect(() => {
    if (!authLoading && alreadyActive) navigate("/parent", { replace: true });
  }, [authLoading, alreadyActive]);

  const [phase,       setPhase]       = useState<"intro"|"form">("intro");
  const [step,        setStep]        = useState<1|2|3|4>(1);
  const [done,        setDone]        = useState(false);
  const [saving,      setSaving]      = useState(false);
  const [globalError, setGlobalError] = useState<string|null>(null);

  useEffect(() => {
    if (phase === "form") window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  // ── Step 1 — Identité ─────────────────────────────────────────────────────
  const [civilite,                setCivilite]                = useState<"M."|"Mme"|"">("");
  const [nomNaissance,            setNomNaissance]            = useState("");
  const [nomUsage,                setNomUsage]                = useState("");
  const [prenoms,                 setPrenoms]                 = useState("");
  const [dateNaissance,           setDateNaissance]           = useState("");
  const [telephone,               setTelephone]               = useState("");
  const [adresseMail,             setAdresseMail]             = useState("");
  // lieu de naissance
  const [codePaysNaissance,       setCodePaysNaissance]       = useState(CODE_PAYS_FRANCE);
  const [codePaysNaissanceLibre,  setCodePaysNaissanceLibre]  = useState(""); // si étranger
  const [codeDept,                setCodeDept]                = useState("");
  const [codeCommuneNaissance,    setCodeCommuneNaissance]    = useState(""); // 3 chiffres
  const [libelleCommuneNaissance, setLibelleCommuneNaissance] = useState("");

  // ── Step 2 — Adresse postale ──────────────────────────────────────────────
  const [adresseNumeroVoie,     setAdresseNumeroVoie]     = useState("");
  const [adresseCodeTypeVoie,   setAdresseCodeTypeVoie]   = useState("");
  const [adresseLibelleVoie,    setAdresseLibelleVoie]    = useState("");
  const [adresseComplement,     setAdresseComplement]     = useState("");
  const [adresseLieuDit,        setAdresseLieuDit]        = useState("");
  const [adresseLibelleCommune, setAdresseLibelleCommune] = useState("");
  const [adresseCodeCommune,    setAdresseCodeCommune]    = useState(""); // 5 chiffres INSEE
  const [adresseCodePostal,     setAdresseCodePostal]     = useState("");

  // ── Step 3 — Coordonnées bancaires ────────────────────────────────────────
  const [iban,          setIban]          = useState("");
  const [ibanError,     setIbanError]     = useState<string|null>(null);
  const [bic,           setBic]           = useState("");
  const [ibanTitulaire, setIbanTitulaire] = useState("");

  // ── Step 4 — Signature ────────────────────────────────────────────────────
  const [consentData,   setConsentData]   = useState(false);
  const [consentMandat, setConsentMandat] = useState(false);

  // ── Validation ────────────────────────────────────────────────────────────
  const isNaissanceFrance = codePaysNaissance === CODE_PAYS_FRANCE;
  const telephoneValid = /^(\+33|0)[0-9]{9}$/.test(telephone.replace(/\s/g, ""));
  const emailValid     = adresseMail.includes("@") && adresseMail.includes(".");

  const step1Valid = !!civilite && !!nomNaissance.trim() && !!prenoms.trim() && !!dateNaissance &&
    telephoneValid && emailValid &&
    (!isNaissanceFrance || (!!codeDept.trim() && codeCommuneNaissance.length === 3 && !!libelleCommuneNaissance.trim()));

  const step2Valid = !!adresseNumeroVoie.trim() && !!adresseCodeTypeVoie &&
    !!adresseLibelleVoie.trim() && !!adresseLibelleCommune.trim() &&
    adresseCodeCommune.length === 5 && adresseCodePostal.length === 5;

  const step3Valid = !!iban.trim() && validateIban(iban) === null && !!bic.trim() && !!ibanTitulaire.trim();
  const step4Valid = consentData && consentMandat;
  const stepValid  = [step1Valid, step2Valid, step3Valid, step4Valid][step - 1];

  function handleIbanChange(val: string) {
    const fmt = formatIban(val);
    setIban(fmt);
    const clean = fmt.replace(/\s/g, "");
    setIbanError(clean.length >= 14 ? validateIban(fmt) : null);
  }

  function goNext() {
    if (step === 3) {
      const err = validateIban(iban);
      if (err) { setIbanError(err); return; }
    }
    setStep(s => (s + 1) as 1|2|3|4);
  }

  function goPrev() {
    if (step === 1) { setPhase("intro"); return; }
    setStep(s => (s - 1) as 1|2|3|4);
  }

  async function handleSubmit() {
    const err = validateIban(iban);
    if (err) { setIbanError(err); return; }
    setSaving(true); setGlobalError(null);

    const effectifCodePays = isNaissanceFrance ? CODE_PAYS_FRANCE : codePaysNaissanceLibre.trim();

    const { error } = await updateProfile({
      civilite:                        civilite as "M."|"Mme",
      nom_naissance:                   nomNaissance.trim().toUpperCase(),
      nom_usage:                       nomUsage.trim() || null,
      prenom:                          prenoms.trim(),
      date_naissance:                  dateNaissance,
      telephone_portable:              telephone.replace(/\s/g, ""),
      adresse_mail:                    adresseMail.trim().toLowerCase(),
      lieu_naissance_code_pays:        effectifCodePays,
      lieu_naissance_code_dept:        isNaissanceFrance ? codeDept.trim() : null,
      lieu_naissance_code_commune:     isNaissanceFrance ? codeCommuneNaissance.trim() : null,
      lieu_naissance_libelle_commune:  isNaissanceFrance ? libelleCommuneNaissance.trim().toUpperCase() : null,
      adresse_numero_voie:             adresseNumeroVoie.trim(),
      adresse_code_type_voie:          adresseCodeTypeVoie,
      adresse_libelle_voie:            adresseLibelleVoie.trim().toUpperCase(),
      adresse_complement:              adresseComplement.trim().toUpperCase() || null,
      adresse_lieu_dit:                adresseLieuDit.trim().toUpperCase() || null,
      adresse_libelle_commune:         adresseLibelleCommune.trim().toUpperCase(),
      adresse_code_commune:            adresseCodeCommune.trim(),
      adresse_code_postal:             adresseCodePostal.trim(),
      adresse_code_pays:               CODE_PAYS_FRANCE,
      iban:                            iban.replace(/\s/g, "").toUpperCase(),
      bic:                             bic.trim().toUpperCase(),
      iban_titulaire:                  ibanTitulaire.trim(),
      parent_cgu_accepted:             true,
      parent_mandat_urssaf_accepted:   true,
      parent_cgu_accepted_at:          new Date().toISOString(),
      parent_mandat_accepted_at:       new Date().toISOString(),
      urssaf_status:                   "activation_pending",
      onboarding_complete:             true,
    });
    setSaving(false);
    if (error) { setGlobalError("Une erreur est survenue. Vérifiez vos informations et réessayez."); return; }
    setDone(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // ── Success ───────────────────────────────────────────────────────────────
  if (done || alreadyPending) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center px-6 py-16">
        <div className="w-full max-w-lg">
          <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
            <div className="px-10 py-10 border-b border-[#F3F4F6] text-center">
              <div className="w-12 h-12 bg-[#F0FDF4] rounded-full flex items-center justify-center mx-auto mb-5 border border-[#BBF7D0]">
                <CheckCircle2 className="w-6 h-6 text-[#16A34A]" />
              </div>
              <h1 className="text-[22px] font-bold text-[#111827] tracking-tight mb-2">
                Demande transmise à l'URSSAF
              </h1>
              <p className="text-[13.5px] text-[#6B7280] leading-relaxed max-w-sm mx-auto">
                Vos informations ont été envoyées. L'URSSAF va vous contacter pour finaliser l'activation.
              </p>
            </div>
            <div className="divide-y divide-[#F3F4F6]">
              <div className="flex gap-4 px-8 py-5 items-start">
                <div className="w-8 h-8 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                  <Mail className="w-4 h-4 text-[#374151]" />
                </div>
                <div>
                  <p className="text-[13.5px] font-semibold text-[#111827] mb-1">Consultez votre boîte mail</p>
                  <p className="text-[12.5px] text-[#6B7280] leading-relaxed">
                    Un e-mail de <strong className="text-[#374151]">no-reply@urssaf.fr</strong> vous est envoyé
                    sous 24–48 h. Vérifiez vos courriers indésirables.
                  </p>
                </div>
              </div>
              <div className="flex gap-4 px-8 py-5 items-start">
                <div className="w-8 h-8 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                  <Lock className="w-4 h-4 text-[#374151]" />
                </div>
                <div>
                  <p className="text-[13.5px] font-semibold text-[#111827] mb-1">Accès en attente</p>
                  <p className="text-[12.5px] text-[#6B7280] leading-relaxed">
                    Votre accès complet à Colibri sera activé dès confirmation de votre espace URSSAF.
                  </p>
                </div>
              </div>
            </div>
            <div className="px-8 py-6">
              <button onClick={() => navigate("/parent")}
                className="w-full h-11 rounded-lg bg-[#111827] hover:bg-[#1F2937] text-white text-[14px] font-semibold transition-colors">
                Retour au tableau de bord
              </button>
            </div>
          </div>
          <div className="flex justify-center mt-6">
            <img src={urssafLogo} alt="Urssaf" className="h-5 object-contain opacity-25" />
          </div>
        </div>
      </div>
    );
  }

  // ── Intro ─────────────────────────────────────────────────────────────────
  if (phase === "intro") {
    return (
      <IntroPage
        onStart={() => { setPhase("form"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
        onBack={() => navigate("/parent")}
      />
    );
  }

  // ── Form ──────────────────────────────────────────────────────────────────
  const ctx = STEP_CONTEXT[step];

  return (
    <div className="min-h-screen bg-[#F8FAFC]">

      {/* Header */}
      <header className="bg-white border-b border-[#E5E7EB] sticky top-0 z-20 h-14 px-6 flex items-center justify-between">
        <button onClick={goPrev}
          className="flex items-center gap-1.5 text-[13px] font-semibold text-[#6B7280] hover:text-[#111827] transition-colors">
          <ChevronLeft className="w-4 h-4" />
          {step === 1 ? "Présentation" : "Précédent"}
        </button>

        <div className="flex items-center gap-1.5">
          {STEP_LABELS.map((label, i) => {
            const n = i + 1;
            return (
              <div key={n} className="flex items-center gap-1.5">
                <div className="flex items-center gap-1.5">
                  <div className={`flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-semibold shrink-0 transition-all
                    ${n < step  ? "bg-[#374151] text-white"
                    : n === step ? "bg-[#1D4ED8] text-white"
                                 : "bg-[#F3F4F6] text-[#9CA3AF]"}`}>
                    {n < step ? <CheckCircle2 className="w-3 h-3" /> : n}
                  </div>
                  <span className={`text-[12px] font-medium hidden sm:block transition-colors
                    ${n === step ? "text-[#111827]" : "text-[#9CA3AF]"}`}>
                    {label}
                  </span>
                </div>
                {i < STEP_LABELS.length - 1 && (
                  <div className={`w-4 h-px mx-1 ${n < step ? "bg-[#9CA3AF]" : "bg-[#E5E7EB]"}`} />
                )}
              </div>
            );
          })}
        </div>

        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#9CA3AF]">
          <Lock className="w-3 h-3" />
          Chiffré · URSSAF
        </div>
      </header>

      <div className="h-[2px] bg-[#F3F4F6]">
        <div className="h-full bg-[#1D4ED8] transition-all duration-500"
          style={{ width: `${(step / 4) * 100}%` }} />
      </div>

      {/* Body */}
      <div className="max-w-[1040px] mx-auto px-6 py-10">
        <div className="grid lg:grid-cols-[1fr_272px] gap-6 items-start">

          {/* ── Form card ── */}
          <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">

            <div className="px-10 pt-9 pb-7 border-b border-[#F3F4F6]">
              <p className="text-[10.5px] font-semibold text-[#1D4ED8] uppercase tracking-widest mb-2">
                Étape {step} sur 4
              </p>
              <h1 className="text-[22px] font-bold text-[#111827] mb-2 tracking-tight">
                {step === 1 && "Votre identité"}
                {step === 2 && "Votre adresse postale"}
                {step === 3 && "Coordonnées bancaires"}
                {step === 4 && "Vérification & signature"}
              </h1>
              <p className="text-[13.5px] text-[#6B7280] leading-relaxed max-w-xl">
                {step === 1 && "Saisissez ces informations exactement comme sur vos documents officiels — elles seront vérifiées par l'URSSAF auprès de la DGFiP."}
                {step === 2 && "L'adresse doit correspondre à celle de votre dernière déclaration de revenus. Tous les champs sont obligatoires sauf mention contraire."}
                {step === 3 && "Votre IBAN sera utilisé par l'URSSAF pour prélever votre reste à charge (50 %). Colibri n'effectue aucun prélèvement sur ce compte."}
                {step === 4 && "Relisez vos informations avant de valider. Cette transmission déclenche l'ouverture de votre espace URSSAF."}
              </p>
            </div>

            <div className="px-10 py-9">

              {/* ── STEP 1 — Identité ── */}
              {step === 1 && (
                <div className="grid grid-cols-2 gap-x-6 gap-y-6">

                  <Field label="Civilité *">
                    <div className="flex gap-2">
                      {(["M.", "Mme"] as const).map(v => (
                        <button key={v} type="button" onClick={() => setCivilite(v)}
                          className="px-4 h-[40px] rounded-md border text-[13px] font-medium transition-all"
                          style={{
                            borderColor: civilite === v ? "#1D4ED8" : "#D1D5DB",
                            color:       civilite === v ? "#1D4ED8" : "#6B7280",
                            background:  civilite === v ? "#EFF6FF" : "#fff",
                          }}>
                          {v}
                        </button>
                      ))}
                    </div>
                  </Field>

                  <div className="col-span-1" />

                  <Field label="Nom de naissance *"
                    note="Nom de naissance, pas nom marital — utilisé pour la vérification fiscale.">
                    <input className={INP} value={nomNaissance}
                      onChange={e => setNomNaissance(e.target.value.toUpperCase())}
                      placeholder="Tel qu'il figure sur votre acte de naissance" />
                  </Field>

                  <Field label="Nom d'usage" span2={false} optional>
                    <input className={INP} value={nomUsage}
                      onChange={e => setNomUsage(e.target.value.toUpperCase())}
                      placeholder="Si différent du nom de naissance" />
                  </Field>

                  <Field label="Prénom(s) *"
                    note="Sans accent, tiret pour prénom composé. Ex : JEAN-MARIE">
                    <input className={INP} value={prenoms}
                      onChange={e => setPrenoms(e.target.value)}
                      placeholder="Tels qu'ils figurent sur votre état civil" />
                  </Field>

                  <Field label="Date de naissance *" span2={false}>
                    <input type="date" className={INP} value={dateNaissance}
                      onChange={e => setDateNaissance(e.target.value)}
                      max={new Date(Date.now() - 18 * 365.25 * 86400000).toISOString().slice(0, 10)} />
                  </Field>

                  {/* Lieu de naissance */}
                  <Field label="Pays de naissance *" span2={false}>
                    <select className={INP} value={codePaysNaissance}
                      onChange={e => setCodePaysNaissance(e.target.value)}>
                      <option value={CODE_PAYS_FRANCE}>France (99100)</option>
                      <option value="ETRANGER">Autre pays</option>
                    </select>
                  </Field>

                  {codePaysNaissance === "ETRANGER" && (
                    <Field label="Code pays COG (5 chiffres) *" span2={false}
                      info={<>Code numérique à 5 chiffres du pays de naissance. Ex : 99109 (Allemagne), 99132 (Espagne).</>}>
                      <input className={INP} value={codePaysNaissanceLibre} maxLength={5}
                        onChange={e => setCodePaysNaissanceLibre(e.target.value.replace(/\D/g, "").slice(0, 5))}
                        placeholder="5 chiffres — ex : 99109" />
                    </Field>
                  )}

                  {isNaissanceFrance && (<>
                    <Field label="Département de naissance *" span2={false}
                      note="2 ou 3 chiffres. Ex : 75 (Paris), 069 (Rhône), 971 (Guadeloupe).">
                      <input className={INP} value={codeDept} maxLength={3}
                        onChange={e => setCodeDept(e.target.value.replace(/[^0-9AB]/gi, "").slice(0, 3).toUpperCase())}
                        placeholder="Ex : 75, 069, 971" />
                    </Field>

                    <Field label="Code commune INSEE (3 chiffres) *" span2={false}
                      info={<>
                        Les 3 derniers chiffres du code INSEE complet. Paris = <strong>056</strong>, Lyon 8e = <strong>388</strong>.{" "}
                        <a href="https://www.insee.fr/fr/recherche?geo=COM" target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 font-semibold text-[#1D4ED8] hover:underline">
                          Trouver le mien <ExternalLink className="w-3 h-3" />
                        </a>
                      </>}>
                      <input className={INP} value={codeCommuneNaissance} maxLength={3}
                        onChange={e => setCodeCommuneNaissance(e.target.value.replace(/\D/g, "").slice(0, 3))}
                        placeholder="3 chiffres — ex : 056" />
                    </Field>

                    <Field label="Commune de naissance *">
                      <input className={INP} value={libelleCommuneNaissance}
                        onChange={e => setLibelleCommuneNaissance(e.target.value.toUpperCase())}
                        placeholder="Ex : PARIS, LYON8EARRONDISSEMENT" />
                    </Field>
                  </>)}

                  <Field label="Téléphone portable *" span2={false}
                    note='Format "0677889900" ou "+33677889900".'>
                    <input className={INP} type="tel" value={telephone}
                      onChange={e => setTelephone(e.target.value.replace(/[^\d+ ]/g, ""))}
                      placeholder="06 77 88 99 00" />
                  </Field>

                  <Field label="Adresse e-mail *" span2={false}
                    note="L'URSSAF vous enverra votre lien d'activation à cette adresse.">
                    <input className={INP} type="email" value={adresseMail}
                      onChange={e => setAdresseMail(e.target.value)}
                      placeholder="prenom.nom@exemple.fr" />
                  </Field>

                </div>
              )}

              {/* ── STEP 2 — Adresse postale ── */}
              {step === 2 && (
                <div className="grid grid-cols-2 gap-x-6 gap-y-6">

                  <Field label="Numéro de voie *" span2={false}>
                    <input className={INP} value={adresseNumeroVoie} maxLength={5}
                      onChange={e => setAdresseNumeroVoie(e.target.value.replace(/\D/g, ""))}
                      placeholder="Ex : 32" />
                  </Field>

                  <Field label="Type de voie *" span2={false}>
                    <select className={INP} value={adresseCodeTypeVoie}
                      onChange={e => setAdresseCodeTypeVoie(e.target.value)}>
                      <option value="">Sélectionner…</option>
                      {TYPES_VOIE.map(t => (
                        <option key={t.code} value={t.code}>{t.label} ({t.code})</option>
                      ))}
                    </select>
                  </Field>

                  <Field label="Libellé de la voie *"
                    note="Nom de la voie sans le type ni le numéro. Ex : Marcel Gotlib">
                    <input className={INP} value={adresseLibelleVoie}
                      onChange={e => setAdresseLibelleVoie(e.target.value.toUpperCase())}
                      placeholder="Ex : MARCEL GOTLIB" />
                  </Field>

                  <Field label="Complément d'adresse" optional>
                    <input className={INP} value={adresseComplement}
                      onChange={e => setAdresseComplement(e.target.value.toUpperCase())}
                      placeholder="Bâtiment, escalier, appartement…" />
                  </Field>

                  <Field label="Lieu-dit" optional>
                    <input className={INP} value={adresseLieuDit}
                      onChange={e => setAdresseLieuDit(e.target.value.toUpperCase())}
                      placeholder="Ex : LES HAUTS DE SEINE" />
                  </Field>

                  <div className="col-span-1" />

                  <Field label="Code postal *" span2={false}>
                    <input className={INP} value={adresseCodePostal} maxLength={5}
                      onChange={e => setAdresseCodePostal(e.target.value.replace(/\D/g, "").slice(0, 5))}
                      placeholder="Ex : 69008" />
                  </Field>

                  <Field label="Commune *" span2={false}>
                    <input className={INP} value={adresseLibelleCommune}
                      onChange={e => setAdresseLibelleCommune(e.target.value.toUpperCase())}
                      placeholder="Ex : LYON" />
                  </Field>

                  <Field label="Code commune INSEE (5 chiffres) *"
                    info={<>
                      Code à 5 chiffres différent du code postal. Ex : 69388 (Lyon 8e), 75056 (Paris).{" "}
                      <a href="https://www.insee.fr/fr/recherche?geo=COM" target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 font-semibold text-[#1D4ED8] hover:underline">
                        Trouver le mien <ExternalLink className="w-3 h-3" />
                      </a>
                    </>}>
                    <input className={INP} value={adresseCodeCommune} maxLength={5}
                      onChange={e => setAdresseCodeCommune(e.target.value.replace(/\D/g, "").slice(0, 5))}
                      placeholder="5 chiffres — ex : 69388" />
                  </Field>

                </div>
              )}

              {/* ── STEP 3 — Banque ── */}
              {step === 3 && (
                <div className="grid grid-cols-2 gap-x-6 gap-y-6">

                  <Field label="IBAN *"
                    note="Visible sur votre RIB ou dans votre espace bancaire en ligne.">
                    <input
                      className={`${INP} font-mono uppercase tracking-widest`}
                      style={{ borderColor: ibanError ? "#EF4444" : undefined }}
                      value={iban} onChange={e => handleIbanChange(e.target.value)}
                      placeholder="FR76 XXXX XXXX XXXX XXXX XXXX XXX"
                      maxLength={42} />
                    {ibanError && (
                      <p className="mt-2 text-[12px] text-[#DC2626] flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />{ibanError}
                      </p>
                    )}
                    {!ibanError && iban.replace(/\s/g, "").length >= 14 && validateIban(iban) === null && (
                      <p className="mt-2 text-[12px] text-[#16A34A] flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />IBAN valide
                      </p>
                    )}
                  </Field>

                  <Field label="Code BIC / SWIFT *" span2={false}
                    note="8 ou 11 caractères, visible sur votre RIB.">
                    <input className={`${INP} font-mono uppercase`}
                      value={bic} onChange={e => setBic(e.target.value.toUpperCase().replace(/\s/g, "").slice(0, 11))}
                      placeholder="Ex : AGRIFRPP" />
                  </Field>

                  <Field label="Titulaire du compte *" span2={false}
                    note="Nom tel qu'il figure sur votre RIB.">
                    <input className={INP} value={ibanTitulaire}
                      onChange={e => setIbanTitulaire(e.target.value)}
                      placeholder="Ex : M. Belle Lurette" />
                  </Field>

                </div>
              )}

              {/* ── STEP 4 — Récap & signature ── */}
              {step === 4 && (
                <div className="space-y-6">

                  <div className="rounded-lg border border-[#E5E7EB] overflow-hidden">
                    <div className="bg-[#F9FAFB] px-5 py-3 border-b border-[#E5E7EB]">
                      <span className="text-[10.5px] font-semibold text-[#6B7280] uppercase tracking-widest">Récapitulatif</span>
                    </div>

                    {[
                      {
                        section: "Identité",
                        rows: [
                          ["Civilité",          civilite],
                          ["Nom de naissance",  nomNaissance],
                          ...(nomUsage ? [["Nom d'usage", nomUsage]] : []),
                          ["Prénom(s)",         prenoms],
                          ["Date de naissance", dateNaissance ? new Date(dateNaissance + "T00:00:00").toLocaleDateString("fr-FR") : "—"],
                          ["Pays naissance",    isNaissanceFrance ? `France (${CODE_PAYS_FRANCE})` : codePaysNaissanceLibre],
                          ...(isNaissanceFrance ? [
                            ["Département",     codeDept],
                            ["Code commune",    codeCommuneNaissance],
                            ["Commune",         libelleCommuneNaissance],
                          ] : []),
                          ["Téléphone",         telephone],
                          ["E-mail",            adresseMail],
                        ],
                      },
                      {
                        section: "Adresse",
                        rows: [
                          ["Voie",         `${adresseNumeroVoie} ${adresseCodeTypeVoie} ${adresseLibelleVoie}`.trim()],
                          ...(adresseComplement ? [["Complément",  adresseComplement]] : []),
                          ...(adresseLieuDit    ? [["Lieu-dit",    adresseLieuDit]]    : []),
                          ["Code postal",   adresseCodePostal],
                          ["Commune",       adresseLibelleCommune],
                          ["Code commune",  adresseCodeCommune],
                        ],
                      },
                      {
                        section: "Banque",
                        rows: [
                          ["IBAN",      iban.slice(0, 9) + " ····· " + iban.slice(-4)],
                          ["BIC",       bic],
                          ["Titulaire", ibanTitulaire],
                        ],
                      },
                    ].map(({ section, rows }) => (
                      <div key={section}>
                        <div className="px-5 py-2 border-b border-t border-[#F3F4F6] bg-[#FAFAFA]">
                          <span className="text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-widest">{section}</span>
                        </div>
                        <div className="divide-y divide-[#F9FAFB]">
                          {rows.map(([k, v]) => (
                            <div key={k} className="flex justify-between items-start gap-6 px-5 py-2.5">
                              <span className="text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-wider shrink-0">{k}</span>
                              <span className="text-[13px] text-[#374151] font-medium text-right">{v || "—"}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}

                    <div className="bg-[#F9FAFB] px-5 py-3 border-t border-[#E5E7EB]">
                      <button onClick={() => setStep(1)}
                        className="text-[12px] text-[#1D4ED8] hover:text-[#1E40AF] font-semibold underline underline-offset-2 transition-colors">
                        Modifier mes informations
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className={LBL}>Consentements requis *</p>
                    {[
                      {
                        id:    "data",
                        state: consentData,
                        set:   setConsentData,
                        text:  "J'accepte que Colibri transmette mes données à l'URSSAF et à la DGFiP dans le cadre du dispositif national d'Avance Immédiate de crédit d'impôt.",
                      },
                      {
                        id:    "mandat",
                        state: consentMandat,
                        set:   setConsentMandat,
                        text:  "J'autorise l'URSSAF à prélever mon reste à charge sur l'IBAN renseigné (mandat de prélèvement SEPA). Ce mandat est révocable à tout moment depuis mon espace URSSAF.",
                      },
                    ].map(({ id, state, set, text }) => (
                      <label key={id}
                        className="flex gap-4 items-start cursor-pointer p-4 rounded-lg border transition-all"
                        style={{
                          borderColor: state ? "#1D4ED8" : "#E5E7EB",
                          background:  state ? "#F0F4FF" : "#fff",
                        }}>
                        <div className="mt-0.5 w-5 h-5 rounded flex items-center justify-center shrink-0 border-2 transition-all"
                          style={{ borderColor: state ? "#1D4ED8" : "#D1D5DB", background: state ? "#1D4ED8" : "#fff" }}>
                          {state && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                          <input type="checkbox" checked={state} onChange={e => set(e.target.checked)} className="sr-only" />
                        </div>
                        <span className="text-[13px] text-[#374151] leading-relaxed">{text}</span>
                      </label>
                    ))}
                  </div>

                  {globalError && (
                    <div className="flex items-start gap-2.5 px-4 py-3 bg-[#FEF2F2] border border-[#FECACA] rounded-lg">
                      <AlertTriangle className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5" />
                      <p className="text-[12.5px] text-[#B91C1C]">{globalError}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-10 py-6 bg-[#F9FAFB] border-t border-[#F3F4F6] flex items-center justify-between">
              <button onClick={goPrev}
                className="text-[13px] font-semibold text-[#6B7280] hover:text-[#111827] transition-colors">
                ← {step === 1 ? "Présentation" : "Précédent"}
              </button>

              {step < 4 ? (
                <button onClick={goNext} disabled={!stepValid}
                  className="h-11 px-8 rounded-lg text-[14px] font-semibold transition-all"
                  style={{
                    background: stepValid ? "#1D4ED8" : "#F3F4F6",
                    color:      stepValid ? "#fff"    : "#D1D5DB",
                    cursor:     stepValid ? "pointer" : "not-allowed",
                  }}>
                  Continuer →
                </button>
              ) : (
                <button onClick={handleSubmit} disabled={!step4Valid || saving}
                  className="h-11 px-8 rounded-lg text-[14px] font-semibold transition-all flex items-center gap-2"
                  style={{
                    background: step4Valid && !saving ? "#1D4ED8" : "#F3F4F6",
                    color:      step4Valid && !saving ? "#fff"    : "#D1D5DB",
                    cursor:     step4Valid && !saving ? "pointer" : "not-allowed",
                  }}>
                  {saving
                    ? <><Loader2 className="w-4 h-4 animate-spin" />Transmission en cours…</>
                    : "Transmettre mes informations →"}
                </button>
              )}
            </div>
          </div>

          {/* ── Sidebar ── */}
          <div className="space-y-4 lg:sticky lg:top-20">

            <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
              <p className="text-[10.5px] font-semibold text-[#6B7280] uppercase tracking-widest mb-4">Sécurité</p>
              <div className="space-y-3.5">
                {TRUST_BULLETS.map(({ icon: Icon, text }, i) => (
                  <div key={i} className="flex gap-3 items-start">
                    <div className="w-6 h-6 bg-[#F9FAFB] border border-[#E5E7EB] rounded-md flex items-center justify-center shrink-0 mt-px">
                      <Icon className="w-3 h-3 text-[#6B7280]" />
                    </div>
                    <p className="text-[12px] text-[#6B7280] leading-relaxed">{text}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
              <p className="text-[10.5px] font-semibold text-[#6B7280] uppercase tracking-widest mb-3.5">{ctx.title}</p>
              {ctx.body}
            </div>

            <div className="bg-[#F3F4F6] rounded-xl p-5">
              <p className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-widest mb-2">Une question ?</p>
              <p className="text-[12.5px] text-[#6B7280] leading-relaxed mb-3">
                Notre équipe est disponible pour vous aider à compléter ce formulaire ou répondre à toute question sur l'Avance Immédiate.
              </p>
              <a href="mailto:contact@colibri-soutien.fr"
                className="text-[12.5px] font-semibold text-[#1D4ED8] hover:underline underline-offset-2 break-all">
                contact@colibri-soutien.fr
              </a>
            </div>

            <div className="flex items-center justify-center gap-2.5 py-1 opacity-30">
              <img src={urssafLogo} alt="Urssaf" className="h-4 object-contain" />
              <span className="text-[10px] text-[#6B7280] font-semibold">URSSAF · DGFiP</span>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
