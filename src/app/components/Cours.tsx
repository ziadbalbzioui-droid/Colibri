import { useState, useMemo } from "react";
import { CalendarDays, Euro, Clock, Plus, X, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useCours } from "../../lib/hooks/useCours";
import { useEleves } from "../../lib/hooks/useEleves";
import { useAuth } from "../../lib/auth";
import { useRecapMensuel } from "../../lib/hooks/useRecapMensuel";
import type { CoursRow } from "../../lib/hooks/useCours";
import type { RecapStatut } from "../../lib/database.types";
import { LoadingGuard } from "./LoadingGuard";

function StatusBadge({ statut }: { statut: RecapStatut }) {
  if (statut === "valide")
    return <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">Validé</span>;
  if (statut === "en_attente_paiement")
    return <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">En attente paiement</span>;
  if (statut === "en_attente_parent")
    return <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">En attente parent</span>;
  return <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-600">En cours</span>;
}

const dureeOptions = ["30min", "1h", "1h30", "2h", "2h30", "3h"];
const dureeToHours: Record<string, number> = {
  "30min": 0.5, "1h": 1, "1h30": 1.5, "2h": 2, "2h30": 2.5, "3h": 3,
};
const JOURS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const MOIS = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];

function formatDate(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return `${d} ${MOIS[m - 1]} ${y}`;
}
function getFirstDayOfWeek(year: number, month: number) {
  return (new Date(year, month, 1).getDay() + 6) % 7;
}
function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

const initialFormState = {
  eleve_id: "",
  eleve_nom: "",
  matiere: "",
  date: "",
  duree: "1h",
  tarif_heure: 30,
  statut: "planifié" as CoursRow["statut"],
};

