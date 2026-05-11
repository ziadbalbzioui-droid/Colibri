import { useState } from "react";
import { ChevronDown, ChevronLeft, Laptop, FileText, HelpCircle, AlertTriangle, ExternalLink, Clock, CreditCard, CheckCircle, AlertCircle, BookOpen, CheckSquare, Landmark, TrendingUp, HeartHandshake, Flag, Send, ArrowRight } from "lucide-react";
import { Link } from "react-router";

// ─── Mock components ───────────────────────────────────────────

function MockDashboard() {
  return (
    <div style={{ background: "#F8FAFC", borderRadius: 14, padding: 16, border: "1px solid #E2E8F0", fontSize: 12 }}>
      <div style={{ marginBottom: 12 }}>
        <p style={{ fontSize: 10, color: "#94A3B8", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 6 }}>Tableau de bord</p>
        <p style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 20, color: "#0F172A", margin: 0, lineHeight: 1.1 }}>
          Bonjour, Marie<br />
          <span style={{ color: "#94A3B8", fontSize: 16 }}>Tableau de bord de suivi</span>
        </p>
      </div>
      <div style={{ background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: 10, padding: "8px 12px", marginBottom: 10, fontSize: 11, color: "#1E40AF", lineHeight: 1.5 }}>
        Tous les montants = <strong>votre part après crédit d'impôt de 50%</strong>. L'État règle l'autre moitié.
      </div>
      <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 12, padding: "12px 14px", display: "flex", alignItems: "center", gap: 12, marginBottom: 8, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, background: "#1D4ED8" }} />
        <div style={{ width: 36, height: 36, background: "#EFF6FF", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, color: "#1D4ED8", flexShrink: 0 }}>T</div>
        <div style={{ flex: 1 }}>
          <p style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 14, color: "#0F172A", margin: 0 }}>Thomas</p>
          <p style={{ fontSize: 10, color: "#64748B", margin: 0 }}>Terminale · Prof : M. Dupont</p>
        </div>
        <span style={{ fontSize: 10, background: "#EFF6FF", color: "#1D4ED8", padding: "2px 8px", borderRadius: 999, fontWeight: 700 }}>Maths</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
        <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 10, padding: "10px 12px" }}>
          <div style={{ width: 24, height: 24, background: "#F0FDF4", borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 6 }}>
            <Clock style={{ width: 11, height: 11, color: "#16A34A" }} />
          </div>
          <p style={{ fontSize: 10, color: "#64748B", margin: 0 }}>Heures ce mois</p>
          <p style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 18, color: "#0F172A", margin: "2px 0 0" }}>6.0h</p>
          <p style={{ fontSize: 10, color: "#64748B", margin: 0 }}>4 séances</p>
        </div>
        <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 10, padding: "10px 12px" }}>
          <div style={{ width: 24, height: 24, background: "#FFFBEB", borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 6 }}>
            <CreditCard style={{ width: 11, height: 11, color: "#D97706" }} />
          </div>
          <p style={{ fontSize: 10, color: "#64748B", margin: 0 }}>Montant en attente</p>
          <p style={{ fontSize: 10, color: "#94A3B8", textDecoration: "line-through", margin: "2px 0 0" }}>120 € brut</p>
          <p style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 18, color: "#16A34A", margin: "1px 0 0" }}>60 €</p>
          <p style={{ fontSize: 10, color: "#16A34A", margin: 0 }}>après crédit d'impôt</p>
        </div>
      </div>
      <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 10, padding: "10px 14px", display: "flex", alignItems: "center", gap: 10 }}>
        <AlertCircle style={{ width: 13, height: 13, color: "#F59E0B", flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: "#0F172A", margin: 0 }}>Avril 2026</p>
          <p style={{ fontSize: 10, color: "#64748B", margin: 0 }}>4 cours</p>
        </div>
        <div style={{ textAlign: "right" }}>
          <p style={{ fontSize: 10, color: "#94A3B8", textDecoration: "line-through", margin: 0 }}>120 €</p>
          <p style={{ fontSize: 12, fontWeight: 700, color: "#16A34A", margin: 0 }}>60 €</p>
        </div>
        <span style={{ fontSize: 10, background: "#2E6BEA", color: "#fff", padding: "3px 8px", borderRadius: 7, fontWeight: 600 }}>Payer</span>
      </div>
    </div>
  );
}

