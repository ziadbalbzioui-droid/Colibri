import { useState, useMemo } from "react";
import { Euro, Users, BookOpen, Trophy, Flame, AlertCircle, Plus, CheckCircle2, X, Loader2 } from "lucide-react";
import { LoadingGuard } from "./LoadingGuard";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useEleves } from "../../lib/hooks/useEleves";
import { useCours } from "../../lib/hooks/useCours";
import { useAuth } from "../../lib/auth";
import type { EleveRow } from "../../lib/hooks/useEleves";
import type { CoursRow } from "../../lib/hooks/useCours";

const dureeOptions = ["30min", "1h", "1h30", "2h", "2h30", "3h"];
const dureeToHours: Record<string, number> = {
  "30min": 0.5, "1h": 1, "1h30": 1.5, "2h": 2, "2h30": 2.5, "3h": 3,
};
const niveaux = ["6ème", "5ème", "4ème", "3ème", "2nde", "1ère S", "1ère ES", "Terminale S", "Terminale ES", "BTS", "Licence 1"];
const MOIS = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];

type ModalType = "cours" | "eleve" | null;

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
      <button onClick={onClose} className="bg-primary text-primary-foreground px-6 py-2.5 rounded-lg hover:opacity-90">Fermer</button>
    </div>
  );
}