export function Cours() {
  const { profile } = useAuth();
  const { cours, loading, error, reload, addCours } = useCours();
  const { eleves } = useEleves();
  const { recaps, validerMois } = useRecapMensuel();
  const hasSiret = !!profile?.siret;

  const today = new Date();
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [recapModal, setRecapModal] = useState<{ mois: string; moisNum: number; anneeNum: number; coursList: CoursRow[] } | null>(null);
  const [validating, setValidating] = useState(false);
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  // L'état est maintenant initialisé à vide au montage
  const [form, setForm] = useState(initialFormState);

  const selectedEleve = eleves.find((e) => e.id === form.eleve_id);

  const monthlySummary = useMemo(() => {
    const map: Record<string, { total: number; nbCours: number; allPaid: boolean; moisNum: number; anneeNum: number; coursList: CoursRow[] }> = {};
    cours.forEach((c: CoursRow) => {
      const [y, m] = c.date.split("-");
      const key = `${MOIS[Number(m) - 1]} ${y}`;
      if (!map[key]) map[key] = { total: 0, nbCours: 0, allPaid: true, moisNum: Number(m), anneeNum: Number(y), coursList: [] };
      map[key].total += c.montant;
      map[key].nbCours += 1;
      map[key].coursList.push(c);
      if (c.statut !== "payé") map[key].allPaid = false;
    });
    return Object.entries(map).map(([mois, v]) => {
      // Un seul recap par mois désormais
      const recap = recaps.find((r) => r.mois === v.moisNum && r.annee === v.anneeNum);
      const recapStatut: RecapStatut = recap?.statut ?? "en_cours";
      return { mois, ...v, recapStatut, recapId: recap?.id ?? null };
    }).slice(0, 3);
  }, [cours, recaps]);

  const firstDay = getFirstDayOfWeek(calYear, calMonth);
  const daysInMonth = getDaysInMonth(calYear, calMonth);
  const cells = Array.from({ length: firstDay + daysInMonth }, (_, i) =>
    i < firstDay ? null : i - firstDay + 1
  );

  const coursByDate = useMemo(() => {
    const map: Record<string, CoursRow[]> = {};
    cours.forEach((c: CoursRow) => {
      if (!map[c.date]) map[c.date] = [];
      map[c.date].push(c);
    });
    return map;
  }, [cours]);

  function prevMonth() {
    if (calMonth === 0) { setCalMonth(11); setCalYear(calYear - 1); }
    else setCalMonth(calMonth - 1);
  }
  function nextMonth() {
    if (calMonth === 11) { setCalMonth(0); setCalYear(calYear + 1); }
    else setCalMonth(calMonth + 1);
  }

  // Fonction dédiée pour ouvrir la modale proprement
  function handleOpenModal() {
    if (eleves.length === 0) {
      alert("Vous devez d'abord ajouter un élève avant de déclarer un cours.");
      return;
    }
    
    const premierEleve = eleves[0];
    setForm({
      eleve_id: premierEleve.id,
      eleve_nom: premierEleve.nom,
      matiere: premierEleve.matiere || "",
      date: "",
      duree: "1h",
      tarif_heure: premierEleve.tarif_heure ?? 30,
      statut: "planifié",
    });
    
    setShowModal(true);
  }

  async function handleAdd() {
    // Barrière de sécurité finale (Guard Clause)
    if (!form.eleve_id || !form.matiere || !form.date) return;
    
    setSaving(true);
    try {
      const heures = dureeToHours[form.duree] ?? 1;
      await addCours({
        eleve_id: form.eleve_id, // Plus de || null permissif
        eleve_nom: form.eleve_nom,
        matiere: form.matiere,
        date: form.date,
        duree: form.duree,
        duree_heures: heures,
        montant: form.tarif_heure * heures,
        statut: form.statut,
      });
      setShowModal(false);
      setForm(initialFormState); // On réinitialise proprement
    } finally {
      setSaving(false);
    }
  }

  async function handleValiderMois() {
    if (!recapModal) return;
    setValidating(true);
    try {
      const coursParEleve: Record<string, string[]> = {};
      recapModal.coursList.forEach((c) => {
        if (!c.eleve_id) return;
        if (!coursParEleve[c.eleve_id]) coursParEleve[c.eleve_id] = [];
        coursParEleve[c.eleve_id].push(c.id);
      });
      await validerMois(recapModal.moisNum, recapModal.anneeNum, coursParEleve);
      setRecapModal(null);
    } finally {
      setValidating(false);
    }
  }

  const selectedCoursItems = selectedDay ? (coursByDate[selectedDay] ?? []) : [];

  // Cours du mois sélectionné (pour l'expand des cartes)
  const [expandedMonth, setExpandedMonth] = useState<string | null>(null); // "YYYY-MM"

  const expandedCours = useMemo(() => {
    if (!expandedMonth) return [];
    return cours.filter((c) => c.date.startsWith(expandedMonth));
  }, [cours, expandedMonth]);

  const expandedByEleve = useMemo(() => {
    const map: Record<string, CoursRow[]> = {};
    expandedCours.forEach((c) => {
      if (!map[c.eleve_nom]) map[c.eleve_nom] = [];
      map[c.eleve_nom].push(c);
    });
    return Object.entries(map);
  }, [expandedCours]);

  // Le boolean qui détermine si le formulaire est valide
  const isFormValid = form.eleve_id !== "" && form.matiere.trim() !== "" && form.date !== "";

  return (
    <LoadingGuard loading={loading} error={error} onRetry={reload}>
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1>Cours & Paiements</h1>
          <p className="text-muted-foreground mt-1">Suivi des cours et versements mensuels</p>
        </div>
        <button
          onClick={handleOpenModal}
          disabled={!hasSiret}
          title={!hasSiret ? "Renseignez votre SIRET pour débloquer cette action" : undefined}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4" />
          Déclarer un cours
        </button>
      </div>

      {/* Monthly summaries */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        {monthlySummary.length === 0 ? (
          <div className="col-span-3 text-center text-muted-foreground py-6">Aucun cours enregistré</div>
        ) : monthlySummary.map((m) => {
          const moisKey = `${m.anneeNum}-${String(m.moisNum).padStart(2, "0")}`;
          const isExpanded = expandedMonth === moisKey;
          return (
            <div
              key={m.mois}
              onClick={() => setExpandedMonth(isExpanded ? null : moisKey)}
              className={`rounded-xl p-5 border cursor-pointer transition-colors ${
                isExpanded ? "bg-primary/5 border-primary/30" : "bg-white border-border hover:bg-muted/30"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-muted-foreground" style={{ fontSize: 14 }}>{m.mois}</span>
                <StatusBadge statut={m.recapStatut} />
              </div>
              <p className="text-2xl" style={{ fontWeight: 600 }}>{m.total.toLocaleString("fr-FR")} €</p>
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-4 text-muted-foreground" style={{ fontSize: 13 }}>
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{m.nbCours} cours</span>
                  <span className="flex items-center gap-1"><Euro className="w-3.5 h-3.5" />{(m.total / 2).toLocaleString("fr-FR")} € crédit</span>
                </div>
                {m.recapStatut === "en_cours" && (
                  <button
                    onClick={(e) => { e.stopPropagation(); setRecapModal({ mois: m.mois, moisNum: m.moisNum, anneeNum: m.anneeNum, coursList: m.coursList }); }}
                    className="text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-muted transition-colors shrink-0"
                  >
                    Finir le mois
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Calendar */}
      <div className="bg-white rounded-xl border border-border p-6 mb-8">
        <div className="flex items-center justify-between mb-5">
          <h3 className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-primary" />
            Calendrier des cours
          </h3>
          <div className="flex items-center gap-2">
            <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
              <ChevronLeft className="w-4 h-4 text-muted-foreground" />
            </button>
            <span style={{ fontWeight: 600, minWidth: 140, textAlign: "center" }}>
              {MOIS[calMonth]} {calYear}
            </span>
            <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 mb-1">
          {JOURS.map((j) => (
            <div key={j} className="text-center text-muted-foreground py-1" style={{ fontSize: 12, fontWeight: 500 }}>{j}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {cells.map((day, i) => {
            if (!day) return <div key={`empty-${i}`} />;
            const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const dayCours = coursByDate[dateStr] ?? [];
            const isSelected = selectedDay === dateStr;
            const isToday = today.getFullYear() === calYear && today.getMonth() === calMonth && today.getDate() === day;

            return (
              <button
                key={dateStr}
                onClick={() => setSelectedDay(isSelected ? null : dateStr)}
                className={`relative flex flex-col items-center rounded-lg py-2 transition-colors ${
                  isSelected ? "bg-primary text-primary-foreground" :
                  isToday ? "bg-primary/10 text-primary" : "hover:bg-muted"
                }`}
              >
                <span style={{ fontSize: 13, fontWeight: isToday ? 600 : 400 }}>{day}</span>
                {dayCours.length > 0 && (
                  <div className="flex gap-0.5 mt-1">
                    {dayCours.slice(0, 3).map((_, idx) => (
                      <span key={idx} className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-white" : "bg-primary"}`} />
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {selectedDay && selectedCoursItems.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-muted-foreground mb-3" style={{ fontSize: 13 }}>
              Cours du {formatDate(selectedDay)}
            </p>
            <div className="space-y-2">
              {selectedCoursItems.map((c: CoursRow) => (
                <div key={c.id} className="flex items-center justify-between px-4 py-2.5 bg-muted rounded-lg">
                  <div>
                    <span style={{ fontWeight: 500 }}>{c.eleve_nom}</span>
                    <span className="text-muted-foreground ml-2" style={{ fontSize: 13 }}>{c.matiere} · {c.duree}</span>
                  </div>
                  <span style={{ fontWeight: 500 }}>{c.montant} €</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {selectedDay && selectedCoursItems.length === 0 && (
          <p className="mt-4 pt-4 border-t border-border text-muted-foreground" style={{ fontSize: 13 }}>
            Aucun cours le {formatDate(selectedDay)}.
          </p>
        )}
      </div>

      {/* Cours du mois sélectionné */}
      {expandedMonth && (
        <div className="bg-white rounded-xl border border-border overflow-hidden">
          <div className="p-5 border-b border-border">
            <h3>{MOIS[Number(expandedMonth.split("-")[1]) - 1]} {expandedMonth.split("-")[0]}</h3>
          </div>
          {expandedCours.length === 0 ? (
            <p className="px-6 py-10 text-center text-muted-foreground">Aucun cours ce mois-ci</p>
          ) : (
            expandedByEleve.map(([nom, items]) => (
              <div key={nom}>
                <div className="px-6 py-2.5 bg-muted/50 border-b border-border">
                  <span style={{ fontWeight: 600 }}>{nom}</span>
                </div>
                <table className="w-full">
                  <tbody>
                    {items.map((c: CoursRow) => (
                      <tr key={c.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-4 text-muted-foreground">{formatDate(c.date)}</td>
                        <td className="px-6 py-4 text-muted-foreground">{c.matiere}</td>
                        <td className="px-6 py-4 text-muted-foreground">{c.duree}</td>
                        <td className="px-6 py-4" style={{ fontWeight: 500 }}>{c.montant} €</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))
          )}
        </div>
      )}

      {/* Recap modal */}
      {recapModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 p-6 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3>Récapitulatif — {recapModal.mois}</h3>
                <p className="text-muted-foreground mt-0.5" style={{ fontSize: 13 }}>
                  {recapModal.coursList.length} cours · {recapModal.coursList.reduce((s, c) => s + c.duree_heures, 0)}h
                </p>
              </div>
              <button onClick={() => setRecapModal(null)} className="p-1.5 rounded-lg hover:bg-muted">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 space-y-4 mb-5">
              {Object.entries(
                recapModal.coursList.reduce<Record<string, CoursRow[]>>((acc, c) => {
                  const k = c.eleve_nom;
                  if (!acc[k]) acc[k] = [];
                  acc[k].push(c);
                  return acc;
                }, {})
              ).map(([nom, items]) => (
                <div key={nom}>
                  <div className="flex items-center justify-between mb-2">
                    <span style={{ fontWeight: 600 }}>{nom}</span>
                    <span className="text-muted-foreground" style={{ fontSize: 13 }}>
                      {items.reduce((s, c) => s + c.duree_heures, 0)}h · {items.reduce((s, c) => s + c.montant, 0).toLocaleString("fr-FR")} €
                    </span>
                  </div>
                  <div className="space-y-1">
                    {items.map((c) => (
                      <div key={c.id} className="flex items-center justify-between px-3 py-2 bg-muted rounded-lg">
                        <span className="text-muted-foreground" style={{ fontSize: 13 }}>{formatDate(c.date)} · {c.matiere} · {c.duree}</span>
                        <span style={{ fontSize: 13, fontWeight: 500 }}>{c.montant} €</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-border flex items-center justify-between mb-4">
              <span style={{ fontWeight: 600 }}>Total</span>
              <span style={{ fontWeight: 600 }}>
                {recapModal.coursList.reduce((s, c) => s + c.montant, 0).toLocaleString("fr-FR")} €
              </span>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setRecapModal(null)} className="flex-1 px-4 py-2.5 rounded-lg border border-border hover:bg-muted">
                Annuler
              </button>
              <button
                onClick={handleValiderMois}
                disabled={validating}
                className="flex-1 bg-primary text-primary-foreground px-4 py-2.5 rounded-lg hover:opacity-90 disabled:opacity-40 flex items-center justify-center gap-2 transition-opacity"
              >
                {validating && <Loader2 className="w-4 h-4 animate-spin" />}
                Valider le mois
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3>Ajouter un cours</h3>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-muted">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block mb-1.5 text-muted-foreground" style={{ fontSize: 13 }}>Élève</label>
                <select
                  value={form.eleve_id}
                  onChange={(e) => {
                    const elv = eleves.find((el) => el.id === e.target.value);
                    setForm({ 
                      ...form, 
                      eleve_id: e.target.value, 
                      eleve_nom: elv?.nom ?? "", 
                      tarif_heure: elv?.tarif_heure ?? 30,
                      matiere: elv?.matiere ?? form.matiere // Bonus: pré-remplit la matière selon l'élève
                    });
                  }}
                  className="w-full px-4 py-2.5 bg-muted rounded-lg outline-none"
                >
                  <option value="" disabled>Sélectionner un élève</option>
                  {eleves.map((e) => <option key={e.id} value={e.id}>{e.nom}</option>)}
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1.5 text-muted-foreground" style={{ fontSize: 13 }}>Date</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full px-4 py-2.5 bg-muted rounded-lg outline-none"
                  />
                </div>
                <div>
                  <label className="block mb-1.5 text-muted-foreground" style={{ fontSize: 13 }}>Durée</label>
                  <select
                    value={form.duree}
                    onChange={(e) => setForm({ ...form, duree: e.target.value })}
                    className="w-full px-4 py-2.5 bg-muted rounded-lg outline-none"
                  >
                    {dureeOptions.map((d) => <option key={d}>{d}</option>)}
                  </select>
                </div>
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

              <div className="flex items-center justify-between px-4 py-3 bg-secondary rounded-lg">
                <span className="text-secondary-foreground" style={{ fontSize: 13 }}>Montant estimé</span>
                <span style={{ fontWeight: 600 }}>
                  {(form.tarif_heure * (dureeToHours[form.duree] ?? 1)).toFixed(2)} €
                </span>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-2.5 rounded-lg border border-border hover:bg-muted">
                Annuler
              </button>
              <button
                onClick={handleAdd}
                disabled={!isFormValid || saving}
                className="flex-1 bg-primary text-primary-foreground px-4 py-2.5 rounded-lg hover:opacity-90 disabled:opacity-40 flex items-center justify-center gap-2 transition-opacity"
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

