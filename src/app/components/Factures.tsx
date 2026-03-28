import { useState } from "react";
import { FileText, Download, CheckCircle2, Clock, Plus, X, ChevronDown, Euro, Users, BookOpen } from "lucide-react";

interface LigneFacture {
  eleve: string;
  matiere: string;
  heures: number;
  tarifHeure: number;
}

interface Facture {
  id: string;
  mois: string;
  dateEmission: string;
  lignes: LigneFacture[];
  statut: "payée" | "en attente";
}

const PROF = {
  nom: "Jean Dupont",
  siret: "123 456 789 00012",
  adresse: "12 rue de la Paix, 75001 Paris",
  email: "jean.dupont@universite.fr",
};

const URSSAF = 0.211;

const MOIS_DISPONIBLES = [
  "Mars 2026", "Janvier 2026", "Décembre 2025", "Novembre 2025", "Octobre 2025",
];

function calcTotal(lignes: LigneFacture[]) {
  return lignes.reduce((acc, l) => acc + l.heures * l.tarifHeure, 0);
}

const initialFactures: Facture[] = [
  {
    id: "FAC-2026-02",
    mois: "Février 2026",
    dateEmission: "28/02/2026",
    statut: "payée",
    lignes: [
      { eleve: "Lucas Martin", matiere: "Mathématiques", heures: 10, tarifHeure: 30 },
      { eleve: "Emma Dupont", matiere: "Anglais", heures: 7, tarifHeure: 25 },
      { eleve: "Thomas Laurent", matiere: "Anglais", heures: 6, tarifHeure: 25 },
      { eleve: "Camille Simon", matiere: "SVT", heures: 8, tarifHeure: 28 },
    ],
  },
  {
    id: "FAC-2026-01",
    mois: "Janvier 2026",
    dateEmission: "31/01/2026",
    statut: "payée",
    lignes: [
      { eleve: "Lucas Martin", matiere: "Mathématiques", heures: 8, tarifHeure: 30 },
      { eleve: "Hugo Bernard", matiere: "Physique-Chimie", heures: 8, tarifHeure: 28 },
      { eleve: "Léa Petit", matiere: "Français", heures: 5, tarifHeure: 25 },
    ],
  },
  {
    id: "FAC-2025-12",
    mois: "Décembre 2025",
    dateEmission: "31/12/2025",
    statut: "en attente",
    lignes: [
      { eleve: "Nathan Moreau", matiere: "SES", heures: 4, tarifHeure: 30 },
      { eleve: "Camille Simon", matiere: "SVT", heures: 6, tarifHeure: 28 },
    ],
  },
];

const statutConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  payée: { label: "Payée", color: "bg-green-100 text-green-700", icon: CheckCircle2 },
  "en attente": { label: "En attente", color: "bg-amber-100 text-amber-700", icon: Clock },
};

