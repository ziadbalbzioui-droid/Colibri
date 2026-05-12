import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  ChevronLeft, Lock, CheckCircle2, AlertTriangle,
  ExternalLink, Mail, Loader2, Shield, Info,
} from "lucide-react";
import { useAuth } from "../../../lib/auth";
import { validateIban, formatIban } from "../../../lib/validateIban";
import urssafLogo from "../../../assets/Urssaf_Baseline-RVB.jpg";

// ─── atoms ───────────────────────────────────────────────────────────────────

const LBL = "block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2";
const INP = [
  "w-full h-[52px] px-4 rounded-xl border border-slate-200 bg-white",
  "text-[14px] text-slate-900 placeholder:text-slate-300",
  "focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0052D4]/10 focus:border-[#0052D4]",
  "transition-all font-sans",
].join(" ");

function Fld({ label, children, hint, warn, span2 = true }: {
  label: string; children: React.ReactNode;
  hint?: string; warn?: React.ReactNode; span2?: boolean;
}) {
  return (
    <div className={span2 ? "col-span-2" : "col-span-1"}>
      <label className={LBL}>{label}</label>
      {children}
      {hint && <p className="mt-2 text-[11.5px] text-slate-400 leading-relaxed">{hint}</p>}
      {warn && (
        <div className="mt-2 flex gap-2.5 items-start rounded-lg px-3.5 py-2.5
                        bg-amber-50 border border-amber-100">
          {warn}
        </div>
      )}
    </div>
  );
}

// ─── trust sidebar ───────────────────────────────────────────────────────────

const TRUST_BULLETS = [
  { icon: Lock,    text: "Connexion chiffrée HTTPS / TLS 1.3" },
  { icon: Shield,  text: "Données transmises directement à l'URSSAF — Colibri ne conserve pas votre RIB complet" },
  { icon: CheckCircle2, text: "Conforme RGPD · conservation légale fiscale 6 ans" },
  { icon: Info,    text: "Opéré par l'URSSAF et la Direction générale des Finances publiques" },
];

