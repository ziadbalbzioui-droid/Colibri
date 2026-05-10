import { useState } from "react";
import { ChevronLeft, ChevronRight, BookOpen, Loader2, AlertCircle, Info } from "lucide-react";
import { useParentData } from "../../../lib/hooks/useParentData";
import type { CoursRow } from "../../../lib/hooks/useCours";

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
  const { cours, children, loading } = useParentData();

  const today = new Date();
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth());

  const profByEleve = Object.fromEntries(children.map((ch) => [ch.id, ch.prof_nom]));

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

      {/* Encart info prix */}
      <div style={{ background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: 14, padding: "12px 16px", display: "flex", gap: 10, alignItems: "flex-start" }}>
        <Info style={{ width: 15, height: 15, color: "#2563EB", flexShrink: 0, marginTop: 2 }} />
        <p style={{ fontSize: 12, color: "#1E40AF", lineHeight: 1.65, margin: 0 }}>
          Les <span style={{ textDecoration: "line-through" }}>prix barrés</span> correspondent au tarif plein horaire. Le montant <strong style={{ color: "#16A34A" }}>en vert</strong> est votre part réelle après crédit d'impôt de 50% — pris en charge directement par l'Urssaf via l'avance immédiate.
          Pour valider ou contester un mois, rendez-vous dans <strong>Validations</strong>.
        </p>
      </div>

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
              <span style={{ fontSize: 12, color: "#64748B" }}>Prix facturé</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#94A3B8", textDecoration: "line-through" }}>{(totalMontant * 2).toLocaleString("fr-FR", { maximumFractionDigits: 2 })} €</span>
            </div>
            {totalMontant > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 10px", background: "#ECFDF5", borderRadius: 8, marginTop: 2 }}>
                <span style={{ fontSize: 12, color: "#065F46", fontWeight: 600 }}>Votre part (après crédit d'impôt)</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#065F46" }}>{totalMontant.toLocaleString("fr-FR", { maximumFractionDigits: 2 })} €</span>
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
                    <p style={{ fontSize: 11, color: "#94A3B8", textDecoration: "line-through", margin: 0 }}>{(c.montant * 2).toLocaleString("fr-FR", { maximumFractionDigits: 2 })} €</p>
                    <p style={{ fontSize: 14, fontWeight: 700, color: "#16A34A", marginTop: 2, marginBottom: 0 }}>{c.montant.toLocaleString("fr-FR", { maximumFractionDigits: 2 })} €</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

    </div>
  );
}
