import { useState } from "react";
import { Search, Plus, X, Clock, Euro, TrendingUp, ChevronRight, AlertCircle } from "lucide-react";

interface Eleve {
  id: number;
  nom: string;
  niveau: string;
  matiere: string;
  tarifHeure: number;
  statut: "actif" | "en attente" | "en pause" | "terminé";
  solde: number; // <0 = doit, 0 = à jour, >0 = avance
  tags: string[];
  notes: string;
  dernierCours: string; // YYYY-MM-DD or ""
  totalHeures: number;
  totalPaye: number;
  heuresParSemaine: number[]; // last 8 weeks, oldest first
}

const TODAY = new Date("2026-03-28");

function daysSince(dateStr: string): number {
  if (!dateStr) return Infinity;
  const d = new Date(dateStr);
  return Math.floor((TODAY.getTime() - d.getTime()) / 86400000);
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

const initialEleves: Eleve[] = [
  {
    id: 1, nom: "Lucas Martin", niveau: "Terminale S", matiere: "Mathématiques", tarifHeure: 30,
    statut: "actif", solde: -60, tags: ["Prépare le bac", "Difficultés en algèbre"],
    notes: "Parents très investis. Préfère les exercices pratiques avant la théorie.",
    dernierCours: "2026-03-28", totalHeures: 28, totalPaye: 780,
    heuresParSemaine: [2, 1, 2, 2, 0, 2, 2, 2],
  },
  {
    id: 2, nom: "Emma Dupont", niveau: "1ère ES", matiere: "Anglais", tarifHeure: 25,
    statut: "actif", solde: 0, tags: ["Oraux blancs"],
    notes: "Très motivée. Prépare une mobilité à l'étranger.",
    dernierCours: "2026-03-27", totalHeures: 14, totalPaye: 350,
    heuresParSemaine: [1, 1, 1, 0, 1, 1, 1, 1.5],
  },
  {
    id: 3, nom: "Hugo Bernard", niveau: "3ème", matiere: "Physique-Chimie", tarifHeure: 28,
    statut: "actif", solde: -56, tags: ["Brevet en juin", "Parents exigeants"],
    notes: "Manque de méthode mais bon niveau. Travailler les raisonnements.",
    dernierCours: "2026-03-26", totalHeures: 20, totalPaye: 504,
    heuresParSemaine: [2, 2, 2, 1, 2, 2, 0, 2],
  },
  {
    id: 4, nom: "Léa Petit", niveau: "2nde", matiere: "Français", tarifHeure: 25,
    statut: "en pause", solde: 0, tags: ["En pause – voyage scolaire"],
    notes: "Reprend début avril.",
    dernierCours: "2026-03-05", totalHeures: 9, totalPaye: 225,
    heuresParSemaine: [1, 1, 1, 1, 0, 0, 0, 0],
  },
  {
    id: 5, nom: "Nathan Moreau", niveau: "Terminale ES", matiere: "SES", tarifHeure: 30,
    statut: "actif", solde: 0, tags: ["Prépare le bac", "Sciences Po en mire"],
    notes: "Très autonome. Travail sur la méthodologie dissertation.",
    dernierCours: "2026-03-25", totalHeures: 16, totalPaye: 450,
    heuresParSemaine: [1, 1, 2, 1, 1, 1, 1, 1],
  },
  {
    id: 6, nom: "Chloé Roux", niveau: "6ème", matiere: "Mathématiques", tarifHeure: 22,
    statut: "terminé", solde: 0, tags: [],
    notes: "",
    dernierCours: "2026-03-10", totalHeures: 6, totalPaye: 132,
    heuresParSemaine: [1, 1, 1, 0, 1, 0, 1, 0],
  },
  {
    id: 7, nom: "Thomas Laurent", niveau: "4ème", matiere: "Anglais", tarifHeure: 25,
    statut: "actif", solde: -37.5, tags: ["Cambridge B1 en mai"],
    notes: "Besoin de travail sur l'oral. Introduire des séances de conversation.",
    dernierCours: "2026-03-24", totalHeures: 18, totalPaye: 412.5,
    heuresParSemaine: [1, 1.5, 1, 1.5, 1, 1, 1.5, 1.5],
  },
  {
    id: 8, nom: "Camille Simon", niveau: "1ère S", matiere: "SVT", tarifHeure: 28,
    statut: "actif", solde: 0, tags: ["Médecine PASS"],
    notes: "Excellente élève, besoin surtout de confiance en soi.",
    dernierCours: "2026-03-23", totalHeures: 22, totalPaye: 560,
    heuresParSemaine: [2, 2, 2, 2, 2, 2, 0, 2],
  },
];

const statutColors: Record<string, string> = {
  actif: "bg-green-100 text-green-700",
  "en attente": "bg-blue-100 text-blue-700",
  "en pause": "bg-amber-100 text-amber-700",
  terminé: "bg-gray-100 text-gray-500",
};

const niveaux = ["6ème", "5ème", "4ème", "3ème", "2nde", "1ère S", "1ère ES", "Terminale S", "Terminale ES", "BTS", "Licence 1", "Licence 2", "Licence 3"];
const emptyForm = { nom: "", niveau: "2nde", matiere: "", tarifHeure: 25, statut: "actif" as Eleve["statut"] };

function SoldeCell({ solde }: { solde: number }) {
  if (solde === 0) return <span className="text-green-600" style={{ fontSize: 13 }}>À jour</span>;
  if (solde < 0) return <span className="text-red-500" style={{ fontSize: 13, fontWeight: 500 }}>Doit {Math.abs(solde)} €</span>;
  return <span className="text-blue-500" style={{ fontSize: 13 }}>Avance {solde} €</span>;
}

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
  const [eleves, setEleves] = useState<Eleve[]>(initialEleves);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [newTag, setNewTag] = useState("");

  const filtered = eleves.filter(
    (e) =>
      e.nom.toLowerCase().includes(search.toLowerCase()) ||
      e.matiere.toLowerCase().includes(search.toLowerCase()) ||
      e.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))
  );

  const selectedEleve = eleves.find((e) => e.id === selectedId) ?? null;

  function updateEleve(id: number, updates: Partial<Eleve>) {
    setEleves((prev) => prev.map((e) => (e.id === id ? { ...e, ...updates } : e)));
  }

  function handleAdd() {
    const newEleve: Eleve = {
      id: Date.now(),
      nom: form.nom,
      niveau: form.niveau,
      matiere: form.matiere,
      tarifHeure: form.tarifHeure,
      statut: form.statut,
      solde: 0,
      tags: [],
      notes: "",
      dernierCours: "",
      totalHeures: 0,
      totalPaye: 0,
      heuresParSemaine: [0, 0, 0, 0, 0, 0, 0, 0],
    };
    setEleves((prev) => [newEleve, ...prev]);
    setShowAdd(false);
    setForm(emptyForm);
  }

  function addTag(id: number, tag: string) {
    const t = tag.trim();
    if (!t) return;
    const eleve = eleves.find((e) => e.id === id);
    if (eleve && !eleve.tags.includes(t)) updateEleve(id, { tags: [...eleve.tags, t] });
    setNewTag("");
  }

  function removeTag(id: number, tag: string) {
    const eleve = eleves.find((e) => e.id === id);
    if (eleve) updateEleve(id, { tags: eleve.tags.filter((t) => t !== tag) });
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1>Élèves</h1>
          <p className="text-muted-foreground mt-1">{eleves.length} élèves enregistrés</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-lg hover:opacity-90 transition-opacity"
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
            {filtered.map((eleve) => {
              const inactive = eleve.statut === "actif" && daysSince(eleve.dernierCours) >= 14;
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
                        {eleve.tags.slice(0, 2).map((tag) => (
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
                  <td className="px-6 py-3" style={{ fontWeight: 500 }}>{eleve.tarifHeure} €</td>
                  <td className="px-6 py-3">
                    <span className={`px-2.5 py-1 rounded-full ${statutColors[eleve.statut]}`} style={{ fontSize: 13 }}>
                      {eleve.statut}
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-1.5">
                      {inactive && <AlertCircle className="w-3.5 h-3.5 text-amber-500" />}
                      <span className={`${inactive ? "text-amber-600" : "text-muted-foreground"}`} style={{ fontSize: 13 }}>
                        {formatDernierCours(eleve.dernierCours)}
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
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 style={{ fontWeight: 600 }}>{selectedEleve.nom}</h2>
                  <p className="text-muted-foreground mt-0.5" style={{ fontSize: 14 }}>
                    {selectedEleve.niveau} · {selectedEleve.matiere}
                  </p>
                  <span className={`inline-flex mt-2 px-2.5 py-0.5 rounded-full ${statutColors[selectedEleve.statut]}`} style={{ fontSize: 13 }}>
                    {selectedEleve.statut}
                  </span>
                </div>
                <button onClick={() => setSelectedId(null)} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-secondary rounded-xl p-4">
                  <div className="flex items-center gap-1.5 text-muted-foreground mb-1" style={{ fontSize: 12 }}>
                    <Clock className="w-3.5 h-3.5" /> Total heures
                  </div>
                  <p style={{ fontSize: 22, fontWeight: 600 }}>{selectedEleve.totalHeures}h</p>
                  <p className="text-muted-foreground" style={{ fontSize: 12 }}>
                    ~{(selectedEleve.heuresParSemaine.reduce((a, b) => a + b, 0) / 8).toFixed(1)}h/sem. (moy.)
                  </p>
                </div>
                <div className="bg-secondary rounded-xl p-4">
                  <div className="flex items-center gap-1.5 text-muted-foreground mb-1" style={{ fontSize: 12 }}>
                    <Euro className="w-3.5 h-3.5" /> Total payé
                  </div>
                  <p style={{ fontSize: 22, fontWeight: 600 }}>{selectedEleve.totalPaye} €</p>
                  <SoldeCell solde={selectedEleve.solde} />
                </div>
              </div>

              {/* Regularity graph */}
              <div className="mb-6">
                <p style={{ fontSize: 13, fontWeight: 500 }} className="mb-3">Régularité (8 dernières semaines)</p>
                <RegularityGraph heures={selectedEleve.heuresParSemaine} />
                <div className="flex items-center gap-3 mt-2">
                  <span className="flex items-center gap-1 text-muted-foreground" style={{ fontSize: 11 }}>
                    <span className="w-2 h-2 rounded-sm bg-green-400 inline-block" /> ≥ 2h
                  </span>
                  <span className="flex items-center gap-1 text-muted-foreground" style={{ fontSize: 11 }}>
                    <span className="w-2 h-2 rounded-sm bg-amber-300 inline-block" /> &lt; 2h
                  </span>
                  <span className="flex items-center gap-1 text-muted-foreground" style={{ fontSize: 11 }}>
                    <span className="w-2 h-2 rounded-sm bg-gray-200 inline-block" /> Aucun cours
                  </span>
                </div>
              </div>

              {/* Tags */}
              <div className="mb-6">
                <p style={{ fontSize: 13, fontWeight: 500 }} className="mb-2">Tags</p>
                <div className="flex flex-wrap gap-2 mb-2">
                  {selectedEleve.tags.map((tag) => (
                    <span key={tag} className="flex items-center gap-1 bg-secondary text-secondary-foreground px-2.5 py-1 rounded-lg" style={{ fontSize: 13 }}>
                      {tag}
                      <button
                        onClick={() => removeTag(selectedEleve.id, tag)}
                        className="hover:text-red-500 transition-colors ml-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { addTag(selectedEleve.id, newTag); } }}
                    placeholder="Ajouter un tag..."
                    className="flex-1 px-3 py-1.5 bg-muted rounded-lg outline-none"
                    style={{ fontSize: 13 }}
                  />
                  <button
                    onClick={() => addTag(selectedEleve.id, newTag)}
                    className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
                    style={{ fontSize: 13 }}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Notes */}
              <div>
                <p style={{ fontSize: 13, fontWeight: 500 }} className="mb-2">Notes privées</p>
                <textarea
                  value={selectedEleve.notes}
                  onChange={(e) => updateEleve(selectedEleve.id, { notes: e.target.value })}
                  placeholder="Notes privées sur cet élève..."
                  rows={4}
                  className="w-full px-4 py-3 bg-muted rounded-lg outline-none resize-none"
                  style={{ fontSize: 13 }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add student modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3>Ajouter un élève</h3>
              <button onClick={() => setShowAdd(false)} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
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
              <div className="grid grid-cols-2 gap-4">
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
                  <label className="block mb-1.5 text-muted-foreground" style={{ fontSize: 13 }}>Matière</label>
                  <input
                    value={form.matiere}
                    onChange={(e) => setForm({ ...form, matiere: e.target.value })}
                    placeholder="Mathématiques..."
                    className="w-full px-4 py-2.5 bg-muted rounded-lg outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1.5 text-muted-foreground" style={{ fontSize: 13 }}>Tarif / heure (€)</label>
                  <input
                    type="number"
                    value={form.tarifHeure}
                    onChange={(e) => setForm({ ...form, tarifHeure: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 bg-muted rounded-lg outline-none"
                  />
                </div>
                <div>
                  <label className="block mb-1.5 text-muted-foreground" style={{ fontSize: 13 }}>Statut</label>
                  <select
                    value={form.statut}
                    onChange={(e) => setForm({ ...form, statut: e.target.value as Eleve["statut"] })}
                    className="w-full px-4 py-2.5 bg-muted rounded-lg outline-none"
                  >
                    <option value="actif">Actif</option>
                    <option value="en attente">En attente</option>
                    <option value="en pause">En pause</option>
                    <option value="terminé">Terminé</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAdd(false)}
                className="flex-1 px-4 py-2.5 rounded-lg border border-border hover:bg-muted transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleAdd}
                disabled={!form.nom || !form.matiere}
                className="flex-1 bg-primary text-primary-foreground px-4 py-2.5 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-40"
              >
                Ajouter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
