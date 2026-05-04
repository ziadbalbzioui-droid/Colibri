import React, { useState } from "react";
import { X, Loader2, Check } from "lucide-react";
import { supabase } from "../../../lib/supabase";
import { MOIS_LABELS, FL, FI, FS } from "./adminShared";

interface Props {
  profsList: { id: string; prenom: string; nom: string }[];
  onClose: () => void;
  onCreated: () => void;
}

export function CreateRecapModal({ profsList, onClose, onCreated }: Props) {
  const now = new Date();
  const [profId, setProfId] = useState(profsList[0]?.id ?? "");
  const [mois, setMois] = useState(String(now.getMonth() + 1));
  const [annee, setAnnee] = useState(String(now.getFullYear()));
  const [step, setStep] = useState<"form" | "orphans">("form");
  const [orphans, setOrphans] = useState<any[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [checking, setChecking] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleNext() {
    if (!profId) return;
    setChecking(true); setError("");
    // Check recap doesn't already exist
    const { data: existing } = await supabase.from("recap_mensuel")
      .select("id").eq("prof_id", profId).eq("mois", Number(mois)).eq("annee", Number(annee)).maybeSingle();
    if (existing) {
      setError(`Un récap existe déjà pour ce prof sur ${MOIS_LABELS[Number(mois) - 1]} ${annee}.`);
      setChecking(false); return;
    }
    // Find orphan cours (recap_id is null) for this prof in this month
    const startDate = `${annee}-${String(mois).padStart(2, "0")}-01`;
    const endDate   = `${annee}-${String(mois).padStart(2, "0")}-31`;
    const { data: found } = await supabase.from("cours")
      .select("id, eleve_nom, eleve_id, matiere, date, montant, duree_heures")
      .eq("prof_id", profId)
      .is("recap_id", null)
      .gte("date", startDate).lte("date", endDate)
      .order("date", { ascending: true });
    setOrphans(found ?? []);
    setSelected(new Set((found ?? []).map((c: any) => c.id))); // pre-select all
    setStep("orphans");
    setChecking(false);
  }

  function toggleAll() {
    if (selected.size === orphans.length) setSelected(new Set());
    else setSelected(new Set(orphans.map((c) => c.id)));
  }

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  async function handleCreate() {
    setSaving(true);
    // 1. Create the recap
    const { data: newRecap, error: insertErr } = await supabase.from("recap_mensuel")
      .insert({ prof_id: profId, mois: Number(mois), annee: Number(annee), statut: "en_cours" })
      .select().single();
    if (insertErr || !newRecap) {
      setError(insertErr?.message ?? "Erreur lors de la création du récap.");
      setSaving(false); return;
    }
    // 2. Attach selected orphan cours
    const toAttach = orphans.filter((c) => selected.has(c.id));
    if (toAttach.length > 0) {
      await supabase.from("cours").update({ recap_id: newRecap.id }).in("id", toAttach.map((c) => c.id));
      // 3. Create recap_eleve_validation for each unique eleve with a valid eleve_id
      const uniqueEleveIds = [...new Set(toAttach.filter((c) => c.eleve_id).map((c) => c.eleve_id))];
      if (uniqueEleveIds.length > 0) {
        await supabase.from("recap_eleve_validation").upsert(
          uniqueEleveIds.map((eleveId) => ({ recap_id: newRecap.id, eleve_id: eleveId, statut: "en_attente_parent" })),
          { onConflict: "recap_id,eleve_id" }
        );
      }
    }
    onCreated(); onClose();
    setSaving(false);
  }

  const totalMontant = orphans.filter((c) => selected.has(c.id)).reduce((s, c) => s + Number(c.montant), 0);
  const prof = profsList.find((p) => p.id === profId);
  const YEARS = [String(now.getFullYear()), String(now.getFullYear() - 1), String(now.getFullYear() - 2)];

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] px-4 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="border-b border-slate-100 px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div>
            <h3 className="font-bold text-slate-900">Créer un récap manuellement</h3>
            <p className="font-mono text-xs text-slate-400 mt-0.5">INSERT INTO recap_mensuel + UPDATE cours SET recap_id</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 transition-colors"><X className="w-4 h-4 text-slate-500" /></button>
        </div>

        {step === "form" && (
          <div className="p-6 space-y-4">
            <div>
              <label className={FL}>prof</label>
              <select value={profId} onChange={(e) => setProfId(e.target.value)} className={FS}>
                {profsList.map((p) => <option key={p.id} value={p.id}>{p.prenom} {p.nom}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={FL}>mois</label>
                <select value={mois} onChange={(e) => setMois(e.target.value)} className={FS}>
                  {MOIS_LABELS.map((m, i) => <option key={i + 1} value={String(i + 1)}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className={FL}>annee</label>
                <select value={annee} onChange={(e) => setAnnee(e.target.value)} className={FS}>
                  {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>
            {error && <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3">{error}</p>}
            <div className="flex gap-3 pt-2">
              <button onClick={onClose} className="flex-1 px-4 py-2.5 text-sm font-medium border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">Annuler</button>
              <button onClick={handleNext} disabled={!profId || checking}
                className="flex-1 px-4 py-2.5 text-sm font-semibold bg-slate-900 text-white rounded-xl hover:bg-primary disabled:opacity-50 flex items-center justify-center gap-2 transition-colors">
                {checking ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Chercher cours orphelins →
              </button>
            </div>
          </div>
        )}

        {step === "orphans" && (
          <>
            <div className="px-6 py-4 border-b border-slate-100 flex-shrink-0">
              <p className="text-sm text-slate-700">
                Récap pour <strong>{prof?.prenom} {prof?.nom}</strong> — <strong>{MOIS_LABELS[Number(mois) - 1]} {annee}</strong>
              </p>
              {orphans.length === 0
                ? <p className="text-sm text-slate-500 mt-1">Aucun cours orphelin trouvé pour cette période. Le récap sera créé vide.</p>
                : <p className="text-sm text-slate-500 mt-1">{orphans.length} cours orphelins trouvés (recap_id = null). Sélectionne ceux à rattacher.</p>}
            </div>

            {orphans.length > 0 && (
              <div className="flex-1 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200 sticky top-0">
                    <tr>
                      <th className="px-4 py-2.5 w-10">
                        <input type="checkbox" checked={selected.size === orphans.length} onChange={toggleAll}
                          className="rounded w-3.5 h-3.5 accent-primary" />
                      </th>
                      <th className="text-left px-3 py-2.5 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wide">date</th>
                      <th className="text-left px-3 py-2.5 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wide">eleve_nom</th>
                      <th className="text-left px-3 py-2.5 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wide">matiere</th>
                      <th className="text-left px-3 py-2.5 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wide">duree_h</th>
                      <th className="text-right px-3 py-2.5 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wide">montant</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {orphans.map((c) => (
                      <tr key={c.id} className={`transition-colors ${selected.has(c.id) ? "bg-primary/5" : "hover:bg-slate-50/60"}`}>
                        <td className="px-4 py-2.5 text-center">
                          <input type="checkbox" checked={selected.has(c.id)} onChange={() => toggleOne(c.id)}
                            className="rounded w-3.5 h-3.5 accent-primary" />
                        </td>
                        <td className="px-3 py-2.5 font-mono text-xs text-slate-500">{c.date}</td>
                        <td className="px-3 py-2.5 font-medium text-slate-900">{c.eleve_nom}</td>
                        <td className="px-3 py-2.5 text-slate-500">{c.matiere}</td>
                        <td className="px-3 py-2.5 font-mono text-slate-600">{c.duree_heures}h</td>
                        <td className="px-3 py-2.5 font-mono font-semibold text-slate-700 text-right">{Number(c.montant).toFixed(2)} €</td>
                      </tr>
                    ))}
                  </tbody>
                  {orphans.length > 0 && (
                    <tfoot>
                      <tr className="border-t-2 border-slate-200 bg-slate-50">
                        <td colSpan={5} className="px-3 py-2.5 text-xs font-mono font-bold text-slate-500 text-right">{selected.size} cours sélectionnés</td>
                        <td className="px-3 py-2.5 font-mono font-bold text-slate-900 text-right">{totalMontant.toFixed(2)} €</td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            )}

            <div className="border-t border-slate-100 px-6 py-4 flex gap-3 flex-shrink-0">
              <button onClick={() => { setStep("form"); setError(""); }} className="px-4 py-2.5 text-sm font-medium border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">← Retour</button>
              <button onClick={handleCreate} disabled={saving}
                className="flex-1 px-4 py-2.5 text-sm font-semibold bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Créer le récap {selected.size > 0 ? `+ rattacher ${selected.size} cours` : "(vide)"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
