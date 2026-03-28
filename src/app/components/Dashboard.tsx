import { useState } from "react";
import { TrendingUp, Euro, Users, BookOpen, Trophy, Flame, AlertCircle, Plus, CheckCircle2, X } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const monthlyData = [
  { month: "Oct", revenus: 320 },
  { month: "Nov", revenus: 480 },
  { month: "Déc", revenus: 560 },
  { month: "Jan", revenus: 720 },
  { month: "Fév", revenus: 890 },
  { month: "Mar", revenus: 1050 },
];

const BRUT = 4020;
const URSSAF_RATE = 0.211;
const urssaf = Math.round(BRUT * URSSAF_RATE);
const net = BRUT - urssaf;
const creditImpot = Math.round(BRUT * 0.5);

const stats = [
  { label: "Revenus bruts", value: `${BRUT.toLocaleString("fr-FR")} €`, icon: Euro, change: "+18%" },
  { label: "Élèves actifs", value: "12", icon: Users, change: "+3" },
  { label: "Heures ce mois", value: "34h", icon: BookOpen, change: "+8h" },
];

const ranking = {
  topEarner: { nom: "Lucas Martin", matiere: "Mathématiques", montant: 780, heures: 28 },
  mostActive: { nom: "Thomas Laurent", matiere: "Anglais", heuresCeMois: 6, evolution: "+3h vs mois dernier" },
  inactive: [
    { nom: "Léa Petit", since: "23 jours" },
    { nom: "Chloé Roux", since: "18 jours" },
  ],
};

const elevesDisponibles = [
  "Lucas Martin", "Emma Dupont", "Hugo Bernard", "Léa Petit",
  "Nathan Moreau", "Chloé Roux", "Thomas Laurent", "Camille Simon",
];
const dureeOptions = ["30min", "1h", "1h30", "2h", "2h30", "3h"];
const dureeToHours: Record<string, number> = {
  "30min": 0.5, "1h": 1, "1h30": 1.5, "2h": 2, "2h30": 2.5, "3h": 3,
};
const niveaux = ["6ème", "5ème", "4ème", "3ème", "2nde", "1ère S", "1ère ES", "Terminale S", "Terminale ES", "BTS", "Licence 1"];
const methodesPaiement = ["Virement", "Espèces", "Chèque", "Paylib / Lydia"];

type ModalType = "cours" | "eleve" | "paiement" | null;

