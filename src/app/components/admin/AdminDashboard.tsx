import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import { useAuth } from "../../../lib/auth";

const PROF_MULTIPLIER = parseFloat(import.meta.env.VITE_COLIBRI_PROF_MULTIPLIER ?? "1.25");
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;

interface ProfPaiement {
  prof_id: string;
  prenom: string;
  nom: string;
  iban: string | null;
  recap_ids: string[];
  montant_brut: number;
  montant_net: number;
  mois_annees: string[];
}

type DispatchState = "idle" | "loading" | "success" | "error";

export function AdminDashboard() {
  const { session, signOut } = useAuth();
  const [profs, setProfs] = useState<ProfPaiement[]>([]);
  const [fetching, setFetching] = useState(true);
  const [dispatchState, setDispatchState] = useState<DispatchState>("idle");
  const [dispatchResult, setDispatchResult] = useState<{ success: string[]; errors: { prof_id: string; error: string }[] } | null>(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  useEffect(() => {
    loadPendingPayments();
  }, [lastRefresh]);

  async function loadPendingPayments() {
    setFetching(true);
    const { data, error } = await supabase
      .from("recap_mensuel")
      .select(`
        id,
        prof_id,
        mois,
        annee,
        profiles!inner ( prenom, nom, iban ),
        cours ( montant )
      `)
      .eq("statut", "valide");

    if (error || !data) {
      console.error("Erreur chargement recaps:", error?.message);
      setFetching(false);
      return;
    }

    const byProf = new Map<string, ProfPaiement>();

    for (const recap of data as any[]) {
      const montantRecap: number = (recap.cours ?? []).reduce(
        (s: number, c: { montant: number }) => s + Number(c.montant),
        0,
      );
      const label = `${String(recap.mois).padStart(2, "0")}/${recap.annee}`;
      const existing = byProf.get(recap.prof_id);

      if (existing) {
        existing.recap_ids.push(recap.id);
        existing.montant_brut += montantRecap;
        existing.montant_net = Math.round(existing.montant_brut * PROF_MULTIPLIER * 100) / 100;
        existing.mois_annees.push(label);
      } else {
        byProf.set(recap.prof_id, {
          prof_id: recap.prof_id,
          prenom: recap.profiles.prenom,
          nom: recap.profiles.nom,
          iban: recap.profiles.iban ?? null,
          recap_ids: [recap.id],
          montant_brut: montantRecap,
          montant_net: Math.round(montantRecap * PROF_MULTIPLIER * 100) / 100,
          mois_annees: [label],
        });
      }
    }

    setProfs(Array.from(byProf.values()));
    setFetching(false);
  }

  async function handleDispatch() {
    if (!session) return;
    setDispatchState("loading");
    setDispatchResult(null);

    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/dispatch-payments`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
      });

      const json = await res.json();

      if (!res.ok) throw new Error(json.error ?? `HTTP ${res.status}`);

      setDispatchResult(json);
      setDispatchState(json.errors?.length > 0 ? "error" : "success");
      setLastRefresh(new Date());
    } catch (e) {
      setDispatchResult({ success: [], errors: [{ prof_id: "global", error: e instanceof Error ? e.message : String(e) }] });
      setDispatchState("error");
    }
  }

  const totalNet = profs.reduce((s, p) => s + p.montant_net, 0);
  const profsWithoutIban = profs.filter((p) => !p.iban);

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Dispatch des paiements</h1>
            <p className="text-sm text-slate-500 mt-1">
              Rémunération prof : tarif × {PROF_MULTIPLIER}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-slate-400">
              Dernière actualisation : {lastRefresh.toLocaleTimeString("fr-FR")}
            </span>
            <button
              onClick={() => signOut()}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 border border-slate-200 hover:bg-slate-100 transition-colors"
            >
              Déconnexion
            </button>
          </div>
        </div>

        {/* Alerte IBAN manquants */}
        {profsWithoutIban.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="text-sm font-semibold text-amber-800">
              {profsWithoutIban.length} prof(s) sans IBAN — ils seront ignorés lors du dispatch :
            </p>
            <ul className="mt-1 text-sm text-amber-700 list-disc list-inside">
              {profsWithoutIban.map((p) => (
                <li key={p.prof_id}>{p.prenom} {p.nom}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Résumé */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <p className="text-xs text-slate-500 uppercase tracking-wide">Profs à payer</p>
            <p className="text-3xl font-bold text-slate-900 mt-1">
              {fetching ? "…" : profs.filter((p) => p.iban).length}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <p className="text-xs text-slate-500 uppercase tracking-wide">Total brut</p>
            <p className="text-3xl font-bold text-slate-900 mt-1">
              {fetching ? "…" : `${profs.reduce((s, p) => s + p.montant_brut, 0).toFixed(2)} €`}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <p className="text-xs text-slate-500 uppercase tracking-wide">Total net à virer</p>
            <p className="text-3xl font-bold text-emerald-600 mt-1">
              {fetching ? "…" : `${totalNet.toFixed(2)} €`}
            </p>
          </div>
        </div>

        {/* Table des profs */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-800">Récapitulatifs validés en attente</h2>
          </div>

          {fetching ? (
            <div className="p-8 text-center text-slate-400 text-sm">Chargement…</div>
          ) : profs.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">
              Aucun récapitulatif validé en attente de paiement.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Prof</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Périodes</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Brut</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Net</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">IBAN</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {profs.map((p) => (
                  <tr key={p.prof_id} className={!p.iban ? "bg-amber-50/50" : ""}>
                    <td className="px-5 py-4 font-medium text-slate-900">
                      {p.prenom} {p.nom}
                    </td>
                    <td className="px-5 py-4 text-slate-500">{p.mois_annees.join(", ")}</td>
                    <td className="px-5 py-4 text-right text-slate-700">{p.montant_brut.toFixed(2)} €</td>
                    <td className="px-5 py-4 text-right font-semibold text-emerald-700">{p.montant_net.toFixed(2)} €</td>
                    <td className="px-5 py-4">
                      {p.iban ? (
                        <span className="font-mono text-xs text-slate-600">{p.iban}</span>
                      ) : (
                        <span className="text-xs text-amber-600 font-semibold">IBAN manquant</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Résultat du dispatch précédent */}
        {dispatchResult && (
          <div className={`rounded-xl border p-4 text-sm ${dispatchState === "success" ? "bg-emerald-50 border-emerald-200" : "bg-red-50 border-red-200"}`}>
            {dispatchResult.success.length > 0 && (
              <p className="text-emerald-800 font-semibold">
                {dispatchResult.success.length} virement(s) envoyé(s) avec succès.
              </p>
            )}
            {dispatchResult.errors.map((e) => (
              <p key={e.prof_id} className="text-red-700 mt-1">
                Échec {e.prof_id === "global" ? "" : `(prof ${e.prof_id})`} : {e.error}
              </p>
            ))}
          </div>
        )}

        {/* Bouton dispatch */}
        <div className="flex justify-end">
          <button
            onClick={handleDispatch}
            disabled={dispatchState === "loading" || profs.filter((p) => p.iban).length === 0}
            className="px-6 py-3 rounded-xl font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {dispatchState === "loading"
              ? "Envoi en cours…"
              : `Dispatcher ${profs.filter((p) => p.iban).length} virement(s) — ${totalNet.toFixed(2)} €`}
          </button>
        </div>

      </div>
    </div>
  );
}