function MockCours() {
  return (
    <div style={{ background: "#F8FAFC", borderRadius: 14, padding: 16, border: "1px solid #E2E8F0", fontSize: 12 }}>
      <p style={{ fontSize: 10, color: "#94A3B8", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 10 }}>Suivi des séances</p>
      <div style={{ background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: 9, padding: "8px 11px", marginBottom: 10, fontSize: 11, color: "#1E40AF", lineHeight: 1.5 }}>
        Les <span style={{ textDecoration: "line-through" }}>prix barrés</span> = tarif plein. Le montant <strong style={{ color: "#16A34A" }}>vert</strong> = votre part après crédit d'impôt 50%.
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <div style={{ width: 26, height: 26, border: "1px solid #E2E8F0", borderRadius: 7, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <ChevronLeft style={{ width: 12, height: 12, color: "#64748B" }} />
        </div>
        <p style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 15, color: "#0F172A", margin: 0, flex: 1, textAlign: "center" }}>Mai 2026</p>
        <div style={{ width: 26, height: 26, border: "1px solid #E2E8F0", borderRadius: 7, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", opacity: 0.35 }}>
          <ChevronLeft style={{ width: 12, height: 12, color: "#64748B", transform: "rotate(180deg)" }} />
        </div>
      </div>
      {[
        { matiere: "Mathématiques", date: "Lundi 5 Mai", duree: "1h30", montant: 45 },
        { matiere: "Mathématiques", date: "Lundi 12 Mai", duree: "1h30", montant: 45 },
      ].map((c, i) => (
        <div key={i} style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 10, padding: "10px 12px", display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <div style={{ width: 3, height: 36, borderRadius: 3, background: "#1D4ED8", flexShrink: 0 }} />
          <div style={{ width: 28, height: 28, background: "#EFF6FF", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <BookOpen style={{ width: 11, height: 11, color: "#1D4ED8" }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 2 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: "#0F172A" }}>{c.matiere}</span>
              <span style={{ fontSize: 10, background: "#EFF6FF", color: "#1D4ED8", padding: "1px 5px", borderRadius: 5, fontWeight: 600 }}>{c.duree}</span>
            </div>
            <p style={{ fontSize: 10, color: "#64748B", margin: 0 }}>{c.date}</p>
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ fontSize: 10, color: "#94A3B8", textDecoration: "line-through", margin: 0 }}>{c.montant * 2} €</p>
            <p style={{ fontSize: 12, fontWeight: 700, color: "#16A34A", margin: 0 }}>{c.montant} €</p>
          </div>
        </div>
      ))}
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
        desc: "La page d'accueil résume l'activité de votre enfant : heures ce mois, montant en attente après crédit d'impôt, dernières factures. Tous les montants affichés sont votre part nette — après déduction du crédit d'impôt de 50%.",
        MockComponent: MockDashboard,
      },
      {
        title: "Suivre les cours par mois",
        desc: "Dans la section « Cours », naviguez mois par mois avec les flèches. Chaque cours détaille la matière, la durée, le professeur et votre part après crédit d'impôt. Le prix barré = tarif plein, le montant vert = ce que vous payez réellement.",
        MockComponent: MockCours,
      },
      {
        title: "Ajouter un professeur",
        desc: "Demandez à votre professeur son code d'invitation (disponible dans son espace Colibri, section « Mon profil »). Dans « Mon profil », saisissez le code et cliquez « Ajouter ». Les cours apparaissent automatiquement dans votre espace.",
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
  {
    id: "factures",
    Icon: FileText,
    title: "Vos factures",
    desc: "Comprendre et payer vos factures en toute sérénité.",
    color: "text-purple-600",
    iconBg: "bg-purple-50",
    accent: "#7c3aed",
    items: [
      {
        title: "Quand est générée une facture ?",
        desc: "Une facture est créée automatiquement après que vous avez validé le récapitulatif mensuel dans la section « Validations ». Elle récapitule tous les cours du mois avec le montant brut et votre part nette après crédit d'impôt.",
      },
      {
        title: "Comprendre le montant",
        desc: "Le montant brut = total des cours au tarif plein. Vous ne payez que 50% — la différence est couverte par l'Urssaf directement. Vous n'avancez rien : la réduction est immédiate et s'applique sur chaque facture.",
      },
      {
        title: "Comment se passe le paiement ?",
        desc: "Une fois la facture générée, l'Urssaf vous envoie un email vous informant du montant qui va être prélevé. Vous avez 48 heures pour contester directement auprès de l'Urssaf sur particulier.urssaf.fr si quelque chose vous semble incorrect. Passé ce délai, l'Urssaf prélève automatiquement votre 50% sur votre compte bancaire.",
      },
      {
        title: "Une facture semble incorrecte ?",
        desc: "La facture correspond au récapitulatif que vous avez validé dans Colibri. Si vous avez un doute avant de valider, utilisez la contestation dans Colibri. Si la facture a déjà été émise et prélevée, contactez notre support à contact@colibri-soutien.fr.",
      },
    ],
  },
];

const FAQ_ITEMS = [
  { q: "Que se passe-t-il si je ne valide pas le récapitulatif mensuel ?", a: "Le mois reste en statut « en attente » dans la section Validations. Aucune facture ne peut être générée. Si vous avez une question sur un cours, contactez votre professeur avant de valider — ou contestez directement depuis la modale de validation." },
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
