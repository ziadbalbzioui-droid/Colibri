import { useState } from "react";
import { ChevronDown, ChevronRight, FileText, MessageCircle, BookOpen, HelpCircle, ExternalLink, CheckCircle2, Mail, Phone } from "lucide-react";

interface FaqItem {
  question: string;
  answer: string;
}

interface Section {
  id: string;
  icon: React.ElementType;
  title: string;
  color: string;
}

const sections: Section[] = [
  { id: "auto-entrepreneur", icon: FileText, title: "S'inscrire en auto-entrepreneur", color: "bg-blue-50 text-blue-600" },
  { id: "comment-ca-marche", icon: BookOpen, title: "Comment ça marche", color: "bg-green-50 text-green-600" },
  { id: "credit-impot", icon: CheckCircle2, title: "Crédit d'impôt", color: "bg-purple-50 text-purple-600" },
  { id: "faq", icon: HelpCircle, title: "Questions fréquentes", color: "bg-amber-50 text-amber-600" },
  { id: "contact", icon: MessageCircle, title: "Nous contacter", color: "bg-rose-50 text-rose-600" },
];

const autoEntrepreneurSteps = [
  {
    num: 1,
    title: "Créer votre compte sur l'URSSAF",
    desc: "Rendez-vous sur autoentrepreneur.urssaf.fr et cliquez sur « Créer mon auto-entreprise ». La démarche est 100% en ligne et prend environ 15 minutes.",
    link: "https://www.autoentrepreneur.urssaf.fr",
    linkLabel: "autoentrepreneur.urssaf.fr",
  },
  {
    num: 2,
    title: "Choisir votre activité",
    desc: "Sélectionnez « Enseignement » comme secteur d'activité. Le code APE attribué sera 8559B — Autres enseignements. C'est la catégorie qui couvre les cours particuliers.",
  },
  {
    num: 3,
    title: "Déclarer votre adresse",
    desc: "Vous pouvez domicilier votre auto-entreprise à votre domicile personnel. Aucun local commercial n'est nécessaire pour exercer des cours particuliers.",
  },
  {
    num: 4,
    title: "Recevoir votre SIRET",
    desc: "Sous 1 à 4 semaines, vous recevez votre numéro SIRET par courrier. Vous pouvez commencer à facturer dès réception. Renseignez-le dans votre profil Colibri.",
  },
  {
    num: 5,
    title: "Déclarer votre chiffre d'affaires",
    desc: "Tous les mois (ou trimestres), déclarez vos revenus sur votre espace URSSAF. Le taux de cotisation pour les prestations de service est de 21,1%.",
  },
];

const commentCaMarche = [
  {
    titre: "Enregistrez vos élèves",
    desc: "Créez un profil pour chaque élève : niveau, matière, tarif horaire. Ajoutez des notes privées et des tags pour garder le contexte de chaque suivi.",
  },
  {
    titre: "Déclarez vos cours",
    desc: "Après chaque séance, enregistrez le cours depuis le dashboard ou la page Cours. Colibri calcule automatiquement le montant et met à jour votre récap mensuel.",
  },
  {
    titre: "Générez vos factures",
    desc: "En fin de mois, générez votre facture depuis la page Factures. Elle est pré-remplie avec tous vos cours déclarés, prête à être téléchargée et envoyée aux familles.",
  },
  {
    titre: "Suivez votre net réel",
    desc: "Colibri décompose automatiquement vos revenus : brut → URSSAF (21,1%) → net réel. Vous savez exactement ce que vous empochez chaque mois.",
  },
  {
    titre: "Mettez en avant le crédit d'impôt",
    desc: "Les familles récupèrent 50% du coût des cours particuliers via le crédit d'impôt. Colibri calcule ce montant pour chaque élève — un argument commercial fort à utiliser.",
  },
];

