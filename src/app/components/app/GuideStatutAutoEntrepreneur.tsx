import { useNavigate } from "react-router";
import { ChevronLeft, AlertTriangle, Info, Lightbulb, CheckCircle2 } from "lucide-react";

// ─── INPI design tokens ────────────────────────────────────────────
const T = "#009EA0";
const TL = "#E6F7F7";
const GB = "#C9CCCF";
const GL = "#F5F6F7";
const RD = "#DC2626";

// ─── INPI micro-components ─────────────────────────────────────────

function ILabel({ children, req }: { children: React.ReactNode; req?: boolean }) {
  return (
    <p style={{ fontSize: 11, color: "#4B5563", fontWeight: 500, marginBottom: 3, lineHeight: 1.35 }}>
      {children}{req && <span style={{ color: RD }}> *</span>}
      {req && <span style={{ color: RD, fontSize: 9, marginLeft: 2 }}>ⓘ</span>}
    </p>
  );
}

function IInput({ val, hi, mono, placeholder }: { val?: string; hi?: boolean; mono?: boolean; placeholder?: string }) {
  return (
    <div style={{
      border: `1px solid ${hi ? RD : GB}`,
      boxShadow: hi ? `0 0 0 1px ${RD}` : "none",
      borderRadius: 3, padding: "6px 9px", background: "#fff",
      fontSize: 12, color: val ? "#111827" : "#9CA3AF", minHeight: 31,
      fontFamily: mono ? "monospace" : "inherit",
    }}>
      {val || placeholder || ""}
    </div>
  );
}

function IInputArea({ val, hi }: { val: string; hi?: boolean }) {
  return (
    <div style={{
      border: `1px solid ${hi ? RD : GB}`,
      boxShadow: hi ? `0 0 0 1px ${RD}` : "none",
      borderRadius: 3, padding: "7px 9px", background: "#fff",
      fontSize: 11, color: "#111827", minHeight: 56, lineHeight: 1.55,
    }}>
      {val}
    </div>
  );
}

function ISelect({ val, hi }: { val: string; hi?: boolean }) {
  return (
    <div style={{
      border: `1px solid ${hi ? RD : GB}`,
      boxShadow: hi ? `0 0 0 1px ${RD}` : "none",
      borderRadius: 3, padding: "6px 9px", background: "#fff",
      fontSize: 12, display: "flex", justifyContent: "space-between", alignItems: "center",
    }}>
      <span style={{ color: "#111827" }}>{val}</span>
      <span style={{ color: "#9CA3AF", fontSize: 9 }}>▾</span>
    </div>
  );
}

function IRadio({ checked, label }: { checked: boolean; label: string }) {
  return (
    <label style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, cursor: "default" }}>
      <div style={{ width: 15, height: 15, borderRadius: "50%", border: `2px solid ${checked ? T : GB}`, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        {checked && <div style={{ width: 6, height: 6, borderRadius: "50%", background: T }} />}
      </div>
      <span style={{ color: "#111827" }}>{label}</span>
    </label>
  );
}

function ICheck({ checked, label }: { checked: boolean; label?: string }) {
  return (
    <label style={{ display: "inline-flex", alignItems: "flex-start", gap: 6, fontSize: 11, cursor: "default" }}>
      <div style={{ width: 14, height: 14, borderRadius: 2, border: `1.5px solid ${checked ? T : GB}`, background: checked ? T : "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
        {checked && <span style={{ color: "#fff", fontSize: 8, lineHeight: 1, fontWeight: 900 }}>✓</span>}
      </div>
      {label && <span style={{ color: "#4B5563", lineHeight: 1.5 }}>{label}</span>}
    </label>
  );
}

function ISection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `2px solid ${T}`, paddingBottom: 5, marginBottom: 10 }}>
        <span style={{ color: T, fontWeight: 700, fontSize: 13 }}>{title}</span>
        <span style={{ color: T, fontSize: 13, lineHeight: 1 }}>∧</span>
      </div>
      {children}
    </div>
  );
}

// Single red-highlight box — wrap only once
function IHi({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ outline: `2px solid ${RD}`, outlineOffset: 1, borderRadius: 3 }}>{children}</div>
  );
}

function IRow({ children, cols = "1fr 1fr" }: { children: React.ReactNode; cols?: string }) {
  return <div style={{ display: "grid", gridTemplateColumns: cols, gap: 10, marginBottom: 8 }}>{children}</div>;
}

function IField({ label, req, children }: { label: string; req?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <ILabel req={req}>{label}</ILabel>
      {children}
    </div>
  );
}

function IRadioGroup({ options, selected }: { options: string[]; selected: string }) {
  return (
    <div style={{ display: "flex", gap: 14, marginTop: 4 }}>
      {options.map(o => <IRadio key={o} checked={o === selected} label={o} />)}
    </div>
  );
}

function INote({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontSize: 10, color: "#6B7280", marginTop: 3, lineHeight: 1.45 }}>{children}</p>
  );
}

// Divider info-box (matches the amber INPI site warnings)
function IWarn({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: "#FFFBF3", border: "1px solid #F59E0B", borderRadius: 4, padding: "8px 10px", fontSize: 11, color: "#92400E", lineHeight: 1.5, marginTop: 8 }}>
      {children}
    </div>
  );
}

// ─── INPI nav sidebar ──────────────────────────────────────────────

