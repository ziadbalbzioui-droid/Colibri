import { useState } from "react";
import { Copy, Check, Gift, Users, Euro, ChevronRight, Loader2, User } from "lucide-react";
import { useParrainage } from "../../../lib/hooks/useParrainage";
import { LoadingGuard } from "../layout/LoadingGuard";
import type { FilleulRow } from "../../../lib/hooks/useParrainage";

const SEUIL_HEURES = 10;
const PRIME = 50;

function ProgressBar({ heures }: { heures: number }) {
  const pct = Math.min(100, (heures / SEUIL_HEURES) * 100);
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${pct >= 100 ? "bg-emerald-500" : "bg-primary"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-slate-500 shrink-0 tabular-nums">{heures.toFixed(1)}/{SEUIL_HEURES}h</span>
    </div>
  );
}

function StatusBadge({ f }: { f: FilleulRow }) {
  if (f.prime_versee) {
    return <span className="text-[11px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-semibold">Prime versée</span>;
  }
  if (f.heures >= SEUIL_HEURES) {
    return <span className="text-[11px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-semibold">🎉 Éligible — {PRIME}€</span>;
  }
  return <span className="text-[11px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-semibold">En cours</span>;
}

function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4">
      <span className="text-3xl font-black tracking-[0.25em] text-slate-900 font-mono flex-1">{code}</span>
      <button
        onClick={copy}
        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
          copied
            ? "bg-emerald-100 text-emerald-700"
            : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
        }`}
      >
        {copied ? <><Check className="w-3.5 h-3.5" /> Copié</> : <><Copy className="w-3.5 h-3.5" /> Copier</>}
      </button>
    </div>
  );
}

function CodeParrainForm({ onApply }: { onApply: (code: string) => Promise<{ error?: string }> }) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit() {
    if (!code.trim()) return;
    setLoading(true);
    setError(null);
    const result = await onApply(code);
    if (result.error) {
      setError(result.error);
    } else {
      setSuccess(true);
    }
    setLoading(false);
  }

  if (success) {
    return (
      <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 px-4 py-3 rounded-xl font-medium">
        <Check className="w-4 h-4" /> Code parrain appliqué avec succès !
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          value={code}
          onChange={(e) => { setCode(e.target.value.toUpperCase()); setError(null); }}
          placeholder="EX: A3B7F2C1"
          maxLength={8}
          className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm font-mono tracking-widest uppercase"
        />
        <button
          onClick={handleSubmit}
          disabled={!code.trim() || loading}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:opacity-90 disabled:opacity-40 transition-opacity"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ChevronRight className="w-4 h-4" />}
          Valider
        </button>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}

export function Parrainage() {
  const { filleuls, parrain, monCode, primesGagnees, eligibles, loading, error, reload, applyCode } = useParrainage();

  const primesVersees = filleuls.filter((f) => f.prime_versee).length * PRIME;

  return (
    <LoadingGuard loading={loading} error={error} onRetry={reload}>
    <div className="max-w-2xl mx-auto">

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Parrainage</h1>
          <p className="text-slate-500 text-sm">Gagnez {PRIME}€ par filleul ayant donné {SEUIL_HEURES}h de cours</p>
        </div>
        <div className="flex items-center gap-1.5 bg-amber-50 text-amber-700 px-3 py-1.5 rounded-xl text-sm font-semibold border border-amber-100">
          <Euro className="w-3.5 h-3.5" />
          {primesGagnees}€ gagnés
        </div>
      </div>

      {/* Mon code */}
      <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-4">
        <div className="flex items-center gap-2 mb-4">
          <Gift className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Mon code de parrainage</h2>
        </div>
        {monCode ? (
          <>
            <CodeBlock code={monCode} />
            <p className="text-xs text-slate-400 mt-3">
              Partagez ce code à vos collègues lors de leur inscription. Vous toucherez {PRIME}€ dès qu'ils auront donné {SEUIL_HEURES}h de cours.
            </p>
          </>
        ) : (
          <p className="text-sm text-slate-400">Code en cours de génération…</p>
        )}
      </section>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 text-center">
          <p className="text-2xl font-bold text-slate-900">{filleuls.length}</p>
          <p className="text-xs text-slate-400 mt-0.5">filleul{filleuls.length > 1 ? "s" : ""}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 text-center">
          <p className="text-2xl font-bold text-emerald-600">{eligibles}</p>
          <p className="text-xs text-slate-400 mt-0.5">éligible{eligibles > 1 ? "s" : ""}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 text-center">
          <p className="text-2xl font-bold text-slate-900">{primesVersees}€</p>
          <p className="text-xs text-slate-400 mt-0.5">versés</p>
        </div>
      </div>

      {/* Mon parrain */}
      <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-4">
        <div className="flex items-center gap-2 mb-4">
          <User className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Mon parrain</h2>
        </div>
        {parrain ? (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary shrink-0">
              {parrain.prenom[0]}{parrain.nom[0]}
            </div>
            <div>
              <p className="font-semibold text-slate-900 text-sm">{parrain.prenom} {parrain.nom}</p>
              <p className="text-xs text-slate-400">Code : <span className="font-mono">{parrain.code_parrainage}</span></p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-slate-400">Vous n'avez pas encore de parrain. Entrez un code si quelqu'un vous a parrainé.</p>
            <CodeParrainForm onApply={applyCode} />
          </div>
        )}
      </section>

      {/* Mes filleuls */}
      <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-5">
          <Users className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Mes filleuls
          </h2>
          {filleuls.length > 0 && (
            <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-0.5 rounded-full">{filleuls.length}</span>
          )}
        </div>

        {filleuls.length === 0 ? (
          <div className="text-center py-10">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
              <Users className="w-5 h-5 text-slate-400" />
            </div>
            <p className="text-sm font-semibold text-slate-700 mb-1">Aucun filleul pour l'instant</p>
            <p className="text-xs text-slate-400">Partagez votre code pour inviter vos collègues</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filleuls.map((f) => (
              <div key={f.id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                  {(f.prenom[0] ?? "") + (f.nom[0] ?? "")}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <p className="text-sm font-semibold text-slate-900 truncate">{f.prenom} {f.nom}</p>
                    <StatusBadge f={f} />
                  </div>
                  <ProgressBar heures={f.heures} />
                </div>
              </div>
            ))}

            {eligibles > 0 && (
              <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3 mt-2">
                <span className="text-sm text-emerald-700 font-medium">
                  🎉 {eligibles} filleul{eligibles > 1 ? "s" : ""} éligible{eligibles > 1 ? "s" : ""} — {eligibles * PRIME}€ à percevoir
                </span>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
    </LoadingGuard>
  );
}
