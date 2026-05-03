import { useState, useMemo } from "react";
import { BookOpen, Plus, X, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useCours } from "../../../lib/hooks/useCours";
import { useEleves } from "../../../lib/hooks/useEleves";
import { useAuth } from "../../../lib/auth";
import { useRecapMensuel } from "../../../lib/hooks/useRecapMensuel";
import { useGrilleCommission, getTauxPlusvalue } from "../../../lib/hooks/useGrilleCommission";
import type { CoursRow } from "../../../lib/hooks/useCours";
import type { RecapStatut } from "../../../lib/database.types";
import { LoadingGuard } from "../layout/LoadingGuard";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogHeader, AlertDialogTitle,
} from "../ui/alert-dialog";

const MATIERES = ["Mathématiques", "Physique", "Chimie", "Français", "Anglais", "Espagnol", "Allemand", "Histoire-Géographie", "SES", "SVT", "NSI", "Philosophie", "Autre"];

function formatDuree(mins: number): string {
  if (mins <= 0) return "0min";
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m}min`;
  return m > 0 ? `${h}h${m}min` : `${h}h`;
}
const JOURS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const MOIS = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];

function formatDate(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return `${d} ${MOIS[m - 1]} ${y}`;
}
function getFirstDayOfWeek(year: number, month: number) { return (new Date(year, month, 1).getDay() + 6) % 7; }
function getDaysInMonth(year: number, month: number) { return new Date(year, month + 1, 0).getDate(); }

const initialFormState = { eleve_id: "", eleve_nom: "", matiere: "", date: "", duree_minutes: 60, tarif_heure: 30, statut: "planifié" as CoursRow["statut"] };

const S = {
  card: { background: "#fff", border: "1px solid #E2E8F0", borderRadius: 16, boxShadow: "0 1px 3px rgba(15,23,42,.06)" } as React.CSSProperties,
  badge: (bg: string, color: string) => ({ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 8px", borderRadius: 999, fontSize: 11, fontWeight: 700, background: bg, color } as React.CSSProperties),
  btnPrimary: { display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: 12, background: "#2E6BEA", color: "#fff", fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer" } as React.CSSProperties,
  btnGhost: { display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: 12, background: "transparent", color: "#334155", fontSize: 13, fontWeight: 600, border: "1px solid #E2E8F0", cursor: "pointer" } as React.CSSProperties,
  input: { width: "100%", padding: "10px 14px", borderRadius: 12, border: "1px solid #E2E8F0", background: "#F1F5F9", fontFamily: "inherit", fontSize: 13, color: "#0F172A", outline: "none" } as React.CSSProperties,
  label: { display: "block", fontSize: 12, fontWeight: 600, color: "#334155", marginBottom: 5 } as React.CSSProperties,
  serif: { fontFamily: "'Fraunces', Georgia, serif" } as React.CSSProperties,
};

function StatusBadge({ statut }: { statut: RecapStatut }) {
  if (statut === "valide") return <span style={S.badge("#ECFDF5", "#065F46")}>Validé</span>;
  if (statut === "en_attente_paiement") return <span style={S.badge("#F5F3FF", "#7C3AED")}>En attente paiement</span>;
  if (statut === "en_attente_parent") return <span style={S.badge("#FFFBEB", "#92400E")}>En attente parent</span>;
  return <span style={S.badge("#EFF6FF", "#1E3A8A")}>En cours</span>;
}

export function Cours() {
  const { profile } = useAuth();
  const { cours, loading, error, reload, addCours } = useCours();
  const { eleves } = useEleves();
  const { recaps, validerMois } = useRecapMensuel();
  const { grille } = useGrilleCommission();
  const hasSiret = !!profile?.siret;
  const hasIban = !!profile?.iban;

  const today = new Date();
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [recapModal, setRecapModal] = useState<{ mois: string; moisNum: number; anneeNum: number; coursList: CoursRow[]; recapStatut: RecapStatut } | null>(null);
  const [validating, setValidating] = useState(false);
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [form, setForm] = useState(initialFormState);
  const [matiereInput, setMatiereInput] = useState("");
  const [showMatiereDropdown, setShowMatiereDropdown] = useState(false);
  const [expandedMonth, setExpandedMonth] = useState<string | null>(null);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const [monthError, setMonthError] = useState<string | null>(null);

  const selectedEleve = eleves.find((e) => e.id === form.eleve_id);

  const allMonthlySummary = useMemo(() => {
    const map: Record<string, { total: number; nbCours: number; moisNum: number; anneeNum: number; coursList: CoursRow[] }> = {};
    cours.forEach((c: CoursRow) => {
      const [y, m] = c.date.split("-");
      const key = `${MOIS[Number(m) - 1]} ${y}`;
      if (!map[key]) map[key] = { total: 0, nbCours: 0, moisNum: Number(m), anneeNum: Number(y), coursList: [] };
      const tarifH = c.duree_heures > 0 ? c.montant / c.duree_heures : 0;
      const taux = getTauxPlusvalue(grille, tarifH);
      map[key].total += c.montant * (1 + taux);
      map[key].nbCours += 1;
      map[key].coursList.push(c);
    });
    return Object.entries(map).map(([mois, v]) => {
      const recap = recaps.find((r) => r.mois === v.moisNum && r.annee === v.anneeNum);
      const recapStatut: RecapStatut = recap?.statut ?? "en_cours";
      return { mois, ...v, recapStatut, recapId: recap?.id ?? null };
    }).sort((a, b) => a.anneeNum !== b.anneeNum ? b.anneeNum - a.anneeNum : b.moisNum - a.moisNum);
  }, [cours, recaps, grille]);

  const monthlySummary = allMonthlySummary.slice(0, 3);
  const olderMonths = allMonthlySummary.slice(3);

  const firstDay = getFirstDayOfWeek(calYear, calMonth);
  const daysInMonth = getDaysInMonth(calYear, calMonth);
  const cells = Array.from({ length: firstDay + daysInMonth }, (_, i) => i < firstDay ? null : i - firstDay + 1);

  const coursByDate = useMemo(() => {
    const map: Record<string, CoursRow[]> = {};
    cours.forEach((c: CoursRow) => { if (!map[c.date]) map[c.date] = []; map[c.date].push(c); });
    return map;
  }, [cours]);

  const expandedCours = useMemo(() => {
    if (!expandedMonth) return [];
    return cours.filter((c: CoursRow) => c.date.startsWith(expandedMonth));
  }, [cours, expandedMonth]);

  const expandedByEleve = useMemo(() => {
    const map: Record<string, CoursRow[]> = {};
    expandedCours.forEach((c: CoursRow) => { if (!map[c.eleve_nom]) map[c.eleve_nom] = []; map[c.eleve_nom].push(c); });
    return Object.entries(map);
  }, [expandedCours]);

  const isFormValid = form.eleve_id !== "" && form.matiere.trim() !== "" && form.date !== "" && form.duree_minutes > 0;
  const selectedCoursItems = selectedDay ? (coursByDate[selectedDay] ?? []) : [];

  function prevMonth() { if (calMonth === 0) { setCalMonth(11); setCalYear(calYear - 1); } else setCalMonth(calMonth - 1); }
  function nextMonth() { if (calMonth === 11) { setCalMonth(0); setCalYear(calYear + 1); } else setCalMonth(calMonth + 1); }

  function handleOpenModal() {
    if (eleves.length === 0) { alert("Vous devez d'abord ajouter un élève."); return; }
    const first = eleves[0];
    setForm({ eleve_id: first.id, eleve_nom: first.nom, matiere: first.matiere?.split(",")[0].trim() ?? "", date: "", duree_minutes: 60, tarif_heure: first.tarif_heure ?? 30, statut: "planifié" });
    setShowModal(true);
  }

  async function handleAdd() {
    if (!isFormValid) return;
    setSaving(true);
    try {
      const heures = form.duree_minutes / 60;
      const dureeLabel = formatDuree(form.duree_minutes);
      await addCours({ eleve_id: form.eleve_id, eleve_nom: form.eleve_nom, matiere: form.matiere, date: form.date, duree: dureeLabel, duree_heures: heures, montant: form.tarif_heure * heures, statut: form.statut });
      setShowModal(false); setForm(initialFormState); setMatiereInput("");
    } finally { setSaving(false); }
  }

  function handleValiderClick() {
    if (!recapModal) return;
    const lastDayOfMonth = new Date(recapModal.anneeNum, recapModal.moisNum, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    lastDayOfMonth.setHours(0, 0, 0, 0);
    if (lastDayOfMonth > today) {
      const nextMonth = recapModal.moisNum === 12 ? 1 : recapModal.moisNum + 1;
      const nextYear = recapModal.moisNum === 12 ? recapModal.anneeNum + 1 : recapModal.anneeNum;
      setMonthError(`Vous pouvez clôturer ce mois à partir du 1er ${MOIS[nextMonth - 1]} ${nextYear}`);
      return;
    }
    setMonthError(null);
    setShowCloseConfirm(true);
  }

  async function handleValiderMois() {
    if (!recapModal) return;
    setValidating(true);
    try {
      const coursParEleve: Record<string, string[]> = {};
      recapModal.coursList.forEach((c) => { if (!c.eleve_id) return; if (!coursParEleve[c.eleve_id]) coursParEleve[c.eleve_id] = []; coursParEleve[c.eleve_id].push(c.id); });
      await validerMois(recapModal.moisNum, recapModal.anneeNum, coursParEleve);
      setRecapModal(null);
    } finally { setValidating(false); setShowCloseConfirm(false); }
  }

  return (
    <LoadingGuard loading={loading} error={error} onRetry={reload}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 28 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-.02em", color: "#0F172A" }}>Cours &amp; Paiements</h1>
            <p style={{ color: "#64748B", marginTop: 4, fontSize: 13 }}>Suivi des cours et versements mensuels</p>
          </div>
          <button style={{ ...S.btnPrimary, opacity: hasSiret ? 1 : 0.4 }} onClick={handleOpenModal} disabled={!hasSiret}>
            <Plus className="w-4 h-4" />Déclarer un cours
          </button>
        </div>

        {/* Monthly summaries */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 20 }}>
          {monthlySummary.length === 0 ? (
            <div style={{ gridColumn: "1/-1", textAlign: "center", color: "#94A3B8", padding: "24px 0", fontSize: 13 }}>Aucun cours enregistré</div>
          ) : monthlySummary.map((m) => {
            const moisKey = `${m.anneeNum}-${String(m.moisNum).padStart(2, "0")}`;
            const isExpanded = expandedMonth === moisKey;
            return (
              <div key={m.mois} onClick={() => setExpandedMonth(isExpanded ? null : moisKey)} style={{ ...S.card, padding: 20, cursor: "pointer", background: isExpanded ? "#EFF6FF" : "#fff", borderColor: isExpanded ? "#C7D8FB" : "#E2E8F0" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <span style={{ color: "#64748B", fontSize: 13 }}>{m.mois}</span>
                  <StatusBadge statut={m.recapStatut} />
                </div>
                <div style={{ ...S.serif, fontSize: 32, letterSpacing: "-.02em", color: "#0F172A" }}>{m.total.toLocaleString("fr-FR")} €</div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
                  <span style={{ fontSize: 12, color: "#64748B", display: "flex", alignItems: "center", gap: 4 }}>
                    <BookOpen style={{ width: 12, height: 12 }} /> {m.nbCours} cours
                  </span>
                  {m.recapStatut === "en_cours" && (
                    <button onClick={(e) => { e.stopPropagation(); setRecapModal({ mois: m.mois, moisNum: m.moisNum, anneeNum: m.anneeNum, coursList: m.coursList, recapStatut: m.recapStatut }); }} style={{ ...S.btnGhost, fontSize: 11, padding: "5px 10px" }}>
                      Finir le mois
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Calendar */}
        <div style={{ ...S.card, padding: 24, marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
            <h2 style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 17, fontWeight: 700, color: "#0F172A" }}>
              <BookOpen style={{ width: 16, height: 16, color: "#2E6BEA" }} />Calendrier des cours
            </h2>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button style={{ ...S.btnGhost, padding: "6px 10px" }} onClick={prevMonth}><ChevronLeft style={{ width: 14, height: 14 }} /></button>
              <span style={{ fontWeight: 700, minWidth: 140, textAlign: "center", fontSize: 14 }}>{MOIS[calMonth]} {calYear}</span>
              <button style={{ ...S.btnGhost, padding: "6px 10px" }} onClick={nextMonth}><ChevronRight style={{ width: 14, height: 14 }} /></button>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", marginBottom: 6 }}>
            {JOURS.map((j) => <div key={j} style={{ textAlign: "center", fontSize: 11, fontWeight: 600, color: "#64748B", padding: "4px 0" }}>{j}</div>)}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 3 }}>
            {cells.map((day, i) => {
              if (!day) return <div key={`e${i}`} />;
              const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const dayCours = coursByDate[dateStr] ?? [];
              const isSel = selectedDay === dateStr;
              const isTod = today.getFullYear() === calYear && today.getMonth() === calMonth && today.getDate() === day;
              return (
                <button key={dateStr} onClick={() => setSelectedDay(isSel ? null : dateStr)} style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "8px 4px", borderRadius: 10, border: "none", cursor: "pointer", background: isSel ? "#2E6BEA" : isTod ? "#EFF6FF" : "transparent", color: isSel ? "#fff" : isTod ? "#2E6BEA" : "#0F172A" }}>
                  <span style={{ fontSize: 12, fontWeight: isTod ? 700 : 400 }}>{day}</span>
                  {dayCours.length > 0 && (
                    <div style={{ display: "flex", gap: 2, marginTop: 3 }}>
                      {dayCours.slice(0, 3).map((_, k) => <span key={k} style={{ width: 5, height: 5, borderRadius: "50%", background: isSel ? "rgba(255,255,255,.8)" : "#2E6BEA" }} />)}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {selectedDay && selectedCoursItems.length > 0 && (
            <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid #E2E8F0" }}>
              <p style={{ fontSize: 12, color: "#64748B", marginBottom: 10 }}>Cours du {formatDate(selectedDay)}</p>
              {selectedCoursItems.map((c: CoursRow) => {
                const tarifH = c.duree_heures > 0 ? c.montant / c.duree_heures : 0;
                const taux = getTauxPlusvalue(grille, tarifH);
                const netProf = Math.round(c.montant * (1 + taux));
                return (
                  <div key={c.id} style={{ padding: "10px 14px", background: "#F1F5F9", borderRadius: 10, marginBottom: 6 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                      <span style={{ fontWeight: 600, fontSize: 13, color: "#0F172A" }}>{c.eleve_nom}</span>
                      <span style={{ color: "#64748B", fontSize: 12 }}>{c.matiere} · {c.duree}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 11, color: "#64748B" }}>{Math.round(tarifH)}€/h · {c.montant}€ famille</span>
                      <span style={{ fontSize: 11, color: "#16A34A" }}>+{Math.round(taux * 100)}% → {netProf}€ pour vous</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {selectedDay && selectedCoursItems.length === 0 && (
            <p style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid #E2E8F0", fontSize: 13, color: "#64748B" }}>Aucun cours le {formatDate(selectedDay)}.</p>
          )}
        </div>

        {/* Expanded month */}
        {expandedMonth && (
          <div style={{ ...S.card, overflow: "hidden", marginBottom: 16 }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid #E2E8F0" }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0F172A" }}>{MOIS[Number(expandedMonth.split("-")[1]) - 1]} {expandedMonth.split("-")[0]}</h3>
            </div>
            {expandedCours.length === 0 ? (
              <p style={{ padding: "40px 24px", textAlign: "center", color: "#94A3B8", fontSize: 13 }}>Aucun cours ce mois-ci</p>
            ) : expandedByEleve.map(([nom, items]) => (
              <div key={nom}>
                <div style={{ padding: "10px 20px", background: "#F8FAFC", borderBottom: "1px solid #E2E8F0" }}>
                  <span style={{ fontWeight: 600, fontSize: 13, color: "#0F172A" }}>{nom}</span>
                </div>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <tbody>
                    {items.map((c: CoursRow) => {
                      const tarifH = c.duree_heures > 0 ? c.montant / c.duree_heures : 0;
                      const taux = getTauxPlusvalue(grille, tarifH);
                      const netProf = Math.round(c.montant * (1 + taux));
                      return (
                        <tr key={c.id}>
                          <td style={{ padding: "12px 20px", borderTop: "1px solid #F1F5F9", fontSize: 13, color: "#64748B" }}>{formatDate(c.date)}</td>
                          <td style={{ padding: "12px 20px", borderTop: "1px solid #F1F5F9", fontSize: 13, color: "#64748B" }}>{c.matiere}</td>
                          <td style={{ padding: "12px 20px", borderTop: "1px solid #F1F5F9", fontSize: 13, color: "#64748B" }}>{c.duree}</td>
                          <td style={{ padding: "12px 20px", borderTop: "1px solid #F1F5F9", fontSize: 12, color: "#94A3B8" }}>{Math.round(tarifH)}€/h</td>
                          <td style={{ padding: "12px 20px", borderTop: "1px solid #F1F5F9", fontSize: 13, color: "#64748B" }}>{c.montant}€ famille</td>
                          <td style={{ padding: "12px 20px", borderTop: "1px solid #F1F5F9", fontSize: 13, fontWeight: 600, color: "#16A34A" }}>+{Math.round(taux * 100)}% → {netProf}€ pour vous</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        )}

        {/* Historique — tous les mois au-delà des 3 récents */}
        {olderMonths.length > 0 && (
          <div style={{ ...S.card, padding: 20, marginBottom: 16 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: "#0F172A", marginBottom: 14 }}>Historique</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))", gap: 10 }}>
              {olderMonths.map((m) => (
                <div
                  key={m.mois}
                  onClick={() => setRecapModal({ mois: m.mois, moisNum: m.moisNum, anneeNum: m.anneeNum, coursList: m.coursList, recapStatut: m.recapStatut })}
                  style={{ padding: "12px 14px", borderRadius: 12, border: "1px solid #E2E8F0", cursor: "pointer", background: "#F8FAFC", transition: "box-shadow .15s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 2px 8px rgba(15,23,42,.08)")}
                  onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#334155" }}>{m.mois}</span>
                    <StatusBadge statut={m.recapStatut} />
                  </div>
                  <div style={{ ...S.serif, fontSize: 20, color: "#0F172A", marginBottom: 4 }}>{m.total.toLocaleString("fr-FR")} €</div>
                  <div style={{ fontSize: 12, color: "#94A3B8", display: "flex", alignItems: "center", gap: 4 }}>
                    <BookOpen style={{ width: 11, height: 11 }} />{m.nbCours} cours
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recap modal */}
        {recapModal && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}>
            <div style={{ background: "#fff", borderRadius: 22, width: "100%", maxWidth: 520, margin: "0 16px", padding: 24, maxHeight: "90vh", display: "flex", flexDirection: "column", boxShadow: "0 4px 24px rgba(15,23,42,.12)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                <div>
                  <h3 style={{ fontWeight: 700, fontSize: 16, color: "#0F172A" }}>Récapitulatif — {recapModal.mois}</h3>
                  <p style={{ color: "#64748B", fontSize: 13, marginTop: 2 }}>{recapModal.coursList.length} cours · {recapModal.coursList.reduce((s, c) => s + c.duree_heures, 0)}h</p>
                </div>
                <button onClick={() => setRecapModal(null)} style={{ background: "none", border: "none", cursor: "pointer" }}><X className="w-4 h-4 text-slate-400" /></button>
              </div>
              <div style={{ overflowY: "auto", flex: 1, marginBottom: 20 }}>
                {Object.entries(recapModal.coursList.reduce<Record<string, CoursRow[]>>((acc, c) => { if (!acc[c.eleve_nom]) acc[c.eleve_nom] = []; acc[c.eleve_nom].push(c); return acc; }, {})).map(([nom, items]) => (
                  <div key={nom} style={{ marginBottom: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                      <span style={{ fontWeight: 600, fontSize: 13, color: "#0F172A" }}>{nom}</span>
                      <span style={{ fontSize: 13, color: "#64748B" }}>
                        {items.reduce((s, c) => s + c.duree_heures, 0)}h · {items.reduce((s, c) => s + c.montant, 0).toLocaleString("fr-FR")}€ famille · {items.reduce((s, c) => {
                          const tarifH = c.duree_heures > 0 ? c.montant / c.duree_heures : 0;
                          return s + Math.round(c.montant * (1 + getTauxPlusvalue(grille, tarifH)));
                        }, 0).toLocaleString("fr-FR")}€ pour vous
                      </span>
                    </div>
                    {items.map((c) => {
                      const tarifH = c.duree_heures > 0 ? c.montant / c.duree_heures : 0;
                      const taux = getTauxPlusvalue(grille, tarifH);
                      const netProf = Math.round(c.montant * (1 + taux));
                      return (
                        <div key={c.id} style={{ padding: "8px 12px", background: "#F1F5F9", borderRadius: 10, marginBottom: 4 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                            <span style={{ fontSize: 13, color: "#64748B" }}>{formatDate(c.date)} · {c.matiere} · {c.duree}</span>
                            <span style={{ fontSize: 13, fontWeight: 500, color: "#0F172A" }}>{c.montant}€ famille</span>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span style={{ fontSize: 11, color: "#94A3B8" }}>{Math.round(tarifH)}€/h</span>
                            <span style={{ fontSize: 11, color: "#16A34A" }}>{netProf}€ pour vous</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
              <div style={{ paddingTop: 16, borderTop: "1px solid #E2E8F0", marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 13, color: "#64748B" }}>Total famille</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#64748B" }}>{recapModal.coursList.reduce((s, c) => s + c.montant, 0).toLocaleString("fr-FR")} €</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontWeight: 700, color: "#0F172A" }}>Pour vous, après impôts et cotisations</span>
                  <span style={{ fontWeight: 700, color: "#16A34A" }}>{recapModal.coursList.reduce((s, c) => {
                    const tarifH = c.duree_heures > 0 ? c.montant / c.duree_heures : 0;
                    return s + Math.round(c.montant * (1 + getTauxPlusvalue(grille, tarifH)));
                  }, 0).toLocaleString("fr-FR")} €</span>
                </div>
              </div>
              {monthError && (
                <div style={{ marginBottom: 12, padding: "10px 14px", background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 10, fontSize: 13, color: "#B91C1C" }}>
                  {monthError}
                </div>
              )}
              {recapModal?.recapStatut === "en_cours" ? (
                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={() => { setRecapModal(null); setMonthError(null); }} style={{ ...S.btnGhost, flex: 1, justifyContent: "center" }}>Annuler</button>
                  <button
                    onClick={handleValiderClick}
                    disabled={validating || !hasIban}
                    title={!hasIban ? "Renseignez votre IBAN pour pouvoir clore un mois" : undefined}
                    style={{ ...S.btnPrimary, flex: 1, justifyContent: "center", opacity: validating || !hasIban ? 0.4 : 1 }}
                  >
                    {validating && <Loader2 className="w-4 h-4 animate-spin" />}Valider le mois
                  </button>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{ display: "flex", justifyContent: "center", padding: "8px 14px", background: "#ECFDF5", border: "1px solid #BBF7D0", borderRadius: 10, fontSize: 13, color: "#065F46", fontWeight: 600 }}>
                    ✓ Mois clôturé
                  </div>
                  <button onClick={() => { setRecapModal(null); setMonthError(null); }} style={{ ...S.btnGhost, justifyContent: "center" }}>Fermer</button>
                </div>
              )}
            </div>
          </div>
        )}

        <AlertDialog open={showCloseConfirm} onOpenChange={setShowCloseConfirm}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Clore le mois de {recapModal ? recapModal.mois : ""}</AlertDialogTitle>
              <AlertDialogDescription>
                Cette action est irréversible. Une fois le mois clôturé, vous ne pourrez plus ajouter ni modifier les cours de ce mois. Les parents recevront une demande de validation des heures.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="flex gap-3">
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction onClick={handleValiderMois} className="bg-red-600 hover:bg-red-700">
                {validating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Clôturer définitivement
              </AlertDialogAction>
            </div>
          </AlertDialogContent>
        </AlertDialog>

        {/* Add cours modal */}
        {showModal && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 16 }}>
            <div style={{ background: "#fff", borderRadius: 22, width: "100%", maxWidth: 480, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 4px 24px rgba(15,23,42,.12)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "22px 24px 0" }}>
                <h2 style={{ fontWeight: 700, fontSize: 16, color: "#0F172A" }}>Ajouter un cours</h2>
                <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", cursor: "pointer" }}><X className="w-4 h-4 text-slate-400" /></button>
              </div>
              <div style={{ padding: "20px 24px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
                <div><label style={S.label}>Élève</label>
                  <select style={S.input} value={form.eleve_id} onChange={(e) => { const elv = eleves.find((el) => el.id === e.target.value); setForm({ ...form, eleve_id: e.target.value, eleve_nom: elv?.nom ?? "", tarif_heure: elv?.tarif_heure ?? 30, matiere: elv?.matiere?.split(",")[0].trim() ?? form.matiere }); }}>
                    <option value="" disabled>Sélectionner un élève</option>
                    {eleves.map((e) => <option key={e.id} value={e.id}>{e.nom}</option>)}
                  </select>
                </div>
                <div><label style={S.label}>Matière</label>
                  <div style={{ position: "relative" }}>
                    <input style={S.input} value={matiereInput || form.matiere} onChange={(e) => { setMatiereInput(e.target.value); setForm({ ...form, matiere: e.target.value }); setShowMatiereDropdown(true); }} onFocus={() => setShowMatiereDropdown(true)} onBlur={() => setTimeout(() => setShowMatiereDropdown(false), 150)} placeholder="Ex: Mathématiques..." />
                    {showMatiereDropdown && (
                      <ul style={{ position: "absolute", zIndex: 10, width: "100%", background: "#fff", border: "1px solid #E2E8F0", borderRadius: 12, boxShadow: "0 4px 16px rgba(15,23,42,.08)", marginTop: 4, maxHeight: 192, overflowY: "auto" }}>
                        {[...(selectedEleve?.matiere ? selectedEleve.matiere.split(",").map((m) => m.trim()).filter(Boolean) : []), ...MATIERES.filter((m) => !selectedEleve?.matiere?.split(",").map((x) => x.trim()).includes(m))].filter((m) => m.toLowerCase().includes((matiereInput || form.matiere).toLowerCase())).map((m) => (
                          <li key={m} onMouseDown={() => { setForm({ ...form, matiere: m }); setMatiereInput(""); setShowMatiereDropdown(false); }} style={{ padding: "10px 14px", fontSize: 13, cursor: "pointer", listStyle: "none", color: "#0F172A" }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = "#F1F5F9")} onMouseLeave={(e) => (e.currentTarget.style.background = "")}>
                            {m}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div><label style={S.label}>Date</label><input type="date" style={S.input} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
                  <div>
                    <label style={S.label}>Durée (minutes)</label>
                    <input
                      type="number"
                      min={5}
                      step={5}
                      style={S.input}
                      value={form.duree_minutes || ""}
                      placeholder="ex. 90"
                      onChange={(e) => setForm({ ...form, duree_minutes: Math.max(0, Number(e.target.value)) })}
                    />
                    {form.duree_minutes > 0 && (
                      <p style={{ fontSize: 11, color: "#64748B", marginTop: 4 }}>
                        = {formatDuree(form.duree_minutes)}
                      </p>
                    )}
                  </div>
                </div>
                <div><label style={S.label}>Tarif / heure — net parent (€)</label><input type="number" style={S.input} value={form.tarif_heure} onChange={(e) => setForm({ ...form, tarif_heure: Number(e.target.value) })} /></div>
                {(() => {
                  const heures = form.duree_minutes / 60;
                  const montantFamille = form.tarif_heure * heures;
                  const taux = getTauxPlusvalue(grille, form.tarif_heure);
                  const netProf = Math.round(montantFamille * (1 + taux));
                  return (
                    <div style={{ background: "#EFF6FF", borderRadius: 10, padding: "12px 14px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#1E3A8A", marginBottom: 6 }}>
                        <span>Prix famille ({form.tarif_heure}€/h × {formatDuree(form.duree_minutes)})</span>
                        <span style={{ fontWeight: 700 }}>{montantFamille.toFixed(2)} €</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                        <span style={{ color: "#059669" }}>Pour vous (+{Math.round(taux * 100)}%, après impôts et cotisations)</span>
                        <span style={{ fontWeight: 700, color: "#059669" }}>{netProf} €</span>
                      </div>
                    </div>
                  );
                })()}
                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={() => setShowModal(false)} style={{ ...S.btnGhost, flex: 1, justifyContent: "center" }}>Annuler</button>
                  <button onClick={handleAdd} disabled={!isFormValid || saving} style={{ ...S.btnPrimary, flex: 1, justifyContent: "center", opacity: (!isFormValid || saving) ? 0.5 : 1 }}>
                    {saving && <Loader2 className="w-4 h-4 animate-spin" />}Ajouter
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </LoadingGuard>
  );
}
