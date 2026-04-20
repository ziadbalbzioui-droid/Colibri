import { useState } from "react";
import { ChevronDown, FileText, BookOpen, CheckCircle2, HelpCircle, Mail, Phone, ExternalLink } from "lucide-react";

const S = {
  card: { background: "#fff", border: "1px solid #E2E8F0", borderRadius: 16, boxShadow: "0 1px 3px rgba(15,23,42,.06)" } as React.CSSProperties,
  btnPrimary: { display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: 12, background: "#2E6BEA", color: "#fff", fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer" } as React.CSSProperties,
};

const sections = [
  { id: "comment-ca-marche", Icon: BookOpen, title: "Comment ça marche", bg: "#E6F8F1", ic: "#10B981" },
  { id: "auto-entrepreneur", Icon: FileText, title: "S'inscrire en auto-entrepreneur", bg: "#EFF6FF", ic: "#2E6BEA" },
  { id: "credit-impot", Icon: CheckCircle2, title: "Crédit d'impôt", bg: "#F5F3FF", ic: "#7C3AED" },
  { id: "faq", Icon: HelpCircle, title: "Questions fréquentes", bg: "#FFFBEB", ic: "#F59E0B" },
  { id: "contact", Icon: Mail, title: "Nous contacter", bg: "#FEF2F2", ic: "#EF4444" },
];

const autoSteps = [
  { num: 1, title: "Créer votre compte sur l'URSSAF", desc: "Rendez-vous sur autoentrepreneur.urssaf.fr et cliquez sur « Créer mon auto-entreprise ». La démarche est 100% en ligne et prend environ 15 minutes.", link: "https://www.autoentrepreneur.urssaf.fr", linkLabel: "autoentrepreneur.urssaf.fr" },
  { num: 2, title: "Choisir votre activité", desc: "Sélectionnez « Enseignement » comme secteur d'activité. Le code APE attribué sera 8559B — Autres enseignements. C'est la catégorie qui couvre les cours particuliers." },
  { num: 3, title: "Déclarer votre adresse", desc: "Vous pouvez domicilier votre auto-entreprise à votre domicile personnel. Aucun local commercial n'est nécessaire pour exercer des cours particuliers." },
  { num: 4, title: "Recevoir votre SIRET", desc: "Sous 1 à 4 semaines, vous recevez votre numéro SIRET par courrier. Vous pouvez commencer à facturer dès réception. Renseignez-le dans votre profil Colibri." },
  { num: 5, title: "Déclarer votre chiffre d'affaires", desc: "Tous les mois (ou trimestres), déclarez vos revenus sur votre espace URSSAF. Le taux de cotisation pour les prestations de service est de 21,1%." },
];

const commentCaMarche = [
  { titre: "Enregistrez vos élèves", desc: "Créez un profil pour chaque élève : niveau, matière, tarif horaire. Ajoutez des notes privées et des tags pour garder le contexte de chaque suivi." },
  { titre: "Déclarez vos cours", desc: "Après chaque séance, enregistrez le cours depuis le dashboard ou la page Cours. Colibri calcule automatiquement le montant et met à jour votre récap mensuel." },
  { titre: "Générez vos factures", desc: "En fin de mois, générez votre facture depuis la page Factures. Elle est pré-remplie avec tous vos cours déclarés, prête à être téléchargée et envoyée aux familles." },
  { titre: "Suivez votre net réel", desc: "Colibri décompose automatiquement vos revenus : brut → URSSAF (21,1%) → net réel. Vous savez exactement ce que vous empochez chaque mois." },
  { titre: "Mettez en avant le crédit d'impôt", desc: "Les familles récupèrent 50% du coût des cours particuliers via le crédit d'impôt. Colibri calcule ce montant pour chaque élève — un argument commercial fort à utiliser." },
];

const creditQuestions = [
  { q: "Qui peut en bénéficier ?", a: "Toutes les familles fiscalement domiciliées en France, qu'elles soient imposables ou non (crédit = remboursement si non imposable)." },
  { q: "Quelles conditions pour le tuteur ?", a: "Vous devez être déclaré en tant que prestataire de services à la personne (SAP) auprès de la DREETS, en plus de votre statut auto-entrepreneur." },
  { q: "Comment les familles déclarent-elles ?", a: "Via leur déclaration de revenus annuelle, en renseignant les montants payés dans la case 7DB. Vos factures servent de justificatifs." },
  { q: "Quel est l'avantage concret ?", a: "Un cours à 30 €/h ne coûte réellement que 15 € à la famille. C'est un argument commercial décisif — mettez-le en avant systématiquement." },
];

const faqItems = [
  { question: "Dois-je être auto-entrepreneur pour utiliser Colibri ?", answer: "Non, vous pouvez utiliser Colibri pour suivre vos cours même sans statut auto-entrepreneur. Cependant, pour facturer légalement et bénéficier du crédit d'impôt pour vos élèves, le statut auto-entrepreneur (ou équivalent) est recommandé." },
  { question: "Le crédit d'impôt s'applique-t-il à tous mes élèves ?", answer: "Le crédit d'impôt de 50% s'applique aux cours dispensés à domicile, déclarés auprès du service CESU ou via une entreprise agréée. Pour en bénéficier, vous devez être déclaré en tant que prestataire de services à la personne." },
  { question: "Comment déclarer mon activité pour les services à la personne ?", answer: "En plus du statut auto-entrepreneur, vous devez obtenir un agrément ou une déclaration SAP (Services à la Personne) auprès de la DREETS de votre région. Cela permet à vos élèves de bénéficier du crédit d'impôt." },
  { question: "Mes données sont-elles sécurisées ?", answer: "Oui. Toutes vos données sont stockées de façon sécurisée. Les informations de vos élèves ne sont jamais partagées avec des tiers. Vous restez propriétaire de vos données." },
  { question: "Puis-je utiliser Colibri sur mobile ?", answer: "Oui, Colibri est entièrement responsive. L'application s'adapte à tous les écrans — smartphone, tablette et desktop." },
  { question: "Comment fonctionne la page PAPS ?", answer: "PAPS est une marketplace privée réservée aux tuteurs inscrits sur Colibri. Vous pouvez y proposer un élève que vous ne pouvez pas prendre en charge, ou récupérer un élève posté par un collègue. C'est un réseau d'entraide entre profs." },
];

export function Aide() {
  const [active, setActive] = useState("comment-ca-marche");
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const sec = sections.find((s) => s.id === active)!;

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-.02em", color: "#0F172A", marginBottom: 4 }}>Centre d'aide</h1>
        <p style={{ color: "#64748B", fontSize: 13 }}>Tout ce qu'il faut savoir pour bien utiliser Colibri et gérer votre activité.</p>
      </div>

      <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
        {/* Left nav */}
        <nav style={{ width: 210, flexShrink: 0, display: "flex", flexDirection: "column", gap: 4, position: "sticky", top: 24 }}>
          {sections.map((s) => (
            <button key={s.id} onClick={() => setActive(s.id)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 10, border: "none", cursor: "pointer", background: active === s.id ? "#2E6BEA" : "transparent", color: active === s.id ? "#fff" : "#334155", fontFamily: "inherit", fontSize: 13, fontWeight: active === s.id ? 600 : 500, textAlign: "left" }}>
              <s.Icon style={{ width: 15, height: 15, color: active === s.id ? "#fff" : s.ic, flexShrink: 0 }} />
              {s.title}
            </button>
          ))}
        </nav>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: sec.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <sec.Icon style={{ width: 20, height: 20, color: sec.ic }} />
            </div>
            <h2 style={{ fontWeight: 700, fontSize: 17, color: "#0F172A" }}>{sec.title}</h2>
          </div>

          {active === "comment-ca-marche" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {commentCaMarche.map((item, i) => (
                <div key={i} style={{ ...S.card, padding: 20, display: "flex", gap: 16 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: "#E6F8F1", color: "#10B981", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{i + 1}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: "#0F172A", marginBottom: 4 }}>{item.titre}</div>
                    <div style={{ fontSize: 13, color: "#64748B", lineHeight: 1.6 }}>{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {active === "auto-entrepreneur" && (
            <div>
              <div style={{ background: "#EFF6FF", border: "1px solid #C7D8FB", borderRadius: 12, padding: 14, marginBottom: 20, fontSize: 13, color: "#1E3A8A" }}>
                <strong>Bonne nouvelle :</strong> l'inscription en auto-entrepreneur est gratuite, 100% en ligne et ne prend que 15 minutes. Vous pouvez commencer à facturer dès réception de votre SIRET.
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {autoSteps.map((step) => (
                  <div key={step.num} style={{ ...S.card, padding: 20, display: "flex", gap: 16 }}>
                    <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#2E6BEA", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, flexShrink: 0 }}>{step.num}</div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14, color: "#0F172A", marginBottom: 4 }}>{step.title}</div>
                      <div style={{ fontSize: 13, color: "#64748B", lineHeight: 1.6 }}>{step.desc}</div>
                      {step.link && (
                        <a href={step.link} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: "#2E6BEA", display: "inline-flex", alignItems: "center", gap: 4, marginTop: 6 }}>
                          <ExternalLink style={{ width: 13, height: 13 }} />{step.linkLabel}
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {active === "credit-impot" && (
            <div>
              <div style={{ background: "#ECFDF5", border: "1px solid #BBF7D0", borderRadius: 12, padding: 16, marginBottom: 20 }}>
                <div style={{ fontWeight: 700, fontSize: 15, color: "#059669", marginBottom: 4 }}>Les familles récupèrent 50% du coût des cours</div>
                <div style={{ fontSize: 13, color: "#047857", lineHeight: 1.6 }}>Grâce au crédit d'impôt pour services à la personne (Art. 199 sexdecies du CGI), les familles récupèrent la moitié du montant payé pour des cours particuliers — dans la limite de 12 000 € de dépenses annuelles.</div>
              </div>
              {creditQuestions.map((item, i) => (
                <div key={i} style={{ ...S.card, padding: 18, marginBottom: 10 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: "#0F172A", marginBottom: 6 }}>{item.q}</div>
                  <div style={{ fontSize: 13, color: "#64748B", lineHeight: 1.6 }}>{item.a}</div>
                </div>
              ))}
            </div>
          )}

          {active === "faq" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {faqItems.map((item, i) => (
                <div key={i} style={{ ...S.card, overflow: "hidden" }}>
                  <button onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", border: "none", cursor: "pointer", background: "none", fontFamily: "inherit", textAlign: "left" }}>
                    <span style={{ fontWeight: 600, fontSize: 14, color: "#0F172A" }}>{item.question}</span>
                    <ChevronDown style={{ width: 16, height: 16, color: "#64748B", flexShrink: 0, marginLeft: 12, transform: openFaq === i ? "rotate(180deg)" : "none", transition: "transform .2s" }} />
                  </button>
                  {openFaq === i && <div style={{ padding: "0 20px 16px", fontSize: 13, color: "#64748B", lineHeight: 1.6 }}>{item.answer}</div>}
                </div>
              ))}
            </div>
          )}

          {active === "contact" && (
            <div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
                {[{ Icon: Mail, title: "Email", desc: "Pour toute question sur votre compte ou l'application.", val: "support@colibri.app", href: "mailto:support@colibri.app" }, { Icon: Phone, title: "Téléphone", desc: "Lundi au vendredi, 9h–18h.", val: "+33 1 23 45 67 89", href: "tel:+33123456789" }].map((c) => (
                  <div key={c.title} style={{ ...S.card, padding: 20 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
                      <c.Icon style={{ width: 16, height: 16, color: "#2E6BEA" }} />
                    </div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: "#0F172A", marginBottom: 4 }}>{c.title}</div>
                    <div style={{ fontSize: 12, color: "#64748B", marginBottom: 10 }}>{c.desc}</div>
                    <a href={c.href} style={{ fontSize: 13, color: "#2E6BEA" }}>{c.val}</a>
                  </div>
                ))}
              </div>
              <div style={{ ...S.card, padding: 24 }}>
                <div style={{ fontWeight: 700, fontSize: 15, color: "#0F172A", marginBottom: 18 }}>Envoyer un message</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                  <div><label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#334155", marginBottom: 5 }}>Prénom</label><input style={{ width: "100%", padding: "10px 14px", borderRadius: 12, border: "1px solid #E2E8F0", background: "#F1F5F9", fontFamily: "inherit", fontSize: 13, outline: "none" }} placeholder="Jean" /></div>
                  <div><label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#334155", marginBottom: 5 }}>Nom</label><input style={{ width: "100%", padding: "10px 14px", borderRadius: 12, border: "1px solid #E2E8F0", background: "#F1F5F9", fontFamily: "inherit", fontSize: 13, outline: "none" }} placeholder="Dupont" /></div>
                </div>
                <div style={{ marginBottom: 12 }}><label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#334155", marginBottom: 5 }}>Email</label><input type="email" style={{ width: "100%", padding: "10px 14px", borderRadius: 12, border: "1px solid #E2E8F0", background: "#F1F5F9", fontFamily: "inherit", fontSize: 13, outline: "none" }} placeholder="jean@email.com" /></div>
                <div style={{ marginBottom: 12 }}><label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#334155", marginBottom: 5 }}>Sujet</label>
                  <select style={{ width: "100%", padding: "10px 14px", borderRadius: 12, border: "1px solid #E2E8F0", background: "#F1F5F9", fontFamily: "inherit", fontSize: 13, outline: "none" }}>
                    <option>Question sur mon compte</option><option>Problème technique</option><option>Question sur la facturation</option><option>Question sur le crédit d'impôt</option><option>Aide à l'inscription auto-entrepreneur</option><option>Autre</option>
                  </select>
                </div>
                <div style={{ marginBottom: 16 }}><label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#334155", marginBottom: 5 }}>Message</label><textarea style={{ width: "100%", padding: "10px 14px", borderRadius: 12, border: "1px solid #E2E8F0", background: "#F1F5F9", fontFamily: "inherit", fontSize: 13, outline: "none", resize: "none", height: 96 }} placeholder="Décrivez votre demande..." /></div>
                <button style={{ ...S.btnPrimary, width: "100%", justifyContent: "center" }}>Envoyer le message</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
