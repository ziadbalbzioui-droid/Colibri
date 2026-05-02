import { useState } from "react";
import { ChevronDown, ChevronLeft, Laptop, Store, Sparkles, CalendarClock, TrendingUp, HelpCircle, Mail, Phone, ExternalLink, AlertTriangle, X, BookOpen, Plus } from "lucide-react";

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

function MockWrap({ children, caption }: { children: React.ReactNode; caption: string }) {
  return (
    <div className="my-6 pointer-events-none select-none">
      <div style={{ ...MS.card, borderRadius: 18 }}>{children}</div>
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
        {/* Montant estimé */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: "#EFF6FF", borderRadius: 10, border: "1px solid #C7D8FB" }}>
          <span style={{ fontSize: 13, color: "#1E3A8A" }}>Montant estimé ⑥</span>
          <span style={{ fontWeight: 700, color: "#1E3A8A" }}>45,00 €</span>
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
      <MockWrap caption="Étape 1 — Sur la page Cours, chaque mois affiche son total. Cliquez « Finir le mois » pour lancer la clôture.">
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
      <MockWrap caption="Étape 2 — Le récapitulatif affiche tous les cours du mois par élève. Vérifiez, puis cliquez « Valider le mois ».">
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
              <span style={{ fontSize: 13, color: "#64748B" }}>3h · 90 €</span>
            </div>
            {[["15 jan.", "Maths", "1h", "30 €"], ["22 jan.", "Maths", "2h", "60 €"]].map(([d, m, dur, mt], i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", background: "#F1F5F9", borderRadius: 10, marginBottom: 4, fontSize: 13, color: "#64748B" }}>
                <span>{d} · {m} · {dur}</span><span style={{ fontWeight: 500, color: "#0F172A" }}>{mt}</span>
              </div>
            ))}
          </div>
          {/* Élève 2 */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontWeight: 600, fontSize: 13, color: "#0F172A" }}>Lucas M.</span>
              <span style={{ fontSize: 13, color: "#64748B" }}>3h30 · 87,50 €</span>
            </div>
            {[["18 jan.", "Physique", "1h30", "37,50 €"], ["25 jan.", "Physique", "2h", "50 €"]].map(([d, m, dur, mt], i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", background: "#F1F5F9", borderRadius: 10, marginBottom: 4, fontSize: 13, color: "#64748B" }}>
                <span>{d} · {m} · {dur}</span><span style={{ fontWeight: 500, color: "#0F172A" }}>{mt}</span>
              </div>
            ))}
          </div>
          {/* Total + bouton */}
          <div style={{ paddingTop: 16, borderTop: "1px solid #E2E8F0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
              <span style={{ fontWeight: 700, color: "#0F172A" }}>Total</span>
              <span style={{ fontWeight: 700, color: "#0F172A" }}>177,50 €</span>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <div style={{ ...MS.btnGhost, flex: 1, justifyContent: "center" }}>Annuler</div>
              <div style={{ ...MS.btnPrimary, flex: 1, justifyContent: "center" }}>Valider le mois</div>
            </div>
          </div>
        </div>
      </MockWrap>
    </div>
  );
}

// ── Mockup : Dashboard stats ──
function MockDashboard() {
  return (
    <MockWrap caption="Dashboard — les 3 indicateurs clés calculés automatiquement à partir de vos cours déclarés">
      <div style={{ padding: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 20 }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: "#0F172A" }}>Dashboard</h1>
            <p style={{ color: "#64748B", fontSize: 13, marginTop: 2 }}>Janvier 2025</p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <div style={{ ...MS.btnGhost, padding: "7px 12px", fontSize: 12 }}>
              <Plus className="w-3.5 h-3.5" /> Élève
            </div>
            <div style={{ ...MS.btnPrimary, padding: "7px 12px", fontSize: 12 }}>
              <Plus className="w-3.5 h-3.5" /> Cours
            </div>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
          {[
            { label: "CA brut", value: "1 240 €", sub: "ce mois", icon: "💶", bg: "#fff", border: "#E2E8F0" },
            { label: "Cotisations URSSAF", value: "−262 €", sub: "21,2% estimé", icon: "📋", bg: "#FFF7ED", border: "#FED7AA" },
            { label: "Net estimé", value: "978 €", sub: "après charges", icon: "✅", bg: "#F0FDF4", border: "#BBF7D0" },
          ].map((s, i) => (
            <div key={i} style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: 16, padding: 20 }}>
              <p style={MS.eyebrow}>{s.label}</p>
              <div style={{ ...MS.serif, fontSize: 30, letterSpacing: "-.02em", color: "#0F172A", margin: "8px 0 4px" }}>{s.value}</div>
              <p style={{ fontSize: 12, color: "#94A3B8" }}>{s.sub}</p>
            </div>
          ))}
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

// ─── Guide data ────────────────────────────────────────────────