const faqItems: FaqItem[] = [
  {
    question: "Dois-je être auto-entrepreneur pour utiliser Colibri ?",
    answer: "Non, vous pouvez utiliser Colibri pour suivre vos cours même sans statut auto-entrepreneur. Cependant, pour facturer légalement et bénéficier du crédit d'impôt pour vos élèves, le statut auto-entrepreneur (ou équivalent) est recommandé.",
  },
  {
    question: "Le crédit d'impôt s'applique-t-il à tous mes élèves ?",
    answer: "Le crédit d'impôt de 50% s'applique aux cours dispensés à domicile, déclarés auprès du service CESU ou via une entreprise agréée. Pour en bénéficier, vous devez être déclaré en tant que prestataire de services à la personne.",
  },
  {
    question: "Comment déclarer mon activité pour les services à la personne ?",
    answer: "En plus du statut auto-entrepreneur, vous devez obtenir un agrément ou une déclaration SAP (Services à la Personne) auprès de la DREETS de votre région. Cela permet à vos élèves de bénéficier du crédit d'impôt.",
  },
  {
    question: "Mes données sont-elles sécurisées ?",
    answer: "Oui. Toutes vos données sont stockées de façon sécurisée. Les informations de vos élèves ne sont jamais partagées avec des tiers. Vous restez propriétaire de vos données.",
  },
  {
    question: "Puis-je utiliser Colibri sur mobile ?",
    answer: "Oui, Colibri est entièrement responsive. L'application s'adapte à tous les écrans — smartphone, tablette et desktop.",
  },
  {
    question: "Comment fonctionne la page PAPS ?",
    answer: "PAPS est une marketplace privée réservée aux tuteurs inscrits sur Colibri. Vous pouvez y proposer un élève que vous ne pouvez pas prendre en charge, ou récupérer un élève posté par un collègue. C'est un réseau d'entraide entre profs.",
  },
];

