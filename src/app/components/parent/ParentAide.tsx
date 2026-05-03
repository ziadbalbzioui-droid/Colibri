import { useState } from "react";
import { ChevronDown, ChevronLeft, Laptop, Zap, FileText, HelpCircle, AlertTriangle, ExternalLink, Clock, CreditCard, CheckCircle, AlertCircle, BookOpen } from "lucide-react";
import { Link } from "react-router";

// ─── Mock components ───────────────────────────────────────────

function MockDashboard() {
  return (
    <div style={{ background: "#F8FAFC", borderRadius: 14, padding: 16, border: "1px solid #E2E8F0", fontSize: 12 }}>
      {/* Header */}
      <div style={{ marginBottom: 14 }}>
        <p style={{ fontSize: 10, color: "#94A3B8", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 6 }}>Tableau de bord</p>
        <p style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 20, color: "#0F172A", margin: 0, lineHeight: 1.1 }}>
          Bonjour, Marie<br />
          <span style={{ color: "#94A3B8", fontSize: 16 }}>Tableau de bord de suivi</span>
        </p>
      </div>
      {/* Child card */}
      <div style={{ background: "linear-gradient(135deg,#1E40AF,#2E6BEA)", borderRadius: 12, padding: "14px 16px", color: "#fff", marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, background: "rgba(255,255,255,.2)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14 }}>T</div>
          <div>
            <p style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 14, color: "#fff", margin: 0 }}>Thomas</p>
            <p style={{ fontSize: 10, color: "#BFDBFE", margin: 0 }}>Terminale · Prof : M. Dupont</p>
          </div>
          <div style={{ marginLeft: "auto", background: "rgba(255,255,255,.2)", fontSize: 10, padding: "2px 8px", borderRadius: 999, fontWeight: 600 }}>Maths</div>
        </div>
      </div>
      {/* Stats row */}
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
          <p style={{ fontSize: 11, color: "#94A3B8", textDecoration: "line-through", margin: "2px 0 0" }}>120 € brut</p>
          <p style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 18, color: "#16A34A", margin: "1px 0 0" }}>60 €</p>
          <p style={{ fontSize: 10, color: "#16A34A", margin: 0 }}>après crédit d'impôt</p>
        </div>
      </div>
      {/* Last invoice row */}
      <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 10, padding: "10px 14px", display: "flex", alignItems: "center", gap: 10 }}>
        <AlertCircle style={{ width: 13, height: 13, color: "#F59E0B", flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: "#0F172A", margin: 0 }}>Avril 2026</p>
          <p style={{ fontSize: 10, color: "#64748B", margin: 0 }}>Avril 2026</p>
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
      {/* Month nav */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <div style={{ width: 26, height: 26, border: "1px solid #E2E8F0", borderRadius: 7, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <ChevronLeft style={{ width: 12, height: 12, color: "#64748B" }} />
        </div>
        <p style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 15, color: "#0F172A", margin: 0, flex: 1, textAlign: "center" }}>Mai 2026</p>
        <div style={{ width: 26, height: 26, border: "1px solid #E2E8F0", borderRadius: 7, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", opacity: 0.35 }}>
          <ChevronLeft style={{ width: 12, height: 12, color: "#64748B", transform: "rotate(180deg)" }} />
        </div>
      </div>
      {/* Course cards */}
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
            <p style={{ fontSize: 10, color: "#94A3B8", textDecoration: "line-through", margin: 0 }}>{c.montant} €</p>
            <p style={{ fontSize: 12, fontWeight: 700, color: "#16A34A", margin: 0 }}>{Math.round(c.montant * 0.5)} €</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function MockValidation() {
  return (
    <div style={{ background: "#F8FAFC", borderRadius: 14, padding: 16, border: "1px solid #E2E8F0", fontSize: 12 }}>
      <p style={{ fontSize: 10, color: "#94A3B8", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 10 }}>Validation du mois</p>
      {/* Warning */}
      <div style={{ background: "#FFFBEB", border: "1px solid #FCD34D", borderRadius: 10, padding: "10px 12px", display: "flex", gap: 8, marginBottom: 12 }}>
        <AlertTriangle style={{ width: 13, height: 13, color: "#B45309", flexShrink: 0, marginTop: 1 }} />
        <p style={{ fontSize: 11, color: "#92400E", margin: 0, lineHeight: 1.5 }}>
          <strong>Action irréversible.</strong> Une fois validé, la facture est générée.
        </p>
      </div>
      {/* Totals */}
      <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 10, padding: "10px 14px", marginBottom: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
          <span style={{ color: "#64748B" }}>Total brut</span>
          <span style={{ color: "#94A3B8", textDecoration: "line-through" }}>180 €</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
          <span style={{ color: "#64748B" }}>Prise en charge Urssaf (50%)</span>
          <span style={{ color: "#16A34A", fontWeight: 600 }}>−90 €</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 6, borderTop: "1px solid #E2E8F0" }}>
          <span style={{ fontWeight: 700, color: "#0F172A" }}>Votre part</span>
          <span style={{ fontWeight: 700, color: "#16A34A" }}>90 €</span>
        </div>
      </div>
      {/* Checkbox */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 12 }}>
        <div style={{ width: 14, height: 14, border: "2px solid #2E6BEA", borderRadius: 3, background: "#2E6BEA", flexShrink: 0, marginTop: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <CheckCircle style={{ width: 9, height: 9, color: "#fff" }} />
        </div>
        <p style={{ fontSize: 11, color: "#374151", margin: 0, lineHeight: 1.5 }}>J'ai vérifié les séances et confirme leur exactitude.</p>
      </div>
      {/* CTA */}
      <div style={{ background: "#2E6BEA", borderRadius: 10, padding: "10px", textAlign: "center", color: "#fff", fontWeight: 600, fontSize: 12 }}>
        Valider le mois
      </div>
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
    desc: "Tableau de bord, suivi des cours par mois, validation mensuelle.",
    color: "text-blue-600",
    iconBg: "bg-blue-50",
    accent: "#2563eb",
    items: [
      {
        title: "Votre tableau de bord",
        desc: "La page d'accueil résume l'activité de votre enfant : heures ce mois, montants en attente après crédit d'impôt, dernières factures. Cliquez sur « Voir tout » pour accéder aux listes complètes.",
        MockComponent: MockDashboard,
      },
      {
        title: "Suivre les cours par mois",
        desc: "Dans la section « Cours », naviguez mois par mois avec les flèches. Chaque cours détaille la matière, la durée, le professeur et votre part après crédit d'impôt (50% du brut).",
        MockComponent: MockCours,
      },
      {
        title: "Valider un récapitulatif mensuel",
        desc: "En fin de mois, votre professeur clôture son récapitulatif et vous demande de le valider. Une bannière orange s'affiche en haut de la page Cours. Examinez chaque cours attentivement, cochez la confirmation, puis cliquez « Valider le mois ».",
        MockComponent: MockValidation,
      },
      {
        title: "Ajouter un professeur",
        desc: "Demandez à votre professeur son code d'invitation (disponible dans son espace Colibri, section « Mon profil »). Allez dans « Mon profil » → « Professeurs & matières » → saisissez le code → « Ajouter ». Les cours apparaissent automatiquement.",
      },
    ],
  },
  {
    id: "avance",
    Icon: Zap,
    title: "L'avance immédiate Urssaf",
    desc: "Requis pour utiliser Colibri — 50% de réduction sur chaque facture.",
    color: "text-amber-600",
    iconBg: "bg-amber-50",
    accent: "#d97706",
    items: [
      {
        title: "Qu'est-ce que l'avance immédiate ?",
        desc: "C'est un dispositif officiel de l'Urssaf qui permet aux familles employant un service à la personne (cours particuliers inclus) de bénéficier de leur crédit d'impôt de 50% directement sur chaque facture. Vous ne payez que la moitié — l'État règle l'autre moitié directement au professeur.",
      },
      {
        title: "Pourquoi c'est obligatoire sur Colibri ?",
        desc: "Colibri est conçu autour du dispositif d'avance immédiate Urssaf. Tous les montants affichés dans l'application correspondent à votre part après crédit d'impôt (50% du brut). L'activation est requise pour utiliser la plateforme.",
      },
      {
        title: "Comment ça marche concrètement ?",
        desc: "Exemple : une séance facturée 40 €. Avec l'avance immédiate, vous payez 20 €. L'Urssaf verse les 20 € restants directement au professeur. Aucune démarche supplémentaire, aucune attente de remboursement : la réduction est appliquée sur chaque facture, automatiquement.",
      },
      {
        title: "Qui y a droit ?",
        desc: "Toute famille qui utilise un service à la personne (cours particuliers, aide à domicile, garde d'enfants…). Il n'y a pas de condition de revenus. Le seul prérequis : que votre professeur soit déclaré SAP auprès des autorités compétentes.",
      },
      {
        title: "Comment l'activer ?",
        desc: "La procédure d'activation sera disponible prochainement directement dans l'application. Vous serez notifié par email dès qu'elle sera ouverte. Vous aurez besoin de vos informations d'état civil et de votre IBAN — la procédure prend environ 5 minutes.",
        link: "/parent/activation",
        linkLabel: "Voir la page d'activation →",
      },
      {
        title: "Mon compte est « en attente »",
        desc: "Cela signifie que votre dossier est en cours de traitement par l'Urssaf. Consultez votre boîte mail — un email de confirmation vous a été envoyé. Une fois validé, la réduction s'applique automatiquement sur les prochaines factures.",
      },
    ],
  },
  {
    id: "factures",
    Icon: FileText,
    title: "Vos factures",
    desc: "Comprendre, valider et payer vos factures en toute sérénité.",
    color: "text-purple-600",
    iconBg: "bg-purple-50",
    accent: "#7c3aed",
    items: [
      {
        title: "Quand est générée une facture ?",
        desc: "Une facture est créée automatiquement après que vous avez validé le récapitulatif mensuel. Elle récapitule tous les cours du mois avec le montant brut et votre part nette après crédit d'impôt.",
      },
      {
        title: "Comprendre le montant",
        desc: "Le montant brut = total des cours. Vous ne payez que 50% — la différence est couverte par l'Urssaf directement. Vous n'avancez rien : la réduction est immédiate et s'applique sur chaque facture.",
      },
      {
        title: "Comment payer ?",
        desc: "Dans la section « Factures », cliquez sur « Payer » à côté de la facture en attente. Vous pouvez régler par carte bancaire ou par virement. Une confirmation vous est envoyée par email.",
      },
      {
        title: "Une facture semble incorrecte ?",
        desc: "La facture doit correspondre exactement au récapitulatif que vous avez validé. Si vous pensez qu'il y a une erreur, contactez directement votre professeur ou notre support à contact@colibri-soutien.fr.",
      },
    ],
  },
];

const FAQ_ITEMS = [
  { q: "Que se passe-t-il si je ne valide pas le récapitulatif mensuel ?", a: "Le mois reste en statut « en attente ». Votre professeur sera notifié. Aucune facture ne peut être générée tant que vous n'avez pas validé. Si vous avez une question sur un cours, contactez votre professeur avant de valider." },
  { q: "Puis-je modifier un cours après avoir validé le récapitulatif ?", a: "Non. La validation est irréversible : elle clôture le mois et déclenche la génération de la facture. C'est pourquoi nous vous recommandons d'examiner attentivement chaque cours avant de confirmer." },
  { q: "L'avance immédiate est-elle vraiment obligatoire ?", a: "Oui. Colibri est conçu autour du dispositif d'avance immédiate Urssaf. Tous les prix affichés dans l'application sont les prix après crédit d'impôt (50% du brut). L'activation est requise pour accéder aux fonctionnalités de paiement." },
  { q: "Suis-je remboursé après paiement avec l'avance immédiate ?", a: "Non, et c'est précisément l'avantage. La réduction est appliquée directement sur chaque facture. Vous ne payez que 50%, l'Urssaf règle le reste directement au professeur. Pas de délai, pas d'avance de trésorerie de votre part." },
  { q: "Comment ajouter un deuxième professeur ?", a: "Demandez à ce professeur de vous communiquer son code d'invitation (dans son espace Colibri, section « Mon profil »). Allez dans « Mon profil » → « Professeurs & matières » et saisissez le code. Ses cours apparaîtront dans votre espace." },
  { q: "Mes données personnelles sont-elles sécurisées ?", a: "Oui. Les données sont hébergées sur serveurs européens, conformes au RGPD. Vos informations bancaires sont chiffrées et ne sont jamais partagées avec des tiers autres que l'Urssaf dans le cadre de l'avance immédiate." },
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
                <div style={{ marginTop: 16 }}>
                  <item.MockComponent />
                </div>
              )}
              {item.link && (
                <Link
                  to={item.link}
                  className={`inline-flex items-center gap-1 text-xs font-semibold mt-3 hover:underline ${guide.color}`}
                >
                  <ExternalLink className="w-3 h-3" />{item.linkLabel}
                </Link>
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
