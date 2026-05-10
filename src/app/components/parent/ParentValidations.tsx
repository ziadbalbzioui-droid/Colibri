import { useState } from "react";
import { CheckCircle, Loader2, X, FileText, AlertTriangle, Flag, Info } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { useParentData } from "../../../lib/hooks/useParentData";
import type { ValidationWithRecap } from "../../../lib/hooks/useParentData";

const MOIS = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];

const S = {
  card: { background: "#fff", border: "1px solid #E2E8F0", borderRadius: 16, boxShadow: "0 1px 3px rgba(15,23,42,.06)" } as React.CSSProperties,
  serif: { fontFamily: "'Fraunces', Georgia, serif" } as React.CSSProperties,
  eyebrow: { fontSize: 11, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase" as const, color: "#64748B" } as React.CSSProperties,
};

const MATIERE_COLORS: Record<string, { bg: string; dot: string }> = {
  "Mathématiques":   { bg: "#EFF6FF", dot: "#1D4ED8" },
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

export function ParentValidations() {
  const { cours, children, validations, validerRecap, loading } = useParentData();
  const navigate = useNavigate();
  const [recapModal, setRecapModal] = useState<ValidationWithRecap | null>(null);
  const [validating, setValidating] = useState(false);
  const [validError, setValidError] = useState<string | null>(null);
  const [validated, setValidated] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const profByEleve = Object.fromEntries(children.map((ch) => [ch.id, ch.prof_nom]));

  const pending   = validations.filter((v) => v.statut === "en_attente_parent");
  const contested = validations.filter((v) => v.statut === "conteste");
  const done      = validations.filter((v) => v.statut === "valide");

  function moisLabel(v: ValidationWithRecap) {
    return `${MOIS[v.recap_mensuel.mois - 1]} ${v.recap_mensuel.annee}`;
  }

  function coursDuRecap(v: ValidationWithRecap) {
    const prefix = `${v.recap_mensuel.annee}-${String(v.recap_mensuel.mois).padStart(2, "0")}`;
    return cours.filter((c) => c.eleve_id === v.eleve_id && c.date.startsWith(prefix));
  }

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
    <div style={{ maxWidth: 860, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Header */}
      <div>
        <p style={S.eyebrow}>Récapitulatifs mensuels</p>
        <h1 style={{ ...S.serif, fontWeight: 400, fontSize: 40, letterSpacing: "-.02em", color: "#0F172A", margin: "6px 0 0", lineHeight: 1.05 }}>
          Validations
        </h1>
      </div>

      {/* Info encart */}
      <div style={{ background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: 14, padding: "14px 18px", display: "flex", gap: 12, alignItems: "flex-start" }}>
        <Info style={{ width: 16, height: 16, color: "#2563EB", flexShrink: 0, marginTop: 2 }} />
        <p style={{ fontSize: 13, color: "#1E40AF", lineHeight: 1.65, margin: 0 }}>
          <strong>Comment ça fonctionne ?</strong> En fin de mois, votre professeur clôture son récapitulatif et vous envoie une demande de validation.
          Examinez chaque séance, vérifiez les montants — ils correspondent à <em>votre part après crédit d'impôt (50%)</em> — puis confirmez.
          La facture est générée automatiquement après votre validation.
        </p>
      </div>

      {/* En attente */}
      {pending.length > 0 && (
        <div>
          <h2 style={{ fontSize: 13, fontWeight: 700, color: "#92400E", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 10 }}>
            En attente de validation ({pending.length})
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {pending.map((r) => {
              const items = coursDuRecap(r);
              const totalH = items.reduce((s, c) => s + c.duree_heures, 0);
              const totalM = items.reduce((s, c) => s + c.montant, 0);
              return (
                <div key={r.id} style={{ ...S.card, padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, borderLeft: "4px solid #F59E0B" }}>
                  <div>
                    <p style={{ fontSize: 15, fontWeight: 700, color: "#0F172A", margin: "0 0 4px" }}>{moisLabel(r)}</p>
                    <p style={{ fontSize: 12, color: "#64748B", margin: 0 }}>
                      {items.length} cours · {totalH}h ·{" "}
                      <span style={{ textDecoration: "line-through", color: "#94A3B8" }}>{(totalM * 2).toLocaleString("fr-FR", { maximumFractionDigits: 2 })} € brut</span>
                      {" → "}
                      <span style={{ color: "#16A34A", fontWeight: 600 }}>{totalM.toLocaleString("fr-FR", { maximumFractionDigits: 2 })} € votre part</span>
                    </p>
                  </div>
                  <button
                    onClick={() => openModal(r)}
                    style={{ fontSize: 13, background: "#2E6BEA", color: "#fff", padding: "9px 20px", borderRadius: 12, border: "none", cursor: "pointer", fontWeight: 600, flexShrink: 0 }}
                  >
                    Voir & Valider
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Contestés */}
      {contested.length > 0 && (
        <div>
          <h2 style={{ fontSize: 13, fontWeight: 700, color: "#9F1239", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 10 }}>
            Contestés ({contested.length})
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {contested.map((r) => (
              <div key={r.id} style={{ ...S.card, padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", borderLeft: "4px solid #F87171" }}>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: "#0F172A", margin: "0 0 3px" }}>{moisLabel(r)}</p>
                  <p style={{ fontSize: 11, color: "#94A3B8", margin: 0, display: "flex", alignItems: "center", gap: 4 }}>
                    <Flag style={{ width: 11, height: 11 }} /> En cours de traitement par l'équipe Colibri
                  </p>
                </div>
                <span style={{ fontSize: 11, background: "#FFF1F2", color: "#9F1239", border: "1px solid #FECDD3", padding: "4px 12px", borderRadius: 8, fontWeight: 600 }}>
                  Contesté
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Historique validé */}
      {done.length > 0 && (
        <div>
          <h2 style={{ fontSize: 13, fontWeight: 700, color: "#065F46", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 10 }}>
            Historique ({done.length})
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {done.map((r) => {
              const items = coursDuRecap(r);
              const totalM = items.reduce((s, c) => s + c.montant, 0);
              return (
                <div key={r.id} style={{ ...S.card, padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", borderLeft: "4px solid #22C55E" }}>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 600, color: "#0F172A", margin: "0 0 3px" }}>{moisLabel(r)}</p>
                    <p style={{ fontSize: 11, color: "#64748B", margin: 0 }}>
                      {items.length} cours{totalM > 0 ? ` · ${totalM.toLocaleString("fr-FR", { maximumFractionDigits: 2 })} €` : ""}
                    </p>
                  </div>
                  <span style={{ fontSize: 11, background: "#ECFDF5", color: "#065F46", border: "1px solid #BBF7D0", padding: "4px 12px", borderRadius: 8, fontWeight: 600 }}>
                    Validé ✓
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty state */}
      {pending.length === 0 && contested.length === 0 && done.length === 0 && (
        <div style={{ ...S.card, padding: 52, textAlign: "center" }}>
          <CheckCircle style={{ width: 32, height: 32, color: "#22C55E", margin: "0 auto 14px" }} />
          <p style={{ fontWeight: 700, color: "#0F172A", fontSize: 15, marginBottom: 6 }}>Tout est à jour !</p>
          <p style={{ fontSize: 13, color: "#94A3B8", margin: 0 }}>Aucun récapitulatif en attente de validation.</p>
        </div>
      )}

      {/* Modal de validation */}
      {recapModal && (() => {
        const items = coursDuRecap(recapModal);
        const totalH = items.reduce((s, c) => s + c.duree_heures, 0);
        const totalM = items.reduce((s, c) => s + c.montant, 0);
        return (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: "0 16px" }}>
            <div style={{ background: "#fff", borderRadius: 22, boxShadow: "0 8px 48px rgba(15,23,42,.22)", width: "100%", maxWidth: 520, maxHeight: "92vh", display: "flex", flexDirection: "column" }}>

              {validated ? (
                <div style={{ padding: 32, textAlign: "center" }}>
                  <div style={{ width: 72, height: 72, background: "#ECFDF5", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                    <CheckCircle style={{ width: 36, height: 36, color: "#22C55E" }} />
                  </div>
                  <h3 style={{ fontWeight: 700, color: "#0F172A", fontSize: 20, margin: "0 0 8px" }}>Mois validé !</h3>
                  <p style={{ fontSize: 14, color: "#64748B", margin: "0 0 28px", lineHeight: 1.6 }}>
                    {moisLabel(recapModal)} a été validé. La facture va être générée et votre professeur sera notifié.
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
                  {/* Header modal */}
                  <div style={{ padding: "24px 28px 0", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                    <div>
                      <h3 style={{ fontWeight: 700, color: "#0F172A", fontSize: 17, margin: "0 0 4px" }}>
                        Valider {moisLabel(recapModal)}
                      </h3>
                      <p style={{ fontSize: 12, color: "#64748B", margin: 0 }}>
                        {items.length} séance{items.length > 1 ? "s" : ""} · {totalH.toFixed(1)} h
                      </p>
                    </div>
                    <button
                      onClick={closeModal}
                      style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid #E2E8F0", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}
                    >
                      <X style={{ width: 14, height: 14, color: "#64748B" }} />
                    </button>
                  </div>

                  {/* Avertissement */}
                  <div style={{ margin: "16px 28px 0", background: "#FFFBEB", border: "1px solid #FCD34D", borderRadius: 12, padding: "12px 16px", display: "flex", gap: 10 }}>
                    <AlertTriangle style={{ width: 16, height: 16, color: "#B45309", flexShrink: 0, marginTop: 1 }} />
                    <p style={{ fontSize: 12, color: "#92400E", margin: 0, lineHeight: 1.6 }}>
                      <strong>Action irréversible.</strong> Une fois validé, le récapitulatif est clôturé et la facture est générée.
                    </p>
                  </div>

                  {/* Liste des cours */}
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
                          <div style={{ textAlign: "right", flexShrink: 0 }}>
                            <p style={{ fontSize: 11, color: "#94A3B8", textDecoration: "line-through", margin: 0 }}>{(c.montant * 2).toLocaleString("fr-FR", { maximumFractionDigits: 2 })} €</p>
                            <p style={{ fontSize: 13, fontWeight: 700, color: "#16A34A", margin: 0 }}>{c.montant.toLocaleString("fr-FR", { maximumFractionDigits: 2 })} €</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Totaux */}
                  <div style={{ margin: "14px 28px 0", background: "#F8FAFC", borderRadius: 12, padding: "14px 16px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ fontSize: 13, color: "#64748B" }}>Prix facturé</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#94A3B8", textDecoration: "line-through" }}>{(totalM * 2).toLocaleString("fr-FR", { maximumFractionDigits: 2 })} €</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ fontSize: 13, color: "#64748B" }}>Crédit d'impôt (50%)</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#16A34A" }}>−{totalM.toLocaleString("fr-FR", { maximumFractionDigits: 2 })} €</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 8, borderTop: "1px solid #E2E8F0" }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: "#0F172A" }}>Votre part</span>
                      <span style={{ fontSize: 14, fontWeight: 700, color: "#16A34A" }}>{totalM.toLocaleString("fr-FR", { maximumFractionDigits: 2 })} €</span>
                    </div>
                  </div>

                  {/* Checkbox confirmation */}
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

                  {validError && (
                    <p style={{ fontSize: 12, color: "#DC2626", background: "#FEF2F2", borderRadius: 8, padding: "8px 12px", margin: "10px 28px 0" }}>{validError}</p>
                  )}

                  {/* Actions */}
                  <div style={{ padding: "16px 28px 28px", display: "flex", flexDirection: "column", gap: 8 }}>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        onClick={closeModal}
                        style={{ flex: 1, padding: "11px", borderRadius: 12, border: "1px solid #E2E8F0", background: "#fff", cursor: "pointer", fontSize: 13, color: "#64748B", fontWeight: 500 }}
                      >
                        Annuler
                      </button>
                      <button
                        onClick={() => { closeModal(); navigate(`/parent/contestation/${recapModal.id}`); }}
                        style={{ flex: 1, padding: "11px", borderRadius: 12, border: "1.5px solid #FB923C", background: "#FFF7ED", cursor: "pointer", fontSize: 13, color: "#EA580C", fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
                      >
                        <Flag style={{ width: 13, height: 13 }} /> Contester
                      </button>
                    </div>
                    <button
                      onClick={handleValider}
                      disabled={validating || !confirmed}
                      style={{
                        width: "100%", background: confirmed ? "#2E6BEA" : "#94A3B8", color: "#fff",
                        padding: "13px", borderRadius: 12, border: "none",
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
