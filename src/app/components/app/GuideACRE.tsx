import { useNavigate } from "react-router";
import { ChevronLeft, AlertTriangle, Info, Download, CalendarClock, RefreshCw, LayoutGrid, FileText, CreditCard, Mail, User, Globe, ClipboardList } from "lucide-react";

// ─── Design tokens ──────────────────────────────────────────────────

const C_HDR = "#1A3A5C";
const C_BORDER = "#999";

const U_LINK = "#1A56A0";
const U_TEAL = "#168480";
const U_BG = "#F7F8FA";
const U_BORDER = "#CBCFD3";

// ─── Shared UI primitives ───────────────────────────────────────────

function INum({ n }: { n: number }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      width: 15, height: 15, borderRadius: "50%",
      background: "#EEF2FF", border: "1.5px solid #C7D2FE",
      color: "#4338CA", fontSize: 8, fontWeight: 800,
      marginLeft: 5, flexShrink: 0, verticalAlign: "middle", lineHeight: 1,
    }}>{n}</span>
  );
}

function Warn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl p-4" style={{ background: "#FFFBEB", border: "1.5px solid #F59E0B" }}>
      <div className="flex gap-3 items-start">
        <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "#D97706" }} />
        <div>
          <p className="font-bold text-xs mb-1.5" style={{ color: "#92400E" }}>{title}</p>
          <div className="text-xs leading-relaxed" style={{ color: "#78350F" }}>{children}</div>
        </div>
      </div>
    </div>
  );
}

function Note({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl p-4" style={{ background: "#EFF6FF", border: "1.5px solid #93C5FD" }}>
      <div className="flex gap-3 items-start">
        <Info className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "#3B82F6" }} />
        <div>
          {title && <p className="font-bold text-xs mb-1.5" style={{ color: "#1E40AF" }}>{title}</p>}
          <div className="text-xs leading-relaxed" style={{ color: "#1E3A8A" }}>{children}</div>
        </div>
      </div>
    </div>
  );
}

function Step({ n, total, title, mock, callouts }: { n: number; total: number; title: string; mock: React.ReactNode; callouts: React.ReactNode }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "55% 45%", gap: 28, marginBottom: 60, alignItems: "start" }}>
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#EEF2FF", border: "2px solid #C7D2FE", color: "#4338CA", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 13, flexShrink: 0 }}>
            {n}
          </div>
          <div>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" as const, color: "#818CF8", marginBottom: 1 }}>
              Étape {n} / {total}
            </p>
            <h2 style={{ fontWeight: 700, fontSize: 16, color: "#0F172A", lineHeight: 1.2 }}>{title}</h2>
          </div>
        </div>
        {mock}
      </div>
      <div style={{ paddingTop: 52, paddingRight: 16, display: "flex", flexDirection: "column" as const, gap: 10 }}>{callouts}</div>
    </div>
  );
}

// ─── Cerfa paper form components ───────────────────────────────────

function CLabel({ children, num }: { children: React.ReactNode; num?: number }) {
  return (
    <p style={{ fontSize: 8, color: "#333", fontWeight: 700, marginBottom: 2, textTransform: "uppercase" as const, letterSpacing: "0.05em" }}>
      {children}{num !== undefined && <INum n={num} />}
    </p>
  );
}

function CInput({ val, placeholder, mono, wide }: { val?: string; placeholder?: string; mono?: boolean; wide?: boolean }) {
  return (
    <div style={{
      border: `1px solid ${C_BORDER}`,
      minHeight: wide ? 26 : 20,
      padding: "2px 5px",
      background: "#fff",
      fontSize: mono ? 10 : 11,
      color: val ? "#111" : "#bbb",
      fontFamily: mono ? "monospace" : "inherit",
      letterSpacing: mono ? "0.12em" : "normal",
    }}>
      {val || placeholder || ""}
    </div>
  );
}

function CField({ label, num, children }: { label: string; num?: number; children: React.ReactNode }) {
  return (
    <div>
      <CLabel num={num}>{label}</CLabel>
      {children}
    </div>
  );
}

function CRow({ children, cols = "1fr 1fr" }: { children: React.ReactNode; cols?: string }) {
  return <div style={{ display: "grid", gridTemplateColumns: cols, gap: 8, marginBottom: 7 }}>{children}</div>;
}

