import { useState } from "react";
import { ChevronLeft, ChevronRight, BookOpen, CheckCircle, Loader2, AlertCircle, X, FileText, AlertTriangle } from "lucide-react";
import { Link } from "react-router";
import { useParentData } from "../../../lib/hooks/useParentData";
import type { CoursRow } from "../../../lib/hooks/useCours";
import type { ValidationWithRecap } from "../../../lib/hooks/useParentData";

const MOIS = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
const JOURS_COURTS = ["L", "M", "M", "J", "V", "S", "D"];

const S = {
  card: { background: "#fff", border: "1px solid #E2E8F0", borderRadius: 16, boxShadow: "0 1px 3px rgba(15,23,42,.06)" } as React.CSSProperties,
  serif: { fontFamily: "'Fraunces', Georgia, serif" } as React.CSSProperties,
  eyebrow: { fontSize: 11, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase" as const, color: "#64748B" } as React.CSSProperties,
};

const MATIERE_COLORS: Record<string, { bg: string; dot: string }> = {
  "Mathématiques":  { bg: "#EFF6FF", dot: "#1D4ED8" },
  "Physique-Chimie": { bg: "#F5F3FF", dot: "#7C3AED" },
  "Français":        { bg: "#FFF7ED", dot: "#C2410C" },
  "Histoire-Géo":    { bg: "#ECFDF5", dot: "#065F46" },
  "Anglais":         { bg: "#F0FDF4", dot: "#15803D" },
  "SVT":             { bg: "#FDF4FF", dot: "#A21CAF" },
  "Philosophie":     { bg: "#FFF1F2", dot: "#BE123C" },
};

function formatDateFull(d: string) {
  const dt = new Date(d);
  const jours = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
  return `${jours[dt.getDay()]} ${dt.getDate()} ${MOIS[dt.getMonth()]}`;
}

// ── Mini calendar with dots under course days ──
function MiniCalendar({ year, month, activeDays }: { year: number; month: number; activeDays: Set<number> }) {
  const firstDow = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const offset = (firstDow + 6) % 7;
  const today = new Date();
  const isCurrentMonth = year === today.getFullYear() && month === today.getMonth();
  const todayDate = today.getDate();

  const cells: (number | null)[] = [];
  for (let i = 0; i < offset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7) cells.push(null);

  return (
    <div>
      {/* Day headers */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", marginBottom: 6 }}>
        {JOURS_COURTS.map((j, i) => (
          <div key={i} style={{ textAlign: "center", fontSize: 10, fontWeight: 700, color: "#94A3B8", padding: "4px 0" }}>{j}</div>
        ))}
      </div>
      {/* Day cells */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }}>
        {cells.map((d, i) => {
          const isActive = d !== null && activeDays.has(d);
          const isToday = isCurrentMonth && d === todayDate;
          return (
            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingBottom: 6 }}>
              <div style={{
                width: 32, height: 32, borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 12, fontWeight: isToday ? 700 : 400,
                background: isToday ? "#EFF6FF" : "transparent",
                color: d ? (isToday ? "#1D4ED8" : "#374151") : "transparent",
                border: isToday ? "1.5px solid #BFDBFE" : "1.5px solid transparent",
              }}>
                {d ?? ""}
              </div>
              {/* Dot for course days */}
              <div style={{
                width: 5, height: 5, borderRadius: "50%",
                background: isActive ? "#2563EB" : "transparent",
                marginTop: 2,
              }} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ParentCours() {
  const { cours, children, validations, validerRecap, profile, loading } = useParentData();
  const [recapModal, setRecapModal] = useState<ValidationWithRecap | null>(null);
  const [validating, setValidating] = useState(false);
  const [validError, setValidError] = useState<string | null>(null);
  const [validated, setValidated] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const today = new Date();
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth());

  const profByEleve = Object.fromEntries(children.map((ch) => [ch.id, ch.prof_nom]));
  const hasAvanceImmediate = profile?.urssaf_status === "active";

  const pending = validations.filter((v) => v.statut === "en_attente_parent");

  function moisLabel(v: ValidationWithRecap) {
    return `${MOIS[v.recap_mensuel.mois - 1]} ${v.recap_mensuel.annee}`;
  }

  function coursDuRecap(v: ValidationWithRecap) {
    const prefix = `${v.recap_mensuel.annee}-${String(v.recap_mensuel.mois).padStart(2, "0")}`;
    return cours.filter((c) => c.eleve_id === v.eleve_id && c.date.startsWith(prefix));
  }

  const isCurrentMonth = selectedYear === today.getFullYear() && selectedMonth === today.getMonth();

  function prevMonth() {
    if (selectedMonth === 0) { setSelectedYear((y) => y - 1); setSelectedMonth(11); }
    else setSelectedMonth((m) => m - 1);
  }
  function nextMonth() {
    if (isCurrentMonth) return;
    if (selectedMonth === 11) { setSelectedYear((y) => y + 1); setSelectedMonth(0); }
    else setSelectedMonth((m) => m + 1);
  }

  const coursOfMonth: CoursRow[] = cours.filter((c) => {
    const d = new Date(c.date);
    return d.getFullYear() === selectedYear && d.getMonth() === selectedMonth;
  });

  const totalHeures = coursOfMonth.reduce((s, c) => s + c.duree_heures, 0);
  const totalMontant = coursOfMonth.reduce((s, c) => s + c.montant, 0);
  const activeDays = new Set(coursOfMonth.map((c) => new Date(c.date).getDate()));
  const sorted = [...coursOfMonth].sort((a, b) => b.date.localeCompare(a.date));

  async function handleValider() {
    if (!recapModal || !confirmed) return;
    setValidating(true);
    setValidError(null);
    try {
      await validerRecap(recapModal.id, recapModal.recap_id);
      setValidated(true);
    } catch (err) {
      setValidError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setValidating(false);
    }
  }

  function openModal(r: ValidationWithRecap) {
    setRecapModal(r);
    setConfirmed(false);
    setValidated(false);
    setValidError(null);
  }

  function closeModal() {
    setRecapModal(null);
    setValidated(false);
    setValidError(null);
    setConfirmed(false);
  }

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 240, color: "#94A3B8" }}>
        <Loader2 style={{ width: 20, height: 20, marginRight: 8 }} className="animate-spin" /> Chargement...
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Header */}
      <div>
        <p style={S.eyebrow}>Suivi des séances</p>
        <h1 style={{ ...S.serif, fontWeight: 400, fontSize: 40, letterSpacing: "-.02em", color: "#0F172A", margin: "6px 0 0", lineHeight: 1.05 }}>
          Cours
        </h1>
      </div>

      {/* Pending validation banner */}
      {pending.length > 0 && (
        <div style={{ background: "#FFFBEB", border: "1px solid #FCD34D", borderRadius: 16, padding: "16px 20px" }}>
          <p style={{ fontWeight: 600, fontSize: 13, color: "#92400E", margin: "0 0 10px" }}>
            {pending.length === 1 ? "1 mois en attente de votre validation" : `${pending.length} mois en attente de validation`}
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {pending.map((r) => {
              const items = coursDuRecap(r);
              const totalH = items.reduce((s, c) => s + c.duree_heures, 0);
              const totalM = items.reduce((s, c) => s + c.montant, 0);
              return (
                <div key={r.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#fff", borderRadius: 12, padding: "10px 16px", border: "1px solid #FDE68A" }}>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "#0F172A", margin: 0 }}>{moisLabel(r)}</p>
                    <p style={{ fontSize: 11, color: "#64748B", marginTop: 2, marginBottom: 0 }}>
                      {items.length} cours · {totalH}h · {totalM.toLocaleString("fr-FR")} €
                    </p>
                  </div>
                  <button
                    onClick={() => openModal(r)}
                    style={{ fontSize: 12, background: "#2E6BEA", color: "#fff", padding: "6px 14px", borderRadius: 10, border: "none", cursor: "pointer", fontWeight: 600, flexShrink: 0 }}
                  >
                    Voir & Valider
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Month navigation */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button
          onClick={prevMonth}
          style={{ width: 36, height: 36, borderRadius: 10, border: "1px solid #E2E8F0", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
        >
          <ChevronLeft style={{ width: 16, height: 16, color: "#64748B" }} />
        </button>
        <h2 style={{ ...S.serif, fontSize: 22, fontWeight: 400, color: "#0F172A", margin: 0, minWidth: 190, textAlign: "center" }}>
          {MOIS[selectedMonth]} {selectedYear}
        </h2>
        <button
          onClick={nextMonth}
          disabled={isCurrentMonth}
          style={{ width: 36, height: 36, borderRadius: 10, border: "1px solid #E2E8F0", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: isCurrentMonth ? "not-allowed" : "pointer", opacity: isCurrentMonth ? 0.35 : 1 }}
        >
          <ChevronRight style={{ width: 16, height: 16, color: "#64748B" }} />
        </button>
      </div>

      {/* Calendar + course list */}
      <div className="grid md:grid-cols-[280px_1fr] grid-cols-1" style={{ gap: 20, alignItems: "start" }}>

        {/* Calendar card */}
        <div style={{ ...S.card, padding: "20px 18px" }}>
          <p style={{ ...S.eyebrow, marginBottom: 16 }}>{MOIS[selectedMonth]} {selectedYear}</p>
          <MiniCalendar year={selectedYear} month={selectedMonth} activeDays={activeDays} />
          {/* Legend */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 12, paddingTop: 12, borderTop: "1px solid #F1F5F9" }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#2563EB" }} />
            <span style={{ fontSize: 11, color: "#64748B" }}>Jour avec cours</span>
          </div>
          {/* Stats */}
          <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 12, color: "#64748B" }}>Séances</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#0F172A" }}>{coursOfMonth.length}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 12, color: "#64748B" }}>Durée totale</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#0F172A" }}>{totalHeures.toFixed(1)} h</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 12, color: "#64748B" }}>Montant brut</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#0F172A" }}>{totalMontant} €</span>
            </div>
            {hasAvanceImmediate && totalMontant > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 10px", background: "#ECFDF5", borderRadius: 8, marginTop: 2 }}>
                <span style={{ fontSize: 12, color: "#065F46", fontWeight: 600 }}>Votre part (50%)</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#065F46" }}>{Math.round(totalMontant * 0.5)} €</span>
              </div>
            )}
          </div>
        </div>

        {/* Course list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {sorted.length === 0 ? (
            <div style={{ ...S.card, padding: 48, textAlign: "center" }}>
              <AlertCircle style={{ width: 24, height: 24, color: "#CBD5E1", margin: "0 auto 12px" }} />
              <p style={{ fontSize: 13, color: "#94A3B8", margin: 0 }}>Aucun cours ce mois-ci</p>
            </div>
          ) : (
            sorted.map((c) => {
              const colors = MATIERE_COLORS[c.matiere] ?? { bg: "#F8FAFC", dot: "#475569" };
              const profNom = profByEleve[c.eleve_id ?? ""] ?? "Professeur";
              return (
                <div key={c.id} style={{ ...S.card, display: "flex", alignItems: "center", gap: 16, padding: "14px 20px" }}>
                  <div style={{ width: 3, height: 48, borderRadius: 3, background: colors.dot, flexShrink: 0 }} />
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: colors.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <BookOpen style={{ width: 15, height: 15, color: colors.dot }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#0F172A" }}>{c.matiere}</span>
                      <span style={{ fontSize: 11, background: colors.bg, color: colors.dot, padding: "1px 8px", borderRadius: 6, fontWeight: 600 }}>{c.duree}</span>
                    </div>
                    <p style={{ fontSize: 11, color: "#64748B", margin: 0 }}>{formatDateFull(c.date)}</p>
                    <p style={{ fontSize: 11, color: "#94A3B8", margin: "2px 0 0" }}>
                      Prof : {profNom}{c.eleve_nom ? ` · Élève : ${c.eleve_nom}` : ""}
                    </p>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <p style={{ fontSize: 14, fontWeight: 600, color: "#0F172A", margin: 0 }}>{c.montant} €</p>
                    <p style={{ fontSize: 10, color: "#94A3B8", marginTop: 2, marginBottom: 0 }}>brut</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Recap validation modal */}
      {recapModal && (() => {
        const items = coursDuRecap(recapModal);
        const totalH = items.reduce((s, c) => s + c.duree_heures, 0);
        const totalM = items.reduce((s, c) => s + c.montant, 0);
        const partParent = Math.round(totalM * 0.5);
        return (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: "0 16px" }}>
            <div style={{ background: "#fff", borderRadius: 22, boxShadow: "0 8px 48px rgba(15,23,42,.22)", width: "100%", maxWidth: 520, maxHeight: "92vh", display: "flex", flexDirection: "column" }}>

              {validated ? (
                /* ── Succès ── */
                <div style={{ padding: 32, textAlign: "center" }}>
                  <div style={{ width: 72, height: 72, background: "#ECFDF5", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                    <CheckCircle style={{ width: 36, height: 36, color: "#22C55E" }} />
                  </div>
                  <h3 style={{ fontWeight: 700, color: "#0F172A", fontSize: 20, margin: "0 0 8px" }}>Mois validé !</h3>
                  <p style={{ fontSize: 14, color: "#64748B", margin: "0 0 28px", lineHeight: 1.6 }}>
                    {moisLabel(recapModal)} a été validé avec succès. Une facture va être générée et votre professeur sera notifié.
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <Link
                      to="/parent/factures"
                      style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "#2E6BEA", color: "#fff", padding: "12px 20px", borderRadius: 14, fontWeight: 600, fontSize: 14, textDecoration: "none" }}
                    >
                      <FileText style={{ width: 16, height: 16 }} /> Voir mes factures
                    </Link>
                    <button onClick={closeModal} style={{ padding: "12px 20px", borderRadius: 14, border: "1px solid #E2E8F0", background: "#fff", cursor: "pointer", fontSize: 14, color: "#64748B" }}>
                      Fermer
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* ── Header ── */}
                  <div style={{ padding: "24px 28px 0", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                    <div>
                      <h3 style={{ fontWeight: 700, color: "#0F172A", fontSize: 17, margin: "0 0 4px" }}>
                        Valider {moisLabel(recapModal)}
                      </h3>
                      <p style={{ fontSize: 12, color: "#64748B", margin: 0 }}>
                        {items.length} séance{items.length > 1 ? "s" : ""} · {totalH.toFixed(1)} h · {totalM.toLocaleString("fr-FR")} €
                      </p>
                    </div>
                    <button
                      onClick={closeModal}
                      style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid #E2E8F0", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}
                    >
                      <X style={{ width: 14, height: 14, color: "#64748B" }} />
                    </button>
                  </div>

                  {/* ── Warning irreversible ── */}
                  <div style={{ margin: "16px 28px 0", background: "#FFFBEB", border: "1px solid #FCD34D", borderRadius: 12, padding: "12px 16px", display: "flex", gap: 10 }}>
                    <AlertTriangle style={{ width: 16, height: 16, color: "#B45309", flexShrink: 0, marginTop: 1 }} />
                    <p style={{ fontSize: 12, color: "#92400E", margin: 0, lineHeight: 1.6 }}>
                      <strong>Action irréversible.</strong> Une fois validé, le récapitulatif est clôturé et la facture est générée. Vous ne pourrez plus apporter de modifications.
                    </p>
                  </div>

                  {/* ── Course list ── */}
                  <div style={{ overflowY: "auto", flex: 1, margin: "16px 28px 0", display: "flex", flexDirection: "column", gap: 6 }}>
                    {items.map((c) => {
                      const colors = MATIERE_COLORS[c.matiere] ?? { bg: "#F8FAFC", dot: "#475569" };
                      const profNom = profByEleve[c.eleve_id ?? ""] ?? "Professeur";
                      return (
                        <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: "#F8FAFC", borderRadius: 12 }}>
                          <div style={{ width: 3, height: 40, borderRadius: 3, background: colors.dot, flexShrink: 0 }} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              <p style={{ fontSize: 13, fontWeight: 600, color: "#0F172A", margin: 0 }}>{c.matiere}</p>
                              <span style={{ fontSize: 10, background: colors.bg, color: colors.dot, padding: "1px 6px", borderRadius: 5, fontWeight: 600 }}>{c.duree}</span>
                            </div>
                            <p style={{ fontSize: 11, color: "#64748B", marginTop: 2, marginBottom: 0 }}>
                              {formatDateFull(c.date)} · {profNom}
                            </p>
                          </div>
                          <span style={{ fontSize: 13, fontWeight: 600, color: "#0F172A", flexShrink: 0 }}>{c.montant} €</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* ── Totals ── */}
                  <div style={{ margin: "14px 28px 0", background: "#F8FAFC", borderRadius: 12, padding: "14px 16px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ fontSize: 13, color: "#64748B" }}>Total brut</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#0F172A" }}>{totalM.toLocaleString("fr-FR")} €</span>
                    </div>
                    {hasAvanceImmediate && (
                      <>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                          <span style={{ fontSize: 13, color: "#64748B" }}>Prise en charge Urssaf (50%)</span>
                          <span style={{ fontSize: 13, fontWeight: 600, color: "#16A34A" }}>−{Math.round(totalM * 0.5)} €</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 8, borderTop: "1px solid #E2E8F0" }}>
                          <span style={{ fontSize: 14, fontWeight: 700, color: "#0F172A" }}>Votre part</span>
                          <span style={{ fontSize: 14, fontWeight: 700, color: "#0F172A" }}>{partParent} €</span>
                        </div>
                      </>
                    )}
                    {!hasAvanceImmediate && (
                      <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 8, borderTop: "1px solid #E2E8F0" }}>
                        <span style={{ fontSize: 14, fontWeight: 700, color: "#0F172A" }}>Total à payer</span>
                        <span style={{ fontSize: 14, fontWeight: 700, color: "#0F172A" }}>{totalM.toLocaleString("fr-FR")} €</span>
                      </div>
                    )}
                  </div>

                  {/* ── Confirmation checkbox ── */}
                  <div style={{ margin: "14px 28px 0" }}>
                    <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={confirmed}
                        onChange={(e) => setConfirmed(e.target.checked)}
                        style={{ width: 16, height: 16, marginTop: 2, accentColor: "#2E6BEA", flexShrink: 0, cursor: "pointer" }}
                      />
                      <span style={{ fontSize: 13, color: "#374151", lineHeight: 1.55 }}>
                        J'ai vérifié le détail des séances et je confirme l'exactitude de ce récapitulatif.
                      </span>
                    </label>
                  </div>

                  {/* ── Error ── */}
                  {validError && (
                    <p style={{ fontSize: 12, color: "#DC2626", background: "#FEF2F2", borderRadius: 8, padding: "8px 12px", margin: "10px 28px 0" }}>{validError}</p>
                  )}

                  {/* ── Actions ── */}
                  <div style={{ padding: "16px 28px 28px", display: "flex", gap: 10 }}>
                    <button
                      onClick={closeModal}
                      style={{ flex: 1, padding: "12px", borderRadius: 14, border: "1px solid #E2E8F0", background: "#fff", cursor: "pointer", fontSize: 14, color: "#64748B", fontWeight: 500 }}
                    >
                      Annuler
                    </button>
                    <button
                      onClick={handleValider}
                      disabled={validating || !confirmed}
                      style={{
                        flex: 2, background: confirmed ? "#2E6BEA" : "#94A3B8", color: "#fff",
                        padding: "12px", borderRadius: 14, border: "none",
                        cursor: confirmed && !validating ? "pointer" : "not-allowed",
                        fontSize: 14, fontWeight: 600,
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                        transition: "background .15s",
                      }}
                    >
                      {validating && <Loader2 style={{ width: 14, height: 14 }} className="animate-spin" />}
                      Valider le mois
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
