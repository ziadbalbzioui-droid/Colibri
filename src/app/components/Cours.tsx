import { useState, useMemo } from "react";
import { CalendarDays, Euro, Clock, CheckCircle2, Plus, X, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useCours } from "../../lib/hooks/useCours";
import { useEleves } from "../../lib/hooks/useEleves";
import type { CoursRow } from "../../lib/hooks/useCours";

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

export function Cours() {
  const { cours, loading, error, addCours } = useCours();
  const { eleves } = useEleves();

  const today = new Date();
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const emptyForm = {
    eleve_id: eleves[0]?.id ?? "",
    eleve_nom: eleves[0]?.nom ?? "",
    matiere: "",
    date: "",
    duree: "1h",
    tarif_heure: eleves[0]?.tarif_heure ?? 30,
    statut: "planifié" as CoursRow["statut"],
  };
  const [form, setForm] = useState(emptyForm);

  // Update form when eleves loads
  const selectedEleve = eleves.find((e) => e.id === form.eleve_id);

  const monthlySummary = useMemo(() => {
    const map: Record<string, { total: number; nbCours: number; allPaid: boolean }> = {};
    cours.forEach((c: CoursRow) => {
      const [y, m] = c.date.split("-");
      const key = `${MOIS[Number(m) - 1]} ${y}`;
      if (!map[key]) map[key] = { total: 0, nbCours: 0, allPaid: true };
      map[key].total += c.montant;
      map[key].nbCours += 1;
      if (c.statut !== "payé") map[key].allPaid = false;
    });
    return Object.entries(map).map(([mois, v]) => ({ mois, ...v })).slice(0, 3);
  }, [cours]);

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

  async function handleAdd() {
    if (!form.matiere || !form.date) return;
    setSaving(true);
    try {
      const heures = dureeToHours[form.duree] ?? 1;
      await addCours({
        eleve_id: form.eleve_id || null,
        eleve_nom: form.eleve_nom,
        matiere: form.matiere,
        date: form.date,
        duree: form.duree,
        duree_heures: heures,
        montant: form.tarif_heure * heures,
        statut: form.statut,
      });
      setShowModal(false);
      setForm(emptyForm);
    } finally {
      setSaving(false);
    }
  }

  const selectedCoursItems = selectedDay ? (coursByDate[selectedDay] ?? []) : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        <Loader2 className="w-6 h-6 animate-spin mr-2" /> Chargement...
      </div>
    );
  }

  if (error) {
    return <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-700">{error}</div>;
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1>Cours & Paiements</h1>
          <p className="text-muted-foreground mt-1">Suivi des cours et versements mensuels</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-lg hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          Déclarer un cours
        </button>
      </div>

      {/* Monthly summaries */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        {monthlySummary.length === 0 ? (
          <div className="col-span-3 text-center text-muted-foreground py-6">Aucun cours enregistré</div>
        ) : monthlySummary.map((m) => (
          <div key={m.mois} className="bg-white rounded-xl p-5 border border-border">
            <div className="flex items-center justify-between mb-3">
              <span className="text-muted-foreground" style={{ fontSize: 14 }}>{m.mois}</span>
              {m.allPaid ? (
                <span className="flex items-center gap-1 text-green-600" style={{ fontSize: 13 }}>
                  <CheckCircle2 className="w-3.5 h-3.5" /> Payé
                </span>
              ) : (
                <span className="text-amber-500" style={{ fontSize: 13 }}>En attente</span>
              )}
            </div>
            <p className="text-2xl" style={{ fontWeight: 600 }}>{m.total.toLocaleString("fr-FR")} €</p>
            <div className="flex items-center gap-4 mt-2 text-muted-foreground" style={{ fontSize: 13 }}>
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{m.nbCours} cours</span>
              <span className="flex items-center gap-1"><Euro className="w-3.5 h-3.5" />{(m.total / 2).toLocaleString("fr-FR")} € crédit</span>
            </div>
          </div>
        ))}
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

      {/* Courses list */}
      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <div className="p-5 border-b border-border">
          <h3>Tous les cours</h3>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left px-6 py-3 text-muted-foreground" style={{ fontSize: 13, fontWeight: 500 }}>Élève</th>
              <th className="text-left px-6 py-3 text-muted-foreground" style={{ fontSize: 13, fontWeight: 500 }}>Matière</th>
              <th className="text-left px-6 py-3 text-muted-foreground" style={{ fontSize: 13, fontWeight: 500 }}>Date</th>
              <th className="text-left px-6 py-3 text-muted-foreground" style={{ fontSize: 13, fontWeight: 500 }}>Durée</th>
              <th className="text-left px-6 py-3 text-muted-foreground" style={{ fontSize: 13, fontWeight: 500 }}>Montant</th>
            </tr>
          </thead>
          <tbody>
            {cours.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                  Aucun cours enregistré
                </td>
              </tr>
            ) : cours.map((c: CoursRow) => (
              <tr key={c.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                <td className="px-6 py-4" style={{ fontWeight: 500 }}>{c.eleve_nom}</td>
                <td className="px-6 py-4 text-muted-foreground">{c.matiere}</td>
                <td className="px-6 py-4 text-muted-foreground">{formatDate(c.date)}</td>
                <td className="px-6 py-4 text-muted-foreground">{c.duree}</td>
                <td className="px-6 py-4" style={{ fontWeight: 500 }}>{c.montant} €</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
                    setForm({ ...form, eleve_id: e.target.value, eleve_nom: elv?.nom ?? "", tarif_heure: elv?.tarif_heure ?? 30 });
                  }}
                  className="w-full px-4 py-2.5 bg-muted rounded-lg outline-none"
                >
                  {eleves.map((e) => <option key={e.id} value={e.id}>{e.nom}</option>)}
                </select>
              </div>

              <div>
                <label className="block mb-1.5 text-muted-foreground" style={{ fontSize: 13 }}>Matière</label>
                <input
                  value={form.matiere}
                  onChange={(e) => setForm({ ...form, matiere: e.target.value })}
                  placeholder={selectedEleve?.matiere ?? "Mathématiques..."}
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
                <div>
                  <label className="block mb-1.5 text-muted-foreground" style={{ fontSize: 13 }}>Statut</label>
                  <select
                    value={form.statut}
                    onChange={(e) => setForm({ ...form, statut: e.target.value as CoursRow["statut"] })}
                    className="w-full px-4 py-2.5 bg-muted rounded-lg outline-none"
                  >
                    <option value="planifié">Planifié</option>
                    <option value="en attente">En attente</option>
                    <option value="payé">Payé</option>
                  </select>
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
                disabled={!form.matiere || !form.date || saving}
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
  );
}