function Faq({ items }: { items: FaqItem[] }) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="border border-border rounded-xl overflow-hidden">
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-muted/50 transition-colors"
          >
            <span style={{ fontWeight: 500, fontSize: 14 }}>{item.question}</span>
            <ChevronDown className={`w-4 h-4 text-muted-foreground shrink-0 ml-3 transition-transform ${open === i ? "rotate-180" : ""}`} />
          </button>
          {open === i && (
            <div className="px-5 pb-4 text-muted-foreground" style={{ fontSize: 14, lineHeight: 1.6 }}>
              {item.answer}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export function Aide() {
  const [activeSection, setActiveSection] = useState<string>("comment-ca-marche");

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="mb-1">Centre d'aide</h1>
        <p className="text-muted-foreground" style={{ fontSize: 14 }}>
          Tout ce qu'il faut savoir pour bien utiliser Colibri et gérer votre activité.
        </p>
      </div>

      <div className="flex gap-6 items-start">
        {/* Sidebar nav */}
        <nav className="w-56 shrink-0 space-y-1 sticky top-6">
          {sections.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-left transition-colors ${
                activeSection === s.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-secondary hover:text-secondary-foreground"
              }`}
            >
              <s.icon className="w-4 h-4 shrink-0" />
              <span style={{ fontSize: 13 }}>{s.title}</span>
              {activeSection !== s.id && <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-40" />}
            </button>
          ))}
        </nav>

        {/* Content */}
        <div className="flex-1 min-w-0">

          {/* ── S'inscrire en auto-entrepreneur ── */}
          {activeSection === "auto-entrepreneur" && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 style={{ fontWeight: 700 }}>S'inscrire en auto-entrepreneur</h2>
                  <p className="text-muted-foreground" style={{ fontSize: 13 }}>Guide étape par étape pour créer votre statut</p>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6">
                <p className="text-blue-700" style={{ fontSize: 13 }}>
                  <strong>Bonne nouvelle :</strong> l'inscription en auto-entrepreneur est gratuite, 100% en ligne et ne prend que 15 minutes. Vous pouvez commencer à facturer dès réception de votre SIRET.
                </p>
              </div>

              <div className="space-y-4">
                {autoEntrepreneurSteps.map((step) => (
                  <div key={step.num} className="bg-white border border-border rounded-xl p-5 flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0" style={{ fontSize: 13, fontWeight: 700 }}>
                      {step.num}
                    </div>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: 14 }} className="mb-1">{step.title}</p>
                      <p className="text-muted-foreground" style={{ fontSize: 13, lineHeight: 1.6 }}>{step.desc}</p>
                      {step.link && (
                        <a
                          href={step.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 mt-2 text-primary hover:underline"
                          style={{ fontSize: 13 }}
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          {step.linkLabel}
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 bg-secondary rounded-xl p-5">
                <p style={{ fontWeight: 500, fontSize: 14 }} className="mb-1">Besoin d'aide pour votre inscription ?</p>
                <p className="text-muted-foreground" style={{ fontSize: 13 }}>Notre équipe peut vous accompagner dans les démarches. Contactez-nous via la section "Nous contacter".</p>
              </div>
            </div>
          )}

          {/* ── Comment ça marche ── */}
          {activeSection === "comment-ca-marche" && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h2 style={{ fontWeight: 700 }}>Comment ça marche</h2>
                  <p className="text-muted-foreground" style={{ fontSize: 13 }}>Tout comprendre en 5 étapes</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {commentCaMarche.map((item, i) => (
                  <div key={i} className="bg-white border border-border rounded-xl p-5 flex gap-4">
                    <div className="w-7 h-7 rounded-lg bg-green-100 text-green-700 flex items-center justify-center shrink-0" style={{ fontSize: 12, fontWeight: 700 }}>
                      {i + 1}
                    </div>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: 14 }} className="mb-1">{item.titre}</p>
                      <p className="text-muted-foreground" style={{ fontSize: 13, lineHeight: 1.6 }}>{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Crédit d'impôt ── */}
          {activeSection === "credit-impot" && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h2 style={{ fontWeight: 700 }}>Crédit d'impôt</h2>
                  <p className="text-muted-foreground" style={{ fontSize: 13 }}>Votre argument commercial numéro 1</p>
                </div>
              </div>

              <div className="bg-green-50 border border-green-100 rounded-xl p-5 mb-6">
                <p style={{ fontWeight: 600, fontSize: 15 }} className="text-green-700 mb-1">Les familles récupèrent 50% du coût des cours</p>
                <p className="text-green-600" style={{ fontSize: 13, lineHeight: 1.6 }}>
                  Grâce au crédit d'impôt pour services à la personne (Art. 199 sexdecies du CGI), les familles récupèrent la moitié du montant payé pour des cours particuliers — dans la limite de 12 000 € de dépenses annuelles.
                </p>
              </div>

              <div className="space-y-4">
                {[
                  {
                    q: "Qui peut en bénéficier ?",
                    a: "Toutes les familles fiscalement domiciliées en France, qu'elles soient imposables ou non (crédit = remboursement si non imposable).",
                  },
                  {
                    q: "Quelles conditions pour le tuteur ?",
                    a: "Vous devez être déclaré en tant que prestataire de services à la personne (SAP) auprès de la DREETS, en plus de votre statut auto-entrepreneur.",
                  },
                  {
                    q: "Comment les familles déclarent-elles ?",
                    a: "Via leur déclaration de revenus annuelle, en renseignant les montants payés dans la case 7DB. Vos factures servent de justificatifs.",
                  },
                  {
                    q: "Quel est l'avantage concret ?",
                    a: "Un cours à 30 €/h ne coûte réellement que 15 € à la famille. C'est un argument commercial décisif — mettez-le en avant systématiquement.",
                  },
                ].map((item, i) => (
                  <div key={i} className="bg-white border border-border rounded-xl p-5">
                    <p style={{ fontWeight: 600, fontSize: 14 }} className="mb-1.5">{item.q}</p>
                    <p className="text-muted-foreground" style={{ fontSize: 13, lineHeight: 1.6 }}>{item.a}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 bg-secondary rounded-xl p-5">
                <p style={{ fontWeight: 500, fontSize: 14 }} className="mb-1">Simulation rapide</p>
                <p className="text-muted-foreground" style={{ fontSize: 13 }}>
                  Pour 100 € de cours facturés, la famille perçoit <strong>50 €</strong> de crédit d'impôt. Le coût réel pour eux est de <strong>50 €</strong>.
                  Colibri calcule ce montant automatiquement pour chaque élève dans votre dashboard.
                </p>
              </div>
            </div>
          )}

          {/* ── FAQ ── */}
          {activeSection === "faq" && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                  <HelpCircle className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h2 style={{ fontWeight: 700 }}>Questions fréquentes</h2>
                  <p className="text-muted-foreground" style={{ fontSize: 13 }}>Les réponses aux questions les plus posées</p>
                </div>
              </div>
              <Faq items={faqItems} />
            </div>
          )}

          {/* ── Contact ── */}
          {activeSection === "contact" && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-rose-600" />
                </div>
                <div>
                  <h2 style={{ fontWeight: 700 }}>Nous contacter</h2>
                  <p className="text-muted-foreground" style={{ fontSize: 13 }}>On vous répond sous 24h ouvrées</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="bg-white border border-border rounded-xl p-5">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                    <Mail className="w-4 h-4 text-primary" />
                  </div>
                  <p style={{ fontWeight: 600, fontSize: 14 }} className="mb-1">Email</p>
                  <p className="text-muted-foreground mb-3" style={{ fontSize: 13 }}>Pour toute question sur votre compte ou l'application.</p>
                  <a href="mailto:support@colibri.app" className="text-primary hover:underline" style={{ fontSize: 13 }}>
                    support@colibri.app
                  </a>
                </div>
                <div className="bg-white border border-border rounded-xl p-5">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                    <Phone className="w-4 h-4 text-primary" />
                  </div>
                  <p style={{ fontWeight: 600, fontSize: 14 }} className="mb-1">Téléphone</p>
                  <p className="text-muted-foreground mb-3" style={{ fontSize: 13 }}>Lundi au vendredi, 9h–18h.</p>
                  <a href="tel:+33123456789" className="text-primary hover:underline" style={{ fontSize: 13 }}>
                    +33 1 23 45 67 89
                  </a>
                </div>
              </div>

              {/* Contact form */}
              <div className="bg-white border border-border rounded-xl p-6">
                <p style={{ fontWeight: 600, fontSize: 15 }} className="mb-4">Envoyer un message</p>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-muted-foreground mb-1.5" style={{ fontSize: 13 }}>Prénom</label>
                      <input placeholder="Jean" className="w-full px-4 py-2.5 bg-muted rounded-lg outline-none" />
                    </div>
                    <div>
                      <label className="block text-muted-foreground mb-1.5" style={{ fontSize: 13 }}>Nom</label>
                      <input placeholder="Dupont" className="w-full px-4 py-2.5 bg-muted rounded-lg outline-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-muted-foreground mb-1.5" style={{ fontSize: 13 }}>Email</label>
                    <input type="email" placeholder="jean@email.com" className="w-full px-4 py-2.5 bg-muted rounded-lg outline-none" />
                  </div>
                  <div>
                    <label className="block text-muted-foreground mb-1.5" style={{ fontSize: 13 }}>Sujet</label>
                    <select className="w-full px-4 py-2.5 bg-muted rounded-lg outline-none">
                      <option>Question sur mon compte</option>
                      <option>Problème technique</option>
                      <option>Question sur la facturation</option>
                      <option>Question sur le crédit d'impôt</option>
                      <option>Aide à l'inscription auto-entrepreneur</option>
                      <option>Autre</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-muted-foreground mb-1.5" style={{ fontSize: 13 }}>Message</label>
                    <textarea
                      rows={4}
                      placeholder="Décrivez votre demande..."
                      className="w-full px-4 py-3 bg-muted rounded-lg outline-none resize-none"
                      style={{ fontSize: 13 }}
                    />
                  </div>
                  <button className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg hover:opacity-90 transition-opacity" style={{ fontSize: 14 }}>
                    Envoyer le message
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
