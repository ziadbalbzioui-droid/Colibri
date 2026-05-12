import { useState } from "react";
import { ChevronDown, ChevronLeft, ChevronRight, Laptop, FileText, HelpCircle, AlertTriangle, ExternalLink, Clock, CreditCard, CheckCircle, AlertCircle, BookOpen, CheckSquare, Landmark, TrendingUp, HeartHandshake, Flag, Send, ArrowRight, KeyRound, Info, Plus, CalendarDays } from "lucide-react";
import { Link } from "react-router";

// ─── Mock components ───────────────────────────────────────────

function MockDashboard() {
  return (
    <div style={{ background: "#F8FAFC", borderRadius: 14, padding: 16, border: "1px solid #E2E8F0", fontSize: 12 }}>
      {/* Header */}
      <div style={{ marginBottom: 14 }}>
        <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: "#64748B", margin: "0 0 6px" }}>
          Lundi 5 Mai 2026 · semaine 2
        </p>
        <p style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 22, color: "#0F172A", margin: 0, lineHeight: 1.1 }}>
          Bonjour, Marie<br />
          <span style={{ color: "#94A3B8", fontSize: 17 }}>Tableau de bord de suivi</span>
        </p>
      </div>
      {/* Child card */}
      <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 14, padding: "12px 16px 12px 20px", display: "flex", alignItems: "center", gap: 12, marginBottom: 8, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 4, background: "#1D4ED8" }} />
        <div style={{ width: 38, height: 38, background: "#EFF6FF", borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, color: "#1D4ED8", flexShrink: 0 }}>T</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 15, color: "#0F172A", margin: "0 0 2px" }}>Thomas</p>
          <p style={{ fontSize: 10, color: "#64748B", margin: 0 }}>Terminale</p>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <span style={{ display: "inline-block", background: "#EFF6FF", color: "#1D4ED8", fontSize: 10, padding: "3px 9px", borderRadius: 999, fontWeight: 700 }}>Mathématiques</span>
          <p style={{ fontSize: 10, color: "#94A3B8", marginTop: 4, marginBottom: 0 }}>M. Dupont</p>
        </div>
      </div>
      {/* Lier prof */}
      <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#fff", border: "1.5px dashed #CBD5E1", borderRadius: 11, padding: "8px 14px", fontSize: 11, fontWeight: 600, color: "#475569", marginBottom: 12 }}>
        <Plus style={{ width: 12, height: 12 }} /> Lier un professeur
      </div>
      {/* Encart info */}
      <div style={{ background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: 11, padding: "9px 12px", marginBottom: 12, display: "flex", gap: 8, alignItems: "flex-start" }}>
        <Info style={{ width: 13, height: 13, color: "#2563EB", flexShrink: 0, marginTop: 1 }} />
        <p style={{ fontSize: 11, color: "#1E40AF", lineHeight: 1.6, margin: 0 }}>
          Tous les montants = <strong>votre part après crédit d'impôt de 50%</strong>. L'État règle l'autre moitié directement.
        </p>
      </div>
      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
        <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 12, padding: "14px 16px" }}>
          <div style={{ width: 30, height: 30, background: "#F0FDF4", borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 8 }}>
            <Clock style={{ width: 12, height: 12, color: "#16A34A" }} />
          </div>
          <p style={{ fontSize: 10, color: "#64748B", margin: 0 }}>Heures ce mois</p>
          <p style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 22, color: "#0F172A", margin: "2px 0 0", letterSpacing: "-.02em" }}>6.0h</p>
          <p style={{ fontSize: 10, color: "#64748B", margin: 0 }}>4 séances</p>
        </div>
        <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 12, padding: "14px 16px" }}>
          <div style={{ width: 30, height: 30, background: "#FFFBEB", borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 8 }}>
            <CreditCard style={{ width: 12, height: 12, color: "#D97706" }} />
          </div>
          <p style={{ fontSize: 10, color: "#64748B", margin: 0 }}>Montant en attente</p>
          <p style={{ fontSize: 10, color: "#94A3B8", textDecoration: "line-through", margin: "4px 0 0" }}>240 € facturé</p>
          <p style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 20, color: "#16A34A", margin: "1px 0 0", letterSpacing: "-.02em" }}>120 €</p>
          <p style={{ fontSize: 10, color: "#16A34A", margin: 0 }}>après crédit d'impôt (50%)</p>
        </div>
      </div>
      {/* Dernières factures */}
      <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 12, overflow: "hidden" }}>
        <div style={{ padding: "11px 16px", borderBottom: "1px solid #F1F5F9" }}>
          <p style={{ fontWeight: 600, fontSize: 12, color: "#0F172A", margin: 0 }}>Dernières factures</p>
        </div>
        {[
          { label: "Avril 2026", n: "4 cours", brut: 240, net: 120, statut: "attente" },
          { label: "Mars 2026",  n: "3 cours", brut: 180, net: 90,  statut: "ok" },
        ].map((f, i) => (
          <div key={i} style={{ padding: "10px 16px", display: "flex", alignItems: "center", gap: 10, borderBottom: i === 0 ? "1px solid #F1F5F9" : "none" }}>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: "#0F172A", margin: 0 }}>{f.label}</p>
              <p style={{ fontSize: 10, color: "#64748B", margin: 0 }}>{f.n}</p>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ fontSize: 10, color: "#94A3B8", textDecoration: "line-through", margin: 0 }}>{f.brut} €</p>
              <p style={{ fontSize: 12, fontWeight: 700, color: "#16A34A", margin: 0 }}>{f.net} €</p>
            </div>
            <span style={{ fontSize: 10, padding: "3px 9px", borderRadius: 7, fontWeight: 600, ...(f.statut === "attente" ? { background: "#FEF9C3", color: "#B45309" } : { background: "#ECFDF5", color: "#065F46" }) }}>
              {f.statut === "attente" ? "En attente" : "Payée"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MockCours() {
  const cours = [
    { matiere: "Mathématiques",  duree: "1h30", date: "Lundi 26 Mai",     prof: "M. Dupont",    eleve: "Thomas", montant: 45, bg: "#EFF6FF", dot: "#1D4ED8" },
    { matiere: "Physique-Chimie", duree: "2h",  date: "Mercredi 21 Mai",  prof: "Mme Bernard",  eleve: "Thomas", montant: 60, bg: "#F5F3FF", dot: "#7C3AED" },
    { matiere: "Mathématiques",  duree: "1h30", date: "Lundi 19 Mai",     prof: "M. Dupont",    eleve: "Thomas", montant: 45, bg: "#EFF6FF", dot: "#1D4ED8" },
    { matiere: "Mathématiques",  duree: "1h30", date: "Lundi 5 Mai",      prof: "M. Dupont",    eleve: "Thomas", montant: 45, bg: "#EFF6FF", dot: "#1D4ED8" },
  ];
  const totalNet = cours.reduce((s, c) => s + c.montant, 0);

  return (
    <div style={{ background: "#F8FAFC", borderRadius: 14, padding: 16, border: "1px solid #E2E8F0", fontSize: 12 }}>
      {/* Encart info */}
      <div style={{ background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: 11, padding: "9px 12px", marginBottom: 14, display: "flex", gap: 8, alignItems: "flex-start" }}>
        <Info style={{ width: 13, height: 13, color: "#2563EB", flexShrink: 0, marginTop: 1 }} />
        <p style={{ fontSize: 11, color: "#1E40AF", lineHeight: 1.6, margin: 0 }}>
          Les <span style={{ textDecoration: "line-through" }}>prix barrés</span> = tarif plein. Le montant <strong style={{ color: "#16A34A" }}>en vert</strong> = votre part après crédit d'impôt 50%.
        </p>
      </div>
      {/* Month nav */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <div style={{ width: 32, height: 32, border: "1px solid #E2E8F0", borderRadius: 9, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <ChevronLeft style={{ width: 14, height: 14, color: "#64748B" }} />
        </div>
        <p style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 18, color: "#0F172A", margin: 0, flex: 1, textAlign: "center" }}>Mai 2026</p>
        <div style={{ width: 32, height: 32, border: "1px solid #E2E8F0", borderRadius: 9, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", opacity: 0.35 }}>
          <ChevronRight style={{ width: 14, height: 14, color: "#64748B" }} />
        </div>
      </div>
      {/* Stats résumé */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 14 }}>
        {[
          { label: "Séances", value: `${cours.length}` },
          { label: "Durée totale", value: "6.0 h" },
          { label: "Votre part", value: `${totalNet} €`, green: true },
        ].map((s, i) => (
          <div key={i} style={{ background: i === 2 ? "#ECFDF5" : "#fff", border: "1px solid #E2E8F0", borderRadius: 9, padding: "8px 10px" }}>
            <p style={{ fontSize: 10, color: i === 2 ? "#065F46" : "#64748B", margin: "0 0 3px" }}>{s.label}</p>
            <p style={{ fontSize: 13, fontWeight: 700, color: i === 2 ? "#065F46" : "#0F172A", margin: 0 }}>{s.value}</p>
          </div>
        ))}
      </div>
      {/* Course list */}
      {cours.map((c, i) => (
        <div key={i} style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 11, padding: "11px 14px", display: "flex", alignItems: "center", gap: 12, marginBottom: i < cours.length - 1 ? 8 : 0 }}>
          <div style={{ width: 3, height: 46, borderRadius: 3, background: c.dot, flexShrink: 0 }} />
          <div style={{ width: 36, height: 36, borderRadius: 10, background: c.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <BookOpen style={{ width: 13, height: 13, color: c.dot }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 3 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: "#0F172A" }}>{c.matiere}</span>
              <span style={{ fontSize: 10, background: c.bg, color: c.dot, padding: "1px 7px", borderRadius: 5, fontWeight: 600 }}>{c.duree}</span>
            </div>
            <p style={{ fontSize: 10, color: "#64748B", margin: 0 }}>{c.date}</p>
            <p style={{ fontSize: 10, color: "#94A3B8", margin: "1px 0 0" }}>Prof : {c.prof} · Élève : {c.eleve}</p>
          </div>
          <div style={{ textAlign: "right", flexShrink: 0 }}>
            <p style={{ fontSize: 10, color: "#94A3B8", textDecoration: "line-through", margin: 0 }}>{c.montant * 2} €</p>
            <p style={{ fontSize: 13, fontWeight: 700, color: "#16A34A", marginTop: 2, marginBottom: 0 }}>{c.montant} €</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function MockLierProf() {
  return (
    <div style={{ background: "#F8FAFC", borderRadius: 14, padding: 16, border: "1px solid #E2E8F0", fontSize: 12 }}>
      {/* Étape 1 : trouver le code */}
      <div style={{ background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: 11, padding: "9px 12px", marginBottom: 14, display: "flex", gap: 8, alignItems: "flex-start" }}>
        <Info style={{ width: 13, height: 13, color: "#2563EB", flexShrink: 0, marginTop: 1 }} />
        <p style={{ fontSize: 11, color: "#1E40AF", lineHeight: 1.6, margin: 0 }}>
          Demandez à votre professeur son <strong>code d'invitation</strong> disponible dans son espace Colibri → Mon profil.
        </p>
      </div>
      {/* Widget form */}
      <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 12, padding: "16px 18px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          <KeyRound style={{ width: 13, height: 13, color: "#64748B" }} />
          <p style={{ fontWeight: 700, fontSize: 12, color: "#0F172A", margin: 0 }}>Lier un professeur</p>
        </div>
        <div style={{ display: "flex", gap: 7, marginBottom: 12 }}>
          <div style={{ flex: 1, padding: "9px 12px", border: "1px solid #E2E8F0", borderRadius: 9, fontFamily: "monospace", letterSpacing: "0.12em", fontSize: 12, color: "#0F172A", background: "#F8FAFC" }}>
            ABC-XY789
          </div>
          <div style={{ padding: "9px 14px", borderRadius: 9, background: "#2E6BEA", color: "#fff", fontSize: 11, fontWeight: 600, display: "flex", alignItems: "center", gap: 5 }}>
            <Plus style={{ width: 11, height: 11 }} /> Ajouter
          </div>
        </div>
        {/* Success */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#ECFDF5", borderRadius: 9, padding: "9px 12px" }}>
          <CheckCircle style={{ width: 13, height: 13, color: "#16A34A" }} />
          <span style={{ fontSize: 11, color: "#16A34A", fontWeight: 600 }}>Professeur ajouté avec succès !</span>
        </div>
      </div>
    </div>
  );
}

function MockValidations() {
  return (
    <div style={{ background: "#F8FAFC", borderRadius: 14, padding: 16, border: "1px solid #E2E8F0", fontSize: 12 }}>
      <p style={{ fontSize: 10, color: "#94A3B8", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 10 }}>Récapitulatifs mensuels</p>
      <div style={{ background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: 9, padding: "8px 11px", marginBottom: 12, fontSize: 11, color: "#1E40AF", lineHeight: 1.5 }}>
        Votre prof clôture son mois → vous validez → la facture est générée automatiquement.
      </div>
      <p style={{ fontSize: 10, fontWeight: 700, color: "#92400E", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 8 }}>En attente de validation (1)</p>
      <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 10, padding: "10px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, borderLeft: "3px solid #F59E0B" }}>
        <div>
          <p style={{ fontSize: 13, fontWeight: 700, color: "#0F172A", margin: "0 0 3px" }}>Avril 2026</p>
          <p style={{ fontSize: 10, color: "#64748B", margin: 0 }}>
            4 cours · 6h ·{" "}
            <span style={{ textDecoration: "line-through", color: "#94A3B8" }}>180 € brut</span>
            {" → "}
            <span style={{ color: "#16A34A", fontWeight: 600 }}>90 € votre part</span>
          </p>
        </div>
        <span style={{ fontSize: 10, background: "#2E6BEA", color: "#fff", padding: "4px 10px", borderRadius: 7, fontWeight: 600 }}>Voir & Valider</span>
      </div>
      <p style={{ fontSize: 10, fontWeight: 700, color: "#065F46", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 8 }}>Historique (1)</p>
      <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 10, padding: "10px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", borderLeft: "3px solid #22C55E" }}>
        <div>
          <p style={{ fontSize: 12, fontWeight: 600, color: "#0F172A", margin: "0 0 2px" }}>Mars 2026</p>
          <p style={{ fontSize: 10, color: "#64748B", margin: 0 }}>3 cours · 75 €</p>
        </div>
        <span style={{ fontSize: 10, background: "#ECFDF5", color: "#065F46", border: "1px solid #BBF7D0", padding: "3px 9px", borderRadius: 7, fontWeight: 600 }}>Validé ✓</span>
      </div>
    </div>
  );
}

function MockValidationModal() {
  return (
    <div style={{ background: "#F8FAFC", borderRadius: 14, padding: 16, border: "1px solid #E2E8F0", fontSize: 12 }}>
      <p style={{ fontSize: 10, color: "#94A3B8", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 10 }}>Modale — Valider Avril 2026</p>
      <div style={{ background: "#FFFBEB", border: "1px solid #FCD34D", borderRadius: 10, padding: "10px 12px", display: "flex", gap: 8, marginBottom: 12 }}>
        <AlertTriangle style={{ width: 13, height: 13, color: "#B45309", flexShrink: 0, marginTop: 1 }} />
        <p style={{ fontSize: 11, color: "#92400E", margin: 0, lineHeight: 1.5 }}>
          <strong>Action irréversible.</strong> Une fois validé, la facture est générée.
        </p>
      </div>
      {[
        { matiere: "Mathématiques", date: "Lundi 7 Avril", duree: "1h30", montant: 45 },
        { matiere: "Mathématiques", date: "Lundi 14 Avril", duree: "1h30", montant: 45 },
      ].map((c, i) => (
        <div key={i} style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 9, padding: "8px 12px", display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <div style={{ width: 2, height: 32, borderRadius: 2, background: "#1D4ED8", flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: "#0F172A", margin: 0 }}>{c.matiere} · {c.duree}</p>
            <p style={{ fontSize: 10, color: "#64748B", margin: 0 }}>{c.date}</p>
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ fontSize: 10, color: "#94A3B8", textDecoration: "line-through", margin: 0 }}>{c.montant * 2} €</p>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#16A34A", margin: 0 }}>{c.montant} €</p>
          </div>
        </div>
      ))}
      <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 9, padding: "10px 12px", marginTop: 8, marginBottom: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
          <span style={{ color: "#64748B" }}>Prix facturé</span>
          <span style={{ color: "#94A3B8", textDecoration: "line-through" }}>180 €</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
          <span style={{ color: "#64748B" }}>Crédit d'impôt (50%)</span>
          <span style={{ color: "#16A34A", fontWeight: 600 }}>−90 €</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 6, borderTop: "1px solid #E2E8F0" }}>
          <span style={{ fontWeight: 700, color: "#0F172A" }}>Votre part</span>
          <span style={{ fontWeight: 700, color: "#16A34A" }}>90 €</span>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 10 }}>
        <div style={{ width: 14, height: 14, border: "2px solid #2E6BEA", borderRadius: 3, background: "#2E6BEA", flexShrink: 0, marginTop: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <CheckCircle style={{ width: 9, height: 9, color: "#fff" }} />
        </div>
        <p style={{ fontSize: 11, color: "#374151", margin: 0, lineHeight: 1.5 }}>J'ai vérifié les séances et confirme leur exactitude.</p>
      </div>
      <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
        <div style={{ flex: 1, border: "1px solid #E2E8F0", borderRadius: 9, padding: "8px", textAlign: "center", fontSize: 11, color: "#64748B" }}>Annuler</div>
        <div style={{ flex: 1, border: "1.5px solid #FB923C", background: "#FFF7ED", borderRadius: 9, padding: "8px", textAlign: "center", fontSize: 11, color: "#EA580C", fontWeight: 600 }}>Contester</div>
      </div>
      <div style={{ background: "#2E6BEA", borderRadius: 9, padding: "9px", textAlign: "center", color: "#fff", fontWeight: 600, fontSize: 12 }}>
        Valider le mois
      </div>
    </div>
  );
}

function MockContestation() {
  return (
    <div style={{ background: "#F8FAFC", borderRadius: 14, padding: 16, border: "1px solid #E2E8F0", fontSize: 12 }}>
      <p style={{ fontSize: 10, color: "#94A3B8", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 10 }}>Contester Avril 2026</p>
      <div style={{ background: "#FFF7ED", border: "1px solid #FDBA74", borderRadius: 9, padding: "8px 11px", marginBottom: 12, fontSize: 11, color: "#92400E", lineHeight: 1.5 }}>
        Sélectionnez les cours qui vous semblent incorrects et expliquez le problème.
      </div>
      {[
        { matiere: "Mathématiques", date: "Lundi 7 Avril", duree: "1h30", conteste: false },
        { matiere: "Mathématiques", date: "Lundi 14 Avril", duree: "2h", conteste: true, raison: "La durée devrait être 1h30 et non 2h" },
      ].map((c, i) => (
        <div key={i} style={{ background: "#fff", border: `1px solid ${c.conteste ? "#FDBA74" : "#E2E8F0"}`, borderRadius: 9, padding: "10px 12px", marginBottom: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: c.conteste ? 8 : 0 }}>
            <div style={{ width: 2, height: 32, borderRadius: 2, background: "#1D4ED8", flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: "#0F172A", margin: 0 }}>{c.matiere} · {c.duree}</p>
              <p style={{ fontSize: 10, color: "#64748B", margin: 0 }}>{c.date}</p>
            </div>
            <div style={{ display: "flex", gap: 5 }}>
              <span style={{ fontSize: 10, padding: "3px 9px", borderRadius: 6, fontWeight: 600, background: c.conteste ? "#F8FAFC" : "#ECFDF5", color: c.conteste ? "#94A3B8" : "#065F46", border: `1px solid ${c.conteste ? "#E2E8F0" : "#BBF7D0"}` }}>OK</span>
              <span style={{ fontSize: 10, padding: "3px 9px", borderRadius: 6, fontWeight: 600, background: c.conteste ? "#FFF7ED" : "#F8FAFC", color: c.conteste ? "#EA580C" : "#94A3B8", border: `1px solid ${c.conteste ? "#FDBA74" : "#E2E8F0"}` }}>
                <Flag style={{ width: 9, height: 9, display: "inline", marginRight: 3 }} />Contester
              </span>
            </div>
          </div>
          {c.conteste && (
            <div style={{ background: "#FFF7ED", border: "1px solid #FDBA74", borderRadius: 7, padding: "7px 10px", fontSize: 11, color: "#92400E", fontStyle: "italic" }}>
              « {c.raison} »
            </div>
          )}
        </div>
      ))}
      <div style={{ background: "#EA580C", borderRadius: 9, padding: "9px", textAlign: "center", color: "#fff", fontWeight: 600, fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
        <Send style={{ width: 12, height: 12 }} /> Envoyer la contestation
      </div>
    </div>
  );
}

function MockApresValidation() {
  return (
    <div style={{ background: "#F8FAFC", borderRadius: 14, padding: 16, border: "1px solid #E2E8F0", fontSize: 12 }}>
      <p style={{ fontSize: 10, color: "#94A3B8", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 10 }}>Ce qui se passe ensuite</p>
      {/* Étapes */}
      {[
        { n: "1", label: "Facture générée automatiquement", done: true },
        { n: "2", label: "L'Urssaf vous envoie un email de notification", done: true },
        { n: "3", label: "48h pour contester auprès de l'Urssaf", done: false, highlight: true },
        { n: "4", label: "L'Urssaf prélève votre 50% (le reste : État)", done: false },
      ].map((step) => (
        <div key={step.n} style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 10 }}>
          <div style={{ width: 22, height: 22, borderRadius: "50%", background: step.done ? "#ECFDF5" : step.highlight ? "#FFFBEB" : "#F1F5F9", border: `1.5px solid ${step.done ? "#22C55E" : step.highlight ? "#FCD34D" : "#E2E8F0"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
            {step.done
              ? <CheckCircle style={{ width: 11, height: 11, color: "#22C55E" }} />
              : <span style={{ fontSize: 10, fontWeight: 700, color: step.highlight ? "#B45309" : "#94A3B8" }}>{step.n}</span>
            }
          </div>
          <p style={{ fontSize: 11, color: step.done ? "#0F172A" : step.highlight ? "#92400E" : "#64748B", margin: 0, lineHeight: 1.5, fontWeight: step.highlight ? 600 : 400 }}>{step.label}</p>
        </div>
      ))}
      {/* Facture preview */}
      <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 9, padding: "10px 14px", display: "flex", alignItems: "center", gap: 10, marginTop: 4 }}>
        <AlertCircle style={{ width: 13, height: 13, color: "#F59E0B", flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: "#0F172A", margin: 0 }}>Avril 2026 — nouvelle facture</p>
          <p style={{ fontSize: 10, color: "#64748B", margin: 0 }}>En attente de paiement Urssaf</p>
        </div>
        <div style={{ textAlign: "right" }}>
          <p style={{ fontSize: 10, color: "#94A3B8", textDecoration: "line-through", margin: 0 }}>180 €</p>
          <p style={{ fontSize: 12, fontWeight: 700, color: "#16A34A", margin: 0 }}>90 €</p>
        </div>
      </div>
    </div>
  );
}

function MockMecanisme() {
  return (
    <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #E2E8F0", overflow: "hidden", fontSize: 12 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
        {/* Sans Colibri */}
        <div style={{ padding: "14px 16px", borderRight: "1px solid #E2E8F0" }}>
          <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", color: "#94A3B8", marginBottom: 10 }}>Sans Colibri</p>
          <div style={{ fontSize: 11, marginBottom: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
              <span style={{ color: "#64748B" }}>Cours (non déclaré)</span>
              <span style={{ fontWeight: 600, color: "#0F172A" }}>30 €</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
              <span style={{ color: "#64748B" }}>Crédit d'impôt État</span>
              <span style={{ fontWeight: 600, color: "#CBD5E1" }}>0 €</span>
            </div>
            <div style={{ height: 1, background: "#E2E8F0", margin: "6px 0" }} />
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontWeight: 700, color: "#0F172A" }}>Vous payez</span>
              <span style={{ fontSize: 20, fontWeight: 900, color: "#0F172A" }}>30 €</span>
            </div>
          </div>
          <p style={{ fontSize: 10, color: "#94A3B8", lineHeight: 1.5 }}>Le prof touche 30 €, sans protection sociale ni cotisations.</p>
        </div>
        {/* Avec Colibri */}
        <div style={{ padding: "14px 16px", background: "#EFF6FF" }}>
          <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", color: "#2563EB", marginBottom: 10 }}>Avec Colibri</p>
          <div style={{ fontSize: 11, marginBottom: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
              <span style={{ color: "#64748B" }}>Facture déclarée</span>
              <span style={{ fontWeight: 600, color: "#0F172A" }}>60 €</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
              <span style={{ color: "#64748B" }}>Crédit d'impôt État</span>
              <span style={{ fontWeight: 600, color: "#2563EB" }}>− 30 €</span>
            </div>
            <div style={{ height: 1, background: "#BFDBFE", margin: "6px 0" }} />
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontWeight: 700, color: "#0F172A" }}>Vous payez</span>
              <span style={{ fontSize: 20, fontWeight: 900, color: "#0F172A" }}>30 €</span>
            </div>
          </div>
          <p style={{ fontSize: 10, fontWeight: 700, color: "#2563EB" }}>Le prof touche 46 € bruts.</p>
        </div>
      </div>
      <div style={{ padding: "10px 16px", background: "#DBEAFE", borderTop: "1px solid #BFDBFE", fontSize: 11, color: "#1E40AF" }}>
        <strong>Pas d'avance, pas d'attente.</strong> Le crédit d'impôt est déduit en temps réel au moment du prélèvement — vous ne payez que votre 50 %, c'est tout.
      </div>
    </div>
  );
}

function MockStats() {
  return (
    <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #E2E8F0", overflow: "hidden", fontSize: 12 }}>
      {[
        { stat: "+40 %", title: "Les profs sont mieux rémunérés.", body: "Après cotisations, le prof touche jusqu'à 40 % de plus qu'au marché non déclaré, grâce à une revalorisation dégressive selon le taux horaire." },
        { stat: "0 €", title: "De travail non déclaré.", body: "Le prof cotise, valide des trimestres et construit ses droits sociaux. Ce qui était de la précarité invisible devient une activité valorisante." },
        { stat: "∞", title: "Cours accessibles aux familles modestes.", body: "Les revenus des tarifs les plus élevés permettent à Colibri de revaloriser sans bénéfice les profs aux tarifs les plus bas." },
      ].map((item, i, arr) => (
        <div key={i} style={{ padding: "12px 16px", borderBottom: i < arr.length - 1 ? "1px solid #F1F5F9" : "none", display: "flex", gap: 12, alignItems: "flex-start" }}>
          <span style={{ fontSize: 20, fontWeight: 900, color: "#0052D4", flexShrink: 0, lineHeight: 1.2, minWidth: 44 }}>{item.stat}</span>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#0F172A", margin: "0 0 3px" }}>{item.title}</p>
            <p style={{ fontSize: 10, color: "#64748B", margin: 0, lineHeight: 1.5 }}>{item.body}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function MockParcours() {
  const steps = [
    { n: "01", title: "Colibri crée votre compte Urssaf.", body: "Dès votre inscription, nous créons votre espace Urssaf en votre nom. Zéro démarche de votre côté." },
    { n: "02", title: "Vous activez et renseignez votre IBAN.", body: "Vous recevez un email de l'Urssaf. Vous activez votre espace sur particulier.urssaf.fr et saisissez votre IBAN." },
    { n: "03", title: "Chaque mois, validation en 48h.", body: "Colibri émet la demande. Vous recevez une notification Urssaf. 48h pour valider ou contester — sans action, accepté automatiquement." },
    { n: "04", title: "L'Urssaf prélève uniquement vos 50%.", body: "L'Urssaf débite uniquement le reste à charge. L'État règle l'autre moitié directement." },
  ];
  return (
    <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #E2E8F0", overflow: "hidden", fontSize: 12 }}>
      {steps.map((step, i) => (
        <div key={step.n} style={{ display: "flex", gap: 12, padding: "12px 16px", borderBottom: i < steps.length - 1 ? "1px solid #F1F5F9" : "none" }}>
          <span style={{ fontSize: 18, fontWeight: 900, color: "#E2E8F0", flexShrink: 0, lineHeight: 1.2 }}>{step.n}</span>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#0F172A", margin: "0 0 2px" }}>{step.title}</p>
            <p style={{ fontSize: 10, color: "#64748B", margin: 0, lineHeight: 1.5 }}>{step.body}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Timeline échéancier parent ────────────────────────────────

function EcheancierTimelineParent() {
  const now   = new Date();
  const month = now.getMonth();
  const MOIS  = ["janvier","février","mars","avril","mai","juin","juillet","août","septembre","octobre","novembre","décembre"];
  const n  = MOIS[(month - 1 + 12) % 12];
  const n1 = MOIS[month];

  const steps = [
    {
      dates: `1er ${n} – 5 ${n1}`,
      title: "Votre professeur finalise son récap",
      desc: `Il clôture son récapitulatif de ${n} avant le 5 ${n1} à minuit. Si ce n'est pas fait à temps, Colibri génère automatiquement le récap avec tous les cours déclarés.`,
    },
    {
      dates: `5 – 7 ${n1}`,
      title: "Vous validez (ou c'est automatique)",
      desc: `Vous avez jusqu'au 7 ${n1} à minuit pour consulter le détail des séances et valider. Sans action de votre part, le récap est accepté automatiquement.`,
    },
    {
      dates: `8 ${n1}`,
      title: "Déclarations Urssaf automatiques",
      desc: `L'Urssaf traite les déclarations — aucune action de votre côté. Vous recevrez un email de notification de prélèvement.`,
    },
    {
      dates: `8 – 12 ${n1}`,
      title: "Prélèvement de votre part",
      desc: `L'Urssaf prélève uniquement votre 50%. L'État règle l'autre moitié directement au professeur — aucune avance, aucun remboursement à attendre.`,
    },
  ];

  return (
    <section>
      <div className="flex items-center gap-2 mb-3">
        <CalendarDays className="w-3.5 h-3.5 text-slate-400" />
        <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Calendrier mensuel</p>
      </div>
      <div className="bg-white border border-slate-100 rounded-xl overflow-hidden">
        {steps.map((step, i) => (
          <div
            key={i}
            className={`flex gap-3 px-4 py-3 ${i < steps.length - 1 ? "border-b border-slate-100" : ""}`}
          >
            <div className="flex flex-col items-center shrink-0 pt-0.5" style={{ width: 20 }}>
              <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border-2 bg-white border-slate-200 text-slate-400">
                {i + 1}
              </div>
              {i < steps.length - 1 && (
                <div className="w-px flex-1 mt-1 min-h-2 bg-slate-100" />
              )}
            </div>
            <div className="flex-1 min-w-0 pb-1">
              <div className="flex items-baseline gap-1.5 flex-wrap">
                <span className="text-sm font-semibold text-slate-600">{step.title}</span>
                <span className="text-[11px] font-mono text-slate-400">· {step.dates}</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed mt-1">{step.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Guide data ────────────────────────────────────────────────

type GuideItem = {
  title: string;
  desc: string;
  link?: string;
  linkLabel?: string;
  MockComponent?: React.ComponentType;
};

const GUIDES: {
  id: string;
  Icon: React.ElementType;
  title: string;
  desc: string;
  color: string;
  iconBg: string;
  accent: string;
  items: GuideItem[];
}[] = [
  {
    id: "utilisation",
    Icon: Laptop,
    title: "Utiliser Colibri",
    desc: "Tableau de bord, suivi des cours par mois, ajouter un professeur.",
    color: "text-blue-600",
    iconBg: "bg-blue-50",
    accent: "#2563eb",
    items: [
      {
        title: "Votre tableau de bord",
        desc: "La page d'accueil centralise tout le suivi. En haut, la carte élève affiche la matière suivie et le professeur associé. En dessous : deux widgets résument le mois en cours — nombre d'heures et montant total à payer (toujours affiché après déduction du crédit d'impôt de 50%). Les dernières factures apparaissent en bas avec leur statut. Si un récapitulatif mensuel attend votre validation, un bandeau jaune s'affiche en priorité en haut de page.",
        MockComponent: MockDashboard,
      },
      {
        title: "Suivre les cours mois par mois",
        desc: "La section « Cours » liste toutes les séances par date décroissante pour le mois sélectionné. Naviguez avec les flèches gauche/droite. Pour chaque cours : la matière avec sa durée en badge coloré, la date, le nom du professeur et de l'élève, puis les montants — le prix barré est le tarif plein facturé, le montant en vert est ce que vous payez réellement après crédit d'impôt. Un encadré récapitulatif au-dessus de la liste indique le nombre de séances, la durée totale et votre part pour le mois.",
        MockComponent: MockCours,
      },
      {
        title: "Lier un nouveau professeur",
        desc: "Pour ajouter un professeur à votre espace, demandez-lui son code d'invitation — il le trouve dans son espace Colibri, section « Mon profil ». Sur votre tableau de bord, cliquez sur « Lier un professeur ». Saisissez le code (format alphanumérique, ex : ABC-XY789) et cliquez « Ajouter ». Les cours de ce professeur apparaissent automatiquement dans vos sections Cours et Validations dès qu'il déclare une séance.",
        MockComponent: MockLierProf,
      },
    ],
  },
  {
    id: "validations",
    Icon: CheckSquare,
    title: "Valider un récapitulatif",
    desc: "Comment valider ou contester le bilan mensuel de votre professeur.",
    color: "text-emerald-600",
    iconBg: "bg-emerald-50",
    accent: "#059669",
    items: [
      {
        title: "La page Validations",
        desc: "En fin de mois, votre professeur clôture son récapitulatif. Une notification apparaît sur votre tableau de bord et dans la section « Validations ». Vous y retrouvez tous les mois en attente, avec le détail des séances et les montants votre part.",
        MockComponent: MockValidations,
      },
      {
        title: "Valider un mois",
        desc: "Cliquez sur « Voir & Valider » pour ouvrir la modale. Examinez chaque cours, vérifiez les dates et les durées. Cochez la case de confirmation puis cliquez « Valider le mois ». Cette action est irréversible — la facture est générée automatiquement.",
        MockComponent: MockValidationModal,
      },
      {
        title: "Contester un cours",
        desc: "Si un cours vous semble incorrect (date erronée, durée excessive…), cliquez « Contester » dans la modale. Vous pouvez signaler précisément les cours problématiques et expliquer la raison. L'équipe Colibri traitera la contestation avec votre professeur.",
        MockComponent: MockContestation,
      },
      {
        title: "Ce qui se passe après la validation",
        desc: "Une facture est créée automatiquement et l'Urssaf vous envoie un email de notification de prélèvement. Vous disposez de 48h pour contester directement auprès de l'Urssaf sur particulier.urssaf.fr. Passé ce délai, l'Urssaf prélève uniquement votre 50% — l'État règle l'autre moitié directement.",
        MockComponent: MockApresValidation,
      },
    ],
  },
  {
    id: "mecanisme",
    Icon: Landmark,
    title: "Le mécanisme financier",
    desc: "Pourquoi vous payez la même chose qu'avant, et à quoi sert l'argent de l'État.",
    color: "text-blue-700",
    iconBg: "bg-blue-50",
    accent: "#0052D4",
    items: [
      {
        title: "Vous payez la même chose qu'avant",
        desc: "Vous n'avancez rien et ne payez pas plus. Colibri facture le double du tarif habituel, et le crédit d'impôt de 50 % est déduit en temps réel par l'Urssaf au moment du prélèvement. En définitive, vous êtes prélevés exactement autant que ce que vous auriez payé sans déclarer — la différence : le prof est déclaré, cotise, et vous avez un justificatif fiscal.",
        MockComponent: MockMecanisme,
      },
      {
        title: "Votre parcours, de l'inscription au prélèvement",
        desc: "La mécanique se déroule en 4 étapes : Colibri crée votre espace Urssaf → vous l'activez et renseignez votre IBAN → chaque mois l'Urssaf vous notifie et vous avez 48h pour valider ou contester → l'Urssaf prélève uniquement vos 50%.",
        MockComponent: MockParcours,
      },
      {
        title: "À quoi sert l'argent de l'État ?",
        desc: "Le crédit d'impôt de 50 % versé par l'État ne génère aucun bénéfice pour Colibri. Il sert à trois choses : revaloriser les profs de +40 % par rapport au marché non déclaré tout en les faisant cotiser, éliminer le travail au noir, et rendre les cours accessibles aux familles qui ne pourraient pas se les permettre autrement.",
        MockComponent: MockStats,
      },
      {
        title: "Conditions et plafonds",
        desc: "Le crédit d'impôt est soumis à des plafonds légaux fixés par l'administration fiscale. Compte bancaire SEPA requis et au moins une déclaration de revenus en France. Pour toute question sur une facture ou les heures déclarées, contactez Colibri directement — l'Urssaf ne gère pas les litiges liés aux prestations.",
        link: "https://www.impots.gouv.fr/portail/particulier/emploi-domicile",
        linkLabel: "Consulter les plafonds en vigueur →",
      },
    ],
  },
];

const FAQ_ITEMS = [
  { q: "Que se passe-t-il si je ne valide pas le récapitulatif mensuel ?", a: "La période allouée à la validation parent sur Colibri est de 48 heures. Passé ce délai, le récapitulatif est considéré comme validé et la facture peut être générée." },
  { q: "Puis-je modifier un cours après avoir validé le récapitulatif ?", a: "Non. La validation est irréversible : elle clôture le mois et déclenche la génération de la facture. C'est pourquoi nous vous recommandons d'examiner attentivement chaque cours avant de confirmer, et d'utiliser la contestation si quelque chose vous paraît incorrect." },
  { q: "Comment fonctionne le prélèvement Urssaf ?", a: "Après votre validation dans Colibri, l'Urssaf vous envoie un email de notification. Vous avez 48h pour contester sur particulier.urssaf.fr. Passé ce délai, l'Urssaf prélève automatiquement votre 50% — l'État verse l'autre moitié directement au professeur. Aucune avance, aucun remboursement." },
  { q: "Suis-je remboursé après paiement avec l'avance immédiate ?", a: "Non, et c'est précisément l'avantage. La réduction est appliquée directement sur chaque prélèvement. Vous ne payez que 50%, l'Urssaf règle le reste directement au professeur. Pas de délai, pas d'avance de trésorerie de votre part." },
  { q: "Comment ajouter un deuxième professeur ?", a: "Demandez à ce professeur de vous communiquer son code d'invitation (dans son espace Colibri, section « Mon profil »). Allez dans « Mon profil » et saisissez le code. Ses cours apparaîtront dans votre espace dès qu'il les déclarera." },
  { q: "Plusieurs parents doivent-ils valider pour le même professeur ?", a: "Oui. Si plusieurs familles ont des élèves chez le même professeur, chaque famille valide séparément. La facture n'est émise qu'une fois que tous les parents ont validé. Cela garantit que tout le monde est d'accord avant le prélèvement." },
  { q: "Mes données personnelles sont-elles sécurisées ?", a: "Oui. Les données sont hébergées sur serveurs européens, conformes au RGPD. Vos informations bancaires sont gérées directement par l'Urssaf et ne transitent pas par Colibri." },
];

// ─── Guide detail page ─────────────────────────────────────────

function GuidePage({ guide, onBack }: { guide: typeof GUIDES[0]; onBack: () => void }) {
  return (
    <div>
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-700 transition-colors mb-10 group"
      >
        <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
        Centre d'aide
      </button>

      <div className="flex items-center gap-3 mb-1">
        <div className={`w-9 h-9 ${guide.iconBg} rounded-lg flex items-center justify-center shrink-0`}>
          <guide.Icon className={`w-5 h-5 ${guide.color}`} />
        </div>
        <h2 className="text-xl font-bold text-slate-900">{guide.title}</h2>
      </div>
      <p className="text-slate-400 text-sm mb-10 ml-12">{guide.desc}</p>

      <div className="border-t border-slate-100">
        {guide.items.map((item, i) => (
          <div key={i} className="border-b border-slate-100 py-8 grid grid-cols-[2rem_1fr] gap-6">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5"
              style={{ backgroundColor: guide.accent + "15", color: guide.accent }}
            >
              {i + 1}
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 mb-1.5">{item.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
              {item.MockComponent && (
                <div style={{ marginTop: 16, maxWidth: 560, margin: "16px auto 0" }}>
                  <item.MockComponent />
                </div>
              )}
              {item.link && (
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-1 text-xs font-semibold mt-3 hover:underline ${guide.color}`}
                >
                  <ExternalLink className="w-3 h-3" />{item.linkLabel}
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── FAQ item ──────────────────────────────────────────────────

function FaqItem({ item, open, onToggle }: { item: { q: string; a: string }; open: boolean; onToggle: () => void }) {
  return (
    <div className="border-b border-slate-100 last:border-0">
      <button onClick={onToggle} className="w-full flex items-start justify-between gap-6 py-4 text-left">
        <span className="text-sm font-medium text-slate-800 leading-snug">{item.q}</span>
        <ChevronDown className={`w-4 h-4 text-slate-300 shrink-0 mt-0.5 transition-transform duration-150 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <p className="text-sm text-slate-500 leading-relaxed pb-5 pr-8">{item.a}</p>}
    </div>
  );
}

// ─── Home view ─────────────────────────────────────────────────

function HomeView({ onSelectGuide }: { onSelectGuide: (id: string) => void }) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="space-y-12">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Centre d'aide</h1>
        <p className="text-sm text-slate-400 mt-1">Guides pratiques, questions fréquentes et contact direct.</p>
      </div>

      <EcheancierTimelineParent />

      <section>
        <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-4">Guides</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {GUIDES.map((guide) => (
            <button
              key={guide.id}
              onClick={() => onSelectGuide(guide.id)}
              className="group flex items-start gap-4 p-5 bg-white border border-slate-100 rounded-xl text-left hover:border-slate-200 transition-colors"
            >
              <div className={`w-9 h-9 ${guide.iconBg} rounded-lg flex items-center justify-center shrink-0 mt-0.5`}>
                <guide.Icon className={`w-4 h-4 ${guide.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-slate-900 mb-0.5">{guide.title}</p>
                <p className="text-xs text-slate-400 leading-relaxed">{guide.desc}</p>
              </div>
              <ChevronLeft className="w-4 h-4 text-slate-300 shrink-0 rotate-180 mt-1 group-hover:text-slate-500 transition-colors" />
            </button>
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center gap-2 mb-4">
          <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Questions fréquentes</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-x-16">
          {FAQ_ITEMS.map((item, i) => (
            <FaqItem key={i} item={item} open={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} />
          ))}
        </div>
      </section>

      <section className="pb-8">
        <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-5">Contact</p>
        <div className="flex flex-col sm:flex-row gap-10">
          <div>
            <p className="text-sm font-semibold text-slate-900 mb-1">Support par email</p>
            <a href="mailto:contact@colibri-soutien.fr" className="text-sm text-primary font-medium hover:underline">
              contact@colibri-soutien.fr
            </a>
            <p className="text-xs text-slate-400 mt-1">Réponse sous 24h ouvrées</p>
          </div>
          <div className="w-px bg-slate-100 hidden sm:block" />
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
              <p className="text-sm font-semibold text-slate-900">Problème urgent</p>
            </div>
            <a href="tel:+33769316936" className="text-sm font-semibold text-red-600 hover:underline">07 69 31 69 36</a>
            <p className="text-xs text-slate-400 mt-1">Accès impossible, erreur critique, facture bloquée</p>
          </div>
        </div>
      </section>
    </div>
  );
}

// ─── Main ──────────────────────────────────────────────────────

export function ParentAide() {
  const [activeGuideId, setActiveGuideId] = useState<string | null>(null);
  const activeGuide = GUIDES.find((g) => g.id === activeGuideId) ?? null;

  return (
    <div>
      {activeGuide
        ? <GuidePage guide={activeGuide} onBack={() => setActiveGuideId(null)} />
        : <HomeView onSelectGuide={setActiveGuideId} />
      }
    </div>
  );
}
