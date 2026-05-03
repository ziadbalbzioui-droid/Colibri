import { useState } from "react";
import { ChevronLeft, ChevronRight, BookOpen, CheckCircle, Loader2, AlertCircle, X, FileText } from "lucide-react";
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

function MiniCalendar({ year, month, activeDays }: { year: number; month: number; activeDays: Set<number> }) {
  const firstDow = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const offset = (firstDow + 6) % 7; // Mon=0
  const today = new Date();
  const isCurrentMonth = year === today.getFullYear() && month === today.getMonth();
  const todayDate = today.getDate();

  const cells: (number | null)[] = [];
  for (let i = 0; i < offset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7) cells.push(null);

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2, marginBottom: 6 }}>
        {JOURS_COURTS.map((j, i) => (
          <div key={i} style={{ textAlign: "center", fontSize: 9, fontWeight: 700, color: "#94A3B8", padding: "2px 0" }}>{j}</div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2 }}>
        {cells.map((d, i) => {
          const isActive = d !== null && activeDays.has(d);
          const isToday = isCurrentMonth && d === todayDate;
          return (
            <div
              key={i}
              style={{
                width: 24, height: 24, borderRadius: 6, margin: "0 auto",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 10,
                fontWeight: isActive ? 700 : 400,
                background: isActive ? "#2E6BEA" : "transparent",
                color: isActive ? "#fff" : isToday ? "#2E6BEA" : d ? "#374151" : "transparent",
                outline: isToday && !isActive ? "1.5px solid #2E6BEA" : "none",
              }}
            >
              {d ?? ""}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ParentCours() {
  const { cours, children, validations, validerRecap, loading } = useParentData();
  const [recapModal, setRecapModal] = useState<ValidationWithRecap | null>(null);
  const [validating, setValidating] = useState(false);
  const [validError, setValidError] = useState<string | null>(null);
  const [validated, setValidated] = useState(false);

  const today = new Date();
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth());

  const profByEleve = Object.fromEntries(children.map((ch) => [ch.id, ch.prof_nom]));

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
    if (!recapModal) return;
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

  function closeModal() {
    setRecapModal(null);
    setValidated(false);
    setValidError(null);
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
                    onClick={() => setRecapModal(r)}
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
        <h2 style={{ ...S.serif, fontSize: 22, fontWeight: 400, color: "#0F172A", margin: 0, minWidth: 180, textAlign: "center" }}>
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
      <div className="grid md:grid-cols-[200px_1fr] grid-cols-1" style={{ gap: 20, alignItems: "start" }}>

        {/* Mini calendar card */}
        <div style={{ ...S.card, padding: 18 }}>
          <p style={{ ...S.eyebrow, marginBottom: 14 }}>{MOIS[selectedMonth].slice(0, 3)} {selectedYear}</p>
          <MiniCalendar year={selectedYear} month={selectedMonth} activeDays={activeDays} />
          <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid #F1F5F9" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 11, color: "#64748B" }}>Séances</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#0F172A" }}>{coursOfMonth.length}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 11, color: "#64748B" }}>Durée totale</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#0F172A" }}>{totalHeures.toFixed(1)}h</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 11, color: "#64748B" }}>Montant</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#0F172A" }}>{totalMontant} €</span>
            </div>
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
                  {/* Color strip */}
                  <div style={{ width: 3, height: 48, borderRadius: 3, background: colors.dot, flexShrink: 0 }} />
                  {/* Icon */}
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: colors.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <BookOpen style={{ width: 15, height: 15, color: colors.dot }} />
                  </div>
                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#0F172A" }}>{c.matiere}</span>
                      <span style={{ fontSize: 11, background: colors.bg, color: colors.dot, padding: "1px 8px", borderRadius: 6, fontWeight: 600 }}>{c.duree}</span>
                    </div>
                    <p style={{ fontSize: 11, color: "#64748B", margin: 0 }}>
                      {formatDateFull(c.date)}
                    </p>
                    <p style={{ fontSize: 11, color: "#94A3B8", margin: "2px 0 0" }}>
                      Prof : {profNom}{c.eleve_nom ? ` · Élève : ${c.eleve_nom}` : ""}
                    </p>
                  </div>
                  {/* Amount */}
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
        return (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: "0 16px" }}>
            <div style={{ background: "#fff", borderRadius: 22, boxShadow: "0 4px 32px rgba(15,23,42,.18)", width: "100%", maxWidth: 440, padding: 28, maxHeight: "90vh", display: "flex", flexDirection: "column" }}>
              {validated ? (
                <div style={{ textAlign: "center", padding: "8px 0" }}>
                  <div style={{ width: 64, height: 64, background: "#ECFDF5", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                    <CheckCircle style={{ width: 32, height: 32, color: "#22C55E" }} />
                  </div>
                  <h3 style={{ fontWeight: 600, color: "#0F172A", fontSize: 18, margin: "0 0 8px" }}>Mois validé !</h3>
                  <p style={{ fontSize: 13, color: "#64748B", margin: "0 0 24px" }}>
                    {moisLabel(recapModal)} a bien été validé. Le professeur en sera notifié.
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <Link
                      to="/parent/factures"
                      style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "#2E6BEA", color: "#fff", padding: "10px 20px", borderRadius: 12, fontWeight: 600, fontSize: 13, textDecoration: "none" }}
                    >
                      <FileText style={{ width: 14, height: 14 }} /> Voir mes factures
                    </Link>
                    <button onClick={closeModal} style={{ padding: "10px 20px", borderRadius: 12, border: "1px solid #E2E8F0", background: "#fff", cursor: "pointer", fontSize: 13 }}>
                      Fermer
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                    <div>
                      <h3 style={{ fontWeight: 600, color: "#0F172A", margin: 0 }}>Valider {moisLabel(recapModal)}</h3>
                      <p style={{ fontSize: 12, color: "#64748B", marginTop: 4, marginBottom: 0 }}>
                        {items.length} cours · {totalH}h · {totalM.toLocaleString("fr-FR")} €
                      </p>
                    </div>
                    <button
                      onClick={closeModal}
                      style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid #E2E8F0", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                    >
                      <X style={{ width: 14, height: 14, color: "#64748B" }} />
                    </button>
                  </div>

                  <div style={{ overflowY: "auto", flex: 1, display: "flex", flexDirection: "column", gap: 6, marginBottom: 16 }}>
                    {items.map((c) => (
                      <div key={c.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: "#F8FAFC", borderRadius: 10 }}>
                        <div>
                          <p style={{ fontSize: 13, fontWeight: 500, color: "#0F172A", margin: 0 }}>{c.matiere}</p>
                          <p style={{ fontSize: 11, color: "#64748B", marginTop: 2, marginBottom: 0 }}>{formatDateFull(c.date)} · {c.duree}</p>
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "#0F172A" }}>{c.montant} €</span>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 14, borderTop: "1px solid #E2E8F0", marginBottom: 16 }}>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>Total</span>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{totalM.toLocaleString("fr-FR")} €</span>
                  </div>

                  {validError && (
                    <p style={{ fontSize: 12, color: "#DC2626", background: "#FEF2F2", borderRadius: 8, padding: "8px 12px", margin: "0 0 12px" }}>{validError}</p>
                  )}

                  <div style={{ display: "flex", gap: 10 }}>
                    <button onClick={closeModal} style={{ flex: 1, padding: "10px", borderRadius: 12, border: "1px solid #E2E8F0", background: "#fff", cursor: "pointer", fontSize: 13 }}>
                      Annuler
                    </button>
                    <button
                      onClick={handleValider}
                      disabled={validating}
                      style={{ flex: 1, background: "#2E6BEA", color: "#fff", padding: "10px", borderRadius: 12, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, opacity: validating ? 0.5 : 1 }}
                    >
                      {validating && <Loader2 style={{ width: 14, height: 14 }} className="animate-spin" />}
                      Confirmer la validation
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
