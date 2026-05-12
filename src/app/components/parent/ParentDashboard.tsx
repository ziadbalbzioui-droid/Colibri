import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Clock, CreditCard, ChevronRight, CheckCircle, AlertCircle, Zap, Plus, Loader2, CheckCircle2, KeyRound, Flag, Info } from "lucide-react";
import { LoadingGuard } from "../layout/LoadingGuard";
import { useParentData } from "../../../lib/hooks/useParentData";

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

const S = {
  card: { background: "#fff", border: "1px solid #E2E8F0", borderRadius: 16, boxShadow: "0 1px 3px rgba(15,23,42,.06)" } as React.CSSProperties,
  serif: { fontFamily: "'Fraunces', Georgia, serif" } as React.CSSProperties,
  eyebrow: { fontSize: 11, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase" as const, color: "#64748B" } as React.CSSProperties,
};

function LierProfWidget({ ajouterCode }: { ajouterCode: (code: string) => Promise<void> }) {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;
    setLoading(true);
    setError(null);
    try {
      await ajouterCode(code);
      setSuccess(true);
      setCode("");
      setTimeout(() => { setOpen(false); setSuccess(false); }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Code invalide");
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "#fff", border: "1.5px dashed #CBD5E1", borderRadius: 12, padding: "10px 16px", fontSize: 13, fontWeight: 600, color: "#475569", cursor: "pointer" }}
      >
        <Plus style={{ width: 15, height: 15 }} />
        Lier un professeur
      </button>
    );
  }

  return (
    <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 14, padding: "18px 20px", boxShadow: "0 1px 3px rgba(15,23,42,.06)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <KeyRound style={{ width: 15, height: 15, color: "#64748B" }} />
        <p style={{ fontWeight: 700, fontSize: 13, color: "#0F172A", margin: 0 }}>Lier un professeur</p>
      </div>
      {success ? (
        <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#16A34A", fontSize: 13, fontWeight: 600 }}>
          <CheckCircle2 style={{ width: 16, height: 16 }} />
          Professeur ajouté avec succès !
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: "flex", gap: 8 }}>
          <input
            type="text"
            value={code}
            onChange={(e) => { setCode(e.target.value.replace(/\s/g, "").toUpperCase()); setError(null); }}
            placeholder="CODE PROF"
            maxLength={20}
            autoFocus
            style={{ flex: 1, padding: "9px 14px", border: "1px solid #E2E8F0", borderRadius: 10, fontSize: 13, fontFamily: "monospace", letterSpacing: "0.1em", textTransform: "uppercase", outline: "none" }}
          />
          <button
            type="submit"
            disabled={!code.trim() || loading}
            style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: 10, background: "#2E6BEA", color: "#fff", fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer", opacity: (!code.trim() || loading) ? 0.5 : 1 }}
          >
            {loading ? <Loader2 style={{ width: 14, height: 14 }} className="animate-spin" /> : <Plus style={{ width: 14, height: 14 }} />}
            Ajouter
          </button>
          <button
            type="button"
            onClick={() => { setOpen(false); setCode(""); setError(null); }}
            style={{ padding: "9px 12px", borderRadius: 10, background: "transparent", border: "1px solid #E2E8F0", fontSize: 13, color: "#94A3B8", cursor: "pointer" }}
          >
            Annuler
          </button>
        </form>
      )}
      {error && (
        <p style={{ fontSize: 12, color: "#DC2626", marginTop: 8, marginBottom: 0, display: "flex", alignItems: "center", gap: 5 }}>
          <AlertCircle style={{ width: 13, height: 13 }} />{error}
        </p>
      )}
    </div>
  );
}