function ISidebar({ active, done = [] }: { active: string; done?: string[] }) {
  const items: { id: string; label: string; subs?: string[] }[] = [
    { id: "identite", label: "Identité de l'entreprise", subs: ["Entrepreneur", "Entreprise", "Contrat d'appui"] },
    { id: "composition", label: "Composition" },
    { id: "insaisissabilite", label: "Insaisissabilité", subs: ["Résidence principale", "Autres résidences"] },
    { id: "etablissements", label: "Établissements", subs: ["Informations générales", "Activités", "Nom de domaine internet"] },
    { id: "options", label: "Options fiscales" },
    { id: "pieces", label: "Pièces jointes" },
    { id: "observations", label: "Observations et correspondance" },
    { id: "recapitulatif", label: "Récapitulatif" },
  ];
  return (
    <div style={{ width: 178, background: GL, borderRight: `1px solid ${GB}`, padding: "10px 0", flexShrink: 0 }}>
      {items.map((item) => {
        const isActive = item.id === active;
        const isDone = done.includes(item.id);
        return (
          <div key={item.id}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "5px 10px", background: isActive ? TL : "transparent" }}>
              <div style={{
                width: 20, height: 20, borderRadius: "50%",
                border: `2px solid ${isDone ? T : isActive ? T : GB}`,
                background: isDone ? T : "transparent",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                {isDone
                  ? <span style={{ color: "#fff", fontSize: 9, fontWeight: 900 }}>✓</span>
                  : isActive
                  ? <span style={{ width: 7, height: 7, borderRadius: "50%", background: T, display: "block" }} />
                  : null}
              </div>
              <span style={{ fontSize: 10.5, color: isActive ? T : isDone ? "#374151" : "#9CA3AF", fontWeight: isActive || isDone ? 600 : 400, lineHeight: 1.3 }}>{item.label}</span>
            </div>
            {isActive && item.subs?.map((sub) => (
              <div key={sub} style={{ padding: "2px 10px 2px 37px", fontSize: 10, color: T, fontWeight: 500 }}>{sub}</div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

// ─── INPI shell wrapper ────────────────────────────────────────────

function IShell({ sidebar, done, step, children }: { sidebar: string; done?: string[]; step: string; children: React.ReactNode }) {
  return (
    <div style={{ border: `1px solid ${GB}`, borderRadius: 10, overflow: "hidden", background: "#fff", userSelect: "none", pointerEvents: "none", boxShadow: "0 2px 12px rgba(0,0,0,.06)" }}>
      {/* INPI breadcrumb header */}
      <div style={{ background: "#fff", borderBottom: `1px solid ${GB}`, padding: "8px 16px" }}>
        <p style={{ fontSize: 10, color: "#6B7280", marginBottom: 3 }}>
          Les champs suivis d'une étoile (<span style={{ color: RD }}>*</span>) sont obligatoires.
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <p style={{ fontSize: 10, color: "#6B7280" }}>Nom du brouillon <span style={{ color: RD }}>*</span> <span style={{ color: "#9CA3AF" }}>ⓘ</span></p>
          <div style={{ border: `1px solid ${T}`, borderRadius: 3, padding: "2px 8px", fontSize: 11, color: "#111827", display: "inline-block" }}>
            Création statut micro-entrepreneur
          </div>
        </div>
      </div>
      {/* Body */}
      <div style={{ display: "flex" }}>
        <ISidebar active={sidebar} done={done} />
        <div style={{ flex: 1, padding: "14px 18px", overflowY: "auto", maxHeight: 500 }}>{children}</div>
      </div>
      {/* Footer */}
      <div style={{ background: GL, borderTop: `1px solid ${GB}`, padding: "7px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ border: `1.5px solid ${T}`, color: T, padding: "4px 12px", borderRadius: 3, fontSize: 10.5, fontWeight: 700 }}>← ÉTAPE PRÉCÉDENTE</div>
        <span style={{ fontSize: 10, color: "#6B7280" }}>{step}</span>
        <div style={{ background: T, color: "#fff", padding: "4px 12px", borderRadius: 3, fontSize: 10.5, fontWeight: 700 }}>ÉTAPE SUIVANTE →</div>
      </div>
    </div>
  );
}

// ─── Callout boxes ─────────────────────────────────────────────────

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

function Note({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl p-4" style={{ background: "#FFF7ED", border: "1.5px solid #FB923C" }}>
      <div className="flex gap-3 items-start">
        <Info className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "#EA580C" }} />
        <div>
          <p className="font-bold text-xs mb-1.5" style={{ color: "#9A3412" }}>{title}</p>
          <div className="text-xs leading-relaxed" style={{ color: "#7C2D12" }}>{children}</div>
        </div>
      </div>
    </div>
  );
}

function Tip({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl p-4" style={{ background: "#FEFCE8", border: "1.5px solid #FDE047" }}>
      <div className="flex gap-3 items-start">
        <Lightbulb className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "#CA8A04" }} />
        <div>
          <p className="font-bold text-xs mb-1.5" style={{ color: "#713F12" }}>{title}</p>
          <div className="text-xs leading-relaxed" style={{ color: "#713F12" }}>{children}</div>
        </div>
      </div>
    </div>
  );
}

function Win({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl p-4" style={{ background: "#F0FDF4", border: "1.5px solid #86EFAC" }}>
      <div className="flex gap-3 items-start">
        <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "#16A34A" }} />
        <div className="text-xs leading-relaxed" style={{ color: "#166534" }}>{children}</div>
      </div>
    </div>
  );
}

// ─── Step layout ───────────────────────────────────────────────────

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
      <div style={{ paddingTop: 52, display: "flex", flexDirection: "column" as const, gap: 10 }}>{callouts}</div>
    </div>
  );
}

// ─── Mock INPI étapes ──────────────────────────────────────────────

function MockStep1() {
  return (
    <IShell sidebar="identite" step="1 / 9">
      <ISection title="Nature de la création">
        <IRow>
          <IHi>
            <IField label="Forme de l'entreprise souhaitée" req>
              <div style={{ fontSize: 12, color: "#111827", padding: "2px 0" }}>Entrepreneur individuel</div>
            </IField>
          </IHi>
          <IHi>
            <IField label="Souhaitez-vous opter pour le statut micro entrepreneur ?" req>
              <div style={{ fontSize: 12, color: "#111827", padding: "2px 0" }}>Oui</div>
            </IField>
          </IHi>
        </IRow>
        <IField label="L'entrepreneur a-t-il déjà exercé une activité non salariée en France ?" req>
          <IRadioGroup options={["Oui", "Non"]} selected="Non" />
        </IField>
      </ISection>
      <ISection title="Entrepreneur">
        <IRow>
          <IField label="Prénom 1" req><IInput val="Martin" /></IField>
          <IField label="Prénom 2"><IInput val="Théophile" /></IField>
        </IRow>
        <IRow>
          <IField label="Prénom 3"><IInput val="Esteban" /></IField>
          <IField label="Prénom 4"><IInput /></IField>
        </IRow>
        <IRow>
          <IField label="Nom de naissance" req><IInput val="DIGHIERO–BRECHT" /></IField>
          <IField label="Genre" req><ISelect val="Masculin" /></IField>
        </IRow>
        <IRow>
          <IField label="Titre"><IInput placeholder="" /></IField>
          <IField label="Nom d'usage"><IInput /></IField>
        </IRow>
        <IRow>
          <IField label="Pseudonyme"><IInput /></IField>
          <IField label="Date de naissance" req>
            <IInput val="15/10/2005" />
            <INote>Exemple : 31/01/2023</INote>
          </IField>
        </IRow>
      </ISection>
    </IShell>
  );
}

function MockStep2() {
  return (
    <IShell sidebar="identite" step="1 / 9">
      <ISection title="Régime microsocial">
        <IHi>
          <IField label="Périodicité de versement" req><ISelect val="Mensuel" /></IField>
        </IHi>
      </ISection>
      <ISection title="Adresse de l'entrepreneur">
        <IField label="Sélectionner une adresse déjà saisie :"><ISelect val="6 BOULEVARD C…" /></IField>
        <IRow>
          <IField label="Pays" req><ISelect val="FRANCE" /></IField>
        </IRow>
        <IField label="Adresse" req>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 6 }}>
            <IInput val="6 BOULEVARD C…" />
            <ISelect val="…" />
          </div>
        </IField>
        <IField label="Complément de localisation"><IInput /></IField>
      </ISection>
      <ISection title="Contact de l'entrepreneur">
        <IRow>
          <IField label="Adresse email"><IInput /></IField>
          <IField label="Téléphone" req>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <div style={{ border: `1px solid ${GB}`, borderRadius: 3, padding: "6px 8px", background: "#fff", fontSize: 11, display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
                <span>🇫🇷</span><span style={{ color: "#6B7280" }}>+33</span><span style={{ color: "#9CA3AF" }}>▾</span>
              </div>
              <IInput val="07" />
            </div>
          </IField>
        </IRow>
      </ISection>
      <ISection title="Volet social de l'entrepreneur">
        <IRow>
          <IField label="Numéro de sécurité sociale" req>
            <IHi><IInput val="105101234567890" mono /></IHi>
            <INote>15 caractères</INote>
          </IField>
          <IField label="Activité non salariée antérieure" req>
            <IRadioGroup options={["Oui", "Non"]} selected="Non" />
          </IField>
        </IRow>
        <IRow>
          <IField label="Organisme d'assurance maladie actuel" req><ISelect val="Régime général" /></IField>
          <IField label="Avez-vous déjà formulé une demande d'ACRE auprès de l'Urssaf ?" req>
            <IRadioGroup options={["Oui", "Non"]} selected="Non" />
          </IField>
        </IRow>
        <IRow>
          <IField label="Exercice d'une activité simultanée" req>
            <IRadioGroup options={["Oui", "Non"]} selected="Non" />
          </IField>
          <IField label="Affiliation biologiste">
            <IRadioGroup options={["Oui", "Non"]} selected="Non" />
          </IField>
        </IRow>
        <IRow>
          <IField label="Affiliation pharmacien">
            <IRadioGroup options={["Oui", "Non"]} selected="Non" />
          </IField>
        </IRow>
      </ISection>
    </IShell>
  );
}

function MockStep3() {
  return (
    <IShell sidebar="identite" done={[]} step="1 / 9">
      <ISection title="Adresse de l'entreprise">
        <IRow>
          <IField label="L'entrepreneur souhaite-t-il fixer l'adresse de son entreprise à son domicile personnel ?" req>
            <IRadioGroup options={["Oui", "Non"]} selected="Oui" />
          </IField>
          <IField label="Recours à une société de domiciliation d'entreprises ?" req>
            <IRadioGroup options={["Oui", "Non"]} selected="Non" />
          </IField>
        </IRow>
        <IWarn>
          Attention si vous répondez oui et fixez votre entreprise à votre domicile, vous devrez effectuer un transfert de votre entreprise en cas de déménagement de votre domicile personnel.
        </IWarn>
        <div style={{ marginTop: 12, display: "flex", gap: 8, alignItems: "flex-start" }}>
          <ICheck checked={true} />
          <p style={{ fontSize: 10, color: "#4B5563", lineHeight: 1.55, marginTop: 1 }}>
            J'ai pris connaissance du caractère obligatoire de la publicité légale de l'adresse de l'entreprise (pour le registre national des entreprises, au titre des articles L. 123-50 et L. 123-52 du code de commerce, pour le registre du commerce et des sociétés, au titre de l'article L. 123-1 du code de commerce). À ce titre, lorsque vous indiquez que l'adresse de l'entreprise est fixée à votre domicile personnel, celle-ci sera rendue publique et sera diffusée, notamment à des fins de réutilisation, (conformément à l'article D. 411-1-3 du code de la propriété intellectuelle et aux articles R. 123-50 et suivants du code de commerce).
          </p>
        </div>
        <p style={{ fontSize: 10, color: "#4B5563", lineHeight: 1.55, marginTop: 8 }}>
          D'autres solutions de domiciliation sont envisageables, comme par exemple un centre d'affaires, une pépinière d'entreprises ou les locaux d'une autre entreprise. Pour ce faire, vous pouvez sélectionner «&nbsp;Non&nbsp;» à la question «&nbsp;L'entrepreneur souhaite-t-il fixer l'adresse de son entreprise à son domicile personnel&nbsp;?&nbsp;», «&nbsp;Oui&nbsp;» à la question «&nbsp;Le déclarant a-t-il recours à une société de domiciliation&nbsp;?&nbsp;» et indiquer le numéro SIREN de l'entreprise domiciliataire.
        </p>
      </ISection>
    </IShell>
  );
}

function MockStep4() {
  return (
    <IShell sidebar="identite" done={[]} step="2 / 9">
      <ISection title="Déclaration du contrat d'appui">
        <IField label="Un contrat d'appui a-t-il été conclu ?" req>
          <div style={{ display: "flex", gap: 16, marginTop: 6 }}>
            <IRadio checked={false} label="Oui" />
            <IHi><IRadio checked={true} label="Non" /></IHi>
          </div>
        </IField>
      </ISection>
    </IShell>
  );
}

function MockStep5() {
  return (
    <IShell sidebar="composition" done={["identite"]} step="3 / 9">
      <p style={{ fontSize: 13, fontWeight: 600, color: "#111827", marginBottom: 14, lineHeight: 1.4 }}>
        Liste des personnes ayant le pouvoir d'engager l'établissement (personne différente de l'entrepreneur) et des indivisaires
      </p>
      <div style={{ border: `1.5px solid ${T}`, color: T, display: "inline-flex", alignItems: "center", padding: "5px 16px", borderRadius: 3, fontSize: 12, fontWeight: 600, marginBottom: 14, gap: 6 }}>
        + Ajouter un représentant
      </div>
      <p style={{ fontSize: 12, color: "#9CA3AF", fontStyle: "italic" }}>Aucun pouvoir n'est défini</p>
    </IShell>
  );
}

function MockStep6() {
  return (
    <IShell sidebar="insaisissabilite" done={["identite", "composition"]} step="4 / 9">
      <ISection title="Insaisissabilité">
        <IField label="Votre résidence principale ne peut pas être saisie par vos créanciers professionnels, sauf volonté contraire de votre part exprimée par déclaration devant notaire : avez-vous effectué une telle déclaration ?" req>
          <div style={{ marginTop: 4, display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ fontSize: 10, color: "#6B7280" }}>ⓘ</span>
          </div>
          <div style={{ display: "flex", gap: 16, marginTop: 6 }}>
            <IRadio checked={false} label="Oui" />
            <IHi><IRadio checked={true} label="Non" /></IHi>
          </div>
        </IField>
      </ISection>
    </IShell>
  );
}

function MockStep7() {
  return (
    <IShell sidebar="etablissements" done={["identite", "composition", "insaisissabilite"]} step="5 / 9">
      <ISection title="Description de l'établissement">
        <IRow>
          <IField label="Cet établissement est-il l'établissement principal ?" req>
            <div style={{ display: "flex", gap: 16, marginTop: 4 }}>
              <IHi><IRadio checked={true} label="Oui" /></IHi>
              <IRadio checked={false} label="Non" />
            </div>
          </IField>
          <IField label="Nom commercial">
            <IHi><IInput val="DIGHIERO–BRECHT Martin" /></IHi>
          </IField>
        </IRow>
      </ISection>
      <ISection title="Adresse de l'établissement">
        <IField label="Sélectionner une adresse déjà saisie :"><ISelect val="6 BOULEVARD CHARLES GAY – 77000 MELUN" /></IField>
        <IRow>
          <IField label="Pays" req><ISelect val="FRANCE" /></IField>
        </IRow>
        <IField label="Adresse" req>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 6 }}>
            <IInput val="6 BOULEVARD CHARLES GAY" />
            <ISelect val="MELUN" />
          </div>
        </IField>
        <IField label="Complément de localisation"><IInput /></IField>
      </ISection>
      <ISection title="Effectif salarié">
        <IRow>
          <IField label="Présence de salariés dans l'établissement en France" req>
            <IRadioGroup options={["Oui", "Non"]} selected="Non" />
          </IField>
          <IField label="Emploie son (ou ses) premier(s) salarié(s)" req>
            <IRadioGroup options={["Oui", "Non"]} selected="Non" />
          </IField>
        </IRow>
      </ISection>
    </IShell>
  );
}

function MockStep8() {
  return (
    <IShell sidebar="etablissements" done={["identite", "composition", "insaisissabilite"]} step="5 / 9">
      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12, fontSize: 11, color: T, fontWeight: 600 }}>
        <span style={{ fontSize: 13 }}>‹</span> Activités de soutien à l'enseignement
      </div>
      <ISection title="Description de l'activité">
        <IRow>
          <IField label="Activité principale pour l'établissement" req>
            <IRadioGroup options={["Oui", "Non"]} selected="Oui" />
          </IField>
          <IField label="Date de début de l'activité" req>
            <IInput val="15/04/2026" />
            <INote>Exemple : 31/01/2023</INote>
          </IField>
        </IRow>
        <IRow>
          <IField label="Exercice de l'activité" req>
            <IRadioGroup options={["Permanente", "Saisonnière"]} selected="Permanente" />
          </IField>
          <IField label="L'activité est-elle exercée de manière ambulante ?" req>
            <div style={{ display: "flex", gap: 14, marginTop: 4 }}>
              <IRadio checked={false} label="Oui" />
              <IHi><IRadio checked={true} label="Non" /></IHi>
            </div>
          </IField>
        </IRow>
        <IField label="Description de l'activité principale" req>
          <IHi><IInputArea val="Cours particuliers de soutien scolaire, à domicile chez les élèves." /></IHi>
          <INote>L'INSEE se basera sur les 140 premiers caractères du libellé de votre activité afin d'attribuer un code APE.</INote>
          <INote>Si vous souhaitez de l'aide pour identifier la catégorisation de votre activité, vous pouvez faire appel au chatbot.</INote>
        </IField>
        <IRow>
          <IField label="Catégorisation 1 de l'activité" req>
            <IHi><ISelect val="Activités de services" /></IHi>
          </IField>
          <IField label="Catégorisation 2 de l'activité" req>
            <IHi><ISelect val="Enseignement" /></IHi>
          </IField>
        </IRow>
        <IField label="Catégorisation 3 de l'activité" req>
          <IHi><ISelect val="Activités de soutien à l'enseignement" /></IHi>
        </IField>
        <div style={{ marginTop: 8, fontSize: 10.5, color: "#4B5563", lineHeight: 1.55 }}>
          <p>Vous déclarez une activité de forme <strong>Libérale</strong>.</p>
          <p style={{ marginTop: 4 }}>Si vous n'êtes pas d'accord avec cette forme d'activité, vous pouvez adapter la catégorisation de l'activité en question pour la faire correspondre au mieux avec la description détaillée de votre activité.</p>
          <p style={{ marginTop: 4, fontSize: 10, color: "#6B7280" }}>Le fait de donner, de mauvaise foi, des indications inexactes ou incomplètes en vue d'une immatriculation, d'une modification de sa situation ou de la radiation du registre national des entreprises d'une personne mentionnée aux 2° à 6° de l'article L. 123-36 est puni d'une amende de 4 500 euros et d'un emprisonnement de six mois.</p>
        </div>
      </ISection>
      <ISection title="Origine">
        <IField label="Type d'origine" req>
          <IHi><ISelect val="Création" /></IHi>
        </IField>
      </ISection>
    </IShell>
  );
}