function CCheck({ checked, label, num, sub }: { checked: boolean; label: string | React.ReactNode; num?: number; sub?: string }) {
  return (
    <div style={{ marginBottom: 6 }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 6 }}>
        <div style={{
          width: 11, height: 11,
          border: `1.5px solid ${checked ? C_HDR : C_BORDER}`,
          background: checked ? C_HDR : "#fff",
          flexShrink: 0, marginTop: 1,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          {checked && <span style={{ color: "#fff", fontSize: 8, fontWeight: 900, lineHeight: 1 }}>✓</span>}
        </div>
        <span style={{ fontSize: 9.5, color: checked ? "#111" : "#555", lineHeight: 1.45, fontWeight: checked ? 700 : 400 }}>
          {label}{num !== undefined && <INum n={num} />}
        </span>
      </div>
      {sub && <p style={{ fontSize: 8.5, color: "#888", marginLeft: 17, marginTop: 1, fontStyle: "italic" }}>{sub}</p>}
    </div>
  );
}

function CSection({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ background: C_HDR, color: "#fff", padding: "4px 8px", fontSize: 9, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase" as const, marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ background: "rgba(255,255,255,0.2)", borderRadius: 2, padding: "0 4px", fontSize: 9 }}>{n}</span>
        {title}
      </div>
      <div style={{ padding: "0 4px" }}>{children}</div>
    </div>
  );
}

function CForm({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      border: `1px solid ${C_BORDER}`,
      background: "#FAFAFA",
      padding: "12px 14px",
      boxShadow: "0 3px 14px rgba(0,0,0,.10)",
      borderRadius: 3,
      userSelect: "none" as const,
      pointerEvents: "none" as const,
    }}>
      {/* Form header */}
      <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 12, paddingBottom: 10, borderBottom: `2px solid ${C_HDR}` }}>
        <div style={{ flexShrink: 0, textAlign: "center" as const, borderRight: `1px solid #ccc`, paddingRight: 10 }}>
          <div style={{ fontSize: 7, color: "#555", lineHeight: 1.5, textTransform: "uppercase" as const }}>
            Ministère du Travail<br />de l'Emploi et<br />de l'Insertion
          </div>
          <div style={{ fontSize: 6.5, color: "#888", marginTop: 4, fontStyle: "italic", background: "#E8EBF0", padding: "2px 4px", borderRadius: 2 }}>Cerfa n° 13584*02</div>
        </div>
        <div style={{ flex: 1, textAlign: "center" as const }}>
          <p style={{ fontSize: 11.5, fontWeight: 900, color: C_HDR, letterSpacing: "0.01em", lineHeight: 1.3, textTransform: "uppercase" as const }}>
            Demande d'aide à la création<br />ou à la reprise d'entreprise
          </p>
          <p style={{ fontSize: 10.5, fontWeight: 900, color: "#B91C1C", marginTop: 3, letterSpacing: "0.08em" }}>(ACRE)</p>
          <p style={{ fontSize: 7.5, color: "#666", marginTop: 3, fontStyle: "italic", lineHeight: 1.5 }}>
            À adresser à l'URSSAF dans les <strong>45 jours</strong> suivant la date de création ou de reprise de l'entreprise
          </p>
        </div>
      </div>
      {children}
    </div>
  );
}

// ─── URSSAF web components ──────────────────────────────────────────

function UHeader() {
  return (
    <div style={{ background: "#fff", borderBottom: `1px solid ${U_BORDER}`, padding: "8px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div>
        <p style={{ fontSize: 6.5, color: U_LINK, fontWeight: 700, letterSpacing: "0.05em", lineHeight: 1.3, marginBottom: 3 }}>
          BIENVENUE SUR LE SERVICE AUTOENTREPRENEUR
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <span style={{ fontSize: 15, fontWeight: 900, color: "#1A3D5C", letterSpacing: "-0.01em" }}>
            <span style={{ color: U_TEAL }}>U</span>rssaf
          </span>
          <span style={{ fontSize: 7, color: "#aaa", fontStyle: "italic" }}>Au service de notre protection sociale</span>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ textAlign: "right" as const }}>
          <p style={{ fontSize: 8, color: "#888", lineHeight: 1.2 }}>Martin</p>
          <p style={{ fontSize: 8.5, fontWeight: 700, color: "#222", lineHeight: 1.2 }}>DIGHIERO–BRECHT</p>
        </div>
        <div style={{ width: 22, height: 22, borderRadius: "50%", background: "#E53E3E", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 900 }}>1</div>
      </div>
    </div>
  );
}

