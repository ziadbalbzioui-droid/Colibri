import React, { useEffect, useState } from "react";
import { Loader2, Link2, Check, X } from "lucide-react";
import { supabase } from "../../../lib/supabase";
import { MOIS_LABELS, TH, TD, CopyID } from "./adminShared";

export function AdminOrphelins() {
  const [cours, setCours]       = useState<any[]>([]);
  const [recaps, setRecaps]     = useState<any[]>([]);
  const [profsList, setProfsList] = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);
  const [filterProf, setFilterProf]   = useState("tous");
  const [filterYear, setFilterYear]   = useState("tous");
  const [filterMonth, setFilterMonth] = useState("tous");
  const [attaching, setAttaching]     = useState<string | null>(null);
  const [targetRecapId, setTargetRecapId] = useState("");
  const [saving, setSaving]     = useState(false);

  async function load() {
    setLoading(true);
    const [{ data: c }, { data: p }, { data: r }] = await Promise.all([
      supabase.from("cours")
        .select("id, eleve_id, eleve_nom, matiere, date, duree_heures, montant, statut, prof_id, created_at, profiles!cours_prof_id_fkey(prenom, nom)")
        .is("recap_id", null)
        .order("date", { ascending: false })
        .limit(500),
      supabase.from("profiles").select("id, prenom, nom").eq("role", "prof").order("nom"),
      supabase.from("recap_mensuel")
        .select("id, mois, annee, prof_id, statut")
        .order("annee", { ascending: false }).order("mois", { ascending: false }),
    ]);
    setCours(c ?? []); setProfsList(p ?? []); setRecaps(r ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const years = [...new Set(cours.map((c) => c.date?.slice(0, 4)).filter(Boolean))].sort((a, b) => b.localeCompare(a));
  const filtered = cours.filter((c) => {
    if (filterProf  !== "tous" && c.prof_id !== filterProf) return false;
    if (filterYear  !== "tous" && !c.date?.startsWith(filterYear)) return false;
    if (filterMonth !== "tous" && Number(c.date?.slice(5, 7)) !== Number(filterMonth)) return false;
    return true;
  });

  function recapsForCours(c: any) {
    return recaps.filter((r) => r.prof_id === c.prof_id);
  }

  async function attach(coursId: string, recapId: string, eleveId: string | null) {
    const targetRecap = recaps.find((r) => r.id === recapId);
    if (targetRecap?.statut === "paye") {
      alert("❌ Ce récap est «Payé». Impossible d'y attacher un cours.");
      return;
    }
    if (targetRecap && !["en_cours", "en_attente_parent"].includes(targetRecap.statut)) {
      if (!window.confirm(
        `⚠ Ce récap est en statut «${targetRecap.statut}».\n\n` +
        `Attacher un cours à un récap déjà validé ou en attente de paiement modifiera son total et peut créer des incohérences avec les validations déjà faites.\n\n` +
        `Continuer quand même ?`
      )) return;
    }
    setSaving(true);
    await supabase.from("cours").update({ recap_id: recapId }).eq("id", coursId);
    if (eleveId) {
      await supabase.from("recap_eleve_validation").upsert(
        [{ recap_id: recapId, eleve_id: eleveId, statut: "en_attente_parent" }],
        { onConflict: "recap_id,eleve_id" }
      );
    }
    setCours((prev) => prev.filter((c) => c.id !== coursId));
    setAttaching(null); setTargetRecapId("");
    setSaving(false);
  }

  const SEL = "h-9 px-3 text-sm bg-white border border-slate-200 rounded-xl outline-none focus:border-primary text-slate-700 cursor-pointer";

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Cours orphelins</h1>
          <p className="text-xs font-mono text-slate-400 mt-0.5">{filtered.length}/{cours.length} rows · cours WHERE recap_id IS NULL</p>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <select value={filterProf} onChange={(e) => setFilterProf(e.target.value)} className={SEL}>
          <option value="tous">Tous les profs</option>
          {profsList.map((p) => <option key={p.id} value={p.id}>{p.prenom} {p.nom}</option>)}
        </select>
        <select value={filterYear} onChange={(e) => { setFilterYear(e.target.value); setFilterMonth("tous"); }} className={SEL}>
          <option value="tous">Toutes les années</option>
          {years.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
        <select value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} className={SEL}>
          <option value="tous">Tous les mois</option>
          {[...Array(12)].map((_, i) => <option key={i + 1} value={String(i + 1)}>{MOIS_LABELS[i]}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(15,23,42,.06)" }}>
        {loading ? <div className="p-8 text-center text-slate-400 text-sm">Chargement…</div>
          : filtered.length === 0
          ? <div className="p-8 text-center text-slate-400 text-sm font-mono">Aucun cours orphelin pour ces filtres. ✓</div>
          : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className={TH}>id</th>
                  <th className={TH}>déclaré le</th>
                  <th className={TH}>date cours</th>
                  <th className={TH}>eleve_nom</th>
                  <th className={TH}>matiere</th>
                  <th className={TH}>duree_h</th>
                  <th className={TH}>montant</th>
                  <th className={TH}>statut</th>
                  <th className={TH}>prof</th>
                  <th className={TH}>attacher à recap</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className={TD}><CopyID id={c.id} /></td>
                    <td className={`${TD} font-mono text-xs text-slate-400`}>
                      {c.created_at ? new Date(c.created_at).toLocaleDateString("fr-FR") : "—"}
                    </td>
                    <td className={`${TD} font-mono text-xs text-slate-500`}>{c.date}</td>
                    <td className={`${TD} font-medium text-slate-900`}>{c.eleve_nom}</td>
                    <td className={`${TD} text-slate-500`}>{c.matiere}</td>
                    <td className={`${TD} font-mono text-slate-600`}>{c.duree_heures}h</td>
                    <td className={`${TD} font-mono font-semibold text-slate-700`}>{Number(c.montant).toFixed(2)} €</td>
                    <td className={TD}>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        c.statut === "déclaré" ? "bg-blue-100 text-blue-700"
                        : c.statut === "contesté" ? "bg-red-100 text-red-700"
                        : "bg-emerald-100 text-emerald-700"}`}>
                        {c.statut}
                      </span>
                    </td>
                    <td className={`${TD} text-xs text-slate-500`}>
                      {c.profiles ? `${c.profiles.prenom} ${c.profiles.nom}` : "—"}
                    </td>
                    <td className={TD}>
                      {attaching === c.id ? (
                        <div className="flex items-center gap-2">
                          <select value={targetRecapId} onChange={(e) => setTargetRecapId(e.target.value)}
                            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 outline-none cursor-pointer">
                            <option value="">— choisir recap —</option>
                            {recapsForCours(c).map((r) => (
                              <option key={r.id} value={r.id}>
                                {MOIS_LABELS[r.mois - 1]} {r.annee} · {r.statut}
                              </option>
                            ))}
                          </select>
                          <button
                            onClick={() => targetRecapId && attach(c.id, targetRecapId, c.eleve_id)}
                            disabled={!targetRecapId || saving}
                            className="flex items-center gap-1 px-2 py-1 text-xs font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors">
                            {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                          </button>
                          <button onClick={() => { setAttaching(null); setTargetRecapId(""); }}
                            className="p-1 text-slate-400 hover:text-slate-700 transition-colors">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button onClick={() => { setAttaching(c.id); setTargetRecapId(""); }}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors">
                          <Link2 className="w-3 h-3" /> Attacher
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
