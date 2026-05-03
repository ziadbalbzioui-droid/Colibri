import { Link, useNavigate } from "react-router";
import { Calendar, Clock, CreditCard, ChevronRight, CheckCircle, AlertCircle, BookOpen, Zap, Clock3 } from "lucide-react";
import { LoadingGuard } from "../layout/LoadingGuard";
import { useParentData } from "../../../lib/hooks/useParentData";

const MOIS = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];

function formatDate(d: string) {
  const dt = new Date(d);
  return `${dt.getDate()} ${MOIS[dt.getMonth()]}`;
}

const S = {
  card: {
    background: "#fff",
    border: "1px solid #E2E8F0",
    borderRadius: 16,
    boxShadow: "0 1px 3px rgba(15,23,42,.06)",
  } as React.CSSProperties,
  serif: { fontFamily: "'Fraunces', Georgia, serif" } as React.CSSProperties,
  eyebrow: {
    fontSize: 11, fontWeight: 700, letterSpacing: ".1em",
    textTransform: "uppercase" as const, color: "#64748B",
  } as React.CSSProperties,
};

export function ParentDashboard() {
  const { children, cours, factures, loading, profile } = useParentData();
  const navigate = useNavigate();

  const isActivationPending = profile?.urssaf_status === "activation_pending";
  const needsActivation = !profile?.onboarding_complete && !isActivationPending;

  const prenom = profile?.prenom ?? "parent";
  const today = new Date();

  const prochaines = cours.filter((c) => new Date(c.date) >= today).slice(0, 3);

  const heuresCeMois = cours
    .filter((c) => {
      const d = new Date(c.date);
      return d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
    })
    .reduce((s, c) => s + c.duree_heures, 0);

  const enAttente = factures
    .filter((f) => f.statut === "en attente")
    .reduce((s, f) => s + f.montant_brut, 0);

  const dernieresFactures = factures.slice(0, 2);

  const weekLabel = (() => {
    const weekNum = Math.ceil((today.getDate() + new Date(today.getFullYear(), today.getMonth(), 1).getDay()) / 7);
    return `${today.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })} · semaine ${weekNum}`;
  })();

  const stats = [
    {
      label: "Prochaine séance",
      value: prochaines[0] ? formatDate(prochaines[0].date) : "—",
      sub: prochaines[0] ? prochaines[0].matiere : "Aucune planifiée",
      icon: Calendar,
      iconBg: "#EFF6FF", iconColor: "#2563EB",
    },
    {
      label: "Heures ce mois",
      value: `${heuresCeMois.toFixed(1)}h`,
      sub: `${cours.filter((c) => {
        const d = new Date(c.date);
        return d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
      }).length} séances`,
      icon: Clock,
      iconBg: "#F0FDF4", iconColor: "#16A34A",
    },
    {
      label: "Montant en attente",
      value: enAttente > 0 ? `${enAttente} €` : "À jour",
      sub: enAttente > 0
        ? `Avec avance immédiate : ${Math.round(enAttente * 0.5)} €`
        : "Tout est payé ✓",
      icon: CreditCard,
      iconBg: enAttente > 0 ? "#FFFBEB" : "#F0FDF4",
      iconColor: enAttente > 0 ? "#D97706" : "#16A34A",
    },
  ];

  return (
    <LoadingGuard loading={loading}>
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", flexDirection: "column", gap: 16 }}>

        {/* Banner: URSSAF activation pending */}
        {isActivationPending && (
          <button
            type="button"
            onClick={() => navigate("/parent/profil")}
            style={{ display: "flex", alignItems: "center", gap: 12, background: "#FFFBEB", border: "2px solid #FCD34D", borderRadius: 16, padding: "14px 20px", cursor: "pointer", textAlign: "left", width: "100%" }}
          >
            <div style={{ width: 40, height: 40, background: "#FDE68A", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Clock3 style={{ width: 20, height: 20, color: "#92400E" }} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 600, color: "#92400E", fontSize: 13, margin: 0 }}>
                Compte Urssaf en attente d'activation
              </p>
              <p style={{ fontSize: 11, color: "#B45309", marginTop: 2, marginBottom: 0 }}>
                Cliquez ici pour terminer l'activation et débloquer toutes les fonctionnalités
              </p>
            </div>
            <ChevronRight style={{ width: 18, height: 18, color: "#B45309", flexShrink: 0 }} />
          </button>
        )}

        {/* CTA: Activate service */}
        {needsActivation && (
          <div style={{ background: "linear-gradient(135deg, #2E6BEA, #1565C0)", borderRadius: 20, padding: "24px 28px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
              <div style={{ width: 48, height: 48, background: "rgba(255,255,255,.2)", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Zap style={{ width: 24, height: 24, color: "#fff" }} />
              </div>
              <div>
                <h2 style={{ fontWeight: 600, fontSize: 16, color: "#fff", margin: 0 }}>Activez votre service d'avance immédiate</h2>
                <p style={{ fontSize: 13, color: "#BFDBFE", marginTop: 2, marginBottom: 0 }}>
                  Bénéficiez de l'avance immédiate déduite directement de vos factures
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate("/parent/profil")}
              style={{ width: "100%", background: "#fff", color: "#2E6BEA", fontWeight: 600, fontSize: 14, padding: "12px", borderRadius: 14, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
            >
              Activer le service <ChevronRight style={{ width: 16, height: 16 }} />
            </button>
          </div>
        )}

        <div style={{ opacity: isActivationPending ? 0.4 : 1, pointerEvents: isActivationPending ? "none" : "auto", display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Header */}
          <div style={{ marginBottom: 8 }}>
            <p style={{ ...S.eyebrow, marginBottom: 10 }}>{weekLabel}</p>
            <h1 style={{ ...S.serif, fontWeight: 400, fontSize: 48, lineHeight: 1.05, letterSpacing: "-.02em", color: "#0F172A", margin: 0 }}>
              Bonjour, {prenom}<br />
              <span style={{ color: "#94A3B8" }}>
                {children.length > 0 ? "Tableau de bord de suivi" : "Tableau de bord parent"}
              </span>
            </h1>
          </div>

          {children.length === 0 ? (
            <div style={{ ...S.card, padding: 48, textAlign: "center", maxWidth: 480, margin: "0 auto" }}>
              <div style={{ width: 64, height: 64, background: "#FEF3C7", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                <AlertCircle style={{ width: 32, height: 32, color: "#F59E0B" }} />
              </div>
              <h2 style={{ fontWeight: 600, color: "#0F172A", marginBottom: 8 }}>Aucun élève associé</h2>
              <p style={{ fontSize: 13, color: "#64748B", margin: 0 }}>
                Votre compte parent n'est pas encore lié à un élève. Contactez votre professeur
                pour qu'il fasse le lien.
              </p>
            </div>
          ) : (
            <>
              {/* Children cards */}
              <div style={{ display: "grid", gridTemplateColumns: children.length > 1 ? "1fr 1fr" : "1fr", gap: 16 }}>
                {children.map((child) => (
                  <div key={child.id} style={{ background: "linear-gradient(135deg, #2E6BEA, #1565C0)", borderRadius: 20, padding: 24, color: "#fff" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                        <div style={{ width: 56, height: 56, background: "rgba(255,255,255,.2)", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 700, flexShrink: 0 }}>
                          {child.nom.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h2 style={{ ...S.serif, fontSize: 20, fontWeight: 400, color: "#fff", margin: 0 }}>{child.nom}</h2>
                          <p style={{ color: "#BFDBFE", fontSize: 13, marginTop: 2, marginBottom: 0 }}>{child.niveau}</p>
                          <p style={{ color: "#BFDBFE", fontSize: 11, marginTop: 2, marginBottom: 0 }}>Prof : {child.prof_nom}</p>
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <p style={{ color: "#BFDBFE", fontSize: 11, marginBottom: 4, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".06em" }}>Matière</p>
                        <span style={{ display: "inline-block", background: "rgba(255,255,255,.2)", fontSize: 11, padding: "2px 10px", borderRadius: 999, fontWeight: 600 }}>
                          {child.matiere}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Stats */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
                {stats.map((stat) => (
                  <div key={stat.label} style={{ ...S.card, padding: 20 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: stat.iconBg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
                      <stat.icon style={{ width: 16, height: 16, color: stat.iconColor }} />
                    </div>
                    <p style={{ fontSize: 11, color: "#64748B", margin: 0 }}>{stat.label}</p>
                    <p style={{ ...S.serif, fontSize: 26, fontWeight: 400, color: "#0F172A", marginTop: 2, marginBottom: 0, letterSpacing: "-.02em" }}>{stat.value}</p>
                    <p style={{ fontSize: 11, color: "#64748B", marginTop: 4, marginBottom: 0 }}>{stat.sub}</p>
                  </div>
                ))}
              </div>

              {/* Séances + Factures */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

                {/* Prochaines séances */}
                <div style={{ ...S.card, overflow: "hidden" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 24px", borderBottom: "1px solid #F1F5F9" }}>
                    <h3 style={{ fontSize: 15, fontWeight: 600, color: "#0F172A", margin: 0 }}>Prochaines séances</h3>
                    <Link to="/parent/cours" style={{ fontSize: 12, color: "#2E6BEA", fontWeight: 600, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 2 }}>
                      Voir tout <ChevronRight style={{ width: 14, height: 14 }} />
                    </Link>
                  </div>
                  {prochaines.length === 0 ? (
                    <p style={{ padding: "24px", fontSize: 13, color: "#94A3B8", textAlign: "center", margin: 0 }}>
                      Aucune séance planifiée
                    </p>
                  ) : (
                    prochaines.map((c, i) => (
                      <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 24px", borderBottom: i < prochaines.length - 1 ? "1px solid #F1F5F9" : "none" }}>
                        <div style={{ width: 32, height: 32, borderRadius: 10, background: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <BookOpen style={{ width: 15, height: 15, color: "#2563EB" }} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: 13, fontWeight: 600, color: "#0F172A", margin: 0 }}>{c.matiere}</p>
                          <p style={{ fontSize: 11, color: "#64748B", marginTop: 2, marginBottom: 0 }}>
                            {formatDate(c.date)} · {c.duree}
                          </p>
                        </div>
                        <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 999, background: "#EFF6FF", color: "#1E3A8A", fontWeight: 600, flexShrink: 0 }}>
                          {c.statut}
                        </span>
                      </div>
                    ))
                  )}
                </div>

                {/* Dernières factures */}
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
                      <div key={f.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 24px", borderBottom: i < dernieresFactures.length - 1 ? "1px solid #F1F5F9" : "none" }}>
                        <div style={{ flexShrink: 0, color: f.statut === "payée" ? "#22C55E" : "#F59E0B" }}>
                          {f.statut === "payée"
                            ? <CheckCircle style={{ width: 16, height: 16 }} />
                            : <AlertCircle style={{ width: 16, height: 16 }} />}
                        </div>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: 13, fontWeight: 600, color: "#0F172A", margin: 0 }}>{f.mois}</p>
                          <p style={{ fontSize: 11, color: "#64748B", marginTop: 2, marginBottom: 0 }}>
                            {f.montant_brut}€ brut
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
                  <div style={{ padding: "12px 24px", background: "#EFF6FF", borderTop: "1px solid #DBEAFE" }}>
                    <p style={{ fontSize: 11, color: "#1E40AF", margin: 0 }}>
                      Avance immédiate Urssaf — le montant est déduit directement de vos factures.
                    </p>
                  </div>
                </div>

              </div>
            </>
          )}
        </div>
      </div>
    </LoadingGuard>
  );
}
