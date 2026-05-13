import React, { useEffect, useState } from "react";
import { Loader2, Plus, Trash2, Search, Users, UserCheck, X, Link2, GraduationCap } from "lucide-react";
import { supabase } from "../../../lib/supabase";
import { FL, FS, TH, TD, CopyID, AdminEditModal } from "./adminShared";

interface Parent { id: string; prenom: string; nom: string; email: string; }
interface Eleve  { id: string; prof_id: string; nom: string; matiere: string; niveau: string; statut: string; }
interface Prof   { id: string; prenom: string; nom: string; }
interface Link   { parent_id: string; eleve_id: string; }

export function AdminLiaisons() {
  const [parents, setParents] = useState<Parent[]>([]);
  const [eleves,  setEleves]  = useState<Eleve[]>([]);
  const [profs,   setProfs]   = useState<Prof[]>([]);
  const [links,   setLinks]   = useState<Link[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  const [selectedParentId, setSelectedParentId] = useState<string | null>(null);
  const [searchParent,     setSearchParent]     = useState("");

  const [showAdd,    setShowAdd]    = useState(false);
  const [addEleveId, setAddEleveId] = useState("");
  const [saving,     setSaving]     = useState(false);

  // ── Load ──────────────────────────────────────────────────────────────────────

  async function load() {
    setLoading(true);
    const [
      { data: parentsData, error: e1 },
      { data: elevesData,  error: e2 },
      { data: profsData,   error: e3 },
      { data: linksData,   error: e4 },
    ] = await Promise.all([
      supabase.from("profiles").select("id, prenom, nom, email").eq("role", "parent").order("nom"),
      supabase.from("eleves").select("id, prof_id, nom, matiere, niveau, statut").order("nom"),
      supabase.from("profiles").select("id, prenom, nom").eq("role", "prof"),
      supabase.from("parent_eleve").select("parent_id, eleve_id"),
    ]);
    if (e1 || e2 || e3 || e4) setError("Erreur lors du chargement.");
    setParents(parentsData ?? []);
    setEleves(elevesData ?? []);
    setProfs(profsData ?? []);
    setLinks(linksData ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  // ── Dérivés ───────────────────────────────────────────────────────────────────

  const selectedParent = parents.find(p => p.id === selectedParentId) ?? null;
  const filteredParents = parents.filter(p =>
    `${p.prenom} ${p.nom} ${p.email}`.toLowerCase().includes(searchParent.toLowerCase())
  );

  const linkedEleveIds = links.filter(l => l.parent_id === selectedParentId).map(l => l.eleve_id);
  const linkedEleves   = eleves.filter(e => linkedEleveIds.includes(e.id));

  const profMap = new Map(profs.map(p => [p.id, `${p.prenom} ${p.nom}`]));

  const countForParent = (parentId: string) => links.filter(l => l.parent_id === parentId).length;

  // Élèves non encore liés à ce parent
  const unlinkableEleves = eleves.filter(e => !linkedEleveIds.includes(e.id));

  // ── Actions ───────────────────────────────────────────────────────────────────

  async function addLink() {
    if (!selectedParentId || !addEleveId) return;
    setSaving(true);
    const { error } = await supabase.from("parent_eleve").insert({ parent_id: selectedParentId, eleve_id: addEleveId });
    if (error) { setError(error.message); setSaving(false); return; }
    await load();
    setShowAdd(false);
    setAddEleveId("");
    setSaving(false);
  }

  async function removeLink(eleveId: string) {
    if (!selectedParentId) return;
    const { error } = await supabase
      .from("parent_eleve")
      .delete()
      .eq("parent_id", selectedParentId)
      .eq("eleve_id", eleveId);
    if (error) { setError(error.message); return; }
    setLinks(prev => prev.filter(l => !(l.parent_id === selectedParentId && l.eleve_id === eleveId)));
  }

  // ── Render ────────────────────────────────────────────────────────────────────

  if (loading) return (
    <div className="flex items-center justify-center py-20 text-slate-400">
      <Loader2 className="w-5 h-5 animate-spin mr-2" /> Chargement…
    </div>
  );

  return (
    <div>
      <div className="mb-5 flex items-start justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900 mb-0.5">Liaisons Parents — Élèves</h2>
          <p className="text-xs text-slate-400">Associer un compte parent à un ou plusieurs élèves.</p>
        </div>
        <div className="text-xs font-mono text-slate-400 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5">
          {parents.length} parents · {links.length} liens
        </div>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-xs text-red-700 flex items-center gap-2">
          <X className="w-3.5 h-3.5 shrink-0" />{error}
          <button onClick={() => setError(null)} className="ml-auto underline">Fermer</button>
        </div>
      )}

      <div className="grid grid-cols-[280px_1fr] gap-4 items-start">

        {/* ── Colonne gauche : liste des parents ── */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input value={searchParent} onChange={e => setSearchParent(e.target.value)}
                placeholder="Chercher un parent…"
                className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-500 placeholder:text-slate-300" />
            </div>
          </div>
          <div className="max-h-[calc(100vh-260px)] overflow-y-auto divide-y divide-slate-50">
            {filteredParents.length === 0 && (
              <p className="text-xs text-slate-400 text-center py-6">Aucun résultat</p>
            )}
            {filteredParents.map(parent => {
              const count = countForParent(parent.id);
              const active = selectedParentId === parent.id;
              return (
                <button key={parent.id} onClick={() => setSelectedParentId(parent.id)}
                  className={`w-full text-left px-4 py-3 transition-colors ${active ? "bg-blue-50" : "hover:bg-slate-50"}`}>
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className={`text-sm font-semibold truncate ${active ? "text-blue-700" : "text-slate-800"}`}>
                        {parent.prenom} {parent.nom}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate">{parent.email}</p>
                    </div>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                      count > 0 ? "bg-blue-100 text-blue-600" : "bg-slate-50 text-slate-300"
                    }`}>
                      {count}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Colonne droite ── */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          {!selectedParent ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
              <Users className="w-8 h-8 opacity-30" />
              <p className="text-sm">Sélectionnez un parent à gauche</p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                    <UserCheck className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{selectedParent.prenom} {selectedParent.nom}</p>
                    <p className="text-[11px] text-slate-400">{selectedParent.email} · {linkedEleves.length} élève(s) lié(s)</p>
                  </div>
                </div>
                <button onClick={() => { setShowAdd(true); setAddEleveId(""); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-blue-600 transition-colors">
                  <Plus className="w-3.5 h-3.5" /> Lier un élève
                </button>
              </div>

              {/* Table */}
              {linkedEleves.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-2">
                  <Link2 className="w-7 h-7 opacity-25" />
                  <p className="text-sm">Aucun élève lié à ce parent.</p>
                  <button onClick={() => { setShowAdd(true); setAddEleveId(""); }}
                    className="text-xs text-blue-600 hover:underline font-semibold mt-1">
                    + Lier un premier élève
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b border-slate-100">
                      <tr>
                        <th className={TH}>Élève</th>
                        <th className={TH}>Matière · Niveau</th>
                        <th className={TH}>Prof</th>
                        <th className={TH}>Statut</th>
                        <th className={TH}></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {linkedEleves.map(eleve => (
                        <tr key={eleve.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className={TD}>
                            <p className="font-medium text-slate-900">{eleve.nom}</p>
                            <CopyID id={eleve.id} />
                          </td>
                          <td className={TD + " text-slate-600"}>
                            {eleve.matiere}
                            <span className="text-slate-400"> · {eleve.niveau}</span>
                          </td>
                          <td className={TD}>
                            <span className="flex items-center gap-1.5 text-slate-600">
                              <GraduationCap className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              {profMap.get(eleve.prof_id) ?? <span className="text-slate-300 italic">—</span>}
                            </span>
                          </td>
                          <td className={TD}>
                            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                              eleve.statut === "actif" ? "bg-emerald-100 text-emerald-700"
                              : eleve.statut === "en pause" ? "bg-slate-100 text-slate-500"
                              : "bg-red-100 text-red-600"
                            }`}>
                              {eleve.statut}
                            </span>
                          </td>
                          <td className={TD}>
                            <button
                              onClick={() => removeLink(eleve.id)}
                              className="flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-red-600 transition-colors px-2 py-1 rounded-md hover:bg-red-50">
                              <Trash2 className="w-3 h-3" /> Délier
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── Modal : lier un élève ── */}
      {showAdd && selectedParent && (
        <AdminEditModal
          title={`Lier un élève — ${selectedParent.prenom} ${selectedParent.nom}`}
          onClose={() => { setShowAdd(false); setAddEleveId(""); }}
          onSave={addLink}
          saving={saving}>
          <div>
            <label className={FL}>Élève à lier *</label>
            <select className={FS} value={addEleveId} onChange={e => setAddEleveId(e.target.value)}>
              <option value="">Sélectionner un élève…</option>
              {unlinkableEleves.map(e => (
                <option key={e.id} value={e.id}>
                  {e.nom} — {e.matiere} {e.niveau} ({profMap.get(e.prof_id) ?? "sans prof"})
                </option>
              ))}
            </select>
          </div>
          {unlinkableEleves.length === 0 && (
            <p className="text-xs text-slate-400 italic">Tous les élèves sont déjà liés à ce parent.</p>
          )}
        </AdminEditModal>
      )}
    </div>
  );
}
