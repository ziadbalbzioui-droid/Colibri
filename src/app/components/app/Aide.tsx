import { useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { useAuth } from "../../../lib/auth";
import { ChevronDown, ChevronLeft, Laptop, Store, Sparkles, CalendarClock, TrendingUp, HelpCircle, Mail, Phone, ExternalLink, AlertTriangle, X, BookOpen, Plus, Users } from "lucide-react";

// ─── Mock style system (matching exact app styles) ─────────────

const MS = {
  card: { background: "#fff", border: "1px solid #E2E8F0", borderRadius: 16, boxShadow: "0 1px 4px rgba(15,23,42,.07)" } as React.CSSProperties,
  modal: { background: "#fff", borderRadius: 22, boxShadow: "0 4px 32px rgba(15,23,42,.18)", overflow: "hidden" } as React.CSSProperties,
  input: { width: "100%", padding: "10px 14px", borderRadius: 12, border: "1px solid #E2E8F0", background: "#F1F5F9", fontSize: 13, color: "#0F172A", boxSizing: "border-box" as const },
  label: { display: "block", fontSize: 12, fontWeight: 600, color: "#334155", marginBottom: 5 } as React.CSSProperties,
  btnPrimary: { display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: 12, background: "#2E6BEA", color: "#fff", fontSize: 13, fontWeight: 600 } as React.CSSProperties,
  btnGhost: { display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: 12, background: "transparent", color: "#334155", fontSize: 13, fontWeight: 600, border: "1px solid #E2E8F0" } as React.CSSProperties,
  badge: (bg: string, color: string): React.CSSProperties => ({ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 8px", borderRadius: 999, fontSize: 11, fontWeight: 700, background: bg, color }),
  serif: { fontFamily: "'Fraunces', Georgia, serif" } as React.CSSProperties,
  eyebrow: { fontSize: 11, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase" as const, color: "#64748B" } as React.CSSProperties,
};

function MockWrap({ children, caption, maxWidth = 480 }: { children: React.ReactNode; caption: string; maxWidth?: number }) {
  return (
    <div className="my-6 pointer-events-none select-none">
      <div style={{ ...MS.card, borderRadius: 18, maxWidth, margin: "0 auto" }}>{children}</div>
      <p className="text-xs text-slate-400 mt-2 text-center italic">{caption}</p>
    </div>
  );
}

function FieldHints({ hints }: { hints: { label: string; desc: string }[] }) {
  return (
    <div className="mt-4 space-y-2">
      {hints.map((h, i) => (
        <div key={i} className="flex gap-3 text-sm">
          <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5">{i + 1}</span>
          <span className="text-slate-500"><span className="font-semibold text-slate-700">{h.label}</span> — {h.desc}</span>
        </div>
      ))}
    </div>
  );
}

// ── Mockup : formulaire Ajouter un élève ──
function MockAjouterEleve() {
  return (
    <MockWrap caption="Fenêtre « Ajouter un élève » — s'ouvre depuis la page Élèves via le bouton en haut à droite">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "22px 24px 0" }}>
        <h2 style={{ fontWeight: 700, fontSize: 16, color: "#0F172A" }}>Ajouter un élève</h2>
        <X className="w-4 h-4 text-slate-300" />
      </div>
      <div style={{ padding: "20px 24px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
        {/* Nom */}
        <div>
          <label style={MS.label}>Nom complet ①</label>
          <div style={{ ...MS.input, color: "#94A3B8" }}>Jean Dupont</div>
        </div>
        {/* Niveau + Tarif */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <label style={MS.label}>Niveau ②</label>
            <div style={{ ...MS.input, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>Terminale S</span><span style={{ color: "#94A3B8" }}>▾</span>
            </div>
          </div>
          <div>
            <label style={MS.label}>Tarif / heure (€) ③</label>
            <div style={MS.input}>25</div>
          </div>
        </div>
        {/* Matières */}
        <div>
          <label style={MS.label}>Matières ④</label>
          <div style={{ ...MS.input, color: "#94A3B8" }}>Chercher une matière...</div>
          <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
            <span style={MS.badge("#EFF6FF", "#1E3A8A")}>Mathématiques &nbsp;<X className="w-2.5 h-2.5" /></span>
          </div>
        </div>
        {/* Boutons */}
        <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
          <div style={{ ...MS.btnGhost, flex: 1, justifyContent: "center" }}>Annuler</div>
          <div style={{ ...MS.btnPrimary, flex: 1, justifyContent: "center" }}>Ajouter</div>
        </div>
      </div>
    </MockWrap>
  );
}

// ── Mockup : formulaire Déclarer un cours ──
function MockDeclarerCours() {
  return (
    <MockWrap caption="Fenêtre « Ajouter un cours » — s'ouvre depuis la page Cours via le bouton en haut à droite">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "22px 24px 0" }}>
        <h2 style={{ fontWeight: 700, fontSize: 16, color: "#0F172A" }}>Ajouter un cours</h2>
        <X className="w-4 h-4 text-slate-300" />
      </div>
      <div style={{ padding: "20px 24px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
        {/* Élève */}
        <div>
          <label style={MS.label}>Élève ①</label>
          <div style={{ ...MS.input, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>Emma L.</span><span style={{ color: "#94A3B8" }}>▾</span>
          </div>
        </div>
        {/* Matière */}
        <div>
          <label style={MS.label}>Matière ②</label>
          <div style={MS.input}>Mathématiques</div>
        </div>
        {/* Date + Durée */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <label style={MS.label}>Date ③</label>
            <div style={{ ...MS.input, color: "#94A3B8" }}>15/01/2025</div>
          </div>
          <div>
            <label style={MS.label}>Durée (minutes) ④</label>
            <div style={MS.input}>90</div>
            <p style={{ fontSize: 11, color: "#64748B", marginTop: 4 }}>= 1h30min</p>
          </div>
        </div>
        {/* Tarif */}
        <div>
          <label style={MS.label}>Tarif / heure (€) ⑤</label>
          <div style={MS.input}>30</div>
        </div>
        {/* Résumé financier */}
        <div style={{ background: "#EFF6FF", borderRadius: 10, padding: "12px 14px", border: "1px solid #C7D8FB" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 13, color: "#1E3A8A" }}>Prix famille (30€/h × 1h30) ⑥</span>
            <span style={{ fontWeight: 700, color: "#1E3A8A" }}>45,00 €</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 12, color: "#059669" }}>Pour vous (+28%, après impôts et cotisations) ⑦</span>
            <span style={{ fontWeight: 700, fontSize: 13, color: "#059669" }}>57,60 €</span>
          </div>
        </div>
        {/* Boutons */}
        <div style={{ display: "flex", gap: 10 }}>
          <div style={{ ...MS.btnGhost, flex: 1, justifyContent: "center" }}>Annuler</div>
          <div style={{ ...MS.btnPrimary, flex: 1, justifyContent: "center" }}>Ajouter</div>
        </div>
      </div>
    </MockWrap>
  );
}

// ── Mockup : cartes mensuelles + modal de clôture ──
function MockFinirMois() {
  return (
    <div className="my-6 pointer-events-none select-none space-y-4">
      {/* Carte mois en cours */}
      <MockWrap maxWidth={560} caption="Étape 1 — Sur la page Cours, chaque mois affiche son total. Cliquez « Finir le mois » pour lancer la clôture.">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14, padding: 20 }}>
          {/* Carte mois clôturé */}
          <div style={{ ...MS.card, padding: 20, background: "#F8FAFC" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span style={{ color: "#64748B", fontSize: 13 }}>Décembre 2024</span>
              <span style={MS.badge("#ECFDF5", "#065F46")}>Validé</span>
            </div>
            <div style={{ ...MS.serif, fontSize: 30, color: "#0F172A" }}>1 240 €</div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
              <span style={{ fontSize: 12, color: "#64748B", display: "flex", alignItems: "center", gap: 4 }}>
                <BookOpen className="w-3 h-3" /> 8 cours
              </span>
            </div>
          </div>
          {/* Carte mois en cours — avec bouton */}
          <div style={{ ...MS.card, padding: 20, background: "#EFF6FF", borderColor: "#C7D8FB" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span style={{ color: "#64748B", fontSize: 13 }}>Janvier 2025</span>
              <span style={MS.badge("#EFF6FF", "#1E3A8A")}>En cours</span>
            </div>
            <div style={{ ...MS.serif, fontSize: 30, color: "#0F172A" }}>750 €</div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
              <span style={{ fontSize: 12, color: "#64748B", display: "flex", alignItems: "center", gap: 4 }}>
                <BookOpen className="w-3 h-3" /> 5 cours
              </span>
              <div style={{ ...MS.btnGhost, fontSize: 11, padding: "5px 10px", background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,.08)", fontWeight: 700 }}>
                Finir le mois
              </div>
            </div>
          </div>
        </div>
      </MockWrap>

      {/* Modal récap */}
      <MockWrap maxWidth={500} caption="Étape 2 — Le récapitulatif affiche tous les cours du mois par élève avec le détail famille / pour vous. Vérifiez, puis cliquez « Valider le mois ».">
        <div style={{ padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
            <div>
              <h3 style={{ fontWeight: 700, fontSize: 16, color: "#0F172A" }}>Récapitulatif — Janvier 2025</h3>
              <p style={{ color: "#64748B", fontSize: 13, marginTop: 2 }}>5 cours · 6h30</p>
            </div>
            <X className="w-4 h-4 text-slate-300" />
          </div>
          {/* Élève 1 */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontWeight: 600, fontSize: 13, color: "#0F172A" }}>Emma L.</span>
              <span style={{ fontSize: 13, color: "#64748B" }}>3h · 90€ famille · 115€ pour vous, après impôts et cotisations</span>
            </div>
            {[
              { d: "15 jan.", m: "Maths", dur: "1h", famille: "30 €", tarifH: "30€/h", net: "38 €" },
              { d: "22 jan.", m: "Maths", dur: "2h", famille: "60 €", tarifH: "30€/h", net: "77 €" },
            ].map((c, i) => (
              <div key={i} style={{ padding: "8px 12px", background: "#F1F5F9", borderRadius: 10, marginBottom: 4 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                  <span style={{ fontSize: 13, color: "#64748B" }}>{c.d} · {c.m} · {c.dur}</span>
                  <span style={{ fontSize: 13, fontWeight: 500, color: "#0F172A" }}>{c.famille} famille</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 11, color: "#94A3B8" }}>{c.tarifH}</span>
                  <span style={{ fontSize: 11, color: "#16A34A" }}>{c.net} pour vous, après impôts et cotisations</span>
                </div>
              </div>
            ))}
          </div>
          {/* Élève 2 */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontWeight: 600, fontSize: 13, color: "#0F172A" }}>Lucas M.</span>
              <span style={{ fontSize: 13, color: "#64748B" }}>3h30 · 87,50€ famille · 108€ pour vous, après impôts et cotisations</span>
            </div>
            {[
              { d: "18 jan.", m: "Physique", dur: "1h30", famille: "37,50 €", tarifH: "25€/h", net: "46 €" },
              { d: "25 jan.", m: "Physique", dur: "2h", famille: "50 €", tarifH: "25€/h", net: "62 €" },
            ].map((c, i) => (
              <div key={i} style={{ padding: "8px 12px", background: "#F1F5F9", borderRadius: 10, marginBottom: 4 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                  <span style={{ fontSize: 13, color: "#64748B" }}>{c.d} · {c.m} · {c.dur}</span>
                  <span style={{ fontSize: 13, fontWeight: 500, color: "#0F172A" }}>{c.famille} famille</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 11, color: "#94A3B8" }}>{c.tarifH}</span>
                  <span style={{ fontSize: 11, color: "#16A34A" }}>{c.net} pour vous, après impôts et cotisations</span>
                </div>
              </div>
            ))}
          </div>
          {/* Total + bouton */}
          <div style={{ paddingTop: 16, borderTop: "1px solid #E2E8F0", marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 13, color: "#64748B" }}>Total famille</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#64748B" }}>177,50 €</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontWeight: 700, color: "#0F172A" }}>Pour vous, après impôts et cotisations</span>
              <span style={{ fontWeight: 700, color: "#16A34A" }}>223 €</span>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ ...MS.btnGhost, flex: 1, justifyContent: "center" }}>Annuler</div>
            <div style={{ ...MS.btnPrimary, flex: 1, justifyContent: "center" }}>Valider le mois</div>
          </div>
        </div>
      </MockWrap>
    </div>
  );
}

// ── Mockup : Dashboard stats ──
function MockDashboard() {
  return (
    <MockWrap maxWidth={580} caption="Dashboard — revenu net calculé automatiquement à partir de vos cours déclarés, commission Colibri incluse">
      <div style={{ padding: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 20 }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: "#0F172A" }}>Dashboard</h1>
            <p style={{ color: "#64748B", fontSize: 13, marginTop: 2 }}>Janvier 2025</p>
          </div>
          <div style={{ ...MS.btnPrimary, padding: "7px 12px", fontSize: 12 }}>
            <Plus className="w-3.5 h-3.5" /> Cours
          </div>
        </div>
        <div style={{ background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: 16, padding: 20, marginBottom: 16 }}>
          <p style={MS.eyebrow}>Revenu après impôts et cotisations</p>
          <div style={{ ...MS.serif, fontSize: 48, letterSpacing: "-.02em", color: "#0F172A", margin: "8px 0 4px" }}>978 €</div>
          <p style={{ fontSize: 12, color: "#94A3B8" }}>Sur 10h de cours déclarés ce mois · commission Colibri incluse</p>
        </div>
        {/* Journal récent */}
        <div style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 14, padding: 16 }}>
          <p style={{ ...MS.eyebrow, marginBottom: 10 }}>Journal récent</p>
          {[
            { nom: "Emma L.", mat: "Maths", tarif: "30€/h · 2h", famille: "60€ famille", net: "77€ pour vous" },
            { nom: "Lucas M.", mat: "Physique", tarif: "25€/h · 1h30", famille: "37,50€ famille", net: "46€ pour vous" },
          ].map((c, i, arr) => (
            <div key={i} style={{ paddingBottom: i < arr.length - 1 ? 10 : 0, marginBottom: i < arr.length - 1 ? 10 : 0, borderBottom: i < arr.length - 1 ? "1px dashed #E2E8F0" : "none" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#0F172A" }}>{c.nom} <span style={{ fontWeight: 400, color: "#94A3B8" }}>· {c.mat}</span></span>
                <span style={{ fontSize: 13, color: "#64748B" }}>{c.famille}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 2 }}>
                <span style={{ fontSize: 11, color: "#64748B" }}>{c.tarif}</span>
                <span style={{ fontSize: 11, color: "#16A34A" }}>{c.net}</span>
              </div>
            </div>
          ))}
          <p style={{ fontSize: 11, color: "#64748B", marginTop: 12 }}>2 séances récentes — 97,50€ famille · <span style={{ color: "#16A34A" }}>123€ pour vous, après impôts et cotisations</span></p>
        </div>
      </div>
    </MockWrap>
  );
}

// ── Mockup : profil IBAN ──
function MockProfil() {
  return (
    <MockWrap caption="Page « Mon profil » — renseignez SIRET et IBAN pour activer la facturation et les paiements">
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", padding: "24px 24px 20px", borderBottom: "1px solid #E2E8F0" }}>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: "#0F172A" }}>Mon profil</h1>
        </div>
        <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
          {/* SIRET */}
          <div>
            <label style={MS.label}>Numéro SIRET ①</label>
            <div style={{ ...MS.input, color: "#94A3B8" }}>123 456 789 00012</div>
            <p style={{ fontSize: 11, color: "#94A3B8", marginTop: 4 }}>14 chiffres — reçu par courrier après inscription URSSAF</p>
          </div>
          {/* IBAN — highlighted */}
          <div>
            <label style={MS.label}>IBAN ②</label>
            <div style={{ ...MS.input, background: "#fff", border: "2px solid #2E6BEA", boxShadow: "0 0 0 4px rgba(46,107,234,.12)" }}>
              FR76 3000 6000 0112 3456 7890 189
            </div>
            <p style={{ fontSize: 11, color: "#2E6BEA", fontWeight: 600, marginTop: 4 }}>
              Requis pour générer des factures et recevoir vos paiements
            </p>
          </div>
          {/* Save */}
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 4 }}>
            <div style={{ ...MS.btnPrimary }}>Enregistrer</div>
          </div>
        </div>
      </div>
    </MockWrap>
  );
}

// ─── PAPS Mockups ─────────────────────────────────────────────

function MockPapsAnnonces() {
  return (
    <MockWrap maxWidth={600} caption="Page PAPS — liste des annonces du réseau avec filtres matière et niveau">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", borderBottom: "1px solid #E2E8F0" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
            <span style={{ fontWeight: 700, fontSize: 16, color: "#0F172A" }}>PAPS</span>
            <span style={{ background: "#FEF3C7", color: "#92400E", padding: "2px 8px", borderRadius: 999, fontSize: 11, fontWeight: 700 }}>Mineurs</span>
          </div>
          <p style={{ fontSize: 12, color: "#64748B" }}>Transmets un élève à un collègue de confiance dans ton réseau.</p>
        </div>
        <div style={{ ...MS.btnPrimary, fontSize: 12, padding: "7px 12px", gap: 5 }}>
          <Plus className="w-3 h-3" /> Poster une annonce
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, padding: "10px 20px", borderBottom: "1px solid #F1F5F9" }}>
        {["Toutes les matières ▾", "Tous niveaux ▾"].map((f, i) => (
          <div key={i} style={{ padding: "6px 12px", background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 10, fontSize: 12, color: "#64748B" }}>{f}</div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, padding: 16 }}>
        {/* Annonce 1 — bouton postuler */}
        <div style={{ borderRadius: 16, border: "1px solid #E2E8F0", overflow: "hidden", background: "#fff" }}>
          <div style={{ height: 4, background: "#3B82F6" }} />
          <div style={{ padding: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
              <div>
                <span style={{ background: "#EFF6FF", color: "#1D4ED8", padding: "3px 10px", borderRadius: 8, fontSize: 11, fontWeight: 700 }}>Mathématiques</span>
                <p style={{ fontSize: 12, color: "#64748B", marginTop: 5 }}>Terminale S</p>
              </div>
              <p style={{ fontSize: 20, fontWeight: 800, color: "#0F172A", lineHeight: 1 }}>30<span style={{ fontSize: 12, fontWeight: 400, color: "#94A3B8" }}>€/h</span></p>
            </div>
            <p style={{ fontSize: 11, color: "#94A3B8", marginBottom: 3 }}>📍 Paris 15e</p>
            <p style={{ fontSize: 11, color: "#94A3B8", marginBottom: 10 }}>🕐 Mercredi 16h · 1x/semaine</p>
            <p style={{ fontSize: 11, color: "#64748B", background: "#F8FAFC", borderRadius: 10, padding: "8px 10px", marginBottom: 12 }}>Élève sérieuse, difficultés en analyse fonctionnelle...</p>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 10, borderTop: "1px solid #F1F5F9" }}>
              <div>
                <p style={{ fontSize: 12, fontWeight: 600, color: "#0F172A" }}>Thomas M.</p>
                <p style={{ fontSize: 11, color: "#94A3B8" }}>il y a 2j</p>
              </div>
              <div style={{ background: "#0F172A", color: "#fff", padding: "6px 12px", borderRadius: 10, fontSize: 11, fontWeight: 600 }}>Je suis dispo</div>
            </div>
          </div>
        </div>
        {/* Annonce 2 — déjà postulé */}
        <div style={{ borderRadius: 16, border: "1px solid #E2E8F0", overflow: "hidden", background: "#fff" }}>
          <div style={{ height: 4, background: "#A855F7" }} />
          <div style={{ padding: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
              <div>
                <span style={{ background: "#F5F3FF", color: "#7C3AED", padding: "3px 10px", borderRadius: 8, fontSize: 11, fontWeight: 700 }}>Physique-Chimie</span>
                <p style={{ fontSize: 12, color: "#64748B", marginTop: 5 }}>1ère S</p>
              </div>
              <p style={{ fontSize: 20, fontWeight: 800, color: "#0F172A", lineHeight: 1 }}>28<span style={{ fontSize: 12, fontWeight: 400, color: "#94A3B8" }}>€/h</span></p>
            </div>
            <p style={{ fontSize: 11, color: "#94A3B8", marginBottom: 3 }}>📍 Paris 6e</p>
            <p style={{ fontSize: 11, color: "#94A3B8", marginBottom: 10 }}>🕐 Jeudi soir · 2x/mois</p>
            <p style={{ fontSize: 11, color: "#64748B", background: "#F8FAFC", borderRadius: 10, padding: "8px 10px", marginBottom: 12 }}>Besoin d'un renfort avant le bac blanc...</p>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 10, borderTop: "1px solid #F1F5F9" }}>
              <div>
                <p style={{ fontSize: 12, fontWeight: 600, color: "#0F172A" }}>Sophie L.</p>
                <p style={{ fontSize: 11, color: "#94A3B8" }}>aujourd'hui</p>
              </div>
              <div style={{ background: "#ECFDF5", color: "#065F46", padding: "6px 12px", borderRadius: 10, fontSize: 11, fontWeight: 600 }}>✓ Demande transmise</div>
            </div>
          </div>
        </div>
      </div>
    </MockWrap>
  );
}

function MockPapsPostForm() {
  return (
    <MockWrap maxWidth={480} caption="Formulaire « Poster une annonce » — décrivez l'élève que vous cédez">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px 0" }}>
        <h2 style={{ fontWeight: 700, fontSize: 16, color: "#0F172A" }}>Poster une annonce</h2>
        <X className="w-4 h-4 text-slate-300" />
      </div>
      <div style={{ padding: "16px 24px 24px", display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <label style={{ ...MS.label, textTransform: "uppercase" as const, letterSpacing: ".06em", fontSize: 10 }}>Matière ①</label>
            <div style={{ ...MS.input, display: "flex", justifyContent: "space-between" }}>Mathématiques <span style={{ color: "#94A3B8" }}>▾</span></div>
          </div>
          <div>
            <label style={{ ...MS.label, textTransform: "uppercase" as const, letterSpacing: ".06em", fontSize: 10 }}>Niveau élève ②</label>
            <div style={{ ...MS.input, display: "flex", justifyContent: "space-between" }}>Terminale S <span style={{ color: "#94A3B8" }}>▾</span></div>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <label style={{ ...MS.label, textTransform: "uppercase" as const, letterSpacing: ".06em", fontSize: 10 }}>Prix (€/h) ③</label>
            <div style={MS.input}>30</div>
          </div>
          <div>
            <label style={{ ...MS.label, textTransform: "uppercase" as const, letterSpacing: ".06em", fontSize: 10 }}>Fréquence ④</label>
            <div style={{ ...MS.input, color: "#94A3B8" }}>1x/semaine…</div>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <label style={{ ...MS.label, textTransform: "uppercase" as const, letterSpacing: ".06em", fontSize: 10 }}>Horaires ⑤</label>
            <div style={{ ...MS.input, color: "#94A3B8" }}>Mercredi 16h…</div>
          </div>
          <div>
            <label style={{ ...MS.label, textTransform: "uppercase" as const, letterSpacing: ".06em", fontSize: 10 }}>Localisation ⑥</label>
            <div style={{ ...MS.input, color: "#94A3B8" }}>Paris 15e…</div>
          </div>
        </div>
        <div>
          <label style={{ ...MS.label, textTransform: "uppercase" as const, letterSpacing: ".06em", fontSize: 10 }}>Description de l'élève ⑦</label>
          <div style={{ ...MS.input, minHeight: 52, color: "#94A3B8", alignItems: "flex-start", display: "flex" }}>Niveau, difficultés, objectifs…</div>
        </div>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 14px", background: "#FEF2F2", borderRadius: 10, border: "1px solid #FECACA" }}>
          <div style={{ width: 14, height: 14, border: "1.5px solid #DC2626", borderRadius: 3, marginTop: 1, flexShrink: 0 }} />
          <div>
            <p style={{ fontSize: 12, fontWeight: 600, color: "#B91C1C" }}>Marquer comme urgent ⑧</p>
            <p style={{ fontSize: 11, color: "#EF4444", marginTop: 2 }}>L'annonce apparaîtra en haut avec un badge rouge</p>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <div style={{ ...MS.btnGhost, flex: 1, justifyContent: "center" }}>Annuler</div>
          <div style={{ ...MS.btnPrimary, flex: 1, justifyContent: "center" }}>Publier l'annonce</div>
        </div>
      </div>
    </MockWrap>
  );
}

function MockPapsCandidatures() {
  return (
    <MockWrap maxWidth={560} caption="Section « Mes annonces » — cliquez sur une annonce pour voir les candidatures et les coordonnées des collègues">
      <div style={{ padding: "14px 20px", borderBottom: "1px solid #E2E8F0", display: "flex", alignItems: "center", gap: 8 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: "#0F172A", textTransform: "uppercase" as const, letterSpacing: ".1em" }}>Mes annonces</p>
        <span style={MS.badge("#EFF6FF", "#2E6BEA")}>1</span>
      </div>
      {/* Annonce row */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 20px", background: "#F8FAFC", borderBottom: "1px solid #F1F5F9" }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: "#EFF6FF", color: "#1D4ED8", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 900, flexShrink: 0 }}>MA</div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <p style={{ fontWeight: 600, fontSize: 13, color: "#0F172A" }}>Mathématiques</p>
            <span style={{ color: "#94A3B8" }}>·</span>
            <p style={{ fontSize: 13, color: "#64748B" }}>Terminale S</p>
          </div>
          <p style={{ fontSize: 11, color: "#94A3B8", marginTop: 2 }}>Paris 15e · 30€/h</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 5, ...MS.badge("#ECFDF5", "#065F46"), padding: "5px 10px" }}>
          <Users className="w-3 h-3" /> 2 candidatures
        </div>
      </div>
      {/* Candidature item */}
      <div style={{ padding: "14px 20px" }}>
        <div style={{ background: "#fff", borderRadius: 12, padding: 14, border: "1px solid #E2E8F0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,rgba(46,107,234,.3),rgba(46,107,234,.1))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#2E6BEA", flexShrink: 0 }}>JD</div>
            <div>
              <p style={{ fontWeight: 600, fontSize: 13, color: "#0F172A" }}>Jean Dupont</p>
              <p style={{ fontSize: 11, color: "#94A3B8" }}>5 mai</p>
            </div>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 6, marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5, ...MS.badge("#EFF6FF", "#1D4ED8"), padding: "5px 10px" }}>
              <Mail className="w-3 h-3" /> jean.dupont@example.com
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 5, ...MS.badge("#ECFDF5", "#065F46"), padding: "5px 10px" }}>
              <Phone className="w-3 h-3" /> 06 12 34 56 78
            </div>
          </div>
          <div style={{ fontSize: 12, color: "#64748B", background: "#F8FAFC", borderRadius: 10, padding: "8px 12px", borderLeft: "3px solid rgba(46,107,234,.3)", fontStyle: "italic" as const }}>
            « Bonjour, je suis disponible le mercredi soir et le week-end. 2 ans d'expérience en soutien Terminale. »
          </div>
        </div>
      </div>
    </MockWrap>
  );
}

// ─── Rich content components for guides ───────────────────────

function ReassuranceBox({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: 12, padding: "14px 16px", marginTop: 14 }}>
      <p style={{ fontWeight: 700, fontSize: 13, color: "#166534", marginBottom: 6 }}>✓ {title}</p>
      <div style={{ fontSize: 13, color: "#166534", lineHeight: 1.65 }}>{children}</div>
    </div>
  );
}

