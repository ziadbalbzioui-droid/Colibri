import { useState } from "react";
import { AlertTriangle, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { useAuth } from "../../../lib/auth";

export function SiretBanner() {
  const { profile, updateProfile } = useAuth();
  const [siret, setSiret] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [result, setResult] = useState<{ nom_entreprise: string; adresse: string } | null>(null);

  if (profile?.role !== "prof" || profile?.siret) return null;

  async function handleVerify() {
    const clean = siret.replace(/\s/g, "");
    if (clean.length !== 14) { setVerifyError("Le SIRET doit contenir 14 chiffres."); return; }
    setVerifying(true);
    setVerifyError(null);
    setResult(null);
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
      setVerifyError(e instanceof Error ? e.message : "Erreur de vérification");
    } finally {
      setVerifying(false);
    }
  }

  async function handleSave() {
    if (!result) return;
    setSaving(true);
    try {
      const { error } = await updateProfile({
        siret: siret.replace(/\s/g, ""),
        nom_entreprise: result.nom_entreprise,
        adresse: result.adresse,
      });
      if (error) throw new Error(error);
      setSaved(true);
    } catch (e) {
      setVerifyError(e instanceof Error ? e.message : "Erreur lors de la sauvegarde.");
    } finally {
      setSaving(false);
    }
  }

  if (saved) {
    return (
      <div className="flex items-center gap-2 bg-green-50 border-b border-green-200 px-4 py-2.5 text-sm text-green-700">
        <CheckCircle2 className="w-4 h-4 shrink-0" />
        SIRET enregistré — votre compte est maintenant débloqué.
      </div>
    );
  }

  return (
    <div className="bg-amber-50 border-b border-amber-200 px-4 py-3 space-y-2">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-start gap-2 flex-1 min-w-0">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800">
            <span className="font-semibold">Profil incomplet.</span>{" "}
            Renseignez votre numéro SIRET pour pouvoir ajouter des élèves et gérer vos cours.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <input
            type="text"
            value={siret}
            onChange={(e) => { setSiret(e.target.value); setResult(null); setVerifyError(null); }}
            placeholder="123 456 789 00012"
            maxLength={17}
            className="w-44 px-3 py-1.5 text-sm border border-amber-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-amber-400/40"
          />
          {!result ? (
            <button
              onClick={handleVerify}
              disabled={verifying || !siret.trim()}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-amber-700 disabled:opacity-50 transition-colors"
            >
              {verifying ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
              Vérifier
            </button>
          ) : (
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
              Enregistrer
            </button>
          )}
        </div>
      </div>

      {verifyError && (
        <div className="max-w-6xl mx-auto flex items-center gap-2 pl-6 text-xs text-red-600">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          {verifyError}
        </div>
      )}

      {result && (
        <div className="max-w-6xl mx-auto ml-6 flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-green-600 shrink-0" />
          <div className="text-xs text-green-800">
            <span className="font-semibold">{result.nom_entreprise}</span>
            {result.adresse && <span className="text-green-600"> · {result.adresse}</span>}
          </div>
        </div>
      )}
    </div>
  );
}
