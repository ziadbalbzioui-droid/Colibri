import { useState, useEffect } from "react";
import { Search, Plus, X, Clock, Euro, ChevronRight, AlertCircle, Loader2, Copy } from "lucide-react";
import { useEleves } from "../../../lib/hooks/useEleves";
import type { EleveRow } from "../../../lib/hooks/useEleves";
import { useAuth } from "../../../lib/auth";
import { LoadingGuard } from "../layout/LoadingGuard";
import { supabase } from "../../../lib/supabase";

const TODAY = new Date();

function daysSince(dateStr: string): number {
  if (!dateStr) return Infinity;
  return Math.floor((TODAY.getTime() - new Date(dateStr).getTime()) / 86400000);
}

function formatDernierCours(dateStr: string): string {
  if (!dateStr) return "—";
  const days = daysSince(dateStr);
  if (days === 0) return "Aujourd'hui";
  if (days === 1) return "Hier";
  if (days < 7) return `Il y a ${days}j`;
  if (days < 30) return `Il y a ${Math.floor(days / 7)}sem`;
  return `Il y a ${Math.floor(days / 30)}mois`;
}

const statutColors: Record<string, string> = {
  "actif": "bg-green-100 text-green-700",
  "en attente": "bg-blue-100 text-blue-700",
  "en attente parent": "bg-amber-100 text-amber-700",
  "en pause": "bg-amber-100 text-amber-700",
  "terminé": "bg-gray-100 text-gray-500",
};

const niveaux = ["6ème", "5ème", "4ème", "3ème", "2nde", "1ère S", "1ère ES", "Terminale S", "Terminale ES", "BTS", "Licence 1", "Licence 2", "Licence 3"];
const MATIERES = ["Mathématiques", "Physique", "Chimie", "Français", "Anglais", "Espagnol", "Allemand", "Histoire-Géographie", "SES", "SVT", "NSI", "Philosophie", "Autre"];
const emptyForm = { nom: "", niveau: "2nde", matieres: [] as string[], tarif_heure: 25, statut: "actif" as EleveRow["statut"] };

function RegularityGraph({ heures }: { heures: number[] }) {
  const max = Math.max(...heures, 0.1);
  const labels = ["S-8", "S-7", "S-6", "S-5", "S-4", "S-3", "S-2", "S-1"];
  return (
    <div>
      <div className="flex items-end gap-1.5" style={{ height: 56 }}>
        {heures.map((h, i) => {
          const barH = Math.round((h / max) * 48);
          const color = h === 0 ? "bg-gray-200" : h >= 2 ? "bg-green-400" : "bg-amber-300";
          return (
            <div key={i} className="flex-1 flex flex-col justify-end">
              <div className={`${color} rounded-sm w-full`} style={{ height: barH || 3 }} title={`${h}h`} />
            </div>
          );
        })}
      </div>
      <div className="flex gap-1.5 mt-1">
        {labels.map((l) => (
          <div key={l} className="flex-1 text-center text-muted-foreground" style={{ fontSize: 9 }}>{l}</div>
        ))}
      </div>
    </div>
  );
}

