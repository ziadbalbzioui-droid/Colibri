import React, { useEffect, useState } from "react";
import { Loader2, Plus, ArrowLeftRight, Search, Users, UserCheck, Check, X } from "lucide-react";
import { supabase } from "../../../lib/supabase";
import { FL, FI, FS, TH, TD, CopyID, AdminEditModal } from "./adminShared";
import { MATIERES_FORM, NIVEAUX_FORM } from "./adminShared";

interface Prof  { id: string; prenom: string; nom: string; email: string; }
interface Eleve { id: string; prof_id: string; nom: string; matiere: string; niveau: string; tarif_heure: number; statut: string; code_invitation: string | null; }

const STATUT_ELEVE_STYLE: Record<string, string> = {
  "actif":       "bg-emerald-100 text-emerald-700",
  "en attente":  "bg-amber-100 text-amber-700",
  "en pause":    "bg-slate-100 text-slate-500",
  "terminé":     "bg-red-100 text-red-600",
};

export function AdminLiaisons() {
  const [profs,   setProfs]   = useState<Prof[]>([]);
  const [eleves,  setEleves]  = useState<Eleve[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  const [selectedProfId, setSelectedProfId] = useState<string | null>(null);
  const [searchProf,     setSearchProf]     = useState("");
  const [searchEleve,    setSearchEleve]    = useState("");

  // Modal: créer un élève
  const [showCreate, setShowCreate] = useState(false);
  const [newNom,     setNewNom]     = useState("");
  const [newMatiere, setNewMatiere] = useState("");
  const [newNiveau,  setNewNiveau]  = useState("");
  const [newTarif,   setNewTarif]   = useState("");

  // Modal: réassigner
  const [reassigning,    setReassigning]    = useState<Eleve | null>(null);
  const [newProfId,      setNewProfId]      = useState("");

  const [saving, setSaving] = useState(false);

  // ── Load ────────────────────────────────────────────────────────────────────

  async function load() {
    setLoading(true);
    const [{ data: profsData, error: e1 }, { data: elevesData, error: e2 }] = await Promise.all([
      supabase.from("profiles").select("id, prenom, nom, email").eq("role", "prof").order("nom"),
      supabase.from("eleves").select("id, prof_id, nom, matiere, niveau, tarif_heure, statut, code_invitation").order("nom"),
    ]);
    if (e1 || e2) setError("Erreur lors du chargement.");
    setProfs(profsData ?? []);
    setEleves(elevesData ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  // ── Dérivés ─────────────────────────────────────────────────────────────────

  const selectedProf  = profs.find(p => p.id === selectedProfId) ?? null;
  const elevesOfProf  = eleves.filter(e => e.prof_id === selectedProfId);
  const filteredEleves = elevesOfProf.filter(e =>
    e.nom.toLowerCase().includes(searchEleve.toLowerCase())
  );
  const filteredProfs = profs.filter(p =>
    `${p.prenom} ${p.nom} ${p.email}`.toLowerCase().includes(searchProf.toLowerCase())
  );

  // ── Actions ──────────────────────────────────────────────────────────────────

  async function createEleve() {
    if (!selectedProfId || !newNom.trim() || !newMatiere || !newNiveau) return;
    setSaving(true);
    const { error } = await supabase.from("eleves").insert({
      prof_id:     selectedProfId,
      nom:         newNom.trim(),
      matiere:     newMatiere,
      niveau:      newNiveau,
      tarif_heure: parseFloat(newTarif) || 0,
      statut:      "actif",
    });
    if (error) { setError(error.message); setSaving(false); return; }
    await load();
    setShowCreate(false);
    setNewNom(""); setNewMatiere(""); setNewNiveau(""); setNewTarif("");
    setSaving(false);
  }

  async function reassignEleve() {
    if (!reassigning || !newProfId || newProfId === reassigning.prof_id) return;
    setSaving(true);
    const { error } = await supabase.from("eleves").update({ prof_id: newProfId }).eq("id", reassigning.id);
    if (error) { setError(error.message); setSaving(false); return; }
    await load();
    setReassigning(null);
    setNewProfId("");
    setSaving(false);
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  if (loading) return (
    <div className="flex items-center justify-center py-20 text-slate-400">
      <Loader2 className="w-5 h-5 animate-spin mr-2" /> Chargement…
    </div>
  );

  return (
    <div>
      <div className="mb-5 flex items-start justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900 mb-0.5">Liaisons Profs — Élèves</h2>
          <p className="text-xs text-slate-400">Créer des élèves et les assigner à un prof, ou réassigner un élève existant.</p>
        </div>
        <div className="text-xs font-mono text-slate-400 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5">
          {profs.length} profs · {eleves.length} élèves
        </div>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-xs text-red-700 flex items-center gap-2">
          <X className="w-3.5 h-3.5 shrink-0" />{error}
          <button onClick={() => setError(null)} className="ml-auto underline">Fermer</button>
        </div>
      )}

      <div className="grid grid-cols-[280px_1fr] gap-4 items-start">

        {/* ── Colonne gauche : liste des profs ── */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input value={searchProf} onChange={e => setSearchProf(e.target.value)}
                placeholder="Chercher un prof…"
                className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-500 placeholder:text-slate-300" />
            </div>
          </div>
          <div className="max-h-[calc(100vh-260px)] overflow-y-auto divide-y divide-slate-50">
            {filteredProfs.length === 0 && (
              <p className="text-xs text-slate-400 text-center py-6">Aucun résultat</p>
            )}
            {filteredProfs.map(prof => {
              const count = eleves.filter(e => e.prof_id === prof.id).length;
              const active = selectedProfId === prof.id;
              return (
                <button key={prof.id} onClick={() => { setSelectedProfId(prof.id); setSearchEleve(""); }}
                  className={`w-full text-left px-4 py-3 transition-colors ${active ? "bg-blue-50" : "hover:bg-slate-50"}`}>
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className={`text-sm font-semibold truncate ${active ? "text-blue-700" : "text-slate-800"}`}>
                        {prof.prenom} {prof.nom}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate">{prof.email}</p>
                    </div>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                      count > 0 ? "bg-slate-100 text-slate-600" : "bg-slate-50 text-slate-300"
                    }`}>
                      {count}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Colonne droite : contenu ── */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          {!selectedProf ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
              <Users className="w-8 h-8 opacity-30" />
              <p className="text-sm">Sélectionnez un prof à gauche</p>
            </div>
          ) : (
            <>
              {/* Header du prof sélectionné */}
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                    <UserCheck className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{selectedProf.prenom} {selectedProf.nom}</p>
                    <p className="text-[11px] text-slate-400">{selectedProf.email} · {elevesOfProf.length} élève(s)</p>
                  </div>
                </div>
                <button onClick={() => setShowCreate(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-blue-600 transition-colors">
                  <Plus className="w-3.5 h-3.5" /> Créer un élève
                </button>
              </div>

              {/* Barre de recherche élèves */}
              {elevesOfProf.length > 0 && (
                <div className="px-6 pt-4">
                  <div className="relative max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input value={searchEleve} onChange={e => setSearchEleve(e.target.value)}
                      placeholder="Filtrer les élèves…"
                      className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-500 placeholder:text-slate-300" />
                  </div>
                </div>
              )}

              {/* Table des élèves */}
              {elevesOfProf.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-2">
                  <p className="text-sm">Aucun élève pour ce prof.</p>
                  <button onClick={() => setShowCreate(true)}
                    className="text-xs text-blue-600 hover:underline font-semibold mt-1">
                    + Créer le premier élève
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto mt-4">
                  <table className="w-full text-sm">
                    <thead className="border-b border-slate-100">
                      <tr>
                        <th className={TH}>Élève</th>
                        <th className={TH}>Matière</th>
                        <th className={TH}>Niveau</th>
                        <th className={TH}>Tarif / h</th>
                        <th className={TH}>Statut</th>
                        <th className={TH}>Code invite</th>
                        <th className={TH}>Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {filteredEleves.map(eleve => (
                        <tr key={eleve.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className={TD}>
                            <p className="font-medium text-slate-900">{eleve.nom}</p>
                            <CopyID id={eleve.id} />
                          </td>
                          <td className={TD + " text-slate-600"}>{eleve.matiere}</td>
                          <td className={TD + " text-slate-600"}>{eleve.niveau}</td>
                          <td className={TD + " tabular-nums text-slate-700 font-medium"}>{eleve.tarif_heure} €</td>
                          <td className={TD}>
                            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${STATUT_ELEVE_STYLE[eleve.statut] ?? "bg-slate-100 text-slate-500"}`}>
                              {eleve.statut}
                            </span>
                          </td>
                          <td className={TD}>
                            {eleve.code_invitation
                              ? <span className="font-mono text-xs text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">{eleve.code_invitation}</span>
                              : <span className="text-slate-300 text-xs">—</span>
                            }
                          </td>
                          <td className={TD}>
                            <button
                              onClick={() => { setReassigning(eleve); setNewProfId(""); }}
                              className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors px-2 py-1 rounded-md hover:bg-blue-50">
                              <ArrowLeftRight className="w-3 h-3" /> Réassigner
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

      {/* ── Modal : créer un élève ── */}
      {showCreate && selectedProf && (
        <AdminEditModal
          title={`Nouvel élève — ${selectedProf.prenom} ${selectedProf.nom}`}
          onClose={() => { setShowCreate(false); setNewNom(""); setNewMatiere(""); setNewNiveau(""); setNewTarif(""); }}
          onSave={createEleve}
          saving={saving}>
          <div>
            <label className={FL}>Nom de l'élève *</label>
            <input className={FI} value={newNom} onChange={e => setNewNom(e.target.value)} placeholder="Prénom Nom" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={FL}>Matière *</label>
              <select className={FS} value={newMatiere} onChange={e => setNewMatiere(e.target.value)}>
                <option value="">Sélectionner…</option>
                {MATIERES_FORM.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className={FL}>Niveau *</label>
              <select className={FS} value={newNiveau} onChange={e => setNewNiveau(e.target.value)}>
                <option value="">Sélectionner…</option>
                {NIVEAUX_FORM.map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className={FL}>Tarif horaire (€)</label>
            <input className={FI} type="number" min="0" step="0.5" value={newTarif} onChange={e => setNewTarif(e.target.value)} placeholder="Ex : 25" />
          </div>
        </AdminEditModal>
      )}

      {/* ── Modal : réassigner ── */}
      {reassigning && (
        <AdminEditModal
          title={`Réassigner — ${reassigning.nom}`}
          onClose={() => { setReassigning(null); setNewProfId(""); }}
          onSave={reassignEleve}
          saving={saving}>
          <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-xs text-slate-600 space-y-1">
            <p><span className="font-mono font-bold text-slate-400 uppercase tracking-wide">Élève</span> — {reassigning.nom}</p>
            <p><span className="font-mono font-bold text-slate-400 uppercase tracking-wide">Prof actuel</span> — {profs.find(p => p.id === reassigning.prof_id)?.prenom} {profs.find(p => p.id === reassigning.prof_id)?.nom}</p>
          </div>
          <div>
            <label className={FL}>Nouveau prof *</label>
            <select className={FS} value={newProfId} onChange={e => setNewProfId(e.target.value)}>
              <option value="">Sélectionner un prof…</option>
              {profs.filter(p => p.id !== reassigning.prof_id).map(p => (
                <option key={p.id} value={p.id}>{p.prenom} {p.nom} — {p.email}</option>
              ))}
            </select>
          </div>
          {newProfId && (
            <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
              <Check className="w-3.5 h-3.5 shrink-0" />
              L'élève sera rattaché à {profs.find(p => p.id === newProfId)?.prenom} {profs.find(p => p.id === newProfId)?.nom}.
            </div>
          )}
        </AdminEditModal>
      )}
    </div>
  );
}