function FacturePreview({ facture, onClose }: { facture: Facture; onClose: () => void }) {
  const brut = calcTotal(facture.lignes);
  const urssaf = Math.round(brut * URSSAF);
  const net = brut - urssaf;
  const creditImpot = Math.round(brut * 0.5);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <p className="text-muted-foreground" style={{ fontSize: 13 }}>Aperçu de la facture</p>
            <h3 style={{ fontWeight: 700 }}>{facture.id} — {facture.mois}</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
              style={{ fontSize: 13 }}
            >
              <Download className="w-4 h-4" /> Télécharger
            </button>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        <div className="p-8">
          <div className="flex justify-between mb-8">
            <div>
              <p style={{ fontWeight: 700, fontSize: 18 }}>{PROF.nom}</p>
              <p className="text-muted-foreground" style={{ fontSize: 13 }}>Auto-entrepreneur</p>
              <p className="text-muted-foreground" style={{ fontSize: 13 }}>SIRET : {PROF.siret}</p>
              <p className="text-muted-foreground" style={{ fontSize: 13 }}>{PROF.adresse}</p>
              <p className="text-muted-foreground" style={{ fontSize: 13 }}>{PROF.email}</p>
            </div>
            <div className="text-right">
              <p style={{ fontWeight: 700, fontSize: 22 }} className="text-primary">{facture.id}</p>
              <p className="text-muted-foreground" style={{ fontSize: 13 }}>Émise le {facture.dateEmission}</p>
              <p className="text-muted-foreground mt-1" style={{ fontSize: 13 }}>Période : {facture.mois}</p>
              <span className={`inline-flex mt-2 px-2.5 py-0.5 rounded-full ${statutConfig[facture.statut].color}`} style={{ fontSize: 12 }}>
                {statutConfig[facture.statut].label}
              </span>
            </div>
          </div>

          <div className="mb-6 p-4 bg-secondary rounded-xl">
            <p style={{ fontWeight: 500 }}>Objet : Prestations de cours particuliers — {facture.mois}</p>
            <p className="text-muted-foreground" style={{ fontSize: 13 }}>Services d'enseignement à domicile — Crédit d'impôt applicable (50%)</p>
          </div>

          <table className="w-full mb-6">
            <thead>
              <tr className="border-b-2 border-border">
                <th className="text-left py-2 text-muted-foreground" style={{ fontSize: 13, fontWeight: 500 }}>Élève</th>
                <th className="text-left py-2 text-muted-foreground" style={{ fontSize: 13, fontWeight: 500 }}>Matière</th>
                <th className="text-right py-2 text-muted-foreground" style={{ fontSize: 13, fontWeight: 500 }}>Heures</th>
                <th className="text-right py-2 text-muted-foreground" style={{ fontSize: 13, fontWeight: 500 }}>Tarif/h</th>
                <th className="text-right py-2 text-muted-foreground" style={{ fontSize: 13, fontWeight: 500 }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {facture.lignes.map((l, i) => (
                <tr key={i} className="border-b border-border">
                  <td className="py-3" style={{ fontWeight: 500 }}>{l.eleve}</td>
                  <td className="py-3 text-muted-foreground">{l.matiere}</td>
                  <td className="py-3 text-right text-muted-foreground">{l.heures}h</td>
                  <td className="py-3 text-right text-muted-foreground">{l.tarifHeure} €</td>
                  <td className="py-3 text-right" style={{ fontWeight: 500 }}>{(l.heures * l.tarifHeure).toFixed(2)} €</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="ml-auto w-72 space-y-2">
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-muted-foreground" style={{ fontSize: 14 }}>Sous-total HT</span>
              <span style={{ fontWeight: 500 }}>{brut.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-muted-foreground" style={{ fontSize: 14 }}>TVA</span>
              <span className="text-muted-foreground" style={{ fontSize: 14 }}>Non applicable (AE)</span>
            </div>
            <div className="flex justify-between py-3 bg-primary/5 rounded-lg px-3">
              <span style={{ fontWeight: 700 }}>Total TTC</span>
              <span style={{ fontWeight: 700, fontSize: 18 }} className="text-primary">{brut.toFixed(2)} €</span>
            </div>
          </div>

          <div className="mt-6 p-4 bg-green-50 border border-green-100 rounded-xl">
            <p className="text-green-700" style={{ fontSize: 13, fontWeight: 500 }}>
              Crédit d'impôt services à la personne (Art. 199 sexdecies CGI)
            </p>
            <p className="text-green-600 mt-1" style={{ fontSize: 13 }}>
              Les familles bénéficient d'un crédit d'impôt de 50% sur ces prestations, soit <strong>{creditImpot.toFixed(2)} €</strong> de réduction fiscale.
            </p>
          </div>

          <div className="mt-4 p-4 bg-secondary rounded-xl">
            <p className="text-muted-foreground" style={{ fontSize: 12, fontWeight: 500 }}>Note interne (non imprimée)</p>
            <div className="flex gap-6 mt-1">
              <span className="text-muted-foreground" style={{ fontSize: 13 }}>Charges URSSAF : <strong className="text-red-500">−{urssaf} €</strong></span>
              <span className="text-muted-foreground" style={{ fontSize: 13 }}>Net réel : <strong className="text-green-600">{net} €</strong></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const emptyLigne: LigneFacture = { eleve: "", matiere: "", heures: 1, tarifHeure: 25 };

export function Factures() {
  const [factures, setFactures] = useState<Facture[]>(initialFactures);
  const [preview, setPreview] = useState<Facture | null>(null);
  const [showGenerate, setShowGenerate] = useState(false);
  const [genMois, setGenMois] = useState(MOIS_DISPONIBLES[0]);
  const [genLignes, setGenLignes] = useState<LigneFacture[]>([{ ...emptyLigne }]);
  const [genSuccess, setGenSuccess] = useState(false);

  function addLigne() {
    setGenLignes((prev) => [...prev, { ...emptyLigne }]);
  }
  function removeLigne(i: number) {
    setGenLignes((prev) => prev.filter((_, idx) => idx !== i));
  }
  function updateLigne(i: number, field: keyof LigneFacture, value: string | number) {
    setGenLignes((prev) => prev.map((l, idx) => idx === i ? { ...l, [field]: value } : l));
  }

  function handleGenerate() {
    const moisShort = genMois.slice(0, 3).toUpperCase();
    const id = `FAC-${genMois.split(" ")[1]}-${moisShort}`;
    const newFacture: Facture = {
      id,
      mois: genMois,
      dateEmission: new Date().toLocaleDateString("fr-FR"),
      statut: "en attente",
      lignes: genLignes.filter((l) => l.eleve && l.matiere),
    };
    setFactures((prev) => [newFacture, ...prev]);
    setGenSuccess(true);
  }

  function closeGenerate() {
    setShowGenerate(false);
    setGenSuccess(false);
    setGenLignes([{ ...emptyLigne }]);
    setGenMois(MOIS_DISPONIBLES[0]);
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="mb-1">Factures</h1>
        <p className="text-muted-foreground" style={{ fontSize: 14 }}>
          Consultez et téléchargez vos factures mensuelles de cours particuliers.
        </p>
      </div>

      {/* Factures list */}
      <div className="space-y-3">
        {factures.map((f) => {
          const brut = calcTotal(f.lignes);
          const net = Math.round(brut * (1 - URSSAF));
          const cfg = statutConfig[f.statut];
          const Icon = cfg.icon;
          return (
            <div key={f.id} className="bg-white border border-border rounded-xl p-5 flex items-center gap-5 hover:shadow-sm transition-shadow">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                f.statut === "payée" ? "bg-green-100" : "bg-amber-100"
              }`}>
                <Icon className={`w-5 h-5 ${
                  f.statut === "payée" ? "text-green-600" : "text-amber-600"
                }`} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p style={{ fontWeight: 600 }}>{f.mois}</p>
                  <span className="text-muted-foreground" style={{ fontSize: 13 }}>· {f.id}</span>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-muted-foreground" style={{ fontSize: 12 }}>
                  <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {f.lignes.length} élève{f.lignes.length > 1 ? "s" : ""}</span>
                  <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" /> {f.lignes.reduce((a, l) => a + l.heures, 0)}h</span>
                  <span className="flex items-center gap-1"><Euro className="w-3 h-3" /> Net {net.toLocaleString("fr-FR")} €</span>
                </div>
              </div>

              <div className="text-right shrink-0">
                <p style={{ fontSize: 18, fontWeight: 700 }}>{brut.toLocaleString("fr-FR")} €</p>
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full ${cfg.color}`} style={{ fontSize: 12 }}>
                  {cfg.label}
                </span>
              </div>

              <button
                onClick={() => setPreview(f)}
                className="shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-border hover:bg-muted transition-colors"
                style={{ fontSize: 13 }}
              >
                <FileText className="w-4 h-4" />
                Voir
              </button>
            </div>
          );
        })}

        {/* Mois sans facture — bouton Générer */}
        {MOIS_DISPONIBLES.filter(
          (m) => !factures.some((f) => f.mois === m)
        ).map((m) => (
          <div key={m} className="bg-white border border-dashed border-border rounded-xl p-5 flex items-center gap-5">
            <div className="w-11 h-11 rounded-xl bg-secondary flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <p style={{ fontWeight: 600 }}>{m}</p>
              <p className="text-muted-foreground" style={{ fontSize: 13 }}>Aucune facture générée</p>
            </div>
            <button
              onClick={() => { setGenMois(m); setShowGenerate(true); setGenSuccess(false); }}
              className="shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
              style={{ fontSize: 13 }}
            >
              <Plus className="w-4 h-4" />
              Générer la facture
            </button>
          </div>
        ))}
      </div>

      {preview && <FacturePreview facture={preview} onClose={() => setPreview(null)} />}

      {/* Generate modal */}
      {showGenerate && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3>Générer une facture</h3>
                <p className="text-muted-foreground mt-0.5" style={{ fontSize: 13 }}>
                  {genMois} — ajoutez les cours effectués ce mois.
                </p>
              </div>
              <button onClick={closeGenerate} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            {genSuccess ? (
              <div className="text-center py-6">
                <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-7 h-7 text-green-600" />
                </div>
                <p style={{ fontWeight: 600, fontSize: 16 }} className="mb-1">Facture générée !</p>
                <p className="text-muted-foreground mb-6" style={{ fontSize: 14 }}>
                  La facture pour <strong>{genMois}</strong> a été créée avec le statut "En attente".
                </p>
                <button onClick={closeGenerate} className="bg-primary text-primary-foreground px-6 py-2.5 rounded-lg hover:opacity-90 transition-opacity">
                  Fermer
                </button>
              </div>
            ) : (
              <div className="space-y-5">
                <div>
                  <label className="block text-muted-foreground mb-1.5" style={{ fontSize: 13 }}>Mois de la facture</label>
                  <div className="relative">
                    <select
                      value={genMois}
                      onChange={(e) => setGenMois(e.target.value)}
                      className="w-full px-4 py-2.5 bg-muted rounded-lg outline-none appearance-none"
                    >
                      {MOIS_DISPONIBLES.map((m) => <option key={m}>{m}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-muted-foreground" style={{ fontSize: 13 }}>Cours effectués</label>
                    <button
                      onClick={addLigne}
                      className="flex items-center gap-1 text-primary hover:opacity-70 transition-opacity"
                      style={{ fontSize: 13 }}
                    >
                      <Plus className="w-3.5 h-3.5" /> Ajouter une ligne
                    </button>
                  </div>

                  <div className="space-y-3">
                    {genLignes.map((l, i) => (
                      <div key={i} className="bg-muted rounded-xl p-3 space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            value={l.eleve}
                            onChange={(e) => updateLigne(i, "eleve", e.target.value)}
                            placeholder="Nom de l'élève"
                            className="px-3 py-2 bg-white rounded-lg outline-none"
                            style={{ fontSize: 13 }}
                          />
                          <input
                            value={l.matiere}
                            onChange={(e) => updateLigne(i, "matiere", e.target.value)}
                            placeholder="Matière"
                            className="px-3 py-2 bg-white rounded-lg outline-none"
                            style={{ fontSize: 13 }}
                          />
                        </div>
                        <div className="grid grid-cols-3 gap-2 items-center">
                          <div className="relative">
                            <input
                              type="number"
                              value={l.heures}
                              onChange={(e) => updateLigne(i, "heures", Number(e.target.value))}
                              className="w-full px-3 py-2 bg-white rounded-lg outline-none pr-7"
                              style={{ fontSize: 13 }}
                              min={0.5} step={0.5}
                            />
                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground" style={{ fontSize: 11 }}>h</span>
                          </div>
                          <div className="relative">
                            <input
                              type="number"
                              value={l.tarifHeure}
                              onChange={(e) => updateLigne(i, "tarifHeure", Number(e.target.value))}
                              className="w-full px-3 py-2 bg-white rounded-lg outline-none pr-6"
                              style={{ fontSize: 13 }}
                            />
                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground" style={{ fontSize: 11 }}>€/h</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span style={{ fontSize: 13, fontWeight: 600 }}>{(l.heures * l.tarifHeure).toFixed(0)} €</span>
                            {genLignes.length > 1 && (
                              <button onClick={() => removeLigne(i)} className="p-1 hover:text-red-500 transition-colors">
                                <X className="w-3.5 h-3.5 text-muted-foreground" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {genLignes.some(l => l.eleve && l.matiere) && (
                  <div className="bg-secondary rounded-xl p-4 space-y-1.5">
                    <div className="flex justify-between text-muted-foreground" style={{ fontSize: 13 }}>
                      <span>Brut</span>
                      <span>{calcTotal(genLignes).toFixed(2)} €</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground" style={{ fontSize: 13 }}>
                      <span>URSSAF (−21,1%)</span>
                      <span className="text-red-500">−{Math.round(calcTotal(genLignes) * URSSAF)} €</span>
                    </div>
                    <div className="flex justify-between border-t border-border pt-1.5" style={{ fontSize: 14, fontWeight: 600 }}>
                      <span>Net réel</span>
                      <span className="text-green-600">{Math.round(calcTotal(genLignes) * (1 - URSSAF))} €</span>
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <button onClick={closeGenerate} className="flex-1 px-4 py-2.5 rounded-lg border border-border hover:bg-muted transition-colors">
                    Annuler
                  </button>
                  <button
                    onClick={handleGenerate}
                    disabled={genLignes.every(l => !l.eleve || !l.matiere)}
                    className="flex-1 bg-primary text-primary-foreground px-4 py-2.5 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-40"
                  >
                    Générer la facture
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
