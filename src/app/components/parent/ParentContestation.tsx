import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { ChevronLeft, BookOpen, CheckCircle, Flag, Loader2, AlertTriangle, Send } from "lucide-react";
import { useParentData } from "../../../lib/hooks/useParentData";
import type { CoursRow } from "../../../lib/hooks/useCours";

const MOIS = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];

const MATIERE_COLORS: Record<string, { bg: string; dot: string }> = {
  "Mathématiques":   { bg: "#EFF6FF", dot: "#1D4ED8" },
  "Physique-Chimie": { bg: "#F5F3FF", dot: "#7C3AED" },
  "Français":        { bg: "#FFF7ED", dot: "#C2410C" },
  "Histoire-Géo":    { bg: "#ECFDF5", dot: "#065F46" },
  "Anglais":         { bg: "#F0FDF4", dot: "#15803D" },
  "SVT":             { bg: "#FDF4FF", dot: "#A21CAF" },
  "Philosophie":     { bg: "#FFF1F2", dot: "#BE123C" },
};

const JOURS = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];

function formatDate(d: string) {
  const dt = new Date(d);
  return `${JOURS[dt.getDay()]} ${dt.getDate()} ${MOIS[dt.getMonth()]}`;
}

interface CourseState {
  etat: "valide" | "conteste";
  raison: string;
}

