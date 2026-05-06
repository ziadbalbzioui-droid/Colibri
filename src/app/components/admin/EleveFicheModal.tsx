import React, { useEffect, useState } from "react";
import { X, Loader2 } from "lucide-react";
import { supabase } from "../../../lib/supabase";
import { CopyID, TH, TD } from "./adminShared";

interface EleveFicheData {
  cours: any[];
  contestations: any[];
}

export function EleveFicheModal({ eleve, onClose }: { eleve: any; onClose: () => void }) {
  const [data, setData] = useState<EleveFicheData>({ cours: [], contestations: [] });
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"cours" | "contestations">("cours");

  useEffect(() => {
    (async () => {
      const { data: cours } = await supabase.from("cours")
        .select("id, date, matiere, duree_heures, montant, statut, recap_id, profiles!cours_prof_id_fkey(prenom, nom)")
        .eq("eleve_id", eleve.id)
        .order("date", { ascending: false })
        .limit(200);

      let contestations: any[] = [];
      try {
        const { data: conts } = await (supabase as any)
          .from("contestation_cours")
          .select("id, raison, created_at, cours!inner(eleve_nom, matiere, date, montant)")
          .eq("cours.eleve_id", eleve.id)
          .order("created_at", { ascending: false })
          .limit(50);
        contestations = conts ?? [];
      } catch (_) {}

      setData({ cours: cours ?? [], contestations });
      setLoading(false);
    })();
  }, [eleve.id]);

  const totalCA = data.cours.reduce((s, c) => s + Number(c.montant), 0);
  const coursDecl = data.cours.filter((c) => c.statut === "déclaré").length;
  const coursContes = data.cours.filter((c) => c.statut === "contesté").length;
  const prof = eleve.profiles;

  const TABS: { key: typeof tab; label: string; count: number }[] = [
    { key: "cours",         label: "Cours",        count: data.cours.length },
    { key: "contestations", label: "Contestations", count: data.contestations.length },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="border-b border-slate-100 px-6 py-4 flex items-start justify-between flex-shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-slate-900 text-lg">{eleve.nom}</h2>
              <CopyID id={eleve.id} />
            </div>
            <div className="flex gap-2 mt-1.5 flex-wrap">
              {eleve.matiere && (
                <span className="text-xs font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded">{eleve.matiere}</span>
              )}
              {eleve.niveau && (
                <span className="text-xs font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded">{eleve.niveau}</span>
              )}
              {eleve.tarif_heure && (
                <span className="text-xs font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded">{eleve.tarif_heure} €/h</span>
              )}
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${eleve.statut === "actif" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                {eleve.statut}
              </span>
            </div>
            {prof && (
              <p className="text-xs text-slate-500 mt-1">
                Prof : <span className="font-semibold">{prof.prenom} {prof.nom}</span>
              </p>
            )}
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 transition-colors flex-shrink-0">
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center gap-2 text-slate-400">
            <Loader2 className="w-5 h-5 animate-spin" /> Chargement…
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-3 divide-x divide-slate-100 border-b border-slate-100 flex-shrink-0">
              {[
                { label: "CA total",       value: `${totalCA.toFixed(2)} €` },
                { label: "Cours déclarés", value: String(coursDecl) },
                { label: "Contestations",  value: String(coursContes), warn: coursContes > 0 },
              ].map(({ label, value, warn }) => (
                <div key={label} className="px-5 py-3">
                  <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wide">{label}</p>
                  <p className={`text-xl font-bold mt-0.5 ${warn ? "text-red-600" : "text-slate-900"}`}>{value}</p>
                </div>
              ))}
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-100 flex-shrink-0">
              {TABS.map(({ key, label, count }) => (
                <button key={key} onClick={() => setTab(key)}
                  className={`px-5 py-2.5 text-sm font-semibold transition-colors relative ${tab === key ? "text-primary" : "text-slate-500 hover:text-slate-800"}`}>
                  {label}
                  <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${tab === key ? "bg-primary/10 text-primary" : "bg-slate-100 text-slate-500"}`}>{count}</span>
                  {tab === key && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="flex-1 overflow-y-auto">
              {tab === "cours" && (
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200 sticky top-0">
                    <tr>
                      <th className={TH}>id</th>
                      <th className={TH}>date</th>
                      <th className={TH}>matiere</th>
                      <th className={TH}>duree_h</th>
                      <th className={TH}>montant</th>
                      <th className={TH}>statut</th>
                      <th className={TH}>recap_id</th>
                      <th className={TH}>prof</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {data.cours.length === 0 && (
                      <tr><td colSpan={8} className="p-8 text-center text-slate-400">Aucun cours.</td></tr>
                    )}
                    {data.cours.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50/60">
                        <td className={TD}><CopyID id={c.id} /></td>
                        <td className={`${TD} font-mono text-xs text-slate-500`}>{c.date}</td>
                        <td className={`${TD} text-slate-500`}>{c.matiere}</td>
                        <td className={`${TD} font-mono text-slate-600`}>{c.duree_heures}h</td>
                        <td className={`${TD} font-mono font-semibold text-slate-700`}>{Number(c.montant).toFixed(2)} €</td>
                        <td className={TD}>
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                            c.statut === "déclaré" ? "bg-blue-100 text-blue-700"
                            : c.statut === "contesté" ? "bg-red-100 text-red-700"
                            : "bg-emerald-100 text-emerald-700"
                          }`}>
                            {c.statut}
                          </span>
                        </td>
                        <td className={TD}>
                          {c.recap_id ? <CopyID id={c.recap_id} /> : <span className="font-mono text-xs text-slate-300">null</span>}
                        </td>
                        <td className={`${TD} text-xs text-slate-500`}>
                          {c.profiles ? `${c.profiles.prenom} ${c.profiles.nom}` : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {tab === "contestations" && (
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200 sticky top-0">
                    <tr>
                      <th className={TH}>id</th>
                      <th className={TH}>date</th>
                      <th className={TH}>matiere</th>
                      <th className={TH}>montant</th>
                      <th className={TH}>raison</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {data.contestations.length === 0 && (
                      <tr><td colSpan={5} className="p-8 text-center text-slate-400">Aucune contestation.</td></tr>
                    )}
                    {data.contestations.map((ct) => (
                      <tr key={ct.id} className="hover:bg-slate-50/60">
                        <td className={TD}><CopyID id={ct.id} /></td>
                        <td className={`${TD} font-mono text-xs text-slate-400`}>{new Date(ct.created_at).toLocaleDateString("fr-FR")}</td>
                        <td className={`${TD} text-slate-500`}>{ct.cours?.matiere ?? "—"}</td>
                        <td className={`${TD} font-mono text-slate-700`}>{ct.cours?.montant != null ? `${Number(ct.cours.montant).toFixed(2)} €` : "—"}</td>
                        <td className={`${TD} text-red-700 text-xs max-w-[200px] truncate`}>{ct.raison || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