type GuideItem = {
  title: string;
  desc: string;
  link?: string;
  linkLabel?: string;
  MockComponent?: () => React.ReactElement;
  fieldHints?: { label: string; desc: string }[];
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
          { label: "Montant estimé", desc: "Calculé automatiquement : tarif × (durée ÷ 60). Mis à jour en temps réel." },
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
        desc: "Le dashboard affiche en temps réel votre CA brut, les cotisations URSSAF estimées et votre net. Ces chiffres se calculent automatiquement à chaque cours enregistré.",
        MockComponent: MockDashboard,
        fieldHints: [
          { label: "CA brut", desc: "Total des montants des cours du mois en cours." },
          { label: "Cotisations URSSAF", desc: "Estimation à 21,2% de votre CA brut. Sert de base à votre déclaration mensuelle ou trimestrielle." },
          { label: "Net estimé", desc: "CA brut moins les cotisations. Votre revenu réel avant impôt sur le revenu." },
        ],
      },
      {
        title: "PAPS — réseau Mines de Paris",
        desc: "Si vous êtes diplômé de Mines de Paris, la section PAPS est accessible depuis la sidebar. Vous pouvez y consulter les annonces de cession d'élèves dans le réseau et postuler directement.",
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
    desc: "Net réel, versement libératoire, crédit d'impôt — comprenez vos chiffres.",
    color: "text-emerald-600",
    iconBg: "bg-emerald-50",
    accent: "#059669",
    items: [
      { title: "Calculer votre net réel", desc: "Net = CA × (1 − 21,2%). Exemple : 1 000 € encaissés → 788 € nets. Avec versement libératoire IR : 766 €. Affiché automatiquement dans votre dashboard." },
      { title: "Le versement libératoire de l'IR", desc: "Option URSSAF permettant de régler l'IR en même temps que les cotisations (+2,2%). Accessible si revenus N-2 < 27 478 €/part fiscale." },
      { title: "Plafond auto-entrepreneur", desc: "Maximum 77 700 € de CA annuel pour les prestations de services. Dépassé deux années consécutives → bascule vers le régime réel." },
      { title: "Crédit d'impôt de vos familles", desc: "Si agréé SAP, vos élèves récupèrent 50% du coût lors de leur déclaration annuelle. Un cours à 30 €/h ne leur coûte réellement que 15 €." },
      { title: "TVA et mentions obligatoires", desc: "Exonéré de TVA en micro-entreprise. Mention obligatoire sur factures : « TVA non applicable – art. 293 B du CGI ». Colibri l'ajoute automatiquement." },
      { title: "Abattement forfaitaire", desc: "Sans versement libératoire : abattement de 50% du CA avant calcul de l'IR. Pas de déduction de frais réels possible." },
    ],
  },
];

const FAQ_ITEMS = [
  { q: "Dois-je être auto-entrepreneur pour utiliser Colibri ?", a: "Non, vous pouvez gérer vos élèves et cours sans statut particulier. Mais pour facturer légalement et permettre à vos élèves de bénéficier du crédit d'impôt 50%, le statut AE avec agrément SAP est nécessaire." },
  { q: "L'ACRE est-elle accordée automatiquement ?", a: "Non. Vous devez la demander sur votre espace URSSAF dans les 45 jours suivant votre déclaration. Passé ce délai, l'exonération est définitivement perdue pour cette création." },
  { q: "Dois-je déclarer à l'URSSAF même si je n'ai rien encaissé ?", a: "Oui, la déclaration est obligatoire même si votre CA est 0. L'omettre entraîne une majoration automatique de 5% (puis 10% après 30 jours supplémentaires)." },
  { q: "Mes élèves peuvent-ils bénéficier du crédit d'impôt ?", a: "Oui, à condition que vous soyez déclaré SAP auprès de la DREETS. Cette démarche gratuite prend environ 2 semaines. Vos familles récupèrent ensuite 50% du montant payé lors de leur déclaration annuelle." },
  { q: "Comment fonctionne le versement libératoire de l'impôt ?", a: "Option URSSAF qui vous fait payer l'IR en même temps que vos cotisations (+2,2% du CA). Plus de régularisation en fin d'année. Éligible si revenus N-2 < 27 478 € par part fiscale." },
  { q: "Puis-je dépasser le plafond auto-entrepreneur en cours d'année ?", a: "Oui, un dépassement ponctuel est toléré. Vous perdez le statut micro seulement si vous dépassez 77 700 € deux années civiles consécutives." },
  { q: "Comment fonctionne le parrainage Colibri ?", a: "Chaque professeur a un code unique dans la section « Parrainage ». Quand un collègue s'inscrit avec votre code, vous devenez son parrain. Dès qu'il atteint 10h de cours déclarées, vous recevez 50 €." },
  { q: "Mes données sont-elles sécurisées ?", a: "Oui. Données hébergées sur serveurs européens, conformes RGPD. Les informations de vos élèves ne sont jamais partagées avec des tiers." },
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
              {item.link && (
                <a href={item.link} target="_blank" rel="noopener noreferrer"
                  className={`inline-flex items-center gap-1 text-xs font-semibold mt-2 hover:underline ${guide.color}`}>
                  <ExternalLink className="w-3 h-3" />{item.linkLabel}
                </a>
              )}
              {item.MockComponent && <item.MockComponent />}
              {item.fieldHints && <FieldHints hints={item.fieldHints} />}
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
            <button key={guide.id} onClick={() => onSelectGuide(guide.id)}
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