const CONTEXT: Record<number, { title: string; body: React.ReactNode }> = {
  1: {
    title: "Pourquoi ces informations ?",
    body: (
      <p className="text-[13px] text-slate-500 leading-relaxed">
        L'URSSAF vérifie votre identité fiscale pour ouvrir votre espace sur{" "}
        <strong className="text-slate-700">particulier.urssaf.fr</strong>.
        Ces données doivent correspondre exactement à celles connues de la DGFiP
        (votre dernière déclaration de revenus).
      </p>
    ),
  },
  2: {
    title: "Votre IBAN, à quoi ça sert ?",
    body: (
      <>
        <p className="text-[13px] text-slate-500 leading-relaxed mb-5">
          L'URSSAF l'utilise <strong className="text-slate-700">uniquement</strong> pour prélever votre reste à charge.
          Colibri n'effectue aucun prélèvement sur cet IBAN.
        </p>
        <div className="space-y-2">
          {[
            ["Facture déclarée",   "60 €",  "slate"],
            ["Crédit d'impôt État","− 30 €","emerald"],
            ["Vous payez",         "30 €",  "blue"],
          ].map(([l, v, c]) => (
            <div key={l} className="flex justify-between text-[13px]">
              <span className="text-slate-500">{l}</span>
              <span className={`font-bold text-${c}-700`}>{v}</span>
            </div>
          ))}
        </div>
        <p className="text-[11.5px] text-slate-400 mt-3 leading-relaxed">
          Le même prix qu'un cours non déclaré — sans avance, sans remboursement en fin d'année.
        </p>
      </>
    ),
  },
  3: {
    title: "Ce qui va se passer",
    body: (
      <ol className="space-y-3.5">
        {[
          ["Vos informations sont transmises à l'URSSAF.", "slate"],
          ["Vous recevez un e-mail d'activation sous 24–48 h (expéditeur : no-reply@urssaf.fr).", "slate"],
          ["Vous activez votre espace sur particulier.urssaf.fr.", "slate"],
          ["Votre accès complet à Colibri est ouvert.", "blue"],
        ].map(([t], i) => (
          <li key={i} className="flex gap-3 items-start">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 mt-px
                            ${i === 3 ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"}`}>
              {i + 1}
            </div>
            <p className="text-[13px] text-slate-500 leading-relaxed">{t as string}</p>
          </li>
        ))}
      </ol>
    ),
  },
};

// ─── main ────────────────────────────────────────────────────────────────────

export function ParentActivation() {
  const { profile, updateProfile, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const alreadyPending = profile?.urssaf_status === "activation_pending";
  const alreadyActive  = profile?.urssaf_status === "active";
  useEffect(() => {
    if (!authLoading && alreadyActive) navigate("/parent", { replace: true });
  }, [authLoading, alreadyActive]);

  const [step,        setStep]        = useState<1|2|3>(1);
  const [done,        setDone]        = useState(false);
  const [saving,      setSaving]      = useState(false);
  const [globalError, setGlobalError] = useState<string|null>(null);

  // step 1
  const [civilite,      setCivilite]      = useState<"M."|"Mme"|"">(profile?.civilite ?? "");
  const [nomNaissance,  setNomNaissance]  = useState(profile?.nom_naissance ?? "");
  const [prenoms,       setPrenoms]       = useState(profile?.prenom ?? "");
  const [dateNaissance, setDateNaissance] = useState(profile?.date_naissance ?? "");
  const [pays,          setPays]          = useState<"FR"|"ETRANGER">(
    profile?.lieu_naissance_pays === "ETRANGER" ? "ETRANGER" : "FR"
  );
  const [codeInsee, setCodeInsee] = useState(profile?.lieu_naissance_cp ?? "");

  // step 2
  const [iban,      setIban]      = useState(formatIban(profile?.iban ?? ""));
  const [ibanError, setIbanError] = useState<string|null>(null);
  const [bic,       setBic]       = useState("");
  const [adresse,   setAdresse]   = useState(profile?.adresse_postale ?? "");

  // step 3
  const [consentData,   setConsentData]   = useState(false);
  const [consentMandat, setConsentMandat] = useState(false);

  const step1Valid = !!civilite && !!nomNaissance.trim() && !!prenoms.trim() && !!dateNaissance &&
                     (pays === "ETRANGER" || !!codeInsee.trim());
  const step2Valid = !!iban.trim() && validateIban(iban) === null && !!bic.trim() && !!adresse.trim();
  const step3Valid = consentData && consentMandat;

  function handleIbanChange(val: string) {
    const fmt = formatIban(val);
    setIban(fmt);
    const clean = fmt.replace(/\s/g, "");
    setIbanError(clean.length >= 14 ? validateIban(fmt) : null);
  }

  function goNext() {
    if (step === 2) {
      const err = validateIban(iban);
      if (err) { setIbanError(err); return; }
    }
    setStep(s => (s + 1) as 1|2|3);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function goPrev() {
    if (step === 1) { navigate("/parent"); return; }
    setStep(s => (s - 1) as 1|2|3);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit() {
    const err = validateIban(iban);
    if (err) { setIbanError(err); return; }
    setSaving(true); setGlobalError(null);
    const { error } = await updateProfile({
      civilite:                      civilite as "M."|"Mme",
      nom_naissance:                 nomNaissance.trim().toUpperCase(),
      prenom:                        prenoms.trim(),
      date_naissance:                dateNaissance,
      lieu_naissance_pays:           pays,
      lieu_naissance_cp:             pays === "FR" ? codeInsee.trim() : "",
      iban:                          iban.replace(/\s/g, "").toUpperCase(),
      adresse_postale:               adresse.trim(),
      parent_cgu_accepted:           true,
      parent_mandat_urssaf_accepted: true,
      parent_cgu_accepted_at:        new Date().toISOString(),
      parent_mandat_accepted_at:     new Date().toISOString(),
      urssaf_status:                 "activation_pending",
      onboarding_complete:           true,
    });
    setSaving(false);
    if (error) { setGlobalError("Une erreur est survenue. Vérifiez vos informations et réessayez."); return; }
    setDone(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // ── success ──────────────────────────────────────────────────────────────
  if (done || alreadyPending) {
    return (
      <div className="min-h-screen bg-[#F7F8FA] flex flex-col items-center justify-center px-6 py-16">
        <div className="w-full max-w-lg">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-10 py-10 border-b border-slate-100 text-center">
              <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-5">
                <CheckCircle2 className="w-7 h-7 text-emerald-500" />
              </div>
              <h1 className="text-[22px] font-extrabold text-slate-900 tracking-tight mb-2">
                Demande transmise à l'URSSAF
              </h1>
              <p className="text-[13.5px] text-slate-500 leading-relaxed max-w-sm mx-auto">
                Vos informations ont été envoyées. L'URSSAF va vous contacter pour finaliser l'activation.
              </p>
            </div>
            <div className="divide-y divide-slate-100">
              <div className="flex gap-4 px-8 py-5 items-start">
                <div className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                  <Mail className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-[13.5px] font-bold text-slate-900 mb-1">Consultez votre boîte mail</p>
                  <p className="text-[12.5px] text-slate-500 leading-relaxed">
                    Un e-mail de <strong className="text-slate-700">no-reply@urssaf.fr</strong> vous est envoyé sous 24–48 h avec un lien pour activer votre espace sur <strong className="text-slate-700">particulier.urssaf.fr</strong>. Vérifiez vos courriers indésirables.
                  </p>
                </div>
              </div>
              <div className="flex gap-4 px-8 py-5 items-start">
                <div className="w-8 h-8 bg-amber-50 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                </div>
                <div>
                  <p className="text-[13.5px] font-bold text-slate-900 mb-1">Accès en attente</p>
                  <p className="text-[12.5px] text-slate-500 leading-relaxed">
                    Votre accès complet à Colibri sera activé dès confirmation de votre espace URSSAF.
                  </p>
                </div>
              </div>
            </div>
            <div className="px-8 py-6">
              <button onClick={() => navigate("/parent")}
                className="w-full h-12 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-[14px] font-bold transition-colors">
                Retour au tableau de bord
              </button>
            </div>
          </div>
          <div className="flex justify-center mt-8">
            <img src={urssafLogo} alt="Urssaf" className="h-6 object-contain opacity-30" />
          </div>
        </div>
      </div>
    );
  }

  // ── form ─────────────────────────────────────────────────────────────────
  const ctx = CONTEXT[step];

  return (
    <div className="min-h-screen bg-[#F7F8FA]">

      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 h-14 px-6 flex items-center justify-between">
        <button onClick={goPrev}
          className="flex items-center gap-1.5 text-[13px] font-semibold text-slate-400 hover:text-slate-700 transition-colors">
          <ChevronLeft className="w-4 h-4" />
          {step === 1 ? "Tableau de bord" : "Précédent"}
        </button>

        {/* step pills */}
        <div className="flex items-center gap-2">
          {[1,2,3].map(n => (
            <div key={n} className="flex items-center gap-2">
              <div className={`flex items-center justify-center w-6 h-6 rounded-full text-[11px] font-bold transition-all
                ${n < step  ? "bg-emerald-500 text-white"
                : n === step ? "bg-[#0052D4] text-white"
                             : "bg-slate-100 text-slate-400"}`}>
                {n < step ? <CheckCircle2 className="w-3.5 h-3.5" /> : n}
              </div>
              {n < 3 && <div className={`w-8 h-px ${n < step ? "bg-emerald-400" : "bg-slate-200"}`} />}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400">
          <Lock className="w-3 h-3 text-emerald-500" />
          Chiffré · URSSAF
        </div>
      </header>

      {/* Full-width progress bar */}
      <div className="h-[3px] bg-slate-200">
        <div className="h-full bg-[#0052D4] transition-all duration-500"
          style={{ width: `${(step / 3) * 100}%` }} />
      </div>

      {/* Page body */}
      <div className="max-w-[1100px] mx-auto px-6 py-10">
        <div className="grid lg:grid-cols-[1fr_300px] xl:grid-cols-[1fr_320px] gap-6 items-start">

          {/* ── Form card ── */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

            {/* Card header */}
            <div className="px-10 pt-9 pb-7 border-b border-slate-100">
              <span className="text-[10.5px] font-bold uppercase tracking-widest text-[#0052D4]">
                Étape {step} sur 3
              </span>
              <h1 className="text-[24px] font-extrabold text-slate-900 mt-1.5 mb-1 tracking-tight">
                {step === 1 && "Votre état civil"}
                {step === 2 && "Vos coordonnées bancaires"}
                {step === 3 && "Vérification & signature"}
              </h1>
              <p className="text-[13.5px] text-slate-500 leading-relaxed">
                {step === 1 && "Saisissez ces informations exactement comme sur vos documents officiels — elles seront transmises à l'URSSAF pour vérification fiscale."}
                {step === 2 && "Votre IBAN sera utilisé par l'URSSAF pour prélever votre reste à charge (50 %). Colibri n'a pas accès à votre compte bancaire."}
                {step === 3 && "Relisez vos informations avant de valider. Cette transmission déclenche l'ouverture de votre espace URSSAF."}
              </p>
            </div>

            {/* Card body */}
            <div className="px-10 py-8">

              {/* ── STEP 1 ── */}
              {step === 1 && (
                <div className="grid grid-cols-2 gap-x-6 gap-y-5">

                  <Fld label="Civilité *">
                    <div className="flex gap-3">
                      {(["M.", "Mme"] as const).map(v => (
                        <button key={v} type="button" onClick={() => setCivilite(v)}
                          className="flex-1 h-[52px] rounded-xl border-2 text-[14px] font-bold transition-all"
                          style={{
                            borderColor: civilite === v ? "#0052D4" : "#E2E8F0",
                            color:       civilite === v ? "#0052D4" : "#94A3B8",
                            background:  civilite === v ? "#EFF6FF" : "#fff",
                          }}>
                          {v}
                        </button>
                      ))}
                    </div>
                  </Fld>

                  <div className="col-span-1" />

                  <Fld label="Nom de naissance *"
                    warn={<>
                      <span className="text-amber-600 font-bold text-[11px] shrink-0">⚠</span>
                      <span className="text-[11.5px] text-amber-800 leading-relaxed">
                        Nom de naissance, pas nom marital — utilisé pour la vérification fiscale.
                      </span>
                    </>}>
                    <input className={INP} value={nomNaissance}
                      onChange={e => setNomNaissance(e.target.value.toUpperCase())}
                      placeholder="Tel qu'il figure sur votre acte de naissance" />
                  </Fld>

                  <Fld label="Prénom(s) *" span2={false}
                    hint="Ex : JEAN-MARIE — sans accent, tiret pour prénom composé.">
                    <input className={INP} value={prenoms}
                      onChange={e => setPrenoms(e.target.value)}
                      placeholder="Prénom(s)" />
                  </Fld>

                  <Fld label="Date de naissance *" span2={false}>
                    <input type="date" className={INP} value={dateNaissance}
                      onChange={e => setDateNaissance(e.target.value)}
                      max={new Date(Date.now() - 18*365.25*86400000).toISOString().slice(0,10)} />
                  </Fld>

                  <Fld label="Pays de naissance *" span2={false}>
                    <select className={INP} value={pays}
                      onChange={e => setPays(e.target.value as "FR"|"ETRANGER")}>
                      <option value="FR">France</option>
                      <option value="ETRANGER">Autre pays</option>
                    </select>
                  </Fld>

                  {pays === "FR" && (
                    <Fld label="Code INSEE de la commune de naissance *"
                      warn={<>
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-px" />
                        <div>
                          <p className="text-[11.5px] text-amber-800 leading-relaxed mb-1">
                            <strong>Différent du code postal.</strong> Pour Paris : <strong>75056</strong> (pas 75001, 75002…).
                          </p>
                          <a href="https://www.insee.fr/fr/recherche?geo=COM" target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 hover:underline">
                            Trouver mon code INSEE <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </>}>
                      <input className={INP} value={codeInsee} maxLength={5}
                        onChange={e => setCodeInsee(e.target.value.replace(/\D/g,"").slice(0,5))}
                        placeholder="Ex : 75056, 69123…" />
                    </Fld>
                  )}
                </div>
              )}

              {/* ── STEP 2 ── */}
              {step === 2 && (
                <div className="grid grid-cols-2 gap-x-6 gap-y-5">

                  <Fld label="IBAN *"
                    hint="Visible sur votre RIB ou dans votre espace bancaire en ligne.">
                    <input
                      className={`${INP} font-mono uppercase tracking-widest`}
                      style={{ borderColor: ibanError ? "#F87171" : undefined }}
                      value={iban} onChange={e => handleIbanChange(e.target.value)}
                      placeholder="FR76 XXXX XXXX XXXX XXXX XXXX XXX"
                      maxLength={42} />
                    {ibanError && (
                      <p className="mt-2 text-[11.5px] text-red-500 flex items-center gap-1.5">
                        <AlertTriangle className="w-3 h-3 shrink-0" />{ibanError}
                      </p>
                    )}
                    {!ibanError && iban.replace(/\s/g,"").length >= 14 && validateIban(iban) === null && (
                      <p className="mt-2 text-[11.5px] text-emerald-600 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3 h-3 shrink-0" />IBAN valide
                      </p>
                    )}
                  </Fld>

                  <Fld label="Code BIC / SWIFT *" span2={false}
                    hint="8 ou 11 caractères, visible sur votre RIB.">
                    <input className={`${INP} font-mono uppercase`}
                      value={bic} onChange={e => setBic(e.target.value.toUpperCase().replace(/\s/g,"").slice(0,11))}
                      placeholder="Ex : BNPAFRPP" />
                  </Fld>

                  <Fld label="Adresse postale complète *"
                    hint="Doit correspondre à l'adresse de votre dernière déclaration de revenus.">
                    <textarea className={`${INP} h-auto py-3.5 resize-none`} rows={3}
                      value={adresse} onChange={e => setAdresse(e.target.value)}
                      placeholder={"Numéro et nom de rue\nCode postal et ville"} />
                  </Fld>
                </div>
              )}

              {/* ── STEP 3 ── */}
              {step === 3 && (
                <div className="space-y-6">

                  {/* Récap */}
                  <div className="rounded-xl border border-slate-200 overflow-hidden">
                    <div className="bg-slate-50 px-5 py-3 border-b border-slate-200">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Récapitulatif</span>
                    </div>
                    <div className="divide-y divide-slate-100">
                      {[
                        ["Civilité",            civilite],
                        ["Nom de naissance",    nomNaissance],
                        ["Prénom(s)",           prenoms],
                        ["Date de naissance",   dateNaissance ? new Date(dateNaissance + "T00:00:00").toLocaleDateString("fr-FR") : "—"],
                        ["Pays de naissance",   pays === "FR" ? "France" : "Étranger"],
                        ...(pays === "FR" ? [["Code INSEE", codeInsee]] : []),
                        ["IBAN",                iban.slice(0,9) + " ····· " + iban.slice(-4)],
                        ["BIC",                 bic],
                        ["Adresse",             adresse.replace(/\n/g, ", ")],
                      ].map(([k, v]) => (
                        <div key={k} className="flex justify-between items-start gap-6 px-5 py-3">
                          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0">{k}</span>
                          <span className="text-[13px] text-slate-700 font-semibold text-right">{v || "—"}</span>
                        </div>
                      ))}
                    </div>
                    <div className="bg-slate-50 px-5 py-3 border-t border-slate-200">
                      <button onClick={() => setStep(1)}
                        className="text-[12px] text-blue-600 hover:text-blue-800 font-semibold underline underline-offset-2 transition-colors">
                        Modifier mes informations
                      </button>
                    </div>
                  </div>

                  {/* Consentements */}
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
                      <label key={id} className="flex gap-4 items-start cursor-pointer p-4 rounded-xl border-2 transition-all"
                        style={{
                          borderColor: state ? "#0052D4" : "#E2E8F0",
                          background:  state ? "#F0F7FF" : "#fff",
                        }}>
                        <div className="mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all"
                          style={{ borderColor: state ? "#0052D4" : "#CBD5E1", background: state ? "#0052D4" : "#fff" }}>
                          {state && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                          <input type="checkbox" checked={state} onChange={e => set(e.target.checked)} className="sr-only" />
                        </div>
                        <span className="text-[13.5px] text-slate-600 leading-relaxed">{text}</span>
                      </label>
                    ))}
                  </div>

                  {globalError && (
                    <div className="flex items-start gap-2.5 px-4 py-3 bg-red-50 border border-red-100 rounded-xl">
                      <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                      <p className="text-[12.5px] text-red-700">{globalError}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Card footer / nav */}
            <div className="px-10 py-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <button onClick={goPrev}
                className="text-[13px] font-semibold text-slate-400 hover:text-slate-700 transition-colors">
                ← {step === 1 ? "Tableau de bord" : "Précédent"}
              </button>

              {step < 3 ? (
                <button onClick={goNext}
                  disabled={step === 1 ? !step1Valid : !step2Valid}
                  className="h-11 px-8 rounded-xl text-[14px] font-bold transition-all"
                  style={{
                    background: (step === 1 ? step1Valid : step2Valid) ? "#0052D4" : "#E2E8F0",
                    color:      (step === 1 ? step1Valid : step2Valid) ? "#fff"    : "#CBD5E1",
                    cursor:     (step === 1 ? step1Valid : step2Valid) ? "pointer" : "not-allowed",
                  }}>
                  Continuer →
                </button>
              ) : (
                <button onClick={handleSubmit}
                  disabled={!step3Valid || saving}
                  className="h-12 px-8 rounded-xl text-[14px] font-bold transition-all flex items-center gap-2.5"
                  style={{
                    background: step3Valid && !saving ? "#0052D4" : "#E2E8F0",
                    color:      step3Valid && !saving ? "#fff"    : "#CBD5E1",
                    cursor:     step3Valid && !saving ? "pointer" : "not-allowed",
                  }}>
                  {saving
                    ? <><Loader2 className="w-4 h-4 animate-spin" />Transmission en cours…</>
                    : "Transmettre mes informations →"}
                </button>
              )}
            </div>
          </div>

          {/* ── Trust sidebar ── */}
          <div className="space-y-4 lg:sticky lg:top-20">

            {/* Security */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-5">
                <Lock className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Sécurité</span>
              </div>
              <div className="space-y-4">
                {TRUST_BULLETS.map(({ icon: Icon, text }, i) => (
                  <div key={i} className="flex gap-3 items-start">
                    <div className="w-7 h-7 bg-slate-50 rounded-lg flex items-center justify-center shrink-0">
                      <Icon className="w-3.5 h-3.5 text-slate-500" />
                    </div>
                    <p className="text-[12px] text-slate-500 leading-relaxed pt-0.5">{text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Context */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-4">{ctx.title}</p>
              {ctx.body}
            </div>

            {/* URSSAF brand */}
            <div className="flex items-center justify-center gap-3 py-2">
              <img src={urssafLogo} alt="Urssaf" className="h-5 object-contain opacity-35" />
              <span className="text-[10.5px] text-slate-300 font-semibold">URSSAF · DGFiP</span>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
