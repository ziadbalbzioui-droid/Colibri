import { useState } from "react";
import { AlertTriangle, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { useAuth } from "../../../lib/auth";
import { validateIban, formatIban } from "../../../lib/validateIban";

export function IbanBanner() {
  const { profile, updateProfile } = useAuth();
  const [iban, setIban] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (profile?.role !== "prof") return null;
  if (profile?.iban != null && profile.iban !== "") return null;


  async function handleSave() {
    const err = validateIban(iban);
    if (err) { setError(err); return; }
    setSaving(true);
    setError(null);
    try {
      const { error: saveError } = await updateProfile({ iban: iban.replace(/\s/g, "") });
      if (saveError) throw new Error(saveError);
      setSaved(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur lors de la sauvegarde.");
    } finally {
      setSaving(false);
    }
  }

  if (saved) {
    return (
      <div className="flex items-center gap-2 bg-green-50 border-b border-green-200 px-4 py-2.5 text-sm text-green-700">
        <CheckCircle2 className="w-4 h-4 shrink-0" />
        IBAN enregistré — vous pouvez désormais recevoir vos paiements.
      </div>
    );
  }

  return (
    <div className="bg-red-50 border-b border-red-200 px-4 py-3 space-y-2">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-start gap-2 flex-1 min-w-0">
          <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">
            <span className="font-semibold">IBAN non renseigné.</span>{" "}
            Ajoutez votre IBAN pour recevoir vos paiements sur votre compte bancaire.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <input
            type="text"
            value={iban}
            onChange={(e) => { setIban(formatIban(e.target.value)); setError(null); }}
            placeholder="FR76 3000 6000 01…"
            maxLength={42}
            className="w-52 px-3 py-1.5 text-sm font-mono tracking-wider border border-red-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-red-400/40 uppercase"
          />
          <button
            onClick={handleSave}
            disabled={saving || !iban.trim()}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
            Enregistrer
          </button>
        </div>
      </div>

      {error && (
        <div className="max-w-6xl mx-auto flex items-center gap-2 pl-6 text-xs text-red-600">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          {error}
        </div>
      )}
    </div>
  );
}