function MockStep8b() {
  return (
    <IShell sidebar="etablissements" done={["identite", "composition", "insaisissabilite"]} step="5 / 9">
      <div style={{ marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: GL, borderRadius: 6, marginBottom: 12 }}>
          <div style={{ fontSize: 11, color: "#374151", fontWeight: 600 }}>Établissement — DIGHIERO–BRECHT Martin</div>
          <div style={{ fontSize: 10, color: "#6B7280" }}>6 BD CHARLES GAY — 77000 MELUN</div>
        </div>
        <p style={{ fontSize: 12, fontWeight: 600, color: "#111827", marginBottom: 6 }}>Liste des activités de l'établissement <span style={{ color: RD }}>*</span></p>
        <p style={{ fontSize: 11, color: "#4B5563", marginBottom: 10 }}>Ajoutez l'une après l'autre les activités exercées à l'aide du bouton ci-dessous.</p>
        <div style={{ background: T, color: "#fff", display: "inline-flex", alignItems: "center", padding: "5px 14px", borderRadius: 3, fontSize: 12, fontWeight: 600, marginBottom: 12 }}>
          Ajouter une activité
        </div>
        <p style={{ fontSize: 11, color: "#374151", fontWeight: 600, marginBottom: 8 }}>Activités exercées actuellement par l'établissement</p>
        <div style={{ border: `1px solid ${GB}`, borderRadius: 6, padding: "12px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <p style={{ fontSize: 12, fontWeight: 700, color: "#111827", marginBottom: 3 }}>Activités de soutien à l'enseignement</p>
            <p style={{ fontSize: 11, color: "#4B5563", marginBottom: 3 }}>Cours particuliers de soutien scolaire, à domicile chez les élèves.</p>
            <p style={{ fontSize: 10.5, color: T, fontWeight: 600 }}>Activité principale</p>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexShrink: 0 }}>
            <span style={{ fontSize: 11 }}>›</span>
            <span style={{ fontSize: 11, color: "#EF4444", fontWeight: 600 }}>🗑 Effacer</span>
          </div>
        </div>
      </div>
    </IShell>
  );
}