function UNav() {
  const items = ["S'informer sur le statut", "Créer mon auto-entreprise", "Gérer mon auto-entreprise", "Une question ?"];
  return (
    <div style={{ borderBottom: `1px solid ${U_BORDER}`, padding: "0 16px", display: "flex", background: "#fff" }}>
      {items.map((item, i) => (
        <div key={i} style={{
          padding: "7px 11px", fontSize: 9.5,
          color: item === "Gérer mon auto-entreprise" ? "#1A3D5C" : "#666",
          fontWeight: item === "Gérer mon auto-entreprise" ? 700 : 400,
          borderBottom: item === "Gérer mon auto-entreprise" ? "3px solid #1A3D5C" : "3px solid transparent",
          marginBottom: -1,
          whiteSpace: "nowrap" as const,
        }}>{item}</div>
      ))}
    </div>
  );
}

function USearchBar() {
  return (
    <div style={{ background: "#fff", borderBottom: `1px solid ${U_BORDER}`, padding: "5px 16px" }}>
      <div style={{ display: "flex", alignItems: "center", border: `1px solid ${U_BORDER}`, borderRadius: 3, overflow: "hidden" }}>
        <span style={{ flex: 1, padding: "4px 10px", fontSize: 9, color: "#bbb", background: "#fff" }}>ex : déclarer et payer mes cotisations, obtenir une attestation...</span>
        <div style={{ background: U_LINK, padding: "5px 7px", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        </div>
      </div>
    </div>
  );
}

function UShell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ border: `1px solid ${U_BORDER}`, borderRadius: 8, overflow: "hidden", background: "#fff", userSelect: "none" as const, pointerEvents: "none" as const, boxShadow: "0 3px 16px rgba(0,0,0,.08)" }}>
      <UHeader />
      <UNav />
      <USearchBar />
      <div style={{ padding: "12px 16px", background: U_BG }}>{children}</div>
    </div>
  );
}

// ─── Mock components ───────────────────────────────────────────────

function MockCerfa1() {
  return (
    <CForm>
      <CSection n="1" title="Identification du demandeur">
        <CRow>
          <CField label="Nom de naissance" num={1}>
            <CInput val="DIGHIERO–BRECHT" />
          </CField>
          <CField label="Prénom(s)" num={2}>
            <CInput val="Martin Théophile" />
          </CField>
        </CRow>
        <CRow cols="1fr 1fr 1fr">
          <CField label="Date de naissance" num={3}>
            <CInput val="15 / 10 / 2005" />
          </CField>
          <CField label="Département de naissance">
            <CInput val="77" />
          </CField>
          <CField label="Commune de naissance">
            <CInput val="MELUN" />
          </CField>
        </CRow>
        <div style={{ marginBottom: 7 }}>
          <CField label="Numéro et voie">
            <CInput val="6 BOULEVARD CHARLES GAY" />
          </CField>
        </div>
        <CRow cols="90px 1fr 1fr">
          <CField label="Code postal">
            <CInput val="77000" />
          </CField>
          <CField label="Commune">
            <CInput val="MELUN" />
          </CField>
          <CField label="Pays">
            <CInput val="FRANCE" />
          </CField>
        </CRow>
        <CRow>
          <CField label="Téléphone">
            <CInput val="07 XX XX XX XX" />
          </CField>
          <CField label="Adresse e-mail">
            <CInput val="martin@email.fr" />
          </CField>
        </CRow>
      </CSection>

      <CSection n="2" title="Identification de l'entreprise créée ou reprise">
        <div style={{ marginBottom: 7 }}>
          <CField label="Numéro SIRET (14 chiffres)" num={4}>
            <CInput val="1 2 3  4 5 6  7 8 9  0 0 0  1 2" mono />
          </CField>
        </div>
        <CRow>
          <CField label="Dénomination sociale / Nom commercial">
            <CInput val="DIGHIERO–BRECHT Martin" />
          </CField>
          <CField label="Date de début d'activité" num={5}>
            <CInput val="15 / 04 / 2026" />
          </CField>
        </CRow>
        <CField label="Adresse du siège social">
          <CInput val="6 BOULEVARD CHARLES GAY — 77000 MELUN" />
        </CField>
        <div style={{ marginTop: 7 }}>
          <CField label="Nature de l'activité">
            <CInput val="Cours particuliers à domicile" />
          </CField>
        </div>
      </CSection>
    </CForm>
  );
}