export function Eleves() {
  const { profile } = useAuth();
  const { eleves, loading, error, reload, addEleve, updateNotes, updateStatut, updateTags } = useEleves();
  const hasSiret = !!profile?.siret;
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [newTag, setNewTag] = useState("");
  const [matiereInput, setMatiereInput] = useState("");
  const [showMatiereDropdown, setShowMatiereDropdown] = useState(false);
  const [saving, setSaving] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [parentsMap, setParentsMap] = useState<Record<string, boolean>>({});
  const [parentsLoaded, setParentsLoaded] = useState(false);

  useEffect(() => {
    async function fetchParents() {
      if (!eleves || eleves.length === 0) {
        setParentsLoaded(true);
        return;
      }
      const { data } = await supabase
        .from("parent_eleve")
        .select("eleve_id")
        .in("eleve_id", eleves.map((e: EleveRow) => e.id));
      if (data) {
        const map: Record<string, boolean> = {};
        data.forEach((d) => { map[d.eleve_id] = true; });
        setParentsMap(map);
      }
      setParentsLoaded(true);
    }
    fetchParents();
  }, [eleves]);

  const filtered = eleves.filter((e: EleveRow) =>
    e.nom.toLowerCase().includes(search.toLowerCase()) ||
    e.matiere.toLowerCase().includes(search.toLowerCase()) ||
    e.tags.some((t: string) => t.toLowerCase().includes(search.toLowerCase()))
  );

  const selectedEleve = eleves.find((e: EleveRow) => e.id === selectedId) ?? null;

  async function handleAdd() {
    if (!form.nom || form.matieres.length === 0) return;
    setSaving(true);
    setAddError(null);
    try {
      await addEleve(
        { nom: form.nom, niveau: form.niveau, matiere: form.matieres.join(", "), tarif_heure: form.tarif_heure, statut: form.statut },
        []
      );
      setShowAdd(false);
      setForm(emptyForm);
    } catch (err) {
      setAddError(err instanceof Error ? err.message : "Erreur lors de l'ajout");
    } finally {
      setSaving(false);
    }
  }

  async function handleAddTag(id: string, tag: string) {
    const t = tag.trim();
    if (!t) return;
    const eleve = eleves.find((e: EleveRow) => e.id === id);
    if (eleve && !eleve.tags.includes(t)) {
      await updateTags(id, [...eleve.tags, t]);
    }
    setNewTag("");
  }

  async function handleRemoveTag(id: string, tag: string) {
    const eleve = eleves.find((e: EleveRow) => e.id === id);
    if (eleve) await updateTags(id, eleve.tags.filter((t: string) => t !== tag));
  }

  return (
    <LoadingGuard loading={loading} error={error} onRetry={reload}>
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1>Élèves</h1>
          <p className="text-muted-foreground mt-1">{eleves.length} élèves enregistrés</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          disabled={!hasSiret}
          title={!hasSiret ? "Renseignez votre SIRET pour débloquer cette action" : undefined}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4" />
          Ajouter un élève
        </button>
      </div>

      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <div className="p-4 border-b border-border">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Rechercher un élève, matière, tag..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-muted rounded-lg border-none outline-none"
            />
          </div>
        </div>

        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left px-6 py-3 text-muted-foreground" style={{ fontSize: 13, fontWeight: 500 }}>Nom</th>
              <th className="text-left px-6 py-3 text-muted-foreground" style={{ fontSize: 13, fontWeight: 500 }}>Niveau</th>
              <th className="text-left px-6 py-3 text-muted-foreground" style={{ fontSize: 13, fontWeight: 500 }}>Matière</th>
              <th className="text-left px-6 py-3 text-muted-foreground" style={{ fontSize: 13, fontWeight: 500 }}>Tarif/h</th>
              <th className="text-left px-6 py-3 text-muted-foreground" style={{ fontSize: 13, fontWeight: 500 }}>Statut</th>
              <th className="text-left px-6 py-3 text-muted-foreground" style={{ fontSize: 13, fontWeight: 500 }}>Dernier cours</th>
              <th className="px-6 py-3" />
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                  {eleves.length === 0 ? "Ajoutez votre premier élève" : "Aucun résultat"}
                </td>
              </tr>
            ) : filtered.map((eleve: EleveRow) => {
              const inactive = eleve.statut === "actif" && daysSince(eleve.dernier_cours) >= 14;
              return (
                <tr
                  key={eleve.id}
                  className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors cursor-pointer"
                  onClick={() => setSelectedId(eleve.id)}
                >
                  <td className="px-6 py-3">
                    <div style={{ fontWeight: 500 }}>{eleve.nom}</div>
                    {eleve.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {eleve.tags.slice(0, 2).map((tag: string) => (
                          <span key={tag} className="bg-secondary text-secondary-foreground px-1.5 py-0.5 rounded" style={{ fontSize: 11 }}>
                            {tag}
                          </span>
                        ))}
                        {eleve.tags.length > 2 && (
                          <span className="text-muted-foreground" style={{ fontSize: 11 }}>+{eleve.tags.length - 2}</span>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-3 text-muted-foreground">{eleve.niveau}</td>
                  <td className="px-6 py-3 text-muted-foreground">{eleve.matiere}</td>
                  <td className="px-6 py-3" style={{ fontWeight: 500 }}>{eleve.tarif_heure} €</td>
                  <td className="px-6 py-3">
                    {(() => {
                      const hasParent = parentsMap[eleve.id];
                      let displayStatut = eleve.statut;
                      if (parentsLoaded && !hasParent && eleve.statut === "actif") {
                        displayStatut = "en attente parent";
                      }
                      return (
                        <span className={`px-2.5 py-1 rounded-full ${statutColors[displayStatut] || "bg-gray-100 text-gray-700"}`} style={{ fontSize: 13 }}>
                          {displayStatut}
                        </span>
                      );
                    })()}
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-1.5">
                      {inactive && <AlertCircle className="w-3.5 h-3.5 text-amber-500" />}
                      <span className={inactive ? "text-amber-600" : "text-muted-foreground"} style={{ fontSize: 13 }}>
                        {formatDernierCours(eleve.dernier_cours)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-3 text-right">
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Detail panel */}
      {selectedEleve && (
        <div className="fixed inset-0 z-40" onClick={() => setSelectedId(null)}>
          <div
            className="absolute right-0 top-0 h-full bg-white shadow-2xl overflow-y-auto"
            style={{ width: 460 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 style={{ fontWeight: 600 }}>{selectedEleve.nom}</h2>
                  <p className="text-muted-foreground mt-0.5" style={{ fontSize: 14 }}>
                    {selectedEleve.niveau} · {selectedEleve.matiere}
                  </p>
                </div>
                <button onClick={() => setSelectedId(null)} className="p-1.5 rounded-lg hover:bg-muted">
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-secondary rounded-xl p-4">
                  <div className="flex items-center gap-1.5 text-muted-foreground mb-1" style={{ fontSize: 12 }}>
                    <Clock className="w-3.5 h-3.5" /> Total heures
                  </div>
                  <p style={{ fontSize: 22, fontWeight: 600 }}>{selectedEleve.total_heures.toFixed(1)}h</p>
                  <p className="text-muted-foreground" style={{ fontSize: 12 }}>
                    ~{(selectedEleve.heures_par_semaine.reduce((a: number, b: number) => a + b, 0) / 8).toFixed(1)}h/sem.
                  </p>
                </div>
                <div className="bg-secondary rounded-xl p-4">
                  <div className="flex items-center gap-1.5 text-muted-foreground mb-1" style={{ fontSize: 12 }}>
                    <Euro className="w-3.5 h-3.5" /> Total payé
                  </div>
                  <p style={{ fontSize: 22, fontWeight: 600 }}>{selectedEleve.total_paye.toFixed(0)} €</p>
                  <p className="text-muted-foreground" style={{ fontSize: 12 }}>{selectedEleve.total_paye > 0 ? `${(selectedEleve.total_paye / (selectedEleve.total_heures || 1)).toFixed(0)} €/h moy.` : ""}</p>
                </div>
              </div>

              <div className="mb-6">
                <p style={{ fontSize: 13, fontWeight: 500 }} className="mb-3">Régularité (8 dernières semaines)</p>
                <RegularityGraph heures={selectedEleve.heures_par_semaine} />
              </div>

              <div className="mb-6">
                <p style={{ fontSize: 13, fontWeight: 500 }} className="mb-2">Tags</p>
                <div className="flex flex-wrap gap-2 mb-2">
                  {selectedEleve.tags.map((tag: string) => (
                    <span key={tag} className="flex items-center gap-1 bg-secondary text-secondary-foreground px-2.5 py-1 rounded-lg" style={{ fontSize: 13 }}>
                      {tag}
                      <button onClick={() => handleRemoveTag(selectedEleve.id, tag)} className="hover:text-red-500 ml-0.5">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") handleAddTag(selectedEleve.id, newTag); }}
                    placeholder="Ajouter un tag..."
                    className="flex-1 px-3 py-1.5 bg-muted rounded-lg outline-none"
                    style={{ fontSize: 13 }}
                  />
                  <button
                    onClick={() => handleAddTag(selectedEleve.id, newTag)}
                    className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg hover:opacity-90"
                    style={{ fontSize: 13 }}
                  >
                    +
                  </button>
                </div>
              </div>

              <div>
                <p style={{ fontSize: 13, fontWeight: 500 }} className="mb-2">Notes privées</p>
                <textarea
                  value={selectedEleve.notes}
                  onChange={(e) => updateNotes(selectedEleve.id, e.target.value)}
                  placeholder="Notes privées sur cet élève..."
                  rows={4}
                  className="w-full px-4 py-3 bg-muted rounded-lg outline-none resize-none"
                  style={{ fontSize: 13 }}
                />
              </div>

                  <div className="mb-6 p-4 bg-primary/5 border border-primary/20 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-primary font-semibold" style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Code d'accès Parent
                      </div>
                      <div className="font-mono text-xl font-bold text-foreground mt-1 tracking-widest">
                        {(selectedEleve as any).code_invitation || "NON GÉNÉRÉ"}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        if ((selectedEleve as any).code_invitation) {
                          navigator.clipboard.writeText((selectedEleve as any).code_invitation);
                        }
                      }}
                      disabled={!(selectedEleve as any).code_invitation}
                      className="p-2.5 bg-white border border-border rounded-lg shadow-sm hover:bg-muted transition-colors disabled:opacity-50"
                      title="Copier le code"
                    >
                      <Copy className="w-5 h-5 text-muted-foreground" />
                    </button>
                  </div>
                  <button
                    onClick={() => {
                      const code = (selectedEleve as any).code_invitation;
                      if (code) {
                        const link = `${window.location.origin}/signup?role=parent&code=${code}`;
                        navigator.clipboard.writeText(link);
                      }
                    }}
                    disabled={!(selectedEleve as any).code_invitation}
                    className="w-full flex items-center justify-center gap-2 bg-white border border-primary/30 text-primary text-sm font-medium py-2 rounded-lg hover:bg-primary/5 transition-colors disabled:opacity-50"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    Copier le lien d'inscription
                  </button>
                </div>

            </div>
          </div>
        </div>
      )}

      {/* Add modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3>Ajouter un élève</h3>
              <button onClick={() => { setShowAdd(false); setAddError(null); }} className="p-1.5 rounded-lg hover:bg-muted">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block mb-1.5 text-muted-foreground" style={{ fontSize: 13 }}>Nom complet</label>
                <input
                  value={form.nom}
                  onChange={(e) => setForm({ ...form, nom: e.target.value })}
                  placeholder="Jean Dupont"
                  className="w-full px-4 py-2.5 bg-muted rounded-lg outline-none"
                />
              </div>
              <div>
                <label className="block mb-1.5 text-muted-foreground" style={{ fontSize: 13 }}>Niveau</label>
                <select
                  value={form.niveau}
                  onChange={(e) => setForm({ ...form, niveau: e.target.value })}
                  className="w-full px-4 py-2.5 bg-muted rounded-lg outline-none"
                >
                  {niveaux.map((n) => <option key={n}>{n}</option>)}
                </select>
              </div>
              <div>
                <label className="block mb-1.5 text-muted-foreground" style={{ fontSize: 13 }}>Matières</label>
                <div className="relative">
                  <input
                    value={matiereInput}
                    onChange={(e) => { setMatiereInput(e.target.value); setShowMatiereDropdown(true); }}
                    onFocus={() => setShowMatiereDropdown(true)}
                    onBlur={() => setTimeout(() => setShowMatiereDropdown(false), 150)}
                    placeholder="Ex: Mathématiques..."
                    className="w-full px-4 py-2.5 bg-muted rounded-lg outline-none"
                  />
                  {showMatiereDropdown && (
                    <ul className="absolute z-10 w-full bg-white border border-border rounded-lg shadow-lg mt-1 max-h-48 overflow-y-auto">
                      {MATIERES
                        .filter((m) => !form.matieres.includes(m) && m.toLowerCase().includes(matiereInput.toLowerCase()))
                        .map((m) => (
                          <li
                            key={m}
                            onMouseDown={() => {
                              setForm({ ...form, matieres: [...form.matieres, m] });
                              setMatiereInput("");
                              setShowMatiereDropdown(false);
                            }}
                            className="px-4 py-2.5 hover:bg-muted cursor-pointer"
                            style={{ fontSize: 13 }}
                          >
                            {m}
                          </li>
                        ))}
                      {matiereInput.trim() && !MATIERES.some((m) => m.toLowerCase() === matiereInput.toLowerCase()) && !form.matieres.includes(matiereInput.trim()) && (
                        <li
                          onMouseDown={() => {
                            setForm({ ...form, matieres: [...form.matieres, matiereInput.trim()] });
                            setMatiereInput("");
                            setShowMatiereDropdown(false);
                          }}
                          className="px-4 py-2.5 hover:bg-muted cursor-pointer text-primary"
                          style={{ fontSize: 13 }}
                        >
                          Ajouter "{matiereInput.trim()}"
                        </li>
                      )}
                    </ul>
                  )}
                </div>
                {form.matieres.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {form.matieres.map((m) => (
                      <span key={m} className="flex items-center gap-1 bg-primary/10 text-primary px-2.5 py-1 rounded-lg" style={{ fontSize: 13 }}>
                        {m}
                        <button type="button" onClick={() => setForm({ ...form, matieres: form.matieres.filter((x) => x !== m) })} className="hover:text-red-500 ml-0.5">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1.5 text-muted-foreground" style={{ fontSize: 13 }}>Tarif / heure (€)</label>
                  <input
                    type="number"
                    value={form.tarif_heure}
                    onChange={(e) => setForm({ ...form, tarif_heure: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 bg-muted rounded-lg outline-none"
                  />
                </div>

              </div>
            </div>
            {addError && (
              <p className="mt-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{addError}</p>
            )}
            <div className="flex gap-3 mt-4">
              <button onClick={() => setShowAdd(false)} className="flex-1 px-4 py-2.5 rounded-lg border border-border hover:bg-muted">
                Annuler
              </button>
              <button
                onClick={handleAdd}
                disabled={!form.nom || form.matieres.length === 0 || saving}
                className="flex-1 bg-primary text-primary-foreground px-4 py-2.5 rounded-lg hover:opacity-90 disabled:opacity-40 flex items-center justify-center gap-2"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                Ajouter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </LoadingGuard>
  );
}