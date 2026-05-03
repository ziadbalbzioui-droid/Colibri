import { useNavigate } from "react-router";
import { ChevronLeft, Shield } from "lucide-react";

export function ParentActivation() {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: "100vh",
      background: "#FAFAFA",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "32px 20px",
    }}>
      {/* Back button */}
      <div style={{ width: "100%", maxWidth: 480, marginBottom: 48 }}>
        <button
          onClick={() => navigate("/parent")}
          style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            fontSize: 13, color: "#94A3B8", background: "none",
            border: "none", cursor: "pointer", padding: 0, fontWeight: 500,
          }}
        >
          <ChevronLeft style={{ width: 15, height: 15 }} />
          Retour au tableau de bord
        </button>
      </div>

      {/* Card */}
      <div style={{
        width: "100%", maxWidth: 480,
        background: "#fff",
        border: "1px solid #E2E8F0",
        borderRadius: 24,
        padding: "48px 40px",
        textAlign: "center",
        boxShadow: "0 2px 12px rgba(15,23,42,.06)",
      }}>
        <div style={{
          width: 56, height: 56,
          background: "#F1F5F9",
          borderRadius: 16,
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 24px",
        }}>
          <Shield style={{ width: 24, height: 24, color: "#94A3B8" }} />
        </div>

        <h1 style={{
          fontFamily: "'Fraunces', Georgia, serif",
          fontWeight: 400, fontSize: 26,
          color: "#0F172A", margin: "0 0 12px",
          letterSpacing: "-.01em", lineHeight: 1.2,
        }}>
          Activation en cours de déploiement
        </h1>

        <p style={{
          fontSize: 14, color: "#64748B",
          lineHeight: 1.65, margin: "0 0 32px",
          maxWidth: 360, marginLeft: "auto", marginRight: "auto",
        }}>
          La procédure d'activation de l'avance immédiate sera disponible très prochainement.
          Vous serez notifié par email dès qu'elle sera ouverte.
        </p>

        <button
          onClick={() => navigate("/parent")}
          style={{
            background: "#F1F5F9", color: "#475569",
            border: "none", borderRadius: 12,
            padding: "11px 24px",
            fontSize: 13, fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Retour au tableau de bord
        </button>
      </div>
    </div>
  );
}