function MockStep9() {
  return (
    <IShell sidebar="options" done={["identite", "composition", "insaisissabilite", "etablissements"]} step="6 / 9">
      <ISection title="Options fiscales">
        <p style={{ fontSize: 11, color: "#4B5563", marginBottom: 8, lineHeight: 1.5 }}>
          Vous pouvez trouver plus d'informations sur les options fiscales sur la page :{" "}
          <span style={{ color: T, textDecoration: "underline", fontWeight: 500 }}>Aide à la définition des options fiscales</span>
        </p>
        <IField label="Option pour le versement libératoire" req>
          <div style={{ display: "flex", gap: 16, marginTop: 6 }}>
            <IRadio checked={false} label="Oui" />
            <IHi><IRadio checked={true} label="Non" /></IHi>
          </div>
        </IField>
      </ISection>
    </IShell>
  );
}

function MockStep10() {
  return (
    <IShell sidebar="pieces" done={["identite", "composition", "insaisissabilite", "etablissements", "options"]} step="7 / 9">
      <ISection title="Identité de l'entreprise">
        <IField label="Sélectionner un type de pièce" req>
          <ISelect val="Copie de la carte nationale d'identité" />
        </IField>
        <IField label="Justificatif d'identité (recto/verso)" req>
          <IHi>
            <div style={{ display: "flex", gap: 10, alignItems: "center", border: `1px dashed ${GB}`, borderRadius: 4, padding: "10px 14px", background: "#FAFAFA" }}>
              <div style={{ flex: 1, fontSize: 11, color: "#9CA3AF", textAlign: "center" as const }}>
                Faites glisser votre document<br />
                <span style={{ color: T, fontWeight: 600 }}>Sélectionnez un fichier</span>
              </div>
              <div style={{ borderLeft: `1px solid ${GB}`, paddingLeft: 10 }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: "#374151" }}>Photo_Identite.pdf</p>
                <p style={{ fontSize: 10, color: "#9CA3AF" }}>901 Ko</p>
                <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
                  <span style={{ fontSize: 14, cursor: "pointer" }}>✕</span>
                  <span style={{ fontSize: 14, cursor: "pointer", color: T }}>👁</span>
                </div>
              </div>
            </div>
          </IHi>
          <INote>Nota bene : Veuillez vérifier que votre copie de la carte nationale d'identité est toujours en cours de validité. Ce document ne sera pas diffusé par le Registre National des Entreprises.</INote>
        </IField>
      </ISection>
      <ISection title="Représentant ou mandataire : Représentant ou mandataire">
        <p style={{ fontSize: 10.5, color: "#4B5563", marginBottom: 8, lineHeight: 1.5 }}>Procuration signée de la personne pour le compte de laquelle le mandataire effectue la formalité</p>
        <INote>Nota bene : Si vous êtes mandataires, veuillez joindre un acte justificatif (procuration). Ce document ne sera pas diffusé par le Registre National des Entreprises.</INote>
        <div style={{ border: `1px dashed ${GB}`, borderRadius: 4, padding: "10px 14px", fontSize: 11, color: "#9CA3AF", textAlign: "center" as const, background: "#FAFAFA", marginTop: 8 }}>
          Faites glisser votre document<br />
          <span style={{ color: T, fontWeight: 600 }}>Sélectionnez un fichier</span>
        </div>
      </ISection>
      <ISection title="Pièces supplémentaires">
        <p style={{ fontSize: 11, color: "#4B5563", marginBottom: 8 }}>Déposez ici toute autre pièce que vous estimez nécessaire pour compléter votre dossier.</p>
        <span style={{ fontSize: 11, color: T, fontWeight: 600, textDecoration: "underline" }}>+ Ajouter des pièces jointes</span>
      </ISection>
    </IShell>
  );
}

