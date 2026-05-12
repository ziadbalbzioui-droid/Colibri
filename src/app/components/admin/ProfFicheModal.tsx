import React, { useEffect, useState } from "react";
import { X, Loader2, Check, Copy, Pencil } from "lucide-react";
import { supabase } from "../../../lib/supabase";
import { MOIS_LABELS, RECAP_STATUT_STYLE, VALIDATION_STATUT_STYLE, TH, TD } from "./adminShared";

function CopyID({ id }: { id: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard.writeText(id); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
      title={id} className="font-mono text-[10px] text-slate-400 hover:text-primary transition-colors flex items-center gap-1 group">
      <span>{id.slice(0, 8)}</span>
      {copied ? <Check className="w-2.5 h-2.5 text-emerald-500" /> : <Copy className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />}
    </button>
  );
}

interface FicheData {
  eleves: any[];
  cours: any[];
  recaps: any[];
  contestations: any[];
}

export function ProfFicheModal({ prof, onClose }: { prof: any; onClose: () => void }) {
  const [data, setData] = useState<FicheData>({ eleves: [], cours: [], recaps: [], contestations: [] });
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"eleves" | "cours" | "recaps" | "contestations">("eleves");
  const [etablissement, setEtablissement] = useState<string>(prof.etablissement ?? "");
  const [editingEtab, setEditingEtab] = useState(false);
  const [savingEtab, setSavingEtab] = useState(false);
  const [ecoles, setEcoles] = useState<string[]>([]);

  useEffect(() => {
    supabase.from("ecoles").select("nom").eq("active", true).order("ordre")
      .then(({ data }) => { if (data) setEcoles(data.map((e: any) => e.nom)); });
  }, []);

  async function saveEtab() {
    setSavingEtab(true);
    await supabase.from("profiles").update({ etablissement }).eq("id", prof.id);
    setSavingEtab(false);
    setEditingEtab(false);
  }

  useEffect(() => {
    (async () => {
      const [{ data: eleves }, { data: cours }, { data: recaps }] = await Promise.all([
        supabase.from("eleves")
          .select("id, nom, matiere, niveau, statut, tarif_heure")
          .eq("prof_id", prof.id).order("nom"),
        supabase.from("cours")
          .select("id, eleve_nom, matiere, date, duree_heures, montant, statut, recap_id")
          .eq("prof_id", prof.id).order("date", { ascending: false }).limit(100),
        supabase.from("recap_mensuel")
          .select("id, mois, annee, statut, recap_eleve_validation(id, statut)")
          .eq("prof_id", prof.id).order("annee", { ascending: false }).order("mois", { ascending: false }),
      ]);

      // Contestations via embedded filter on cours.prof_id
      let contestations: any[] = [];
      try {
        const { data: conts } = await (supabase as any)
          .from("contestation_cours")
          .select("id, raison, created_at, cours!inner(eleve_nom, matiere, date, montant)")
          .eq("cours.prof_id", prof.id)
          .order("created_at", { ascending: false })
          .limit(20);
        contestations = conts ?? [];
      } catch (_) { /* ignore if filter not supported */ }

      setData({ eleves: eleves ?? [], cours: cours ?? [], recaps: recaps ?? [], contestations });
      setLoading(false);
    })();
  }, [prof.id]);

  const totalCA   = data.cours.reduce((s, c) => s + Number(c.montant), 0);
  const elevesActifs = data.eleves.filter((e) => e.statut === "actif").length;
  const coursDecl = data.cours.filter((c) => c.statut === "déclaré").length;
  const coursContes = data.cours.filter((c) => c.statut === "contesté").length;

  const TABS: { key: typeof tab; label: string; count: number }[] = [
    { key: "eleves",        label: "Élèves",        count: data.eleves.length },
    { key: "cours",         label: "Cours",          count: data.cours.length },
    { key: "recaps",        label: "Récaps",         count: data.recaps.length },
    { key: "contestations", label: "Contestations",  count: data.contestations.length },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="border-b border-slate-100 px-6 py-4 flex items-start justify-between flex-shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-slate-900 text-lg">{prof.prenom} {prof.nom}</h2>
              <CopyID id={prof.id} />
            </div>
            <p className="font-mono text-xs text-slate-400 mt-0.5">{prof.email}</p>
            <div className="flex gap-2 mt-1.5 flex-wrap">
              {prof.siret
                ? <span className="text-xs font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded">SIRET {prof.siret}</span>
                : <span className="text-xs font-semibold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">SIRET manquant</span>}
              {prof.iban
                ? <span className="text-xs font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded">IBAN {prof.iban.slice(0,8)}…</span>
                : <span className="text-xs font-semibold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">IBAN manquant</span>}
            </div>
            <div className="flex items-center gap-2 mt-2">
              {editingEtab ? (
                <>
                  <select value={etablissement} onChange={e => setEtablissement(e.target.value)}
                    className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white outline-none max-w-xs">
                    <option value="">— Non renseigné —</option>
                    {etablissement && !ecoles.includes(etablissement) && (
                      <option value={etablissement}>{etablissement}</option>
                    )}
                    {ecoles.map(e => <option key={e} value={e}>{e}</option>)}
                  </select>
                  <button onClick={saveEtab} disabled={savingEtab}
                    className="p-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors" title="Enregistrer">
                    {savingEtab ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  </button>
                  <button onClick={() => { setEditingEtab(false); setEtablissement(prof.etablissement ?? ""); }}
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors" title="Annuler">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </>
              ) : (
                <>
                  {etablissement
                    ? <span className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-100 px-2.5 py-0.5 rounded-full font-medium">{etablissement}</span>
                    : <span className="text-xs text-slate-400 italic">Établissement non renseigné</span>
                  }
                  <button onClick={() => setEditingEtab(true)}
                    className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors" title="Modifier l'établissement">
                    <Pencil className="w-3 h-3" />
                  </button>
                </>
              )}
            </div>
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
            {/* Stats bar */}
            <div className="grid grid-cols-4 divide-x divide-slate-100 border-b border-slate-100 flex-shrink-0">
              {[
                { label: "Élèves actifs",  value: `${elevesActifs}/${data.eleves.length}` },
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
              {tab === "eleves" && (
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200 sticky top-0">
                    <tr><th className={TH}>id</th><th className={TH}>nom</th><th className={TH}>matiere</th><th className={TH}>niveau</th><th className={TH}>tarif/h</th><th className={TH}>statut</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {data.eleves.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-slate-400">Aucun élève.</td></tr>}
                    {data.eleves.map((e) => (
                      <tr key={e.id} className="hover:bg-slate-50/60">
                        <td className={TD}><CopyID id={e.id} /></td>
                        <td className={`${TD} font-medium text-slate-900`}>{e.nom}</td>
                        <td className={`${TD} text-slate-500`}>{e.matiere}</td>
                        <td className={`${TD} text-slate-500`}>{e.niveau}</td>
                        <td className={`${TD} font-mono text-slate-700`}>{e.tarif_heure} €/h</td>
                        <td className={TD}>
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${e.statut === "actif" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                            {e.statut}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {tab === "cours" && (
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200 sticky top-0">
                    <tr><th className={TH}>id</th><th className={TH}>date</th><th className={TH}>eleve_nom</th><th className={TH}>matiere</th><th className={TH}>duree_h</th><th className={TH}>montant</th><th className={TH}>statut</th><th className={TH}>recap_id</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {data.cours.length === 0 && <tr><td colSpan={8} className="p-8 text-center text-slate-400">Aucun cours.</td></tr>}
                    {data.cours.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50/60">
                        <td className={TD}><CopyID id={c.id} /></td>
                        <td className={`${TD} font-mono text-xs text-slate-500`}>{c.date}</td>
                        <td className={`${TD} font-medium text-slate-900`}>{c.eleve_nom}</td>
                        <td className={`${TD} text-slate-500`}>{c.matiere}</td>
                        <td className={`${TD} font-mono text-slate-600`}>{c.duree_heures}h</td>
                        <td className={`${TD} font-mono font-semibold text-slate-700`}>{Number(c.montant).toFixed(2)} €</td>
                        <td className={TD}>
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${c.statut === "déclaré" ? "bg-blue-100 text-blue-700" : c.statut === "contesté" ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"}`}>
                            {c.statut}
                          </span>
                        </td>
                        <td className={TD}>{c.recap_id ? <CopyID id={c.recap_id} /> : <span className="font-mono text-xs text-slate-300">null</span>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {tab === "recaps" && (
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200 sticky top-0">
                    <tr><th className={TH}>id</th><th className={TH}>période</th><th className={TH}>statut</th><th className={TH}>validations</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {data.recaps.length === 0 && <tr><td colSpan={4} className="p-8 text-center text-slate-400">Aucun récap.</td></tr>}
                    {data.recaps.map((r) => {
                      const vals: any[] = r.recap_eleve_validation ?? [];
                      const nbV = vals.filter((v) => v.statut === "valide").length;
                      const nbC = vals.filter((v) => v.statut === "conteste").length;
                      const nbA = vals.filter((v) => v.statut !== "valide").length;
                      const si = RECAP_STATUT_STYLE[r.statut] ?? { bg: "bg-slate-100 text-slate-500", label: r.statut };
                      return (
                        <tr key={r.id} className="hover:bg-slate-50/60">
                          <td className={TD}><CopyID id={r.id} /></td>
                          <td className={`${TD} font-semibold text-slate-900`}>{MOIS_LABELS[r.mois - 1]} {r.annee}</td>
                          <td className={TD}><span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${si.bg}`}>{si.label}</span></td>
                          <td className={TD}>
                            <div className="flex gap-1.5 flex-wrap">
                              {nbV > 0 && <span className="text-xs bg-emerald-100 text-emerald-700 font-semibold px-2 py-0.5 rounded-full">{nbV} ✓</span>}
                              {nbC > 0 && <span className="text-xs bg-red-100 text-red-700 font-semibold px-2 py-0.5 rounded-full">{nbC} contesté</span>}
                              {nbA - nbC > 0 && <span className="text-xs bg-amber-100 text-amber-700 font-semibold px-2 py-0.5 rounded-full">{nbA - nbC} ⏳</span>}
                              {vals.length === 0 && <span className="text-xs text-slate-400">—</span>}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}

              {tab === "contestations" && (
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200 sticky top-0">
                    <tr><th className={TH}>id</th><th className={TH}>date</th><th className={TH}>eleve_nom</th><th className={TH}>matiere</th><th className={TH}>montant</th><th className={TH}>raison</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {data.contestations.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-slate-400">Aucune contestation.</td></tr>}
                    {data.contestations.map((ct) => (
                      <tr key={ct.id} className="hover:bg-slate-50/60">
                        <td className={TD}><CopyID id={ct.id} /></td>
                        <td className={`${TD} font-mono text-xs text-slate-400`}>{new Date(ct.created_at).toLocaleDateString("fr-FR")}</td>
                        <td className={`${TD} font-medium text-slate-900`}>{ct.cours?.eleve_nom ?? "—"}</td>
                        <td className={`${TD} text-slate-500`}>{ct.cours?.matiere ?? "—"}</td>
                        <td className={`${TD} font-mono text-slate-700`}>{ct.cours?.montant != null ? `${Number(ct.cours.montant).toFixed(2)} €` : "—"}</td>
                        <td className={`${TD} text-red-700 text-xs max-w-[180px] truncate`}>{ct.raison || "—"}</td>
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