export function ParentContestation() {
  const { validationId } = useParams<{ validationId: string }>();
  const navigate = useNavigate();
  const { validations, cours, children, loading, contesterRecap } = useParentData();

  const [states, setStates] = useState<Record<string, CourseState>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const validation = validations.find((v) => v.id === validationId);

  const coursOfValidation: CoursRow[] = (() => {
    if (!validation) return [];
    const { mois, annee } = validation.recap_mensuel;
    const prefix = `${annee}-${String(mois).padStart(2, "0")}`;
    return cours
      .filter((c) => c.eleve_id === validation.eleve_id && c.date.startsWith(prefix))
      .sort((a, b) => a.date.localeCompare(b.date));
  })();

  const profByEleve = Object.fromEntries(children.map((ch) => [ch.id, ch.prof_nom]));

  // Initialize state when courses load
  useEffect(() => {
    if (coursOfValidation.length > 0 && Object.keys(states).length === 0) {
      const initial: Record<string, CourseState> = {};
      coursOfValidation.forEach((c) => { initial[c.id] = { etat: "valide", raison: "" }; });
      setStates(initial);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coursOfValidation.length]);

  const contestedCount = Object.values(states).filter((s) => s.etat === "conteste").length;
  const validCount = Object.values(states).filter((s) => s.etat === "valide").length;

  const canSubmit =
    contestedCount > 0 &&
    Object.entries(states).every(([, s]) => s.etat === "valide" || s.raison.trim().length > 0);

  async function handleSubmit() {
    if (!validationId || !canSubmit) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const contestations = Object.entries(states)
        .filter(([, s]) => s.etat === "conteste")
        .map(([cours_id, s]) => ({ cours_id, raison: s.raison.trim() }));
      await contesterRecap(validationId, contestations);
      setSubmitted(true);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#FAFAFA", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Loader2 style={{ width: 20, height: 20, color: "#94A3B8" }} className="animate-spin" />
      </div>
    );
  }

  if (!validation || coursOfValidation.length === 0) {
    return (
      <div style={{ minHeight: "100vh", background: "#FAFAFA", display: "flex", flexDirection: "column", alignItems: "center", padding: "40px 20px" }}>
        <div style={{ width: "100%", maxWidth: 520, marginBottom: 48 }}>
          <button onClick={() => navigate("/parent/cours")} style={backBtnStyle}>
            <ChevronLeft style={{ width: 15, height: 15 }} /> Retour aux cours
          </button>
        </div>
        <p style={{ fontSize: 14, color: "#94A3B8" }}>Récapitulatif introuvable.</p>
      </div>
    );
  }

  const { mois, annee } = validation.recap_mensuel;
  const monthLabel = `${MOIS[mois - 1]} ${annee}`;
  const totalBrut = coursOfValidation.reduce((s, c) => s + c.montant, 0);
  const profNom = profByEleve[validation.eleve_id] ?? "Professeur";

  return (
    <div style={{ minHeight: "100vh", background: "#FAFAFA", padding: "32px 20px 60px" }}>
      <div style={{ maxWidth: 620, margin: "0 auto" }}>

        {/* Back button */}
        <button onClick={() => navigate("/parent/cours")} style={backBtnStyle}>
          <ChevronLeft style={{ width: 15, height: 15 }} /> Retour aux cours
        </button>

        {/* ── Success state ── */}
        {submitted ? (
          <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 24, padding: "48px 40px", textAlign: "center", boxShadow: "0 2px 12px rgba(15,23,42,.06)", marginTop: 16 }}>
            <div style={{ width: 64, height: 64, background: "#FFF1F2", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <Flag style={{ width: 28, height: 28, color: "#E11D48" }} />
            </div>
            <h2 style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 400, fontSize: 24, color: "#0F172A", margin: "0 0 10px" }}>
              Contestation envoyée
            </h2>
            <p style={{ fontSize: 14, color: "#64748B", lineHeight: 1.65, margin: "0 0 32px", maxWidth: 380, marginLeft: "auto", marginRight: "auto" }}>
              Votre contestation pour <strong>{monthLabel}</strong> a été transmise à l'équipe Colibri.
              Nous reviendrons vers vous sous 48h ouvrées.
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <button
                onClick={() => navigate("/parent/cours")}
                style={{ background: "#0F172A", color: "#fff", border: "none", borderRadius: 12, padding: "11px 24px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
              >
                Retour aux cours
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* ── Header ── */}
            <div style={{ marginTop: 16, marginBottom: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                <div style={{ width: 32, height: 32, background: "#FFF1F2", borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Flag style={{ width: 14, height: 14, color: "#E11D48" }} />
                </div>
                <h1 style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 400, fontSize: 26, color: "#0F172A", margin: 0, letterSpacing: "-.01em" }}>
                  Contester le récapitulatif
                </h1>
              </div>
              <p style={{ fontSize: 13, color: "#64748B", margin: 0, paddingLeft: 42 }}>
                {monthLabel} · {coursOfValidation.length} séance{coursOfValidation.length > 1 ? "s" : ""} · Prof : {profNom}
              </p>
            </div>

            {/* ── Info box ── */}
            <div style={{ background: "#FFFBEB", border: "1px solid #FCD34D", borderRadius: 14, padding: "14px 18px", display: "flex", gap: 12, marginBottom: 24 }}>
              <AlertTriangle style={{ width: 16, height: 16, color: "#B45309", flexShrink: 0, marginTop: 2 }} />
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: "#92400E", margin: "0 0 3px" }}>Comment contester ?</p>
                <p style={{ fontSize: 12, color: "#B45309", margin: 0, lineHeight: 1.6 }}>
                  Sélectionnez les cours que vous ne reconnaissez pas ou qui comportent une erreur, et indiquez la raison pour chacun. Les cours que vous validez seront comptabilisés normalement.
                </p>
              </div>
            </div>

            {/* ── Course list ── */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
              {coursOfValidation.map((c) => {
                const colors = MATIERE_COLORS[c.matiere] ?? { bg: "#F8FAFC", dot: "#475569" };
                const state = states[c.id] ?? { etat: "valide", raison: "" };
                const isContested = state.etat === "conteste";
                return (
                  <div
                    key={c.id}
                    style={{
                      background: "#fff",
                      border: `1.5px solid ${isContested ? "#FECDD3" : "#E2E8F0"}`,
                      borderRadius: 16,
                      overflow: "hidden",
                      transition: "border-color .15s",
                    }}
                  >
                    {/* Course info row */}
                    <div style={{ padding: "14px 18px", display: "flex", alignItems: "center", gap: 14 }}>
                      <div style={{ width: 3, height: 44, borderRadius: 3, background: isContested ? "#FB7185" : colors.dot, flexShrink: 0, transition: "background .15s" }} />
                      <div style={{ width: 38, height: 38, background: isContested ? "#FFF1F2" : colors.bg, borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "background .15s" }}>
                        <BookOpen style={{ width: 15, height: 15, color: isContested ? "#FB7185" : colors.dot }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 3 }}>
                          <span style={{ fontSize: 13, fontWeight: 600, color: "#0F172A" }}>{c.matiere}</span>
                          <span style={{ fontSize: 10, background: colors.bg, color: colors.dot, padding: "1px 7px", borderRadius: 5, fontWeight: 600 }}>{c.duree}</span>
                        </div>
                        <p style={{ fontSize: 11, color: "#64748B", margin: 0 }}>{formatDate(c.date)}</p>
                      </div>
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <p style={{ fontSize: 11, color: "#94A3B8", textDecoration: "line-through", margin: 0 }}>{c.montant} €</p>
                        <p style={{ fontSize: 13, fontWeight: 700, color: "#16A34A", margin: 0 }}>{Math.round(c.montant * 0.5)} €</p>
                      </div>
                    </div>

                    {/* Toggle */}
                    <div style={{ borderTop: "1px solid #F1F5F9", padding: "12px 18px", display: "flex", gap: 8 }}>
                      <button
                        onClick={() => setStates((prev) => ({ ...prev, [c.id]: { ...prev[c.id], etat: "valide" } }))}
                        style={{
                          flex: 1, padding: "9px", borderRadius: 10, fontSize: 12, fontWeight: 600,
                          border: state.etat === "valide" ? "none" : "1px solid #E2E8F0",
                          background: state.etat === "valide" ? "#ECFDF5" : "#fff",
                          color: state.etat === "valide" ? "#16A34A" : "#94A3B8",
                          cursor: "pointer",
                          display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                          transition: "all .15s",
                        }}
                      >
                        <CheckCircle style={{ width: 13, height: 13 }} /> Valider ce cours
                      </button>
                      <button
                        onClick={() => setStates((prev) => ({ ...prev, [c.id]: { ...prev[c.id], etat: "conteste" } }))}
                        style={{
                          flex: 1, padding: "9px", borderRadius: 10, fontSize: 12, fontWeight: 600,
                          border: state.etat === "conteste" ? "none" : "1px solid #E2E8F0",
                          background: state.etat === "conteste" ? "#FFF1F2" : "#fff",
                          color: state.etat === "conteste" ? "#E11D48" : "#94A3B8",
                          cursor: "pointer",
                          display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                          transition: "all .15s",
                        }}
                      >
                        <Flag style={{ width: 13, height: 13 }} /> Contester
                      </button>
                    </div>

                    {/* Reason input (expanded when contested) */}
                    {isContested && (
                      <div style={{ borderTop: "1px solid #FECDD3", padding: "12px 18px", background: "#FFF8F8" }}>
                        <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#9F1239", marginBottom: 6, textTransform: "uppercase", letterSpacing: ".06em" }}>
                          Raison de la contestation
                        </label>
                        <textarea
                          value={state.raison}
                          onChange={(e) => setStates((prev) => ({ ...prev, [c.id]: { ...prev[c.id], raison: e.target.value } }))}
                          placeholder="Ex : Cette séance n'a pas eu lieu, durée incorrecte, cours non reconnu..."
                          rows={2}
                          style={{
                            width: "100%", resize: "vertical",
                            background: "#fff", border: `1.5px solid ${state.raison.trim() ? "#FECDD3" : "#FCA5A5"}`,
                            borderRadius: 10, padding: "10px 12px",
                            fontSize: 12, color: "#0F172A",
                            outline: "none", fontFamily: "inherit", lineHeight: 1.55,
                            boxSizing: "border-box",
                          }}
                        />
                        {state.raison.trim().length === 0 && (
                          <p style={{ fontSize: 11, color: "#FB7185", marginTop: 4, marginBottom: 0 }}>
                            Une raison est requise pour contester ce cours.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* ── Summary ── */}
            <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 16, padding: "16px 20px", marginBottom: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 13, color: "#64748B" }}>Cours validés</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#16A34A" }}>{validCount}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 13, color: "#64748B" }}>Cours contestés</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#E11D48" }}>{contestedCount}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 10, borderTop: "1px solid #F1F5F9" }}>
                <span style={{ fontSize: 13, color: "#64748B" }}>Total brut du mois</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#94A3B8", textDecoration: "line-through" }}>{totalBrut} €</span>
              </div>
            </div>

            {/* ── Error ── */}
            {submitError && (
              <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 12, padding: "12px 16px", marginBottom: 16, fontSize: 13, color: "#DC2626" }}>
                {submitError}
              </div>
            )}

            {/* ── Submit ── */}
            <button
              onClick={handleSubmit}
              disabled={!canSubmit || submitting}
              style={{
                width: "100%", padding: "15px",
                background: canSubmit ? "#E11D48" : "#E2E8F0",
                color: canSubmit ? "#fff" : "#94A3B8",
                border: "none", borderRadius: 14,
                fontSize: 14, fontWeight: 700,
                cursor: canSubmit && !submitting ? "pointer" : "not-allowed",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                transition: "background .15s",
              }}
            >
              {submitting
                ? <Loader2 style={{ width: 16, height: 16 }} className="animate-spin" />
                : <Send style={{ width: 16, height: 16 }} />
              }
              {contestedCount > 0
                ? `Envoyer la contestation (${contestedCount} cours)`
                : "Sélectionnez au moins un cours à contester"
              }
            </button>
            <p style={{ fontSize: 11, color: "#94A3B8", textAlign: "center", marginTop: 10 }}>
              L'équipe Colibri vous contactera sous 48h ouvrées pour traiter votre demande.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

const backBtnStyle: React.CSSProperties = {
  display: "inline-flex", alignItems: "center", gap: 6,
  fontSize: 13, color: "#94A3B8", background: "none",
  border: "none", cursor: "pointer", padding: 0, fontWeight: 500, marginBottom: 0,
};