function MockStep11() {
  return (
    <IShell sidebar="observations" done={["identite", "composition", "insaisissabilite", "etablissements", "options", "pieces"]} step="8 / 9">
      <ISection title="Observations et correspondance">
        <IField label="Observations">
          <div style={{ border: `1px solid ${GB}`, borderRadius: 3, padding: "8px 9px", background: "#fff", fontSize: 11, color: "#9CA3AF", minHeight: 48 }}>
            Ajoutez votre commentaire ici.
          </div>
        </IField>
        <div style={{ marginTop: 10 }}>
          <ICheck checked={true} label="Je demande que les informations enregistrées dans le répertoire Sirène ne puissent pas être consultées ni utilisées par des tiers." />
        </div>
        <p style={{ fontSize: 10, color: "#4B5563", marginTop: 8, lineHeight: 1.5 }}>
          <strong>Une partie des informations fait l'objet d'une publicité légale :</strong> ces données seront diffusées à des fins de réutilisation en données ouvertes. Ainsi vos nom, prénom, nom d'usage, mois et année de naissance, commune de résidence, tout comme les pièces annexes (statuts, PV d'assemblée générale…) seront mis à la disposition du public à des fins de réutilisation, par exemple par des sites internet d'information sur les entreprises.
        </p>
        <p style={{ fontSize: 10, color: "#4B5563", marginTop: 6, lineHeight: 1.5 }}>
          Vous pouvez vous opposer à ce que ces informations fassent l'objet d'une utilisation à des fins de <strong>prospection</strong>, toutefois leur diffusion reste autorisée.
        </p>
        <IField label="Je consens à la mise à disposition de mes données personnelles à des fins de prospection" req>
          <IRadioGroup options={["Oui", "Non"]} selected="Non" />
        </IField>
      </ISection>
      <ISection title="Correspondance">
        <p style={{ fontSize: 10, color: "#4B5563", marginBottom: 8, lineHeight: 1.5, fontStyle: "italic" }}>
          Cette information est susceptible d'être communiquée aux Chambres consulaires, ainsi qu'aux organismes fiscaux et sociaux. Les administrations pourront y adresser des documents à l'entreprise au cours de sa vie sociale.
        </p>
        <IField label="Type de destinataire" req>
          <div style={{ display: "flex", flexDirection: "column" as const, gap: 6, marginTop: 4 }}>
            <IRadio checked={false} label="L'entreprise" />
            <IRadio checked={false} label="Mandataire ayant procuration" />
            <IRadio checked={false} label="Autre personne justifiant d'un intérêt" />
            <IHi><IRadio checked={true} label="Entrepreneur" /></IHi>
          </div>
        </IField>
        <div style={{ marginTop: 10 }}>
          <IField label="Sélectionner une adresse déjà saisie :"><ISelect val="6 BOULEVARD CHARLES GAY — 77000 MELUN" /></IField>
          <IRow>
            <IField label="Complément de localisation"><IInput /></IField>
          </IRow>
          <IRow>
            <IField label="Courriel"><IInput /></IField>
            <IField label="Téléphone">
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <div style={{ border: `1px solid ${GB}`, borderRadius: 3, padding: "5px 7px", background: "#fff", fontSize: 11, display: "flex", gap: 3, flexShrink: 0 }}>
                  <span>🇫🇷</span><span style={{ color: "#6B7280" }}>+33</span><span style={{ color: "#9CA3AF" }}>▾</span>
                </div>
                <IInput val="07" />
              </div>
            </IField>
          </IRow>
        </div>
      </ISection>
    </IShell>
  );
}