function MockCerfa2() {
  return (
    <CForm>
      <CSection n="3" title="Critères d'éligibilité — cocher au moins une case">
        <CCheck checked={false} label="Demandeur d'emploi indemnisé (ARE ou ASS)" />
        <CCheck checked={false} label="Demandeur d'emploi non indemnisé inscrit à France Travail depuis plus de 6 mois" />
        <CCheck checked={false} label="Bénéficiaire du RSA ou conjoint d'un bénéficiaire du RSA" />
        <CCheck
          checked={true}
          num={1}
          label={<><strong>Âgé de 18 à 25 ans révolus</strong> (sans autre condition requise)</>}
          sub="→ C'est votre cas — cochez uniquement cette case"
        />
        <CCheck checked={false} label="Âgé de 26 à 29 ans révolus et non soumis à l'obligation d'assurance chômage" />
        <CCheck checked={false} label="Contrat d'appui au projet d'entreprise (CAPE)" />
        <CCheck checked={false} label="Implantation dans un quartier prioritaire de la ville (QPV)" />
        <CCheck checked={false} label="Bénéficiaire PreParE ou travailleur reconnu handicapé" />
      </CSection>

      <CSection n="4" title="Attestation et signature">
        <p style={{ fontSize: 8, color: "#444", lineHeight: 1.55, marginBottom: 9, fontStyle: "italic" }}>
          Je soussigné(e) certifie sur l'honneur l'exactitude des renseignements fournis dans la présente demande et m'engage à signaler toute modification de ma situation.
        </p>
        <CRow>
          <CField label="Fait à" num={2}>
            <CInput val="MELUN" />
          </CField>
          <CField label="Le" num={2}>
            <CInput val="__ / __ / 2026" />
          </CField>
        </CRow>
        <CField label="Signature du demandeur (manuscrite)">
          <div style={{ border: `1px solid ${C_BORDER}`, minHeight: 44, background: "#fff", position: "relative" as const }}>
            <span style={{ position: "absolute" as const, bottom: 4, right: 6, fontSize: 7.5, color: "#ccc", fontStyle: "italic" }}>signer ici</span>
          </div>
        </CField>
      </CSection>
    </CForm>
  );
}