function TermsList({ terms }: { terms: { term: string; def: string }[] }) {
  return (
    <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 10 }}>
      {terms.map((t, i) => (
        <div key={i} style={{ display: "grid", gridTemplateColumns: "160px 1fr", gap: 12, padding: "10px 14px", background: "#F8FAFC", borderRadius: 10, border: "1px solid #E2E8F0", alignItems: "start" }}>
          <span style={{ fontWeight: 700, fontSize: 13, color: "#0F172A" }}>{t.term}</span>
          <span style={{ fontSize: 13, color: "#64748B", lineHeight: 1.55 }}>{t.def}</span>
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
  MockComponent?: () => React.ReactElement;
  fieldHints?: { label: string; desc: string }[];
  extraContent?: React.ReactNode;
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
    id: "plateforme",
    Icon: Laptop,
    title: "Utilisation de la plateforme",
    desc: "Élèves, cours, factures, dashboard — tout en main en 5 minutes.",
    color: "text-blue-600",
    iconBg: "bg-blue-50",
    accent: "#2563eb",
    items: [
      {
        title: "Ajoutez vos élèves",
        desc: "Depuis la page « Élèves », cliquez « Ajouter un élève » en haut à droite. Un formulaire s'ouvre — remplissez les informations ci-dessous.",
        MockComponent: MockAjouterEleve,
        fieldHints: [
          { label: "Nom complet", desc: "Prénom et nom de l'élève, tel qu'il apparaîtra sur les factures." },
          { label: "Niveau", desc: "Niveau scolaire actuel (6ème → Licence). Aide à contextualiser les cours." },
          { label: "Tarif / heure", desc: "Taux horaire en euros. Il sera utilisé automatiquement pour calculer le montant de chaque cours." },
          { label: "Matières", desc: "Tapez les premières lettres pour filtrer, puis cliquez sur la matière. Vous pouvez en ajouter plusieurs." },
        ],
      },
      {
        title: "Déclarez vos cours",
        desc: "Après chaque séance, rendez-vous sur la page « Cours » et cliquez « Déclarer un cours ». Remplissez le formulaire suivant.",
        MockComponent: MockDeclarerCours,
        fieldHints: [
          { label: "Élève", desc: "Sélectionnez l'élève dans la liste déroulante. Le tarif et la matière sont pré-remplis depuis son profil." },
          { label: "Matière", desc: "Vérifiez ou modifiez la matière enseignée lors de cette séance." },
          { label: "Date", desc: "Date à laquelle le cours a eu lieu (ou est planifié)." },
          { label: "Durée (minutes)", desc: "Entrez la durée en minutes. Colibri convertit automatiquement : 90 = 1h30min." },
          { label: "Tarif / heure", desc: "Pré-rempli depuis le profil élève. Modifiez si ce cours a un tarif exceptionnel." },
          { label: "Prix famille", desc: "Calculé automatiquement : tarif × (durée ÷ 60). Mis à jour en temps réel." },
          { label: "Pour vous (après impôts et cotisations)", desc: "Ce que vous toucherez réellement. La plus-value Colibri est calculée pour être déjà nette de cotisations URSSAF et d'impôt sur le revenu — aucune déduction supplémentaire." },
        ],
      },
      {
        title: "Clôturez le mois",
        desc: "En fin de mois, clôturez le récapitulatif pour verrouiller les cours et notifier les familles. Cette action est irréversible — un IBAN renseigné est obligatoire.",
        MockComponent: MockFinirMois,
        fieldHints: [
          { label: "Étape 1 — Finir le mois", desc: "Sur chaque carte mensuelle en statut « En cours », cliquez « Finir le mois ». Possible uniquement après le dernier jour du mois." },
          { label: "Étape 2 — Vérifier le récap", desc: "Le récapitulatif liste tous les cours du mois par élève. Vérifiez les totaux avant de valider." },
          { label: "Étape 3 — Valider", desc: "Cliquez « Valider le mois » puis confirmez. Les parents reçoivent une demande de validation des heures et le mois passe en statut « Validé »." },
        ],
      },
      {
        title: "Suivez vos finances",
        desc: "Le dashboard affiche en temps réel votre revenu net du mois. Ce montant se calcule automatiquement à chaque cours enregistré, en tenant compte de la plus-value Colibri — déjà nette de cotisations et d'impôts.",
        MockComponent: MockDashboard,
        fieldHints: [
          { label: "Revenu après impôts et cotisations", desc: "Total de vos gains pour le mois, après application de la plus-value Colibri. C'est le montant qui arrivera sur votre compte bancaire." },
          { label: "Plus-value Colibri", desc: "Pourcentage ajouté à chaque cours selon votre tarif horaire (plus le tarif est abordable, plus la subvention est forte). Il est calculé pour être déjà net de cotisations URSSAF et d'impôt sur le revenu." },
        ],
      },
      {
        title: "PAPS — Consulter les annonces du réseau",
        desc: "Réservé aux diplômés de Mines de Paris. Dans la section PAPS, vous voyez toutes les annonces de cession d'élèves publiées par d'autres profs du réseau. Chaque carte indique la matière, le niveau, le prix, la fréquence et la localisation.",
        MockComponent: MockPapsAnnonces,
        fieldHints: [
          { label: "Filtres matière / niveau", desc: "Affinez les annonces affichées selon votre domaine et les niveaux que vous souhaitez enseigner." },
          { label: "Carte d'annonce", desc: "Chaque annonce montre la matière (code couleur), le prix horaire, la localisation, les heures hebdomadaires et une description courte." },
          { label: "Je suis dispo", desc: "Envoyez votre candidature en un clic. Le prof qui a posté l'annonce reçoit vos coordonnées directement." },
        ],
      },
      {
        title: "PAPS — Poster votre propre annonce",
        desc: "Vous souhaitez céder un ou plusieurs élèves à un confrère du réseau ? Cliquez sur « Poster une annonce » en haut à droite pour remplir le formulaire.",
        MockComponent: MockPapsPostForm,
        fieldHints: [
          { label: "Matière", desc: "La matière concernée par la cession (Maths, Physique-Chimie, etc.)." },
          { label: "Niveau", desc: "Le niveau scolaire de l'élève à céder (Seconde, Terminale, CPGE…)." },
          { label: "Prix (€/h)", desc: "Le tarif horaire pratiqué avec cet élève, pour que le repreneur puisse s'organiser." },
          { label: "Fréquence", desc: "Fréquence des cours — par exemple « 1h/semaine » ou « 2h toutes les 2 semaines »." },
          { label: "Horaires", desc: "Les créneaux disponibles convenus avec l'élève." },
          { label: "Localisation", desc: "Quartier ou ville pour que les candidats sachent si c'est accessible." },
          { label: "Description", desc: "Quelques lignes sur l'élève, sa progression, ses besoins — pour aider le repreneur à se projeter." },
          { label: "Urgent", desc: "Cochez si vous partez bientôt et avez besoin d'un repreneur rapidement. L'annonce sera mise en avant." },
        ],
      },
      {
        title: "PAPS — Gérer vos candidatures reçues",
        desc: "Quand un prof postule à l'une de vos annonces, vous le voyez apparaître dans la section « Mes annonces ». Ses coordonnées sont affichées directement — prenez contact et organisez la passation.",
        MockComponent: MockPapsCandidatures,
        fieldHints: [
          { label: "Nom du candidat", desc: "Prénom et nom du prof qui a postulé à votre annonce." },
          { label: "Email & téléphone", desc: "Coordonnées directes pour le contacter sans passer par la plateforme." },
          { label: "Message", desc: "Le message laissé par le candidat pour se présenter ou préciser sa disponibilité." },
        ],
      },
      {
        title: "Renseignez SIRET et IBAN",
        desc: "Sans SIRET, vous ne pouvez pas ajouter d'élève ni déclarer de cours. Sans IBAN, vous ne pouvez pas clôturer un mois. Rendez-vous dans « Mon profil » pour les renseigner.",
        MockComponent: MockProfil,
        fieldHints: [
          { label: "SIRET", desc: "Numéro à 14 chiffres reçu par courrier de l'URSSAF (1 à 4 semaines après inscription). Obligatoire pour créer des élèves." },
          { label: "IBAN", desc: "Votre IBAN bancaire. Obligatoire pour clôturer un mois et recevoir vos paiements via Colibri." },
        ],
      },
    ],
  },
  {
    id: "auto-entrepreneur",
    Icon: Store,
    title: "Créer son statut auto-entrepreneur",
    desc: "Gratuit, 100% en ligne, 15 minutes. Tout ce qu'il faut savoir.",
    color: "text-indigo-600",
    iconBg: "bg-indigo-50",
    accent: "#4338ca",
    items: [
      { title: "S'inscrire sur l'URSSAF", desc: "Rendez-vous sur autoentrepreneur.urssaf.fr → « Créer mon auto-entreprise ». Démarche gratuite, 100% en ligne.", link: "https://www.autoentrepreneur.urssaf.fr", linkLabel: "autoentrepreneur.urssaf.fr" },
      { title: "Choisir l'activité", desc: "Sélectionnez « Enseignement ». Le code APE attribué sera 8559B — Autres enseignements (cours particuliers)." },
      { title: "Domiciliation", desc: "Domiciliez à votre adresse personnelle. Aucun local commercial n'est requis pour les cours particuliers à domicile." },
      { title: "Recevoir le SIRET", desc: "Délai : 1 à 4 semaines, par courrier. Renseignez-le dans Colibri dès réception pour débloquer la facturation." },
      { title: "Agrément SAP (optionnel)", desc: "Pour que vos élèves bénéficient du crédit d'impôt 50%, déclarez votre activité SAP auprès de la DREETS.", link: "https://nova.emploi.gouv.fr", linkLabel: "nova.emploi.gouv.fr" },
      { title: "Déclarer le CA chaque période", desc: "Sur votre espace URSSAF, déclarez les revenus encaissés. Taux : 21,2% du CA brut. Déclarez 0 si rien encaissé — c'est obligatoire." },
    ],
  },
  {
    id: "acre",
    Icon: Sparkles,
    title: "Demande ACRE",
    desc: "Divisez vos charges par 2 la première année. À demander sous 45 jours.",
    color: "text-amber-600",
    iconBg: "bg-amber-50",
    accent: "#d97706",
    items: [
      { title: "Qu'est-ce que l'ACRE ?", desc: "Exonération partielle de charges sociales pendant les 4 premiers trimestres. Cotisations de 21,2% → ~10,6% la première année." },
      { title: "Qui est éligible ?", desc: "Tous les créateurs d'auto-entreprise depuis 2020, sans condition. Il suffit de ne pas en avoir bénéficié dans les 3 dernières années." },
      { title: "Comment faire la demande ?", desc: "Espace URSSAF → Mon compte → Demande d'ACRE. À soumettre dans les 45 jours suivant la déclaration de création.", link: "https://www.autoentrepreneur.urssaf.fr", linkLabel: "Espace URSSAF →" },
      { title: "Économie concrète", desc: "Sur 2 000 €/mois de CA : ~212 €/mois économisés, soit ~2 500 € sur l'année." },
      { title: "Après l'ACRE", desc: "L'exonération s'arrête au 5ème trimestre civil. Anticipez le retour au taux plein (21,2%) en ajustant vos tarifs dès le départ." },
    ],
  },
  {
    id: "urssaf",
    Icon: CalendarClock,
    title: "Déclaration URSSAF",
    desc: "Quand, quoi et comment déclarer — sans risquer les pénalités.",
    color: "text-purple-600",
    iconBg: "bg-purple-50",
    accent: "#7c3aed",
    items: [
      { title: "Choisir sa fréquence", desc: "Trimestrielle par défaut. Optez pour le mensuel (recommandé) à la création ou en début d'année civile." },
      { title: "Délais mensuels", desc: "Les revenus du mois M sont à déclarer avant le dernier jour du mois M+1. Ex : mars → avant le 30 avril." },
      { title: "Délais trimestriels", desc: "T1 → 30 avril / T2 → 31 juillet / T3 → 31 octobre / T4 → 31 janvier. Dates fermes." },
      { title: "Quoi déclarer", desc: "Le CA encaissé (sommes reçues sur votre compte). Si une famille n'a pas encore payé, ne déclarez pas. Si CA = 0, déclarez quand même 0.", link: "https://www.autoentrepreneur.urssaf.fr", linkLabel: "Mon espace URSSAF →" },
      { title: "Taux applicable", desc: "21,2% du CA brut pour les prestations de services. +2,2% si vous optez pour le versement libératoire de l'IR." },
      { title: "Pénalités de retard", desc: "Retard → +5% des cotisations dues. Au-delà de 30 jours → +10%. Activez les rappels email dans votre espace URSSAF." },
    ],
  },
  {
    id: "finance",
    Icon: TrendingUp,
    title: "Guide financier",
    desc: "Ce que vous gagnez vraiment, et pourquoi vous n'avez rien à craindre — APL, bourses, impôts.",
    color: "text-emerald-600",
    iconBg: "bg-emerald-50",
    accent: "#059669",
    items: [
      {
        title: "Ce que vous gagnez vraiment",
        desc: "Sur chaque euro encaissé, vous reversez 21,2% à l'URSSAF (cotisations sociales). Le reste est à vous. Votre dashboard Colibri calcule tout ça automatiquement.",
        extraContent: (
          <>
            <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
              {[
                { label: "500 € encaissés", net: "447 €" },
                { label: "1 000 € encaissés", net: "894 €", highlight: true },
                { label: "2 000 € encaissés", net: "1 788 €" },
              ].map((s, i) => (
                <div key={i} style={{ background: s.highlight ? "#F0FDF4" : "#F8FAFC", border: `1px solid ${s.highlight ? "#BBF7D0" : "#E2E8F0"}`, borderRadius: 12, padding: "16px", textAlign: "center" as const }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", marginBottom: 10, textTransform: "uppercase" as const, letterSpacing: ".06em" }}>{s.label}</p>
                  <p style={{ fontSize: 22, fontWeight: 800, color: s.highlight ? "#166534" : "#0F172A" }}>{s.net}</p>
                  <p style={{ fontSize: 11, color: "#94A3B8", marginTop: 4 }}>net en poche</p>
                </div>
              ))}
            </div>
            <p style={{ fontSize: 11, color: "#94A3B8", marginTop: 8 }}>Calculs avec ACRE (taux ~10,6%, 1ère année). Sans ACRE : cotisations à 21,2% — ex. 1 000 € → 788 € net.</p>
          </>
        ),
      },
      {
        title: "APL : vous les gardez",
        desc: "C'est la première question que tout le monde se pose. La réponse est simple.",
        extraContent: (
          <ReassuranceBox title="Vous gardez vos APL. Sans aucun changement.">
            Dans le contexte de cours de soutien occasionnels — quelques centaines d'euros par mois — il n'y a <strong>aucun impact sur vos APL. Pas même de quelques euros.</strong> Pour que vos revenus personnels affectent vos APL, il faudrait gagner des dizaines de milliers d'euros par an. Ce n'est absolument pas le contexte ici. <strong>Donnez des cours l'esprit totalement tranquille.</strong>
          </ReassuranceBox>
        ),
      },
      {
        title: "Bourse CROUS : rien ne change",
        desc: "Votre bourse repose sur les revenus de vos parents, pas les vôtres.",
        extraContent: (
          <ReassuranceBox title="Votre bourse reste exactement la même.">
            Les bourses sur critères sociaux sont calculées <strong>uniquement sur les revenus de vos parents</strong>. Vos revenus personnels de cours particuliers n'entrent absolument pas dans le calcul. Vous pouvez donner des cours, encaisser de l'argent, et <strong>continuer à percevoir votre bourse comme avant</strong> — sans aucune démarche supplémentaire.
          </ReassuranceBox>
        ),
      },
      {
        title: "Foyer fiscal : restez avec vos parents jusqu'à 25 ans",
        desc: "Tant que vous êtes étudiant, vous pouvez rester rattaché au foyer fiscal de vos parents. C'est presque toujours le meilleur choix.",
        extraContent: (
          <ReassuranceBox title="Double avantage : vos parents et vous y gagnez.">
            Vos parents conservent une <strong>demi-part fiscale</strong> qui réduit leur impôt. De votre côté, vous bénéficiez d'un <strong>abattement de 50%</strong> sur vos revenus avant calcul de l'impôt — en pratique, avec quelques milliers d'euros de CA par an, <strong>vous ne payez rien en impôt sur le revenu</strong>.
          </ReassuranceBox>
        ),
      },
      {
        title: "Impôt sur le revenu : probablement 0 €",
        desc: "L'État applique automatiquement un abattement de 50% sur vos revenus. Vous n'êtes imposé que sur la moitié de ce que vous encaissez.",
        extraContent: (
          <>
            <div style={{ marginTop: 14, padding: "14px 16px", background: "#F8FAFC", borderRadius: 12, border: "1px solid #E2E8F0", fontSize: 13, color: "#64748B", lineHeight: 1.65 }}>
              <strong style={{ color: "#0F172A" }}>Exemple :</strong> 5 000 € encaissés sur l'année → 2 500 € imposables (après abattement 50%). En dessous de ~11 300 € de revenus imposables, le taux est <strong style={{ color: "#166534" }}>0%</strong>. La plupart des étudiants qui donnent des cours <strong style={{ color: "#0F172A" }}>ne paient aucun impôt sur le revenu</strong>.
            </div>
            <ReassuranceBox title="Pas de mauvaise surprise en fin d'année">
              Si vous voulez lisser vos dépenses, vous pouvez opter pour le <strong>versement libératoire</strong> : vous payez l'IR chaque mois (+2,2% du CA) en même temps que vos cotisations URSSAF. Plus de régularisation, plus de surprise.
            </ReassuranceBox>
          </>
        ),
      },
      {
        title: "L'ACRE : la 1ère année à moitié prix",
        desc: "En le demandant dès la création (dans les 45 jours), vos cotisations URSSAF sont divisées par 2 pendant toute votre première année.",
        extraContent: (
          <ReassuranceBox title="Comment l'obtenir en 2 minutes">
            Espace URSSAF → Mon compte → Demande d'ACRE. Gratuit, accordé automatiquement. Sur 1 000 € de CA, vous payez <strong>106 € de cotisations au lieu de 212 €</strong>. À faire <strong>dans les 45 jours</strong> après votre déclaration de création — après, c'est définitivement perdu.
          </ReassuranceBox>
        ),
      },
    ],
  },
];

const FAQ_ITEMS = [
  { q: "La création d'une auto-entreprise me sort-elle du foyer fiscal de mes parents ?", a: "Non. Vos parents peuvent continuer à vous rattacher à leur foyer fiscal jusqu'à vos 25 ans, quel que soit votre chiffre d'affaires — c'est un choix déclaratif. Pour plus d'informations, consultez notre guide financier." },
  { q: "Comment créer mon auto-entreprise ?", a: "La démarche est 100% en ligne, gratuite, et prend environ 15 minutes sur autoentrepreneur.urssaf.fr. Consultez notre guide pas-à-pas dans la section Guides ci-dessus — il couvre chaque écran, chaque champ à remplir et les erreurs courantes à éviter." },
  { q: "Est-ce que Colibri va gérer ma déclaration URSSAF à ma place ?", a: "C'est une fonctionnalité que nous développons activement. À terme, Colibri vous permettra de déclarer votre chiffre d'affaires à l'URSSAF directement depuis la plateforme, sans avoir à vous connecter sur leur site. En attendant, notre guide Déclaration URSSAF détaille la démarche étape par étape." },
  { q: "Comment suis-je rémunéré — fréquence et origine du virement ?", a: "Vous recevez un virement bancaire mensuel émis par Colibri, une fois le mois clôturé et les heures validées par les familles. Le montant correspond à votre revenu net calculé par la plateforme, déjà tenu compte des charges URSSAF. Sur votre relevé bancaire, le virement apparaît depuis le compte Colibri." },
  { q: "Est-ce que j'ai un bulletin de salaire ?", a: "Non — vous n'êtes pas salarié de Colibri, mais auto-entrepreneur. Il n'y a pas de bulletin de salaire. Colibri génère automatiquement une facture pour chaque mois clôturé, accessible dans la section Factures. Ces factures font office de justificatif de revenus (banque, location, etc.)." },
  { q: "Est-ce que ça cotise pour ma retraite ?", a: "Oui. Une partie de vos cotisations URSSAF (~22% du CA) est reversée à l'assurance vieillesse. Vous accumulez des trimestres de retraite au fil de votre activité. À titre indicatif, un CA d'environ 1 800 € sur l'année valide un trimestre — ce qui s'ajoute à ceux de vos futurs emplois salariés." },
  { q: "Quel avantage par rapport au travail au black ?", a: "Plusieurs avantages concrets : vous gagnez bien plus qu'au black grâce au système de Crédit d'Impôt, vous êtes couvert en cas de contrôle fiscal, vous accumulez des droits sociaux (retraite, sécurité sociale) et vous pouvez justifier ces revenus pour une location ou un crédit. Le travail non déclaré expose en plus à des sanctions pénales et redressements." },
  { q: "Je paye des impôts et des charges — c'est vraiment plus intéressant quand même ?", a: "Oui, et c'est précisément ce que Colibri calcule pour vous. Colibri vous promet une augmentatio allant jusqu'à 40% APRES IMPOTS ET COTISATIONS." },
  { q: "L'ACRE est-elle accordée automatiquement ?", a: "Non. Vous devez la demander vous-même à l'URSSAF dans les 45 jours suivant votre date de début d'activité. Passé ce délai, l'exonération est définitivement perdue — il n'existe aucun recours. Consultez notre guide ACRE dans la section Guides : il vous explique comment remplir le formulaire et l'envoyer via la messagerie URSSAF en moins de 10 minutes." },
  { q: "Dois-je déclarer à l'URSSAF même si je n'ai rien encaissé ?", a: "Oui, la déclaration est obligatoire même si votre chiffre d'affaires est 0. L'omettre entraîne une majoration automatique de 5% des cotisations dues (puis 10% au-delà de 30 jours supplémentaires). Déclarer 0 prend 30 secondes et vous met à l'abri de toute pénalité." },
  { q: "Comment fonctionne le parrainage Colibri ?", a: "Chaque professeur dispose d'un code unique dans la section Parrainage. Partagez-le à un collègue qui souhaite rejoindre Colibri — dès qu'il atteint 10 heures de cours déclarées sur la plateforme, vous recevez automatiquement 50 € sur votre prochain virement." },
  { q: "Puis-je cumuler l'auto-entreprise avec un job étudiant salarié en parallèle ?", a: "Oui, sans aucune restriction. Le statut auto-entrepreneur est parfaitement cumulable avec un contrat étudiant, un stage rémunéré ou tout autre emploi salarié. Les deux activités sont déclarées séparément — vos revenus salariés n'impactent pas votre CA auto-entrepreneur, et vice versa." },
  { q: "Est-ce que mes revenus Colibri affectent mes APL ?", a: "Non, dans aucun cas. Les APL sont calculées sur la base de votre situation de logement et de vos ressources de l'année N-2 — le fait d'exercer une activité auto-entrepreneur ne déclenche aucune révision ni suppression de vos APL." },
  { q: "Est-ce que ça impacte ma bourse sur critères sociaux ?", a: "Non. Les bourses sur critères sociaux (CROUS) sont attribuées sur la base des revenus fiscaux de vos parents, pas des vôtres. Votre activité auto-entrepreneur n'entre pas dans le calcul et n'affecte pas votre droit à la bourse." },
  { q: "Que se passe-t-il si une famille ne paie pas ?", a: "Le recouvrement des impayés n'est pas du ressort de Colibri — c'est une relation directe entre vous et la famille, que vous gérez à votre niveau. Colibri traite uniquement les contestations simples : erreur de date, d'horaire ou de tarif sur un récapitulatif mensuel. En cas de désaccord sur le fond, prenez contact directement avec le parent concerné." },
  { q: "Dois-je cotiser même si mon CA est très faible ?", a: "Oui, mais proportionnellement. Les cotisations URSSAF sont calculées en pourcentage de votre CA réel — si vous encaissez peu, vous payez peu. Il n'y a pas de cotisation minimale forfaitaire en micro-entreprise. Pour un CA de 100 €, vous devrez environ 22 € de cotisations. En revanche, la déclaration reste obligatoire même à 0 €." },
];

// ─── Guide detail page ─────────────────────────────────────────

const ONBOARDING_GUIDE_IDS = ["auto-entrepreneur", "plateforme"];

function GuidePage({ guide, onBack }: { guide: typeof GUIDES[0]; onBack: () => void }) {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const showOnboardingButton = ONBOARDING_GUIDE_IDS.includes(guide.id) && !profile?.onboarding_complete;

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
              {item.link && (
                <a href={item.link} target="_blank" rel="noopener noreferrer"
                  className={`inline-flex items-center gap-1 text-xs font-semibold mt-2 hover:underline ${guide.color}`}>
                  <ExternalLink className="w-3 h-3" />{item.linkLabel}
                </a>
              )}
              {item.MockComponent && <item.MockComponent />}
              {item.fieldHints && <FieldHints hints={item.fieldHints} />}
              {item.extraContent}
            </div>
          </div>
        ))}
      </div>

      {showOnboardingButton && (
        <div className="mt-10 pt-8 border-t border-slate-100">
          <button
            onClick={() => navigate("/onboarding")}
            className="w-full flex items-center justify-center gap-2 bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Revenir à l'onboarding
          </button>
        </div>
      )}
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
  const navigate = useNavigate();

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
            <button key={guide.id} onClick={() => guide.id === "auto-entrepreneur" ? navigate("/app/aide/guide-statut") : guide.id === "acre" ? navigate("/app/aide/guide-acre") : guide.id === "urssaf" ? navigate("/app/aide/guide-declaration-urssaf") : onSelectGuide(guide.id)}
              className="group flex items-start gap-4 p-5 bg-white border border-slate-100 rounded-xl text-left hover:border-slate-200 transition-colors">
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

export function Aide() {
  const { hash } = useLocation();
  const hashId = hash ? hash.slice(1) : null;
  const validHashId = hashId && GUIDES.some((g) => g.id === hashId) ? hashId : null;
  const [activeGuideId, setActiveGuideId] = useState<string | null>(validHashId);
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
