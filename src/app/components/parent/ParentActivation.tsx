import { useNavigate } from "react-router";
import { ChevronLeft, Shield, CreditCard, CheckCircle, User, Lock } from "lucide-react";

const STEPS = [
  {
    number: 1,
    title: "Vos informations",
    desc: "Identité, date et lieu de naissance",
    icon: User,
  },
  {
    number: 2,
    title: "Vos coordonnées bancaires",
    desc: "IBAN pour recevoir les remboursements",
    icon: CreditCard,
  },
  {
    number: 3,
    title: "Confirmation",
    desc: "Validation et envoi à l'Urssaf",
    icon: CheckCircle,
  },
];

const BENEFITS = [
  { label: "50%", sub: "de réduction immédiate" },
  { label: "0 €", sub: "d'avance de trésorerie" },
  { label: "5 min", sub: "pour activer" },
];

export function ParentActivation() {
  const navigate = useNavigate();

  return (
    <div style={{ maxWidth: 620, margin: "0 auto", display: "flex", flexDirection: "column", gap: 0 }}>

      {/* Back */}
      <button
        onClick={() => navigate("/parent/profil")}
        style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "#64748B", background: "none", border: "none", cursor: "pointer", padding: "0 0 24px", fontWeight: 500 }}
      >
        <ChevronLeft style={{ width: 16, height: 16 }} />
        Mon profil
      </button>

      {/* Hero card */}
      <div style={{ background: "linear-gradient(145deg, #1E40AF 0%, #2E6BEA 50%, #3B82F6 100%)", borderRadius: 24, padding: "36px 32px 32px", marginBottom: 20, position: "relative", overflow: "hidden" }}>
        {/* Background pattern */}
        <div style={{ position: "absolute", top: -40, right: -40, width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,.05)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -60, left: -20, width: 160, height: 160, borderRadius: "50%", background: "rgba(255,255,255,.04)", pointerEvents: "none" }} />

        {/* Icon */}
        <div style={{ width: 56, height: 56, background: "rgba(255,255,255,.15)", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20, backdropFilter: "blur(8px)" }}>
          <Shield style={{ width: 28, height: 28, color: "#fff" }} />
        </div>

        {/* Title */}
        <h1 style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 400, fontSize: 30, color: "#fff", margin: "0 0 8px", lineHeight: 1.15, letterSpacing: "-.01em" }}>
          Activez l'avance immédiate
        </h1>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,.75)", margin: "0 0 28px", lineHeight: 1.55, maxWidth: 420 }}>
          Dispositif officiel Urssaf — bénéficiez de 50% de réduction sur chaque facture de cours particuliers, sans avancer de trésorerie.
        </p>

        {/* Benefits row */}
        <div style={{ display: "flex", gap: 12 }}>
          {BENEFITS.map((b) => (
            <div
              key={b.label}
              style={{ flex: 1, background: "rgba(255,255,255,.12)", borderRadius: 14, padding: "14px 10px", textAlign: "center", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,.15)" }}
            >
              <p style={{ fontSize: 22, fontWeight: 800, color: "#fff", margin: "0 0 2px", letterSpacing: "-.02em" }}>{b.label}</p>
              <p style={{ fontSize: 10, color: "rgba(255,255,255,.65)", margin: 0, fontWeight: 500, textTransform: "uppercase", letterSpacing: ".06em" }}>{b.sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Steps card */}
      <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 20, overflow: "hidden", boxShadow: "0 1px 4px rgba(15,23,42,.07)", marginBottom: 16 }}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid #F1F5F9" }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: ".1em", margin: 0 }}>
            3 étapes · environ 5 minutes
          </p>
        </div>
        {STEPS.map((step, i) => {
          const isFirst = i === 0;
          const Icon = step.icon;
          return (
            <div
              key={step.number}
              style={{
                display: "flex", alignItems: "center", gap: 16,
                padding: "20px 24px",
                borderBottom: i < STEPS.length - 1 ? "1px solid #F8FAFC" : "none",
                background: isFirst ? "#FAFBFF" : "#fff",
              }}
            >
              {/* Step indicator */}
              <div style={{
                width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: isFirst ? "#2E6BEA" : "#F1F5F9",
                border: isFirst ? "none" : "1.5px solid #E2E8F0",
              }}>
                {isFirst ? (
                  <Icon style={{ width: 20, height: 20, color: "#fff" }} />
                ) : (
                  <Lock style={{ width: 16, height: 16, color: "#94A3B8" }} />
                )}
              </div>

              {/* Content */}
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: isFirst ? "#0F172A" : "#94A3B8", margin: 0 }}>{step.title}</p>
                  {isFirst && (
                    <span style={{ fontSize: 10, fontWeight: 700, background: "#EFF6FF", color: "#1D4ED8", padding: "2px 8px", borderRadius: 999, textTransform: "uppercase", letterSpacing: ".06em" }}>
                      Étape 1
                    </span>
                  )}
                </div>
                <p style={{ fontSize: 12, color: isFirst ? "#64748B" : "#CBD5E1", margin: "3px 0 0" }}>{step.desc}</p>
              </div>

              {/* Status */}
              <div style={{ flexShrink: 0 }}>
                {isFirst ? (
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#2E6BEA" }} />
                ) : (
                  <Lock style={{ width: 14, height: 14, color: "#CBD5E1" }} />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Coming soon notice */}
      <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 16, padding: "20px 24px", marginBottom: 16, display: "flex", gap: 16, alignItems: "flex-start", boxShadow: "0 1px 4px rgba(15,23,42,.07)" }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: "#F1F5F9", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Shield style={{ width: 18, height: 18, color: "#64748B" }} />
        </div>
        <div>
          <p style={{ fontSize: 14, fontWeight: 600, color: "#0F172A", margin: "0 0 4px" }}>Fonctionnalité en cours de déploiement</p>
          <p style={{ fontSize: 13, color: "#64748B", margin: 0, lineHeight: 1.6 }}>
            L'activation de l'avance immédiate sera disponible très prochainement. Vous serez notifié par email dès que la procédure sera ouverte. En attendant, vous pouvez consulter votre statut dans{" "}
            <button onClick={() => navigate("/parent/profil")} style={{ background: "none", border: "none", cursor: "pointer", color: "#2E6BEA", fontWeight: 600, padding: 0, fontSize: 13 }}>
              Mon profil
            </button>.
          </p>
        </div>
      </div>

      {/* CTA button — disabled for now */}
      <button
        disabled
        style={{
          width: "100%", padding: "16px", borderRadius: 16,
          background: "#E2E8F0", color: "#94A3B8",
          fontSize: 15, fontWeight: 700, border: "none",
          cursor: "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
          letterSpacing: ".01em",
        }}
      >
        <Shield style={{ width: 18, height: 18 }} />
        Commencer l'activation
      </button>
      <p style={{ fontSize: 12, color: "#94A3B8", textAlign: "center", marginTop: 10 }}>
        Disponible prochainement — nous finalisons l'intégration avec l'Urssaf
      </p>
    </div>
  );
}