function ModalWrapper({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h3>{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function SuccessState({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <div className="text-center py-4">
      <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
        <CheckCircle2 className="w-7 h-7 text-green-600" />
      </div>
      <p style={{ fontWeight: 600, fontSize: 16 }} className="mb-1">{message}</p>
      <p className="text-muted-foreground mb-6" style={{ fontSize: 14 }}>L'opération a bien été enregistrée.</p>
      <button onClick={onClose} className="bg-primary text-primary-foreground px-6 py-2.5 rounded-lg hover:opacity-90 transition-opacity">
        Fermer
      </button>
    </div>
  );
}

export function Dashboard() {
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [success, setSuccess] = useState(false);

  // Cours form
  const [coursForm, setCoursForm] = useState({ eleve: elevesDisponibles[0], matiere: "", date: "", duree: "1h", tarifHeure: 30 });
  // Élève form
  const [eleveForm, setEleveForm] = useState({ nom: "", niveau: "2nde", matiere: "", tarifHeure: 25 });
  // Paiement form
  const [paiementForm, setPaiementForm] = useState({ eleve: elevesDisponibles[0], montant: 60, methode: "Virement", note: "" });

  function openModal(type: ModalType) {
    setSuccess(false);
    setActiveModal(type);
  }

  function closeModal() {
    setActiveModal(null);
    setSuccess(false);
  }

  function submit() {
    setSuccess(true);
  }

  const quickActions = [
    {
      key: "cours" as ModalType,
      icon: BookOpen,
      label: "Déclarer un cours",
      desc: "Enregistrer une séance effectuée",
      color: "bg-blue-50 text-blue-600",
    },
    {
      key: "eleve" as ModalType,
      icon: Users,
      label: "Ajouter un élève",
      desc: "Créer un nouveau profil élève",
      color: "bg-green-50 text-green-600",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1>Tableau de bord</h1>
        <p className="text-muted-foreground mt-1">Vue d'ensemble de votre activité</p>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {quickActions.map((action) => (
          <button
            key={action.key}
            onClick={() => openModal(action.key)}
            className="flex items-center gap-4 bg-white border border-border rounded-xl p-4 hover:border-primary/40 hover:shadow-sm transition-all text-left group"
          >
            <div className={`w-11 h-11 rounded-xl ${action.color} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}>
              <action.icon className="w-5 h-5" />
            </div>
            <div>
              <p style={{ fontWeight: 600, fontSize: 14 }}>{action.label}</p>
              <p className="text-muted-foreground" style={{ fontSize: 12 }}>{action.desc}</p>
            </div>
            <Plus className="w-4 h-4 text-muted-foreground ml-auto shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        ))}
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl p-4 border border-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-muted-foreground" style={{ fontSize: 13 }}>{stat.label}</span>
              <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
                <stat.icon className="w-4 h-4 text-primary" />
              </div>
            </div>
            <p className="text-xl" style={{ fontWeight: 600 }}>{stat.value}</p>
            <span className="text-green-600" style={{ fontSize: 12 }}>{stat.change} ce mois</span>
          </div>
        ))}
      </div>

      {/* Revenue breakdown + Credit impôt */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
        <div className="bg-white rounded-xl p-6 border border-border">
          <h3 className="mb-5">Décomposition des revenus</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-3 border-b border-border">
              <div>
                <p style={{ fontWeight: 500 }}>Revenus bruts ce mois</p>
                <p className="text-muted-foreground" style={{ fontSize: 13 }}>Total facturé aux familles</p>
              </div>
              <p style={{ fontSize: 20, fontWeight: 600 }}>{BRUT.toLocaleString("fr-FR")} €</p>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-border">
              <div>
                <p className="text-red-500" style={{ fontWeight: 500 }}>— Charges URSSAF</p>
                <p className="text-muted-foreground" style={{ fontSize: 13 }}>Auto-entrepreneur (21,1%)</p>
              </div>
              <p className="text-red-500" style={{ fontSize: 20, fontWeight: 600 }}>− {urssaf.toLocaleString("fr-FR")} €</p>
            </div>
            <div className="flex items-center justify-between py-3 bg-green-50 rounded-xl px-4">
              <div>
                <p className="text-green-700" style={{ fontWeight: 600 }}>Net réel</p>
                <p className="text-green-600" style={{ fontSize: 13 }}>Ce que vous empochez</p>
              </div>
              <p className="text-green-700" style={{ fontSize: 22, fontWeight: 700 }}>{net.toLocaleString("fr-FR")} €</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex rounded-full overflow-hidden h-2">
              <div className="bg-green-400" style={{ width: `${(net / BRUT) * 100}%` }} />
              <div className="bg-red-300 flex-1" />
            </div>
            <div className="flex justify-between mt-1 text-muted-foreground" style={{ fontSize: 11 }}>
              <span>Net {Math.round((net / BRUT) * 100)}%</span>
              <span>URSSAF {Math.round(URSSAF_RATE * 100)}%</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-border flex flex-col">
          <h3 className="mb-2">Gain généré </h3>

          <div className="flex-1 flex flex-col items-center justify-center text-center py-2">
            <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mb-3">
              <TrendingUp className="w-7 h-7 text-green-600" />
            </div>
            <p style={{ fontSize: 36, fontWeight: 700 }} className="text-green-600">
              {creditImpot.toLocaleString("fr-FR")} €
            </p>
            <p className="text-muted-foreground mt-1" style={{ fontSize: 13 }}>
              économisés par vos élèves ce semestre
            </p>
          </div>
          <div className="mt-auto pt-4 border-t border-border">
            <p className="text-muted-foreground" style={{ fontSize: 12 }}>
              Sur {BRUT.toLocaleString("fr-FR")} € déclarés, les familles reçoivent <strong>{creditImpot.toLocaleString("fr-FR")} €</strong> — coût réel : <strong>{(BRUT - creditImpot).toLocaleString("fr-FR")} €</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* Revenue chart */}
      <div className="bg-white rounded-xl p-6 border border-border mb-6">
        <h3 className="mb-6">Évolution des revenus</h3>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={monthlyData}>
            <defs>
              <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2196F3" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#2196F3" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E3F2FD" />
            <XAxis dataKey="month" stroke="#5C7A99" fontSize={13} />
            <YAxis stroke="#5C7A99" fontSize={13} tickFormatter={(v) => `${v}€`} />
            <Tooltip formatter={(value: number) => [`${value} €`, "Revenus"]} />
            <Area type="monotone" dataKey="revenus" stroke="#2196F3" fill="url(#colorRev)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Mini ranking */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-xl p-5 border border-border">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
              <Trophy className="w-4 h-4 text-amber-500" />
            </div>
            <p style={{ fontWeight: 500, fontSize: 14 }}>Élève le plus rentable</p>
          </div>
          <p style={{ fontWeight: 700, fontSize: 18 }}>{ranking.topEarner.nom}</p>
          <p className="text-muted-foreground" style={{ fontSize: 13 }}>{ranking.topEarner.matiere}</p>
          <div className="mt-3 pt-3 border-t border-border flex justify-between text-muted-foreground" style={{ fontSize: 13 }}>
            <span>{ranking.topEarner.heures}h au total</span>
            <span className="text-green-600" style={{ fontWeight: 500 }}>{ranking.topEarner.montant} €</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-border">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
              <Flame className="w-4 h-4 text-blue-500" />
            </div>
            <p style={{ fontWeight: 500, fontSize: 14 }}>Plus de volume ce mois</p>
          </div>
          <p style={{ fontWeight: 700, fontSize: 18 }}>{ranking.mostActive.nom}</p>
          <p className="text-muted-foreground" style={{ fontSize: 13 }}>{ranking.mostActive.matiere}</p>
          <div className="mt-3 pt-3 border-t border-border flex justify-between text-muted-foreground" style={{ fontSize: 13 }}>
            <span>{ranking.mostActive.heuresCeMois}h ce mois</span>
            <span className="text-blue-600" style={{ fontWeight: 500 }}>{ranking.mostActive.evolution}</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-border">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
              <AlertCircle className="w-4 h-4 text-amber-500" />
            </div>
            <p style={{ fontWeight: 500, fontSize: 14 }}>Inactifs depuis 2 sem.</p>
          </div>
          <div className="space-y-3">
            {ranking.inactive.map((e) => (
              <div key={e.nom} className="flex items-center justify-between">
                <p style={{ fontWeight: 500, fontSize: 14 }}>{e.nom}</p>
                <span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full" style={{ fontSize: 12 }}>
                  il y a {e.since}
                </span>
              </div>
            ))}
          </div>
          <p className="text-muted-foreground mt-3 pt-3 border-t border-border" style={{ fontSize: 12 }}>
            Penser à les relancer pour ne pas perdre le suivi.
          </p>
        </div>
      </div>

      {/* — Modal: Déclarer un cours — */}
      {activeModal === "cours" && (
        <ModalWrapper title="Déclarer un cours" onClose={closeModal}>
          {success ? <SuccessState message="Cours enregistré !" onClose={closeModal} /> : (
            <div className="space-y-4">
              <div>
                <label className="block mb-1.5 text-muted-foreground" style={{ fontSize: 13 }}>Élève</label>
                <select value={coursForm.eleve} onChange={(e) => setCoursForm({ ...coursForm, eleve: e.target.value })}
                  className="w-full px-4 py-2.5 bg-muted rounded-lg outline-none">
                  {elevesDisponibles.map((n) => <option key={n}>{n}</option>)}
                </select>
              </div>
              <div>
                <label className="block mb-1.5 text-muted-foreground" style={{ fontSize: 13 }}>Matière</label>
                <input value={coursForm.matiere} onChange={(e) => setCoursForm({ ...coursForm, matiere: e.target.value })}
                  placeholder="Mathématiques..." className="w-full px-4 py-2.5 bg-muted rounded-lg outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1.5 text-muted-foreground" style={{ fontSize: 13 }}>Date</label>
                  <input type="date" value={coursForm.date} onChange={(e) => setCoursForm({ ...coursForm, date: e.target.value })}
                    className="w-full px-4 py-2.5 bg-muted rounded-lg outline-none" />
                </div>
                <div>
                  <label className="block mb-1.5 text-muted-foreground" style={{ fontSize: 13 }}>Durée</label>
                  <select value={coursForm.duree} onChange={(e) => setCoursForm({ ...coursForm, duree: e.target.value })}
                    className="w-full px-4 py-2.5 bg-muted rounded-lg outline-none">
                    {dureeOptions.map((d) => <option key={d}>{d}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block mb-1.5 text-muted-foreground" style={{ fontSize: 13 }}>Tarif / heure (€)</label>
                <input type="number" value={coursForm.tarifHeure} onChange={(e) => setCoursForm({ ...coursForm, tarifHeure: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 bg-muted rounded-lg outline-none" />
              </div>
              <div className="flex items-center justify-between px-4 py-3 bg-secondary rounded-lg">
                <span className="text-secondary-foreground" style={{ fontSize: 13 }}>Montant estimé</span>
                <span style={{ fontWeight: 600 }}>
                  {(coursForm.tarifHeure * (dureeToHours[coursForm.duree] ?? 1)).toFixed(2)} €
                </span>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={closeModal} className="flex-1 px-4 py-2.5 rounded-lg border border-border hover:bg-muted transition-colors">Annuler</button>
                <button onClick={submit} disabled={!coursForm.matiere || !coursForm.date}
                  className="flex-1 bg-primary text-primary-foreground px-4 py-2.5 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-40">
                  Enregistrer
                </button>
              </div>
            </div>
          )}
        </ModalWrapper>
      )}

      {/* — Modal: Ajouter un élève — */}
      {activeModal === "eleve" && (
        <ModalWrapper title="Ajouter un élève" onClose={closeModal}>
          {success ? <SuccessState message="Élève ajouté !" onClose={closeModal} /> : (
            <div className="space-y-4">
              <div>
                <label className="block mb-1.5 text-muted-foreground" style={{ fontSize: 13 }}>Nom complet</label>
                <input value={eleveForm.nom} onChange={(e) => setEleveForm({ ...eleveForm, nom: e.target.value })}
                  placeholder="Jean Dupont" className="w-full px-4 py-2.5 bg-muted rounded-lg outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1.5 text-muted-foreground" style={{ fontSize: 13 }}>Niveau</label>
                  <select value={eleveForm.niveau} onChange={(e) => setEleveForm({ ...eleveForm, niveau: e.target.value })}
                    className="w-full px-4 py-2.5 bg-muted rounded-lg outline-none">
                    {niveaux.map((n) => <option key={n}>{n}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block mb-1.5 text-muted-foreground" style={{ fontSize: 13 }}>Matière</label>
                  <input value={eleveForm.matiere} onChange={(e) => setEleveForm({ ...eleveForm, matiere: e.target.value })}
                    placeholder="Maths..." className="w-full px-4 py-2.5 bg-muted rounded-lg outline-none" />
                </div>
              </div>
              <div>
                <label className="block mb-1.5 text-muted-foreground" style={{ fontSize: 13 }}>Tarif / heure (€)</label>
                <input type="number" value={eleveForm.tarifHeure} onChange={(e) => setEleveForm({ ...eleveForm, tarifHeure: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 bg-muted rounded-lg outline-none" />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={closeModal} className="flex-1 px-4 py-2.5 rounded-lg border border-border hover:bg-muted transition-colors">Annuler</button>
                <button onClick={submit} disabled={!eleveForm.nom || !eleveForm.matiere}
                  className="flex-1 bg-primary text-primary-foreground px-4 py-2.5 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-40">
                  Ajouter
                </button>
              </div>
            </div>
          )}
        </ModalWrapper>
      )}

      {/* — Modal: Déclencher un paiement — */}
      {activeModal === "paiement" && (
        <ModalWrapper title="Déclencher un paiement" onClose={closeModal}>
          {success ? <SuccessState message="Paiement enregistré !" onClose={closeModal} /> : (
            <div className="space-y-4">
              <div>
                <label className="block mb-1.5 text-muted-foreground" style={{ fontSize: 13 }}>Élève</label>
                <select value={paiementForm.eleve} onChange={(e) => setPaiementForm({ ...paiementForm, eleve: e.target.value })}
                  className="w-full px-4 py-2.5 bg-muted rounded-lg outline-none">
                  {elevesDisponibles.map((n) => <option key={n}>{n}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1.5 text-muted-foreground" style={{ fontSize: 13 }}>Montant (€)</label>
                  <input type="number" value={paiementForm.montant} onChange={(e) => setPaiementForm({ ...paiementForm, montant: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 bg-muted rounded-lg outline-none" />
                </div>
                <div>
                  <label className="block mb-1.5 text-muted-foreground" style={{ fontSize: 13 }}>Méthode</label>
                  <select value={paiementForm.methode} onChange={(e) => setPaiementForm({ ...paiementForm, methode: e.target.value })}
                    className="w-full px-4 py-2.5 bg-muted rounded-lg outline-none">
                    {methodesPaiement.map((m) => <option key={m}>{m}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block mb-1.5 text-muted-foreground" style={{ fontSize: 13 }}>Note (optionnel)</label>
                <input value={paiementForm.note} onChange={(e) => setPaiementForm({ ...paiementForm, note: e.target.value })}
                  placeholder="Mars 2026, 3 séances..." className="w-full px-4 py-2.5 bg-muted rounded-lg outline-none" />
              </div>
              <div className="flex items-center justify-between px-4 py-3 bg-secondary rounded-lg">
                <span className="text-secondary-foreground" style={{ fontSize: 13 }}>
                  {paiementForm.eleve}
                </span>
                <span style={{ fontWeight: 600 }}>{paiementForm.montant} € — {paiementForm.methode}</span>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={closeModal} className="flex-1 px-4 py-2.5 rounded-lg border border-border hover:bg-muted transition-colors">Annuler</button>
                <button onClick={submit} disabled={!paiementForm.montant}
                  className="flex-1 bg-primary text-primary-foreground px-4 py-2.5 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-40">
                  Confirmer
                </button>
              </div>
            </div>
          )}
        </ModalWrapper>
      )}
    </div>
  );
}