function MockStep12() {
  return (
    <div style={{ border: `1px solid ${GB}`, borderRadius: 10, overflow: "hidden", background: "#fff", userSelect: "none", pointerEvents: "none", boxShadow: "0 2px 12px rgba(0,0,0,.06)" }}>
      <div style={{ padding: "22px 26px" }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: "#111827", marginBottom: 18 }}>Nouvelle entreprise</h2>
        <div style={{ marginBottom: 16 }}>
          <h3 style={{ fontWeight: 700, fontSize: 14, color: "#111827", marginBottom: 6 }}>Confirmation de la demande</h3>
          <p style={{ fontSize: 12, color: "#4B5563", lineHeight: 1.65 }}>
            Félicitations ! Votre demande de création d'entreprise a bien été enregistrée. Vous pouvez suivre l'avancement de votre formalité sur le tableau de bord avec le numéro suivant : <span style={{ color: T, fontWeight: 700 }}>J00XXXXXXXXXX</span>
          </p>
        </div>
        <div>
          <h3 style={{ fontWeight: 700, fontSize: 14, color: "#111827", marginBottom: 8 }}>Pour aller plus loin</h3>
          <ul style={{ fontSize: 11, color: "#4B5563", lineHeight: 1.7, paddingLeft: 18 }}>
            <li>Retrouvez toutes les informations et démarches administratives nécessaires à la création, à la gestion et au développement de votre entreprise en consultant le <span style={{ color: T, textDecoration: "underline" }}>site officiel d'information administrative pour les entreprises</span>.</li>
            <li style={{ marginTop: 6 }}>Prochaine étape ? Il est maintenant essentiel de <strong>valoriser</strong> et de <strong>protéger votre entreprise</strong> nouvellement créée grâce à la <strong>propriété industrielle</strong>. L'INPI vous accompagne pour :<br />
              <span style={{ color: "#9CA3AF" }}>— Vérifier la disponibilité d'un nom commercial, d'une marque sur <span style={{ color: T }}>data inpi</span></span><br />
              <span style={{ color: "#9CA3AF" }}>— Envisager la protection de vos innovations via <span style={{ color: T }}>Coaching INPI</span></span>
            </li>
          </ul>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 18 }}>
          <div style={{ background: T, color: "#fff", padding: "7px 20px", borderRadius: 4, fontSize: 12, fontWeight: 700 }}>RETOUR À L'ACCUEIL</div>
        </div>
      </div>
    </div>
  );
}

// ─── Main export ───────────────────────────────────────────────────

const TOTAL = 13;

