import { useState } from "react";
import { HelpCircle, BookOpen, FileText, Zap, ChevronDown, ChevronUp, UserPlus, CheckSquare } from "lucide-react";

const S = {
  card: { background: "#fff", border: "1px solid #E2E8F0", borderRadius: 16, boxShadow: "0 1px 3px rgba(15,23,42,.06)" } as React.CSSProperties,
  serif: { fontFamily: "'Fraunces', Georgia, serif" } as React.CSSProperties,
  eyebrow: { fontSize: 11, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase" as const, color: "#64748B" } as React.CSSProperties,
};

interface GuideItem { title: string; desc: string }
interface Guide {
  icon: React.ElementType;
  color: string;
  iconColor: string;
  title: string;
  items: GuideItem[];
}

const GUIDES: Guide[] = [
  {
    icon: BookOpen,
    color: "#EFF6FF",
    iconColor: "#2563EB",
    title: "Suivre les cours de votre enfant",
    items: [
      {
        title: "Naviguer par mois",
        desc: "Allez dans la section « Cours ». Naviguez mois par mois avec les flèches. Vous voyez tous les cours donnés, avec la date, la matière, la durée et le nom du professeur.",
      },
      {
        title: "Le calendrier des séances",
        desc: "Le mini-calendrier à gauche vous montre en un coup d'œil les jours où une séance a eu lieu. Les cases bleues = jours de cours. La case encadrée = aujourd'hui.",
      },
      {
        title: "Valider un mois",
        desc: "En fin de mois, le professeur clôture son récapitulatif et vous demande de le valider. Une notification orange apparaît en haut de la page Cours. Cliquez sur « Voir & Valider » pour consulter le détail et confirmer.",
      },
    ],
  },
  {
    icon: CheckSquare,
    color: "#ECFDF5",
    iconColor: "#059669",
    title: "Valider un récapitulatif mensuel",
    items: [
      {
        title: "Pourquoi valider ?",
        desc: "La validation confirme au professeur que vous avez bien reçu le récapitulatif des cours du mois et que vous en approuvez le contenu. C'est à partir de cette validation que la facture est générée.",
      },
      {
        title: "Comment valider ?",
        desc: "Cliquez sur « Voir & Valider » dans la bannière orange en haut de la page Cours. Vous consultez le détail de chaque cours (matière, date, durée, montant), puis vous cliquez sur « Confirmer la validation ».",
      },
      {
        title: "Et après ?",
        desc: "Une facture est générée automatiquement. Elle apparaît dans la section « Factures ». Si l'avance immédiate est active, vous ne payez que 50% du montant.",
      },
    ],
  },
  {
    icon: FileText,
    color: "#F5F3FF",
    iconColor: "#7C3AED",
    title: "Vos factures",
    items: [
      {
        title: "Quand reçoit-on une facture ?",
        desc: "Une facture est générée automatiquement après que vous avez validé le récapitulatif mensuel. Elle récapitule tous les cours du mois.",
      },
      {
        title: "Comprendre le montant",
        desc: "Le montant brut correspond au total des cours. Si l'avance immédiate Urssaf est activée, vous ne payez que 50% — l'Urssaf prend en charge l'autre moitié directement, sans remboursement à attendre.",
      },
      {
        title: "Payer une facture",
        desc: "Rendez-vous dans la section « Factures » et cliquez sur « Payer » à côté de la facture en attente. Vous pouvez payer par carte ou par virement.",
      },
    ],
  },
  {
    icon: Zap,
    color: "#FFFBEB",
    iconColor: "#D97706",
    title: "L'avance immédiate Urssaf",
    items: [
      {
        title: "Qu'est-ce que c'est ?",
        desc: "L'avance immédiate est un dispositif de l'État qui vous permet de ne payer que 50% des cours particuliers, l'autre moitié étant prise en charge directement par l'Urssaf. Contrairement au crédit d'impôt classique, vous n'avancez pas l'argent — la réduction est appliquée directement sur chaque facture.",
      },
      {
        title: "Qui y a droit ?",
        desc: "Toute famille qui fait appel à un service à la personne (cours particuliers inclus) bénéficie d'un crédit d'impôt de 50%. L'avance immédiate rend ce crédit disponible immédiatement, sans attendre la déclaration fiscale annuelle.",
      },
      {
        title: "Comment l'activer ?",
        desc: "Rendez-vous dans « Mon profil » → section « Service d'avance immédiate ». Si ce n'est pas encore activé, suivez les instructions. Vous aurez besoin de vos informations d'état civil. L'activation prend quelques minutes.",
      },
      {
        title: "Mon compte est « en attente d'activation »",
        desc: "Cela signifie que votre dossier est en cours de traitement par l'Urssaf. Consultez votre boîte mail — un email de confirmation vous a été envoyé pour finaliser l'activation. Une fois validé, la réduction s'applique automatiquement sur les prochaines factures.",
      },
    ],
  },
  {
    icon: UserPlus,
    color: "#F0FDF4",
    iconColor: "#16A34A",
    title: "Ajouter un professeur",
    items: [
      {
        title: "Obtenir le code d'invitation",
        desc: "Chaque professeur sur Colibri possède un code unique. Demandez-le lui directement. Il peut le retrouver dans son espace Colibri, section « Mon profil ».",
      },
      {
        title: "Lier un nouveau professeur",
        desc: "Allez dans « Mon profil » → section « Professeurs & matières ». Saisissez le code et cliquez sur « Ajouter ». Les cours de ce professeur apparaîtront automatiquement dans votre espace.",
      },
    ],
  },
];

function GuideSection({ icon: Icon, color, iconColor, title, items }: Guide) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ ...S.card, overflow: "hidden" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{ width: "100%", display: "flex", alignItems: "center", gap: 16, padding: "20px 24px", background: "transparent", border: "none", cursor: "pointer", textAlign: "left" }}
      >
        <div style={{ width: 44, height: 44, borderRadius: 12, background: color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icon style={{ width: 20, height: 20, color: iconColor }} />
        </div>
        <span style={{ flex: 1, fontSize: 15, fontWeight: 600, color: "#0F172A" }}>{title}</span>
        {open
          ? <ChevronUp style={{ width: 18, height: 18, color: "#94A3B8", flexShrink: 0 }} />
          : <ChevronDown style={{ width: 18, height: 18, color: "#94A3B8", flexShrink: 0 }} />}
      </button>

      {open && (
        <div style={{ borderTop: "1px solid #F1F5F9" }}>
          {items.map((item, i) => (
            <div key={i} style={{ padding: "18px 24px", borderBottom: i < items.length - 1 ? "1px solid #F8FAFC" : "none" }}>
              <div style={{ display: "flex", gap: 12 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: iconColor, marginTop: 7, flexShrink: 0 }} />
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "#0F172A", margin: "0 0 4px" }}>{item.title}</p>
                  <p style={{ fontSize: 13, color: "#64748B", margin: 0, lineHeight: 1.65 }}>{item.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function ParentAide() {
  return (
    <div style={{ maxWidth: 720, margin: "0 auto", display: "flex", flexDirection: "column", gap: 16 }}>

      {/* Header */}
      <div style={{ marginBottom: 8 }}>
        <p style={S.eyebrow}>Centre d'aide</p>
        <h1 style={{ ...S.serif, fontWeight: 400, fontSize: 40, letterSpacing: "-.02em", color: "#0F172A", margin: "6px 0 4px", lineHeight: 1.05 }}>
          Aide
        </h1>
        <p style={{ fontSize: 14, color: "#64748B", margin: 0 }}>
          Tout ce que vous devez savoir pour utiliser votre espace parent Colibri.
        </p>
      </div>

      {GUIDES.map((guide) => (
        <GuideSection key={guide.title} {...guide} />
      ))}

      {/* Footer contact */}
      <div style={{ ...S.card, padding: "18px 24px", background: "#F8FAFC", display: "flex", alignItems: "center", gap: 14 }}>
        <HelpCircle style={{ width: 20, height: 20, color: "#94A3B8", flexShrink: 0 }} />
        <p style={{ fontSize: 13, color: "#64748B", margin: 0 }}>
          Une question ? Contactez directement votre professeur — il a accès à toutes vos données et peut vous aider depuis son espace Colibri.
        </p>
      </div>
    </div>
  );
}