export function ParentDashboard() {
  const { children, cours, factures, validations, loading, profile, ajouterCode } = useParentData();
  const navigate = useNavigate();

  const isActivationPending = profile?.urssaf_status === "activation_pending";
  const needsActivation = !profile?.onboarding_complete && !isActivationPending;

  const prenom = profile?.prenom ?? "parent";
  const today = new Date();

  const heuresCeMois = cours
    .filter((c) => {
      const d = new Date(c.date);
      return d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
    })
    .reduce((s, c) => s + c.duree_heures, 0);

  const coursCeMois = cours.filter((c) => {
    const d = new Date(c.date);
    return d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
  }).length;

  const enAttente = factures
    .filter((f) => f.statut === "en attente")
    .reduce((s, f) => s + f.montant_brut, 0);

  const dernieresFactures = factures.slice(0, 4);

  const weekLabel = (() => {
    const weekNum = Math.ceil((today.getDate() + new Date(today.getFullYear(), today.getMonth(), 1).getDay()) / 7);
    return `${today.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })} · semaine ${weekNum}`;
  })();

  return (
    <LoadingGuard loading={loading}>
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", flexDirection: "column", gap: 16 }}>

        {/* Banner: URSSAF activation pending */}
        {isActivationPending && (
          <button
            type="button"
            onClick={() => navigate("/parent/profil")}
            style={{ display: "flex", alignItems: "center", gap: 12, background: "#FFFBEB", border: "1px solid #FCD34D", borderRadius: 14, padding: "12px 16px", cursor: "pointer", textAlign: "left", width: "100%" }}
          >
            <div style={{ width: 34, height: 34, background: "#FDE68A", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Clock style={{ width: 16, height: 16, color: "#92400E" }} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 600, color: "#92400E", fontSize: 13, margin: 0 }}>
                Compte Urssaf en attente d'activation
              </p>
              <p style={{ fontSize: 11, color: "#B45309", marginTop: 2, marginBottom: 0 }}>
                Consultez votre boîte mail pour finaliser l'activation
              </p>
            </div>
            <ChevronRight style={{ width: 16, height: 16, color: "#B45309", flexShrink: 0 }} />
          </button>
        )}

        {/* CTA: Activate service */}
        {needsActivation && (
          <button
            type="button"
            onClick={() => navigate("/parent/activation")}
            style={{ display: "flex", alignItems: "center", gap: 12, background: "#FFF7ED", border: "1.5px solid #FB923C", borderRadius: 14, padding: "12px 16px", cursor: "pointer", textAlign: "left", width: "100%" }}
          >
            <div style={{ width: 34, height: 34, background: "#FED7AA", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Zap style={{ width: 16, height: 16, color: "#EA580C" }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontWeight: 700, color: "#EA580C", fontSize: 13, margin: 0 }}>
                Activez l'avance immédiate pour utiliser Colibri
              </p>
              <p style={{ fontSize: 11, color: "#C2410C", marginTop: 2, marginBottom: 0 }}>
                50% de réduction sur chaque facture · Requis pour accéder aux paiements
              </p>
            </div>
            <div style={{ flexShrink: 0, background: "#EA580C", color: "#fff", fontWeight: 700, fontSize: 12, padding: "7px 14px", borderRadius: 10, display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap" }}>
              Activer <ChevronRight style={{ width: 13, height: 13 }} />
            </div>
          </button>
        )}

        <div style={{ opacity: isActivationPending ? 0.4 : 1, pointerEvents: isActivationPending ? "none" : "auto", display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Header */}
          <div style={{ marginBottom: 4 }}>
            <p style={{ ...S.eyebrow, marginBottom: 10 }}>{weekLabel}</p>
            <h1 style={{ ...S.serif, fontWeight: 400, fontSize: 48, lineHeight: 1.05, letterSpacing: "-.02em", color: "#0F172A", margin: 0 }}>
              Bonjour, {prenom}<br />
              <span style={{ color: "#94A3B8" }}>
                {children.length > 0 ? "Tableau de bord de suivi" : "Tableau de bord parent"}
              </span>
            </h1>
          </div>

          {children.length === 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 480, margin: "0 auto" }}>
              <div style={{ ...S.card, padding: 40, textAlign: "center" }}>
                <div style={{ width: 64, height: 64, background: "#FEF3C7", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                  <AlertCircle style={{ width: 32, height: 32, color: "#F59E0B" }} />
                </div>
                <h2 style={{ fontWeight: 600, color: "#0F172A", marginBottom: 8 }}>Aucun élève associé</h2>
                <p style={{ fontSize: 13, color: "#64748B", margin: "0 0 20px" }}>
                  Saisissez le code communiqué par votre professeur pour lier votre enfant.
                </p>
                <LierProfWidget ajouterCode={ajouterCode} />
              </div>
            </div>
          ) : (
            <>
              {/* Children cards */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {children.map((child) => {
                  const colors = MATIERE_COLORS[child.matiere] ?? { bg: "#F8FAFC", dot: "#475569" };
                  return (
                    <div key={child.id} style={{ ...S.card, padding: "16px 20px 16px 24px", display: "flex", alignItems: "center", gap: 16, position: "relative", overflow: "hidden" }}>
                      {/* Left accent bar */}
                      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 4, background: colors.dot }} />
                      {/* Avatar */}
                      <div style={{ width: 46, height: 46, background: colors.bg, borderRadius: 13, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 700, color: colors.dot, flexShrink: 0 }}>
                        {child.nom.charAt(0).toUpperCase()}
                      </div>
                      {/* Name + level */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h2 style={{ ...S.serif, fontSize: 17, fontWeight: 400, color: "#0F172A", margin: "0 0 3px", lineHeight: 1.2 }}>
                          {child.nom}
                        </h2>
                        <p style={{ fontSize: 12, color: "#64748B", margin: 0 }}>{child.niveau}</p>
                      </div>
                      {/* Matière + prof */}
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <span style={{ display: "inline-block", background: colors.bg, color: colors.dot, fontSize: 11, padding: "3px 10px", borderRadius: 999, fontWeight: 700 }}>
                          {child.matiere}
                        </span>
                        <p style={{ fontSize: 11, color: "#94A3B8", marginTop: 5, marginBottom: 0 }}>{child.prof_nom}</p>
                      </div>
                    </div>
                  );
                })}
                <LierProfWidget ajouterCode={ajouterCode} />
              </div>

              {/* Encart crédit d'impôt */}
              <div style={{ background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: 14, padding: "12px 16px", display: "flex", gap: 10, alignItems: "flex-start" }}>
                <Info style={{ width: 15, height: 15, color: "#2563EB", flexShrink: 0, marginTop: 2 }} />
                <p style={{ fontSize: 12, color: "#1E40AF", lineHeight: 1.65, margin: 0 }}>
                  Tous les montants affichés correspondent à <strong>votre part réelle après crédit d'impôt de 50%</strong>. L'État prend en charge l'autre moitié directement via l'Urssaf — aucune avance, aucun remboursement à attendre.
                </p>
              </div>

              {/* Stats */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                {/* Heures ce mois */}
                <div style={{ ...S.card, padding: 20 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: "#F0FDF4", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
                    <Clock style={{ width: 16, height: 16, color: "#16A34A" }} />
                  </div>
                  <p style={{ fontSize: 11, color: "#64748B", margin: 0 }}>Heures ce mois</p>
                  <p style={{ ...S.serif, fontSize: 26, fontWeight: 400, color: "#0F172A", marginTop: 2, marginBottom: 0, letterSpacing: "-.02em" }}>
                    {heuresCeMois.toFixed(1)}h
                  </p>
                  <p style={{ fontSize: 11, color: "#64748B", marginTop: 4, marginBottom: 0 }}>{coursCeMois} séance{coursCeMois > 1 ? "s" : ""}</p>
                </div>
                {/* Action requise */}
                {(() => {
                  const pending = validations.filter((v) => v.statut === "en_attente_parent");
                  const MOIS_LC = ["janvier","février","mars","avril","mai","juin","juillet","août","septembre","octobre","novembre","décembre"];

                  if (pending.length === 0) {
                    return (
                      <div style={{ ...S.card, padding: "20px 22px", display: "flex", flexDirection: "column", gap: 10 }}>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "#ECFDF5", borderRadius: 999, padding: "3px 10px 3px 7px", alignSelf: "flex-start" }}>
                          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#22C55E" }} />
                          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" as const, color: "#15803D" }}>Aucune action</span>
                        </div>
                        <p style={{ fontSize: 14, fontWeight: 600, color: "#0F172A", margin: 0, lineHeight: 1.3 }}>Tout est à jour</p>
                        <p style={{ fontSize: 12, color: "#64748B", margin: 0, lineHeight: 1.5 }}>Aucun récapitulatif en attente de validation.</p>
                      </div>
                    );
                  }

                  return (
                    <div style={{ ...S.card, padding: "20px 22px", background: "#FFFBEB", border: "1px solid #FDE68A" }}>
                      <div style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "#FEF3C7", borderRadius: 999, padding: "3px 10px 3px 7px", marginBottom: 12 }}>
                        <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#F59E0B" }} />
                        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" as const, color: "#B45309" }}>Action requise</span>
                      </div>
                      {pending.map((v) => {
                        const moisNom = MOIS_LC[(v.recap_mensuel.mois ?? 1) - 1];
                        const deadlineMois = MOIS_LC[(v.recap_mensuel.mois ?? 1) % 12];
                        return (
                          <div key={v.id} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                            <p style={{ fontSize: 14, fontWeight: 700, color: "#92400E", margin: 0, lineHeight: 1.3 }}>
                              Validez le mois de {moisNom}
                            </p>
                            <p style={{ fontSize: 11, color: "#78350F", margin: 0, lineHeight: 1.5 }}>
                              Délai : <strong>7 {deadlineMois}</strong>, puis validé automatiquement.
                            </p>
                            <Link
                              to="/parent/validations"
                              style={{ display: "block", textAlign: "center", fontSize: 12, background: "#B45309", color: "#fff", padding: "8px 0", borderRadius: 10, fontWeight: 700, textDecoration: "none" }}
                            >
                              Voir & Valider →
                            </Link>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>

              {/* Dernières factures — full width */}
              <div style={{ ...S.card, overflow: "hidden" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 24px", borderBottom: "1px solid #F1F5F9" }}>
                  <h3 style={{ fontSize: 15, fontWeight: 600, color: "#0F172A", margin: 0 }}>Dernières factures</h3>
                  <Link to="/parent/factures" style={{ fontSize: 12, color: "#2E6BEA", fontWeight: 600, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 2 }}>
                    Voir tout <ChevronRight style={{ width: 14, height: 14 }} />
                  </Link>
                </div>
                {dernieresFactures.length === 0 ? (
                  <p style={{ padding: "24px", fontSize: 13, color: "#94A3B8", textAlign: "center", margin: 0 }}>
                    Aucune facture
                  </p>
                ) : (
                  dernieresFactures.map((f, i) => (
                    <div key={f.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 24px", borderBottom: i < dernieresFactures.length - 1 ? "1px solid #F8FAFC" : "none" }}>
                      <div style={{ flexShrink: 0, color: f.statut === "payée" ? "#22C55E" : "#F59E0B" }}>
                        {f.statut === "payée"
                          ? <CheckCircle style={{ width: 16, height: 16 }} />
                          : <AlertCircle style={{ width: 16, height: 16 }} />}
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: "#0F172A", margin: 0 }}>{f.mois}</p>
                        <p style={{ fontSize: 11, color: "#64748B", marginTop: 2, marginBottom: 0 }}>
                          {MOIS[new Date(f.date_emission).getMonth()]} {new Date(f.date_emission).getFullYear()}
                        </p>
                      </div>
                      {/* Prix barré + net */}
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <p style={{ fontSize: 11, color: "#94A3B8", textDecoration: "line-through", margin: 0 }}>{(f.montant_brut * 2).toLocaleString("fr-FR", { maximumFractionDigits: 2 })} €</p>
                        <p style={{ fontSize: 13, fontWeight: 700, color: f.statut === "payée" ? "#64748B" : "#16A34A", margin: 0 }}>
                          {f.montant_brut.toLocaleString("fr-FR", { maximumFractionDigits: 2 })} €
                        </p>
                      </div>
                      {f.statut === "en attente" ? (
                        <Link to="/parent/factures" style={{ fontSize: 12, background: "#2E6BEA", color: "#fff", padding: "5px 12px", borderRadius: 10, fontWeight: 600, textDecoration: "none", flexShrink: 0 }}>
                          Payer
                        </Link>
                      ) : (
                        <span style={{ fontSize: 11, background: "#ECFDF5", color: "#065F46", padding: "4px 10px", borderRadius: 8, fontWeight: 600, flexShrink: 0 }}>
                          Payée
                        </span>
                      )}
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </LoadingGuard>
  );
}