export function GuideStatutAutoEntrepreneur() {
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
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 bg-indigo-50 rounded-lg flex items-center justify-center shrink-0">
            <span className="text-lg">🏪</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900">Créer son statut auto-entrepreneur</h1>
        </div>
        <p className="text-slate-400 text-sm ml-12 mb-4">
          Guide pas-à-pas du formulaire INPI — chaque écran est reproduit tel que vous le verrez, avec les bons choix à faire.
        </p>
        <div className="ml-12 flex flex-wrap items-center gap-2 text-xs">
          {[
            { Icon: AlertTriangle, label: "Attention", color: "#D97706", bg: "#FFFBEB", border: "#F59E0B" },
            { Icon: Info, label: "À savoir", color: "#EA580C", bg: "#FFF7ED", border: "#FB923C" },
            { Icon: Lightbulb, label: "Astuce", color: "#CA8A04", bg: "#FEFCE8", border: "#FDE047" },
            { Icon: CheckCircle2, label: "Colibri", color: "#16A34A", bg: "#F0FDF4", border: "#86EFAC" },
          ].map(({ Icon, label, color, bg, border }) => (
            <span key={label} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-medium" style={{ background: bg, border: `1px solid ${border}`, color }}>
              <Icon className="w-3 h-3" />{label}
            </span>
          ))}
        </div>
      </div>

      <div className="border-t border-slate-100 mb-12" />

      <Step n={1} total={TOTAL} title="Identité de l'entrepreneur"
        mock={<MockStep1 />}
        callouts={<>
          <Tip title="Nom du brouillon — libre">
            Vous pouvez écrire ce que vous voulez dans ce champ, c'est juste un intitulé interne pour retrouver votre dossier. <strong>«&nbsp;Création statut micro-entrepreneur&nbsp;»</strong> convient parfaitement.
          </Tip>
          <Note title="Nature de la création">
            Sélectionnez <strong>«&nbsp;Entrepreneur individuel&nbsp;»</strong> et répondez <strong>«&nbsp;Oui&nbsp;»</strong> au statut micro-entrepreneur. Ces deux champs encadrés en rouge sont les plus importants de cette page.
          </Note>
        </>}
      />

      <Step n={2} total={TOTAL} title="Régime microsocial, adresse et numéro de sécurité sociale"
        mock={<MockStep2 />}
        callouts={<>
          <Warn title="Numéro de sécu : sans espaces !">
            Le champ attend <strong>15 chiffres consécutifs</strong>, sans espace, sans tiret. Si vous copiez-collez depuis votre carte Vitale, supprimez tous les espaces. Le site vérifie automatiquement la longueur.
          </Warn>
          <Note title="Périodicité mensuelle">
            Choisissez <strong>«&nbsp;Mensuel&nbsp;»</strong>. Vous devrez déclarer vos revenus chaque mois à l'URSSAF — et vous pourrez le faire directement depuis Colibri.
          </Note>
          <Win>
            <strong>Avantage Colibri :</strong> une fois inscrit, vous n'aurez pas besoin d'aller sur le site URSSAF pour vos déclarations mensuelles. Tout se fait depuis votre tableau de bord.
          </Win>
        </>}
      />

      <Step n={3} total={TOTAL} title="Adresse de l'entreprise"
        mock={<MockStep3 />}
        callouts={<>
          <Warn title="Adresse étudiante interdite">
            L'adresse de domiciliation <strong>ne doit pas être une résidence étudiante</strong> (cité universitaire, foyer, chambre en école comme la MEUH…). Elle sera rendue publique dans le registre des entreprises.
            <br /><br />
            <strong>Pour les mineurs :</strong> indiquez l'adresse du domicile de vos <strong>parents</strong>, pas de votre école.
          </Warn>
          <Tip title="Domiciliation à votre domicile">
            Cochez <strong>«&nbsp;Oui&nbsp;»</strong> pour fixer l'adresse à votre domicile. Aucun local professionnel n'est requis pour donner des cours particuliers. Cochez également la case d'acceptation de la publicité légale pour continuer.
          </Tip>
        </>}
      />

      <Step n={4} total={TOTAL} title="Contrat d'appui (CAPE)"
        mock={<MockStep4 />}
        callouts={<>
          <Note title="Qu'est-ce qu'un contrat d'appui ?">
            Le CAPE (Contrat d'Appui au Projet d'Entreprise) est un dispositif très spécifique permettant de tester une activité quelques mois en restant demandeur d'emploi, grâce à une <strong>couveuse d'entreprise</strong> ou un incubateur qui prête son SIRET.
          </Note>
          <Warn title="Répondez « Non »">
            Vous créez votre propre micro-entreprise de façon indépendante : vous n'avez pas signé de contrat avec une couveuse, et vous aurez <strong>votre propre numéro SIRET</strong>. Répondre «&nbsp;Oui&nbsp;» par erreur bloquerait votre dossier en demandant des documents que vous n'avez pas.
          </Warn>
        </>}
      />

      <Step n={5} total={TOTAL} title="Composition — représentants de l'établissement"
        mock={<MockStep5 />}
        callouts={<>
          <Note title="Pourquoi cette section ?">
            Cette page liste les personnes ayant le pouvoir légal de signer des contrats ou des engagements financiers <strong>au nom de votre entreprise</strong> — autres que vous.
          </Note>
          <Tip title="N'ajoutez personne">
            En auto-entrepreneur, <strong>vous êtes le seul maître à bord</strong>. Ne déclarez pas vos parents, votre conjoint ou un ami, même s'ils vous aident. «&nbsp;Engager l'établissement&nbsp;» signifie pouvoir contracter des dettes en votre nom — ce n'est pas nécessaire pour donner des cours particuliers.
          </Tip>
        </>}
      />

      <Step n={6} total={TOTAL} title="Insaisissabilité de la résidence principale"
        mock={<MockStep6 />}
        callouts={<>
          <Note title="La question peut sembler piégée">
            Le site ne vous demande <strong>pas</strong> si vous souhaitez protéger votre résidence. Il vous demande si vous avez déjà effectué <strong>une démarche payante chez un notaire</strong> pour y renoncer ou pour protéger d'autres biens.
          </Note>
          <Tip title="Répondez « Non » dans presque tous les cas">
            Depuis 2015, la loi protège <strong>automatiquement et gratuitement</strong> votre résidence principale. Vous n'avez rien à faire. La déclaration notariale n'est utile que pour protéger d'autres biens immobiliers (résidence secondaire, terrain).
            <br /><br />
            Même si vous êtes <strong>locataire</strong>, répondez «&nbsp;Non&nbsp;» — la question ne change rien à votre situation.
          </Tip>
        </>}
      />

      <Step n={7} total={TOTAL} title="Établissement — nom commercial et adresse"
        mock={<MockStep7 />}
        callouts={<>
          <Note title="Nom commercial = votre identité professionnelle">
            Renseignez votre <strong>NOM DE NAISSANCE</strong> suivi de votre <strong>Prénom</strong>. Les majuscules sont indifférentes pour l'INPI.
            <br /><br />
            Exemple&nbsp;: <code style={{ background: "#FEF3C7", padding: "1px 5px", borderRadius: 3, fontFamily: "monospace" }}>DIGHIERO–BRECHT Martin</code>
          </Note>
          <Tip title="Établissement principal et adresse">
            Cochez <strong>«&nbsp;Oui&nbsp;»</strong> comme établissement principal (c'est votre unique établissement). L'adresse est automatiquement reprise depuis votre domicile saisi à l'étape précédente. Laissez «&nbsp;Non&nbsp;» pour la présence de salariés.
          </Tip>
        </>}
      />

      <Step n={8} total={TOTAL} title="Activités — description et catégorisation"
        mock={<MockStep8 />}
        callouts={<>
          <Tip title="Description exacte à copier-coller">
            <strong style={{ display: "block", marginBottom: 4 }}>Dans le champ description :</strong>
            <code style={{ display: "block", background: "#FEF3C7", padding: "5px 8px", borderRadius: 4, fontFamily: "monospace", fontSize: 11, lineHeight: 1.5 }}>
              Cours particuliers de soutien scolaire, à domicile chez les élèves.
            </code>
            <br />
            <strong style={{ display: "block", marginBottom: 4 }}>Catégorisation dans l'ordre :</strong>
            1. Activités de services<br />
            2. Enseignement<br />
            3. Activités de soutien à l'enseignement
          </Tip>
          <Note title="Activité ambulante → Non">
            «&nbsp;Ambulante&nbsp;» signifie vendre sur <strong>la voie publique ou les marchés</strong> (nécessite une carte payante). Se déplacer <strong>chez vos élèves</strong> n'est pas ambulant. Répondez <strong>«&nbsp;Non&nbsp;»</strong> sans hésiter.
          </Note>
        </>}
      />

      <Step n={9} total={TOTAL} title="Liste des activités de l'établissement"
        mock={<MockStep8b />}
        callouts={<>
          <Tip title="Une seule activité à renseigner">
            Après avoir validé la description de l'activité, vous arrivez sur cette page récapitulative. Vous y voyez l'activité que vous venez d'enregistrer. <strong>N'en ajoutez pas d'autre</strong> — une seule activité suffit pour les cours particuliers.
          </Tip>
          <Note title="Nom de domaine internet (écran suivant)">
            La page suivante vous demande un éventuel nom de domaine internet (ex&nbsp;: monsite.fr). <strong>Laissez ce champ vide</strong> — il n'est pas nécessaire pour exercer votre activité.
          </Note>
        </>}
      />

      <Step n={10} total={TOTAL} title="Options fiscales — versement libératoire"
        mock={<MockStep9 />}
        callouts={<>
          <Note title="Qu'est-ce que le versement libératoire ?">
            Cette option permet de payer l'impôt sur le revenu <strong>en même temps que vos cotisations URSSAF</strong>, à un taux fixe de 2,2% du CA. Elle est définitive pour l'année civile en cours.
          </Note>
          <Warn title="Comment choisir ?">
            <strong>Mettez «&nbsp;Non&nbsp;»</strong> si vous débutez et ne prévoyez pas de grosses sommes tout de suite, ou si vous n'êtes pas imposable (revenus sous le seuil).
            <br /><br />
            <strong>Mettez «&nbsp;Oui&nbsp;»</strong> si vous êtes déjà salarié à côté, ou si vos parents (foyer fiscal duquel vous dépendez) sont dans une tranche élevée.
            <br /><br />
            <strong>En cas de doute&nbsp;: «&nbsp;Non&nbsp;».</strong> Vous pourrez activer l'option plus tard, mais l'inverse est très contraignant.
          </Warn>
        </>}
      />

      <Step n={11} total={TOTAL} title="Pièces jointes"
        mock={<MockStep10 />}
        callouts={<>
          <Note title="Carte nationale d'identité">
            Déposez une copie de votre <strong>CNI recto/verso</strong> (ou passeport) en un seul fichier si possible. Vérifiez qu'elle est <strong>en cours de validité</strong> — l'INPI le contrôle systématiquement.
          </Note>
          <Warn title="Section « Représentant ou mandataire » — rien à déposer">
            Cette section concerne uniquement les cas où quelqu'un effectue les démarches <em>à votre place</em> avec procuration. Ce n'est pas votre cas : <strong>laissez ce champ vide</strong>.
          </Warn>
        </>}
      />

      <Step n={12} total={TOTAL} title="Observations et correspondance"
        mock={<MockStep11 />}
        callouts={<>
          <Tip title="Type de destinataire → Entrepreneur">
            Sélectionnez <strong>«&nbsp;Entrepreneur&nbsp;»</strong> comme type de destinataire. Les courriers officiels (URSSAF, administrations) seront envoyés à votre adresse personnelle.
          </Tip>
          <Note title="Données Sirène">
            Cochez la case <strong>«&nbsp;Je demande que les informations ne puissent pas être consultées par des tiers&nbsp;»</strong> pour limiter le démarchage commercial. Vos données restent malgré tout publiques dans le registre légal.
          </Note>
        </>}
      />

      <Step n={13} total={TOTAL} title="Confirmation — c'est envoyé !"
        mock={<MockStep12 />}
        callouts={<>
          <Win>
            <strong>Félicitations !</strong> Votre dossier est soumis. La demande est traitée en <strong>3 à 10 jours ouvrés</strong>. Conservez votre numéro de suivi pour suivre l'avancement.
            <br /><br />
            Dès réception de votre SIRET par courrier, renseignez-le dans <strong>Colibri → Mon profil</strong> pour débloquer la facturation.
          </Win>
          <Note title="Les étapes suivantes">
            <strong>1. Espace URSSAF</strong> — vous recevrez un email d'activation. Connectez-vous sur <em>autoentrepreneur.urssaf.fr</em> pour renseigner votre IBAN de paiement des cotisations.
            <br /><br />
            <strong>2. Demande d'ACRE</strong> (optionnel mais fortement recommandé) — vous avez <strong>45 jours</strong> pour demander l'exonération partielle de charges la première année. Consultez le guide ACRE dans le centre d'aide.
            <br /><br />
            <strong>3. Déclarations mensuelles</strong> — déclarez votre chiffre d'affaires chaque mois. Avec Colibri, tout se fait directement depuis la plateforme.
          </Note>
        </>}
      />
    </div>
  );
}