function MockURSSAFDashboard() {
  type Sub = { label: string; n?: number };
  type Tile = { label: string; subs: Sub[]; Icon: React.ElementType; highlight?: boolean };

  const tiles: Tile[] = [
    { label: "Mes échéances en cours", subs: [{ label: "Déclarer et payer" }, { label: "Calendrier des échéances" }], Icon: CalendarClock },
    { label: "Régulariser ma situation", subs: [{ label: "Échéances à régulariser" }, { label: "Modifier une déclaration" }], Icon: RefreshCw },
    { label: "Mes plateformes", subs: [{ label: "Déclarations plateformes" }, { label: "Questions plateforme" }], Icon: LayoutGrid },
    { label: "Mes documents", subs: [{ label: "Historique déclarations" }, { label: "Mes attestations" }], Icon: FileText },
    { label: "Mes paiements", subs: [{ label: "Mes versements" }, { label: "Situation du compte" }, { label: "Délais de paiement" }], Icon: CreditCard },
    { label: "Ma messagerie", subs: [{ label: "Messages reçus" }, { label: "Messages envoyés" }, { label: "Nouveau message", n: 2 }], Icon: Mail, highlight: true },
    { label: "Mon compte", subs: [{ label: "Informations personnelles" }, { label: "Moyens de paiement" }, { label: "Mes paramètres" }], Icon: User },
    { label: "Travailler à l'étranger", subs: [{ label: "Mon tableau de bord" }], Icon: Globe },
    { label: "Mes demandes en cours", subs: [{ label: "Aucune demande en cours" }], Icon: ClipboardList },
  ];

  return (
    <UShell>
      <p style={{ fontSize: 8, color: "#aaa", marginBottom: 6 }}>Accueil › Gérer mon auto-entreprise</p>

      <div style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
        <div style={{ flex: 1, height: 1, background: U_TEAL, opacity: 0.35 }} />
        <span style={{ padding: "0 10px", fontSize: 13, fontWeight: 700, color: "#1A3D5C" }}>Gérer</span>
        <div style={{ flex: 1, height: 1, background: U_TEAL, opacity: 0.35 }} />
      </div>

      <div style={{ background: "#fff", border: `1px solid ${U_BORDER}`, borderRadius: 5, padding: "7px 10px", marginBottom: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
          <p style={{ fontSize: 9, fontWeight: 700, color: U_LINK }}>Mon fil d'activité</p>
          <p style={{ fontSize: 7.5, color: "#aaa" }}>Dernière connexion le 04/05/2026 à 15:57</p>
        </div>
        <p style={{ fontSize: 8.5, color: "#444", lineHeight: 1.5 }}>Bienvenue sur votre espace personnel dédié aux auto-entrepreneurs.</p>
      </div>

      <div style={{ display: "flex", marginBottom: 10, borderBottom: `1px solid ${U_BORDER}` }}>
        <div style={{ padding: "5px 14px", fontSize: 9.5, fontWeight: 700, color: "#fff", background: U_LINK, borderRadius: "3px 3px 0 0" }}>Mon auto-entreprise au quotidien</div>
        <div style={{ padding: "5px 14px", fontSize: 9.5, color: U_LINK }}>Aller plus loin</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
        {tiles.map((tile, i) => (
          <div key={i} style={{
            background: tile.highlight ? "#EFF6FF" : "#fff",
            border: tile.highlight ? `2px solid ${U_LINK}` : `1px solid ${U_BORDER}`,
            borderRadius: 5, padding: "8px 10px",
          }}>
            <div style={{ width: 34, height: 34, border: `1.5px solid ${tile.highlight ? U_LINK : "#D1D5DB"}`, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 5px", background: tile.highlight ? "#DBEAFE" : U_BG }}>
              <tile.Icon style={{ width: 14, height: 14, color: tile.highlight ? U_LINK : "#9CA3AF", strokeWidth: 1.5 }} />
            </div>
            <p style={{ fontSize: 9.5, fontWeight: 700, color: tile.highlight ? U_LINK : U_TEAL, marginBottom: 4, textAlign: "center" as const, lineHeight: 1.3 }}>
              {tile.label}{tile.highlight && <INum n={1} />}
            </p>
            {tile.subs.map((sub, j) => (
              <p key={j} style={{ fontSize: 8.5, lineHeight: 1.65, color: sub.n ? U_LINK : "#aaa", fontWeight: sub.n ? 700 : 400 }}>
                {sub.label}{sub.n && <INum n={sub.n} />}
              </p>
            ))}
          </div>
        ))}
      </div>
    </UShell>
  );
}

function MockURSSAFMessagerie() {
  const msg = `Bonjour,

Suite à la création récente de mon auto-entreprise (SIRET : [numéro SIRET à 14 chiffres]), je vous sollicite par la présente pour bénéficier du dispositif ACRE.

Vous trouverez en pièces jointes à ce message l'ensemble des documents requis pour l'étude de mon dossier :
— Le formulaire de demande d'ACRE dûment rempli et signé.
— Une copie de ma pièce d'identité.

Je vous remercie par avance pour le traitement de ma demande.
Cordialement,
[Prénom NOM]`;

  return (
    <UShell>
      <p style={{ fontSize: 8, color: "#aaa", marginBottom: 2 }}>Accueil › Gérer mon auto-entreprise › Messagerie</p>
      <p style={{ fontSize: 8.5, color: U_LINK, fontWeight: 600, marginBottom: 10 }}>‹ Retour au tableau de bord</p>

      <div style={{ display: "flex", alignItems: "center", marginBottom: 10 }}>
        <div style={{ flex: 1, height: 1, background: U_TEAL, opacity: 0.4 }} />
        <span style={{ fontSize: 12, fontWeight: 700, color: "#1A3D5C", padding: "0 10px" }}>Ma messagerie — Nouveau message</span>
        <div style={{ flex: 1, height: 1, background: U_TEAL, opacity: 0.4 }} />
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", justifyContent: "center", gap: 24, marginBottom: 12, paddingBottom: 8, borderBottom: `1px solid ${U_BORDER}` }}>
        {["Messages reçus", "Messages envoyés", "Nouveau message"].map((tab) => (
          <div key={tab} style={{
            fontSize: 9.5, fontWeight: tab === "Nouveau message" ? 700 : 400,
            color: tab === "Nouveau message" ? U_LINK : "#aaa",
            borderBottom: tab === "Nouveau message" ? `2px solid ${U_LINK}` : "none",
            paddingBottom: 4,
          }}>{tab}</div>
        ))}
      </div>

      {/* Category dropdown */}
      <div style={{ marginBottom: 9 }}>
        <p style={{ fontSize: 8, color: "#555", fontWeight: 700, marginBottom: 3, textTransform: "uppercase" as const, letterSpacing: "0.05em" }}>
          Catégorie<INum n={1} />
        </p>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", border: `1px solid ${U_BORDER}`, borderRadius: 4, padding: "6px 10px", background: "#fff", fontSize: 10 }}>
          <span style={{ color: "#222" }}>L'aide à la création d'entreprise (Acre)</span>
          <span style={{ color: "#bbb", fontSize: 10 }}>▾</span>
        </div>
      </div>

      {/* Object */}
      <div style={{ marginBottom: 9 }}>
        <p style={{ fontSize: 8, color: "#555", fontWeight: 700, marginBottom: 3, textTransform: "uppercase" as const, letterSpacing: "0.05em" }}>
          Objet
        </p>
        <div style={{ border: `1px solid ${U_BORDER}`, borderRadius: 4, padding: "6px 10px", background: "#fff", fontSize: 10, color: "#333" }}>
          Demande d'ACRE — création auto-entreprise
        </div>
      </div>

      {/* Message body */}
      <div style={{ marginBottom: 9 }}>
        <p style={{ fontSize: 8, color: "#555", fontWeight: 700, marginBottom: 3, textTransform: "uppercase" as const, letterSpacing: "0.05em" }}>
          Message<INum n={2} />
        </p>
        <div style={{ border: `1px solid ${U_BORDER}`, borderRadius: 4, padding: "8px 10px", background: "#fff", fontSize: 9, color: "#333", lineHeight: 1.7, whiteSpace: "pre-wrap" as const }}>
          {msg}
        </div>
      </div>

      {/* File attachments */}
      <p style={{ fontSize: 8, color: "#555", fontWeight: 700, marginBottom: 5, textTransform: "uppercase" as const, letterSpacing: "0.05em" }}>
        Pièces jointes
      </p>
      <div style={{ display: "flex", flexDirection: "column" as const, gap: 5, marginBottom: 12 }}>
        {[
          { n: 3, name: "Formulaire-ACRE.pdf", size: "284 Ko", color: "#DC2626" },
          { n: 4, name: "CARTE_IDENTITE.pdf", size: "1.2 Mo", color: "#DC2626" },
        ].map(({ n, name, size, color }) => (
          <div key={n} style={{ display: "flex", alignItems: "center", gap: 6, border: `1px solid ${U_BORDER}`, borderRadius: 4, padding: "5px 10px", background: "#fff" }}>
            <div style={{ width: 22, height: 22, background: "#FEF2F2", border: "1px solid #FCA5A5", borderRadius: 3, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span style={{ fontSize: 7.5, fontWeight: 900, color }}>PDF</span>
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 9.5, fontWeight: 700, color: "#222", lineHeight: 1.2 }}>{name}<INum n={n} /></p>
              <p style={{ fontSize: 7.5, color: "#aaa" }}>{size}</p>
            </div>
            <span style={{ color: "#ccc", fontSize: 14, cursor: "pointer" }}>×</span>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ border: `1px dashed ${U_BORDER}`, color: U_LINK, padding: "5px 12px", borderRadius: 4, fontSize: 9, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ fontSize: 12, lineHeight: 1 }}>+</span> Ajouter une pièce jointe
        </div>
        <div style={{ background: U_TEAL, color: "#fff", padding: "6px 20px", borderRadius: 4, fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", gap: 5 }}>
          Envoyer le message <span style={{ fontSize: 11 }}>→</span>
        </div>
      </div>
    </UShell>
  );
}

// ─── ACRE intro banner ─────────────────────────────────────────────

function AcreBanner() {
  return (
    <div className="rounded-xl overflow-hidden mb-10" style={{ border: "1.5px solid #C7D2FE" }}>
      <div className="px-5 py-4 flex gap-3 items-start" style={{ background: "#EEF2FF" }}>
        <Info className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "#4338CA" }} />
        <div>
          <p className="font-bold text-sm mb-1" style={{ color: "#3730A3" }}>Qu'est-ce que l'ACRE ?</p>
          <p className="text-xs leading-relaxed" style={{ color: "#4338CA" }}>
            En tant que prof de moins de 26 ans, tu bénéficies automatiquement d'une <strong>exonération partielle de cotisations sociales</strong> lors de ta première année d'activité. Ton taux passe de ~22% à <strong>~11%</strong> pendant 4 trimestres — soit la moitié des charges.
          </p>
        </div>
      </div>
      <div className="px-5 py-3 flex gap-3 items-center" style={{ background: "#FEF9C3", borderTop: "1px solid #FDE68A" }}>
        <AlertTriangle className="w-3.5 h-3.5 shrink-0" style={{ color: "#CA8A04" }} />
        <p className="text-xs leading-relaxed" style={{ color: "#713F12" }}>
          La demande doit être envoyée dans les <strong>45 jours</strong> suivant ta date de début d'activité — passé ce délai, l'exonération est <strong>définitivement perdue</strong>, sans recours.
        </p>
      </div>
    </div>
  );
}

// ─── Main export ───────────────────────────────────────────────────

const TOTAL = 4;

export function GuideACRE() {
  const navigate = useNavigate();

  return (
    <div>
      {/* Back */}
      <button
        onClick={() => navigate("/app/aide")}
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 mb-8 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        Retour au centre d'aide
      </button>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900 mb-2">Demande ACRE</h1>
        <p className="text-slate-400 text-sm">
          Comment remplir le formulaire et l'envoyer via la messagerie URSSAF — avant le délai de 45 jours.
        </p>
      </div>

      {/* ACRE intro banner */}
      <AcreBanner />

      {/* Download button */}
      <div className="flex items-center gap-4 mb-10 p-4 rounded-xl" style={{ background: "#F8FAFC", border: "1.5px solid #E2E8F0" }}>
        <div style={{ flex: 1 }}>
          <p className="text-sm font-semibold text-slate-800 mb-0.5">Formulaire cerfa n° 13584*02</p>
          <p className="text-xs text-slate-400">Document officiel — à remplir, signer et envoyer via la messagerie URSSAF</p>
        </div>
        <a
          href="/Formulaire-ACRE.pdf"
          download="Formulaire-ACRE.pdf"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-colors"
          style={{ background: "#4F46E5", color: "#fff", textDecoration: "none", flexShrink: 0 }}
        >
          <Download className="w-4 h-4" />
          Télécharger le formulaire
        </a>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-2 text-xs mb-10">
        {[
          { Icon: Info, label: "Info / astuce", color: "#2563EB", bg: "#EFF6FF", border: "#93C5FD" },
          { Icon: AlertTriangle, label: "Attention", color: "#D97706", bg: "#FFFBEB", border: "#F59E0B" },
        ].map(({ Icon, label, color, bg, border }) => (
          <span key={label} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-medium" style={{ background: bg, border: `1px solid ${border}`, color }}>
            <Icon className="w-3 h-3" />{label}
          </span>
        ))}
      </div>

      <div className="border-t border-slate-100 mb-12" />

      <Step n={1} total={TOTAL} title="Informations personnelles et entreprise"
        mock={<MockCerfa1 />}
        callouts={<>
          <Note title="① ② État civil — soyez précis">
            Renseignez vos prénoms exactement comme sur votre CNI, y compris les accents. La <strong>date de naissance ③</strong> permet à l'URSSAF de vérifier automatiquement votre éligibilité.
          </Note>
          <Warn title="④ SIRET — attendez de le recevoir">
            Vous ne pouvez remplir ce formulaire qu'<strong>après avoir reçu votre SIRET par courrier</strong>. Il arrive généralement 1 à 2 semaines après la création sur l'INPI. Ne remplissez pas avec un SIRET hypothétique.
          </Warn>
          <Note title="⑤ Date de début d'activité">
            Reprenez exactement la date indiquée lors de la création sur l'INPI. C'est cette date qui fait courir le <strong>délai de 45 jours</strong>. Elle figure dans votre e-mail de confirmation INPI.
          </Note>
        </>}
      />

      <Step n={2} total={TOTAL} title="Critère d'éligibilité et signature"
        mock={<MockCerfa2 />}
        callouts={<>
          <Note title="① Une seule case à cocher">
            Cochez uniquement la case <strong>«&nbsp;Âgé de 18 à 25 ans révolus&nbsp;»</strong>. C'est votre unique critère. Une seule case cochée suffit — l'URSSAF vérifie votre date de naissance dans ses fichiers.
          </Note>
          <Note title="② Signature — imprimez, signez, scannez">
            Imprimez le formulaire, signez-le à la main, puis scannez-le (ou photographiez-le lisiblement). Vous pouvez aussi signer directement en PDF avec Adobe Acrobat ou Preview (Mac).
          </Note>
          <Warn title="Délai impératif : 45 jours !">
            Passé ce délai après votre date de début d'activité, l'exonération est <strong>définitivement perdue</strong>. Il n'existe aucun recours ni prolongation possible.
          </Warn>
        </>}
      />

      <Step n={3} total={TOTAL} title="Naviguer vers Ma messagerie → Nouveau message"
        mock={<MockURSSAFDashboard />}
        callouts={<>
          <Note title="① Ma messagerie — le bon endroit">
            L'ACRE ne se demande <strong>pas</strong> via un formulaire en ligne dédié. Elle passe exclusivement par la <strong>messagerie sécurisée</strong> du portail. Repérez la tuile «&nbsp;Ma messagerie&nbsp;» ① sur le tableau de bord.
          </Note>
          <Warn title="② Cliquez sur « Nouveau message »">
            Dans la tuile Ma messagerie, cliquez directement sur le lien «&nbsp;Nouveau message&nbsp;» ②. <strong>N'envoyez pas de mail</strong> depuis votre messagerie personnelle — il ne sera pas pris en compte par l'URSSAF.
          </Warn>
        </>}
      />

      <Step n={4} total={TOTAL} title="Rédiger le message et joindre les fichiers"
        mock={<MockURSSAFMessagerie />}
        callouts={<>
          <Note title="① Catégorie — choisir la bonne">
            Dans le menu déroulant ①, sélectionnez <strong>«&nbsp;L'aide à la création d'entreprise (Acre)&nbsp;»</strong>. Sans cette catégorie, le message sera traité par le mauvais service et votre dossier sera perdu.
          </Note>
          <Note title="② Modèle de message — à copier-coller">
            Copiez ce texte dans le champ message ② en remplaçant les crochets par vos informations :
            <div style={{ background: "#DBEAFE", borderRadius: 6, padding: "8px 10px", marginTop: 6, fontFamily: "monospace", fontSize: 10, lineHeight: 1.75, whiteSpace: "pre-wrap" as const, color: "#1E3A8A" }}>
{`Bonjour,

Suite à la création de mon auto-entreprise
(SIRET : [votre SIRET à 14 chiffres]), je vous
sollicite pour bénéficier du dispositif ACRE.

Pièces jointes :
— Formulaire ACRE rempli et signé
— Copie de ma pièce d'identité

Cordialement, [Prénom NOM]`}
            </div>
          </Note>
          <Warn title="③ ④ Deux pièces jointes obligatoires">
            <strong>③ Formulaire-ACRE.pdf</strong> — le cerfa rempli et signé (étapes 1 + 2).<br /><br />
            <strong>④ Pièce d'identité</strong> — CNI recto/verso ou passeport en PDF ou image lisible.<br /><br />
            Sans l'un ou l'autre, le dossier sera <strong>incomplet ou refusé</strong>. L'URSSAF accusera réception par message dans les jours suivants.
          </Warn>
        </>}
      />
    </div>
  );
}