export function Dashboard() {
  const { profile } = useAuth();
  const { eleves, loading: elevesLoading, error: elevesError, reload: reloadEleves, addEleve } = useEleves();
  const { cours, loading: coursLoading, error: coursError, reload: reloadCours, addCours } = useCours();
  const dataLoading = elevesLoading || coursLoading;
  const dataError = elevesError ?? coursError;

  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [success, setSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  const [coursForm, setCoursForm] = useState({
    eleve_id: "", eleve_nom: "", matiere: "", date: "", duree: "1h", tarif_heure: 30,
  });
  const [eleveForm, setEleveForm] = useState({ nom: "", niveau: "2nde", matiere: "", tarif_heure: 25 });

  function openModal(type: ModalType) {
    setSuccess(false);
    setSaving(false);
    setActiveModal(type);
    if (eleves.length > 0) {
      setCoursForm((f) => ({ ...f, eleve_id: eleves[0].id, eleve_nom: eleves[0].nom, tarif_heure: eleves[0].tarif_heure }));
    }
  }
  function closeModal() { setActiveModal(null); setSuccess(false); }

  async function submitCours() {
    if (!coursForm.matiere || !coursForm.date) return;
    setSaving(true);
    try {
      const heures = dureeToHours[coursForm.duree] ?? 1;
      await addCours({
        eleve_id: coursForm.eleve_id || null,
        eleve_nom: coursForm.eleve_nom,
        matiere: coursForm.matiere,
        date: coursForm.date,
        duree: coursForm.duree,
        duree_heures: heures,
        montant: coursForm.tarif_heure * heures,
        statut: "planifié",
      });
      setSuccess(true);
    } finally {
      setSaving(false);
    }
  }

  async function submitEleve() {
    if (!eleveForm.nom || !eleveForm.matiere) return;
    setSaving(true);
    try {
      await addEleve(
        { nom: eleveForm.nom, niveau: eleveForm.niveau, matiere: eleveForm.matiere, tarif_heure: eleveForm.tarif_heure, statut: "actif" },
        []
      );
      setSuccess(true);
    } finally {
      setSaving(false);
    }
  }

  // ── Computed stats ──────────────────────────────────────────────
  const now = new Date();
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const coursThisMonth = useMemo(
    () => cours.filter((c: CoursRow) => c.date.startsWith(thisMonth)),
    [cours, thisMonth]
  );

  const brutThisMonth = useMemo(
    () => coursThisMonth.reduce((s: number, c: CoursRow) => s + c.montant, 0),
    [coursThisMonth]
  );

  const elevesActifs = useMemo(
    () => eleves.filter((e: EleveRow) => e.statut === "actif").length,
    [eleves]
  );

  const heuresThisMonth = useMemo(
    () => coursThisMonth.reduce((s: number, c: CoursRow) => s + c.duree_heures, 0),
    [coursThisMonth]
  );

  // Monthly chart — last 6 months
  const monthlyData = useMemo(() => {
    const map: Record<string, number> = {};
    cours.forEach((c: CoursRow) => {
      const [y, m] = c.date.split("-");
      const key = `${MOIS[Number(m) - 1].slice(0, 3)} ${y.slice(2)}`;
      map[key] = (map[key] ?? 0) + c.montant;
    });
    return Object.entries(map).slice(-6).map(([month, revenus]) => ({ month, revenus }));
  }, [cours]);

  // Ranking
  const topEarner = useMemo(() => {
    const map: Record<string, { nom: string; matiere: string; montant: number; heures: number }> = {};
    cours.forEach((c: CoursRow) => {
      if (!map[c.eleve_nom]) map[c.eleve_nom] = { nom: c.eleve_nom, matiere: c.matiere, montant: 0, heures: 0 };
      map[c.eleve_nom].montant += c.montant;
      map[c.eleve_nom].heures += c.duree_heures;
    });
    return Object.values(map).sort((a, b) => b.montant - a.montant)[0] ?? null;
  }, [cours]);

  const mostActiveThisMonth = useMemo(() => {
    const map: Record<string, { nom: string; matiere: string; heures: number }> = {};
    coursThisMonth.forEach((c: CoursRow) => {
      if (!map[c.eleve_nom]) map[c.eleve_nom] = { nom: c.eleve_nom, matiere: c.matiere, heures: 0 };
      map[c.eleve_nom].heures += c.duree_heures;
    });
    return Object.values(map).sort((a, b) => b.heures - a.heures)[0] ?? null;
  }, [coursThisMonth]);

  const inactifs = useMemo(() => {
    return eleves
      .filter((e: EleveRow) => {
        if (e.statut !== "actif") return false;
        const days = e.dernier_cours
          ? Math.floor((Date.now() - new Date(e.dernier_cours).getTime()) / 86400000)
          : Infinity;
        return days >= 14;
      })
      .slice(0, 3)
      .map((e: EleveRow) => ({
        nom: e.nom,
        since: e.dernier_cours
          ? `${Math.floor((Date.now() - new Date(e.dernier_cours).getTime()) / 86400000)} jours`
          : "inconnu",
      }));
  }, [eleves]);

  const stats = [
    { label: "Revenus bruts", value: `${brutThisMonth.toLocaleString("fr-FR")} €`, icon: Euro, change: `ce mois` },
    { label: "Élèves actifs", value: String(elevesActifs), icon: Users, change: `sur ${eleves.length} total` },
    { label: "Heures ce mois", value: `${heuresThisMonth.toFixed(1)}h`, icon: BookOpen, change: `${coursThisMonth.length} séances` },
  ];

  const quickActions = [
    { key: "cours" as ModalType, icon: BookOpen, label: "Déclarer un cours", desc: "Enregistrer une séance effectuée", color: "bg-blue-50 text-blue-600" },
    { key: "eleve" as ModalType, icon: Users, label: "Ajouter un élève", desc: "Créer un nouveau profil élève", color: "bg-green-50 text-green-600" },
  ];

  const prenomAffiche = profile?.prenom ?? "Prof";
  const hasSiret = !!profile?.siret;

  return (
    <LoadingGuard loading={dataLoading} error={dataError} onRetry={() => { reloadEleves(); reloadCours(); }}>
    <div className={`max-w-6xl mx-auto ${!hasSiret ? "opacity-50 pointer-events-none select-none" : ""}`}>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Bonjour, {prenomAffiche}</h1>
        <p className="text-slate-500 mt-1 text-sm">Vue d'ensemble de votre activité</p>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {quickActions.map((action) => (
          <button
            key={action.key}
            onClick={() => hasSiret && openModal(action.key)}
            disabled={!hasSiret}
            title={!hasSiret ? "Renseignez votre SIRET pour débloquer cette action" : undefined}
            className="flex items-center gap-4 bg-white border border-slate-100 rounded-2xl p-4 hover:border-primary/30 hover:shadow-md transition-all duration-200 text-left group disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.99]"
          style={{ boxShadow: "0 1px 3px rgba(15,23,42,0.04), 0 4px 12px rgba(15,23,42,0.04)" }}
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
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl p-5 border border-slate-100" style={{ boxShadow: "0 1px 3px rgba(15,23,42,0.04), 0 4px 12px rgba(15,23,42,0.04)" }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-slate-500 text-xs font-semibold uppercase tracking-wide">{stat.label}</span>
              <div className="w-8 h-8 rounded-xl bg-primary/8 flex items-center justify-center">
                <stat.icon className="w-4 h-4 text-primary" />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900 tracking-tight tabular-nums">{stat.value}</p>
            <span className="text-slate-400 text-xs mt-1 block">{stat.change}</span>
          </div>
        ))}
      </div>

      {/* Revenue breakdown */}
      <div className="mb-6">
        <div className="bg-white rounded-2xl p-6 border border-slate-100" style={{ boxShadow: "0 1px 3px rgba(15,23,42,0.04), 0 4px 12px rgba(15,23,42,0.04)" }}>
          <h3 className="mb-5 font-semibold text-slate-900 tracking-tight">L'impact Colibri</h3>
          {brutThisMonth === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-6">Aucun cours ce mois-ci</p>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between py-3 border-b border-border opacity-70">
                <div>
                  <p style={{ fontWeight: 500 }}>Revenus avant Colibri</p>
                  <p className="text-muted-foreground" style={{ fontSize: 13 }}>Pour le même budget parent</p>
                </div>
                <p className="line-through text-muted-foreground" style={{ fontSize: 20, fontWeight: 600 }}>{(brutThisMonth / 2).toLocaleString("fr-FR")} €</p>
              </div>
              <div className="flex items-center justify-between py-3 bg-green-50 rounded-xl px-4 border border-green-100">
                <div>
                  <p className="text-green-700" style={{ fontWeight: 600 }}>Revenus bruts après Colibri</p>
                  <p className="text-green-600" style={{ fontSize: 13 }}>Légal et déclaré</p>
                </div>
                <p className="text-green-700" style={{ fontSize: 22, fontWeight: 700 }}>{brutThisMonth.toLocaleString("fr-FR")} €</p>
              </div>
              <div className="flex rounded-full overflow-hidden h-2 mt-2">
                <div className="bg-gray-300" style={{ width: '50%' }} />
                <div className="bg-green-400" style={{ width: '50%' }} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Revenue chart */}
      {monthlyData.length > 0 && (
        <div className="bg-white rounded-2xl p-6 border border-slate-100 mb-6" style={{ boxShadow: "0 1px 3px rgba(15,23,42,0.04), 0 4px 12px rgba(15,23,42,0.04)" }}>
          <h3 className="mb-6 font-semibold text-slate-900 tracking-tight">Évolution des revenus</h3>
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
              <YAxis stroke="#5C7A99" fontSize={13} tickFormatter={(v: number) => `${v}€`} />
              <Tooltip formatter={(value: number) => [`${value} €`, "Revenus"]} />
              <Area type="monotone" dataKey="revenus" stroke="#2196F3" fill="url(#colorRev)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Modal: Déclarer un cours */}
      {activeModal === "cours" && (
        <ModalWrapper title="Déclarer un cours" onClose={closeModal}>
          {success ? <SuccessState message="Cours enregistré !" onClose={closeModal} /> : (
            <div className="space-y-4">
              <div>
                <label className="block mb-1.5 text-muted-foreground" style={{ fontSize: 13 }}>Élève</label>
                <select
                  value={coursForm.eleve_id}
                  onChange={(e) => {
                    const elv = eleves.find((el: EleveRow) => el.id === e.target.value);
                    setCoursForm({ ...coursForm, eleve_id: e.target.value, eleve_nom: elv?.nom ?? "", tarif_heure: elv?.tarif_heure ?? 30 });
                  }}
                  className="w-full px-4 py-2.5 bg-muted rounded-lg outline-none"
                >
                  {eleves.map((e: EleveRow) => <option key={e.id} value={e.id}>{e.nom}</option>)}
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
                <input type="number" value={coursForm.tarif_heure} onChange={(e) => setCoursForm({ ...coursForm, tarif_heure: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 bg-muted rounded-lg outline-none" />
              </div>
              <div className="flex items-center justify-between px-4 py-3 bg-secondary rounded-lg">
                <span style={{ fontSize: 13 }}>Montant estimé</span>
                <span style={{ fontWeight: 600 }}>{(coursForm.tarif_heure * (dureeToHours[coursForm.duree] ?? 1)).toFixed(2)} €</span>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={closeModal} className="flex-1 px-4 py-2.5 rounded-lg border border-border hover:bg-muted">Annuler</button>
                <button onClick={submitCours} disabled={!coursForm.matiere || !coursForm.date || saving}
                  className="flex-1 bg-primary text-primary-foreground px-4 py-2.5 rounded-lg hover:opacity-90 disabled:opacity-40 flex items-center justify-center gap-2">
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  Enregistrer
                </button>
              </div>
            </div>
          )}
        </ModalWrapper>
      )}

      {/* Modal: Ajouter un élève */}
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
                <input type="number" value={eleveForm.tarif_heure} onChange={(e) => setEleveForm({ ...eleveForm, tarif_heure: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 bg-muted rounded-lg outline-none" />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={closeModal} className="flex-1 px-4 py-2.5 rounded-lg border border-border hover:bg-muted">Annuler</button>
                <button onClick={submitEleve} disabled={!eleveForm.nom || !eleveForm.matiere || saving}
                  className="flex-1 bg-primary text-primary-foreground px-4 py-2.5 rounded-lg hover:opacity-90 disabled:opacity-40 flex items-center justify-center gap-2">
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  Ajouter
                </button>
              </div>
            </div>
          )}
        </ModalWrapper>
      )}
    </div>
    </LoadingGuard>
  );
}
