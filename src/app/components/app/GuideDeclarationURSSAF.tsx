import { useNavigate } from "react-router";
import { ChevronLeft, AlertTriangle, Info, CheckCircle2, CalendarClock, RefreshCw, LayoutGrid, FileText, CreditCard, Mail, User, Globe, ClipboardList } from "lucide-react";

// ─── Design tokens ──────────────────────────────────────────────────

const U_LINK = "#1A56A0";
const U_TEAL = "#168480";
const U_BG = "#F7F8FA";
const U_BORDER = "#CBCFD3";
const U_DARK = "#1A3D5C";

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

// ─── URSSAF Shell components ────────────────────────────────────────

function UHeader({ name = "DAVION-JOUFFRE" }: { name?: string }) {
  return (
    <div style={{ background: "#fff", borderBottom: `1px solid ${U_BORDER}` }}>
      <div style={{ padding: "8px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div>
            <p style={{ fontSize: 7, color: U_LINK, fontWeight: 700, letterSpacing: "0.04em", lineHeight: 1 }}>BIENVENUE SUR<br />LE SERVICE AUTOENTREPRENEUR</p>
            <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 3 }}>
              <div style={{ background: U_DARK, color: "#fff", fontWeight: 900, fontSize: 13, padding: "2px 7px", borderRadius: 2 }}>Urssaf</div>
              <p style={{ fontSize: 7, color: "#888", fontStyle: "italic" }}>Au service de notre protection sociale</p>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <p style={{ fontSize: 9, fontWeight: 700, color: "#333", textAlign: "right" as const }}>{name}</p>
          <div style={{ width: 22, height: 22, borderRadius: "50%", background: "#E53E3E", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 900 }}>1</div>
        </div>
      </div>
    </div>
  );
}

function UNav({ active = "Gérer mon auto-entreprise" }: { active?: string }) {
  const items = ["S'informer sur le statut", "Créer mon auto-entreprise", "Gérer mon auto-entreprise", "Une question ?"];
  return (
    <div style={{ borderBottom: `1px solid ${U_BORDER}`, padding: "0 16px", display: "flex", background: "#fff" }}>
      {items.map((item, i) => (
        <div key={i} style={{
          padding: "7px 10px", fontSize: 9.5, whiteSpace: "nowrap" as const,
          color: item === active ? U_DARK : "#666",
          fontWeight: item === active ? 700 : 400,
          borderBottom: item === active ? `3px solid ${U_DARK}` : "3px solid transparent",
          marginBottom: -1,
        }}>{item}</div>
      ))}
    </div>
  );
}

function USearchBar() {
  return (
    <div style={{ background: "#fff", borderBottom: `1px solid ${U_BORDER}`, padding: "5px 16px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 0, border: `1px solid ${U_BORDER}`, borderRadius: 3, overflow: "hidden" }}>
        <span style={{ flex: 1, padding: "4px 10px", fontSize: 9, color: "#bbb", background: "#fff" }}>ex : déclarer et payer mes cotisations, obtenir une attestation...</span>
        <div style={{ background: U_LINK, padding: "5px 8px", display: "flex", alignItems: "center" }}>
          <span style={{ color: "#fff", fontSize: 10 }}>🔍</span>
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

// ─── Step 1: Dashboard ──────────────────────────────────────────────

function MockDashboard() {
  type Sub = { label: string; n?: number };
  type Tile = { label: string; subs: Sub[]; Icon: React.ElementType; highlight?: boolean };

  const tiles: Tile[] = [
    { label: "Mes échéances en cours", subs: [{ label: "Déclarer et payer", n: 1 }, { label: "Calendrier des échéances" }], Icon: CalendarClock, highlight: true },
    { label: "Régulariser ma situation", subs: [{ label: "Mes échéances à régulariser" }, { label: "Modifier une déclaration" }], Icon: RefreshCw },
    { label: "Mes plateformes", subs: [{ label: "Mes déclarations plateformes" }, { label: "Questions sur une déclaration" }], Icon: LayoutGrid },
    { label: "Mes documents", subs: [{ label: "Historique de mes déclarations" }, { label: "Mes attestations" }], Icon: FileText },
    { label: "Mes paiements", subs: [{ label: "Mes versements" }, { label: "Situation de mon compte" }, { label: "Mes délais de paiement" }], Icon: CreditCard },
    { label: "Ma messagerie", subs: [{ label: "Messages reçus" }, { label: "Messages envoyés" }, { label: "Nouveau message" }], Icon: Mail },
    { label: "Mon compte", subs: [{ label: "Mes informations personnelles" }, { label: "Mes moyens de paiement" }, { label: "Mes paramètres" }], Icon: User },
    { label: "Je pars travailler à l'étranger", subs: [{ label: "Mon tableau de bord" }], Icon: Globe },
    { label: "Mes demandes en cours", subs: [{ label: "Aucune demande en cours" }], Icon: ClipboardList },
  ];

  return (
    <UShell>
      <p style={{ fontSize: 8, color: "#aaa", marginBottom: 6 }}>Accueil › Gérer mon auto-entreprise</p>

      <div style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
        <div style={{ flex: 1, height: 1, background: U_TEAL, opacity: 0.35 }} />
        <span style={{ padding: "0 10px", fontSize: 13, fontWeight: 700, color: U_TEAL }}>Gérer</span>
        <div style={{ flex: 1, height: 1, background: U_TEAL, opacity: 0.35 }} />
      </div>

      {/* Activity feed */}
      <div style={{ background: "#fff", border: `1px solid ${U_BORDER}`, borderRadius: 5, padding: "7px 10px", marginBottom: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
          <p style={{ fontSize: 9.5, fontWeight: 700, color: U_LINK }}>Mon fil d'activité</p>
          <p style={{ fontSize: 8, color: "#aaa" }}>Dernière connexion le 04/05/2026 à 15:57</p>
        </div>
        <p style={{ fontSize: 8, color: "#888", marginBottom: 2 }}>7 janvier 2026 – 20:12</p>
        <p style={{ fontSize: 8.5, color: "#444", lineHeight: 1.5 }}>Bienvenue sur votre nouvel espace personnel en ligne, dédié aux auto-entrepreneurs.</p>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", marginBottom: 10, borderBottom: `1px solid ${U_BORDER}` }}>
        <div style={{ padding: "5px 14px", fontSize: 9.5, fontWeight: 700, color: "#fff", background: U_LINK, borderRadius: "3px 3px 0 0" }}>Mon auto-entreprise au quotidien</div>
        <div style={{ padding: "5px 14px", fontSize: 9.5, color: U_LINK }}>Aller plus loin</div>
      </div>

      {/* Tile grid */}
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

// ─── Step 2: Échéances page ─────────────────────────────────────────

function MockEcheances() {
  return (
    <UShell>
      <p style={{ fontSize: 8, color: "#aaa" }}>Accueil › Gérer mon auto-entreprise › Mes échéances en cours</p>
      <p style={{ fontSize: 8.5, color: U_LINK, fontWeight: 600, marginBottom: 10 }}>‹ Retour au tableau de bord</p>

      <div style={{ display: "flex", alignItems: "center", marginBottom: 12 }}>
        <div style={{ flex: 1, height: 1, background: U_TEAL, opacity: 0.35 }} />
        <span style={{ padding: "0 10px", fontSize: 12, fontWeight: 700, color: U_TEAL }}>Mes échéances en cours</span>
        <div style={{ flex: 1, height: 1, background: U_TEAL, opacity: 0.35 }} />
      </div>

      {/* Two icons */}
      <div style={{ display: "flex", justifyContent: "center", gap: 40, marginBottom: 14 }}>
        <div style={{ textAlign: "center" as const }}>
          <div style={{ width: 44, height: 44, border: `2px solid ${U_TEAL}`, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 4px", background: "#F0FAFA" }}>
            <FileText style={{ width: 18, height: 18, color: U_TEAL, strokeWidth: 1.5 }} />
          </div>
          <p style={{ fontSize: 9, fontWeight: 700, color: U_TEAL }}>Déclarer et payer</p>
        </div>
        <div style={{ textAlign: "center" as const }}>
          <div style={{ width: 44, height: 44, border: `1.5px solid ${U_BORDER}`, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 4px", background: "#fff" }}>
            <CalendarClock style={{ width: 18, height: 18, color: "#9CA3AF", strokeWidth: 1.5 }} />
          </div>
          <p style={{ fontSize: 9, color: "#aaa" }}>Calendrier des échéances</p>
        </div>
      </div>

      {/* Section title */}
      <p style={{ fontSize: 12, fontWeight: 700, color: U_LINK, marginBottom: 6 }}>Déclarer et payer</p>
      <p style={{ fontSize: 8.5, color: "#666", marginBottom: 10, lineHeight: 1.5 }}>
        Vous pouvez retrouver les déclarations que vous devez effectuer pour la période en cours.
      </p>

      {/* Declaration card */}
      <div style={{ border: `1px solid ${U_BORDER}`, borderRadius: 5, overflow: "hidden", background: "#fff" }}>
        <div style={{ padding: "8px 12px", borderBottom: `1px solid ${U_BORDER}`, display: "flex", alignItems: "center", gap: 8 }}>
          <p style={{ fontSize: 10.5, fontWeight: 700, color: "#222" }}>Déclaration d'Avril 2026</p>
          <span style={{ fontSize: 8, fontWeight: 600, color: U_LINK, background: "#DBEAFE", padding: "1px 7px", borderRadius: 10 }}>✎ À déclarer</span>
          <span style={{ fontSize: 8, fontWeight: 600, color: U_TEAL, background: "#CCFBF1", padding: "1px 7px", borderRadius: 10 }}>€ À payer</span>
        </div>
        <div style={{ padding: "10px 12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
            <div style={{ width: 16, height: 16, borderRadius: "50%", background: "#DBEAFE", border: `1.5px solid ${U_LINK}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span style={{ fontSize: 8, color: U_LINK, fontWeight: 900 }}>✓</span>
            </div>
            <p style={{ fontSize: 9, color: "#555" }}>Déclaration à effectuer avant le <strong>01/06/2026 à 23:59</strong></p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
            <div style={{ width: 16, height: 16, borderRadius: "50%", background: "#DBEAFE", border: `1.5px solid ${U_LINK}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span style={{ fontSize: 8, color: U_LINK, fontWeight: 900 }}>✓</span>
            </div>
            <p style={{ fontSize: 9, color: "#555" }}>Paiement à effectuer avant le <strong>01/06/2026 à 23:59</strong></p>
          </div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 4, background: U_LINK, color: "#fff", padding: "5px 14px", borderRadius: 4, fontSize: 9.5, fontWeight: 700 }}>
            Déclarer et payer <INum n={1} />
          </div>
        </div>
      </div>
    </UShell>
  );
}

// ─── Step 3: CA declaration form ────────────────────────────────────

function UWizardSteps({ active }: { active: 1 | 2 | 3 }) {
  const steps = ["Chiffre d'affaires", "Cotisations et contributions", "Paiement"];
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 14, paddingBottom: 10, borderBottom: `1px solid ${U_BORDER}` }}>
      {steps.map((s, i) => {
        const n = i + 1;
        const done = n < active;
        const curr = n === active;
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 0, flex: i < 2 ? 1 : 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <div style={{
                width: 18, height: 18, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 900, flexShrink: 0,
                background: done ? U_TEAL : curr ? U_LINK : "#E5E7EB",
                color: done || curr ? "#fff" : "#9CA3AF",
              }}>
                {done ? "✓" : n}
              </div>
              <p style={{ fontSize: 9, fontWeight: curr ? 700 : 400, color: curr ? U_LINK : done ? U_TEAL : "#9CA3AF", borderBottom: curr ? `2px solid ${U_LINK}` : "none", paddingBottom: 2 }}>{s}</p>
            </div>
            {i < 2 && <div style={{ flex: 1, height: 1, background: "#E5E7EB", margin: "0 8px" }} />}
          </div>
        );
      })}
    </div>
  );
}

function UInput({ val, unit = "€", highlighted }: { val: string; unit?: string; highlighted?: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", border: `1.5px solid ${highlighted ? U_LINK : U_BORDER}`, borderRadius: 4, background: highlighted ? "#EFF6FF" : "#fff", overflow: "hidden", width: 120 }}>
      <input
        readOnly
        value={val}
        style={{ flex: 1, border: "none", outline: "none", padding: "5px 8px", fontSize: 11, fontWeight: highlighted ? 700 : 400, color: highlighted ? U_LINK : "#222", background: "transparent", width: 80 }}
      />
      <span style={{ padding: "5px 8px", fontSize: 11, color: "#666", background: "#F3F4F6", borderLeft: `1px solid ${U_BORDER}` }}>{unit}</span>
    </div>
  );
}

function MockDeclarationCA() {
  return (
    <div style={{ border: `1px solid ${U_BORDER}`, borderRadius: 8, overflow: "hidden", userSelect: "none" as const, pointerEvents: "none" as const, boxShadow: "0 3px 16px rgba(0,0,0,.08)" }}>
      <UHeader />
      <UNav />
      <USearchBar />
      <div style={{ padding: "12px 16px", background: U_BG }}>
        <p style={{ fontSize: 8, color: "#aaa" }}>Accueil › Gérer mon auto-entreprise › Mes échéances en cours</p>
        <p style={{ fontSize: 8.5, color: U_LINK, fontWeight: 600, marginBottom: 10 }}>‹ Retour à déclarer et payer</p>

        <div style={{ display: "flex", justifyContent: "center", gap: 40, marginBottom: 12 }}>
          <div style={{ textAlign: "center" as const }}>
            <div style={{ width: 36, height: 36, border: `2px solid ${U_TEAL}`, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 3px", background: "#F0FAFA" }}>
              <FileText style={{ width: 15, height: 15, color: U_TEAL, strokeWidth: 1.5 }} />
            </div>
            <p style={{ fontSize: 8.5, fontWeight: 700, color: U_TEAL }}>Déclarer et payer</p>
          </div>
          <div style={{ textAlign: "center" as const }}>
            <div style={{ width: 36, height: 36, border: `1px solid ${U_BORDER}`, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 3px", background: "#fff" }}>
              <CalendarClock style={{ width: 15, height: 15, color: "#9CA3AF", strokeWidth: 1.5 }} />
            </div>
            <p style={{ fontSize: 8.5, color: "#bbb" }}>Calendrier des échéances</p>
          </div>
        </div>

        <UWizardSteps active={1} />

        <div style={{ position: "relative" as const }}>
          {/* "Droit à l'erreur" stamp */}
          <div style={{ position: "absolute" as const, top: 0, right: 0, width: 52, height: 52, borderRadius: "50%", border: "2.5px solid #DC2626", display: "flex", flexDirection: "column" as const, alignItems: "center", justifyContent: "center", padding: 3 }}>
            <p style={{ fontSize: 5.5, fontWeight: 900, color: "#DC2626", textAlign: "center" as const, letterSpacing: "0.03em", lineHeight: 1.4, textTransform: "uppercase" as const }}>VOUS AVEZ<br />DROIT<br />À L'ERREUR</p>
          </div>

          <p style={{ fontSize: 12, fontWeight: 700, color: U_LINK, marginBottom: 2 }}>Déclaration de chiffre d'affaires d'Avril 2026</p>
          <p style={{ fontSize: 10, fontWeight: 700, color: U_TEAL, marginBottom: 4 }}>Déclaration de chiffre d'affaires</p>
          <p style={{ fontSize: 8.5, color: "#555", lineHeight: 1.5, marginBottom: 12 }}>
            Renseignez votre chiffre d'affaires dans le formulaire ci-dessous en fonction de la nature de votre activité.
          </p>

          {/* BNC section */}
          <div style={{ background: "#fff", border: `1px solid ${U_BORDER}`, borderRadius: 5, padding: "10px 12px", marginBottom: 10 }}>
            <p style={{ fontSize: 9.5, fontWeight: 700, color: U_LINK, marginBottom: 8 }}>En lien avec votre activité libérale</p>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
              <p style={{ fontSize: 9, color: "#555" }}>Recettes des activités libérales (BNC)</p>
              <div style={{ width: 14, height: 14, borderRadius: "50%", background: "#E5E7EB", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, color: "#666", fontWeight: 700 }}>?</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div>
                <p style={{ fontSize: 7.5, color: "#888", marginBottom: 2 }}>Montant BNC <INum n={1} /></p>
                <UInput val="460" highlighted />
              </div>
            </div>
          </div>

          {/* Autres natures */}
          <div style={{ background: "#fff", border: `1px solid ${U_BORDER}`, borderRadius: 5, padding: "10px 12px", marginBottom: 12 }}>
            <p style={{ fontSize: 9.5, fontWeight: 700, color: U_LINK, marginBottom: 8 }}>Autres natures de chiffre d'affaires</p>

            <div style={{ marginBottom: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                <p style={{ fontSize: 8.5, color: "#555" }}>Chiffre d'affaires des activités de ventes de marchandises et assimilées (BIC ventes)</p>
                <div style={{ width: 14, height: 14, borderRadius: "50%", background: "#E5E7EB", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, color: "#666", fontWeight: 700, flexShrink: 0 }}>?</div>
              </div>
              <div>
                <p style={{ fontSize: 7.5, color: "#888", marginBottom: 2 }}>Montant BIC ventes</p>
                <UInput val="0" />
              </div>
            </div>

            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                <p style={{ fontSize: 8.5, color: "#555" }}>Chiffre d'affaires des activités de prestations de services commerciales ou artisanales (BIC prestations)</p>
                <div style={{ width: 14, height: 14, borderRadius: "50%", background: "#E5E7EB", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, color: "#666", fontWeight: 700, flexShrink: 0 }}>?</div>
              </div>
              <div>
                <p style={{ fontSize: 7.5, color: "#888", marginBottom: 2 }}>Montant BIC prestations</p>
                <UInput val="0" />
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ border: `1px solid ${U_BORDER}`, color: "#555", padding: "5px 12px", borderRadius: 4, fontSize: 9, fontWeight: 500 }}>Abandonner la déclaration</div>
            <div style={{ background: U_LINK, color: "#fff", padding: "6px 14px", borderRadius: 4, fontSize: 9.5, fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
              Calculer les cotisations et contributions <INum n={2} /> →
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Step 4: Cotisations table ──────────────────────────────────────

function MockCotisations() {
  const rows = [
    { label: "Montants totaux", ca: "460 €", total: "70 €", cotis: "59 €", cfp: "1 €", bold: true },
    { label: "Recettes des activités libérales (BNC)", ca: "460 €", total: "—", cotis: "59 €\n(12,80%)", cfp: "—", bold: false },
    { label: "Chiffre d'affaires des activités de ventes de marchandises (BIC ventes)", ca: "0 €", total: "—", cotis: "0 €", cfp: "—", bold: false },
    { label: "Chiffre d'affaires des activités de prestations de services (BIC prestations)", ca: "0 €", total: "—", cotis: "0 €", cfp: "—", bold: false },
  ];

  return (
    <div style={{ border: `1px solid ${U_BORDER}`, borderRadius: 8, overflow: "hidden", userSelect: "none" as const, pointerEvents: "none" as const, boxShadow: "0 3px 16px rgba(0,0,0,.08)" }}>
      <UHeader />
      <UNav />
      <USearchBar />
      <div style={{ padding: "12px 16px", background: U_BG }}>
        <p style={{ fontSize: 8, color: "#aaa" }}>Accueil › Gérer mon auto-entreprise › Mes échéances en cours</p>
        <p style={{ fontSize: 8.5, color: U_LINK, fontWeight: 600, marginBottom: 10 }}>‹ Retour à déclarer et payer</p>

        <div style={{ display: "flex", justifyContent: "center", gap: 40, marginBottom: 12 }}>
          <div style={{ textAlign: "center" as const }}>
            <div style={{ width: 36, height: 36, border: `2px solid ${U_TEAL}`, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 3px", background: "#F0FAFA" }}>
              <FileText style={{ width: 15, height: 15, color: U_TEAL, strokeWidth: 1.5 }} />
            </div>
            <p style={{ fontSize: 8.5, fontWeight: 700, color: U_TEAL }}>Déclarer et payer</p>
          </div>
          <div style={{ textAlign: "center" as const }}>
            <div style={{ width: 36, height: 36, border: `1px solid ${U_BORDER}`, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 3px", background: "#fff" }}>
              <CalendarClock style={{ width: 15, height: 15, color: "#9CA3AF", strokeWidth: 1.5 }} />
            </div>
            <p style={{ fontSize: 8.5, color: "#bbb" }}>Calendrier des échéances</p>
          </div>
        </div>

        <UWizardSteps active={2} />

        <div style={{ position: "relative" as const }}>
          <div style={{ position: "absolute" as const, top: 0, right: 0, width: 52, height: 52, borderRadius: "50%", border: "2.5px solid #DC2626", display: "flex", flexDirection: "column" as const, alignItems: "center", justifyContent: "center", padding: 3 }}>
            <p style={{ fontSize: 5.5, fontWeight: 900, color: "#DC2626", textAlign: "center" as const, letterSpacing: "0.03em", lineHeight: 1.4, textTransform: "uppercase" as const }}>VOUS AVEZ<br />DROIT<br />À L'ERREUR</p>
          </div>

          <p style={{ fontSize: 12, fontWeight: 700, color: U_LINK, marginBottom: 6 }}>Déclaration de chiffre d'affaires d'Avril 2026</p>

          {/* ACRE + versement checkmarks */}
          <div style={{ marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 4 }}>
              <CheckCircle2 className="w-3 h-3 shrink-0" style={{ color: U_TEAL }} />
              <p style={{ fontSize: 8.5, color: "#444" }}>Vous avez opté pour le versement libératoire de l'impôt sur le revenu.</p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <CheckCircle2 className="w-3 h-3 shrink-0" style={{ color: U_TEAL }} />
              <p style={{ fontSize: 8.5, color: "#444" }}>Vous bénéficiez de l'aide aux créateurs repreneurs d'entreprise <strong>(ACRE)</strong>.</p>
            </div>
          </div>

          <p style={{ fontSize: 10, fontWeight: 700, color: U_TEAL, marginBottom: 4 }}>Déclaration de chiffre d'affaires</p>
          <p style={{ fontSize: 8.5, color: "#555", lineHeight: 1.5, marginBottom: 8 }}>
            Le tableau ci-dessous récapitule les cotisations et contributions calculées à partir du chiffre d'affaires saisi pour cette période.
          </p>

          <div style={{ display: "flex", gap: 16, marginBottom: 10 }}>
            <p style={{ fontSize: 9.5, fontWeight: 700, color: "#222" }}>Chiffre d'affaires total <span style={{ color: U_LINK }}>460 €</span></p>
            <p style={{ fontSize: 9.5, fontWeight: 700, color: "#222" }}>Cotisations et contributions totales <span style={{ color: "#DC2626" }}>70 €</span></p>
          </div>

          {/* Table */}
          <div style={{ background: "#fff", border: `1px solid ${U_BORDER}`, borderRadius: 4, overflow: "hidden", marginBottom: 12 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 8.5 }}>
              <thead>
                <tr style={{ background: "#F3F4F6", borderBottom: `1px solid ${U_BORDER}` }}>
                  <th style={{ padding: "7px 9px", textAlign: "left" as const, fontWeight: 700, color: "#555", fontSize: 8 }}>Nature du chiffre d'affaires</th>
                  <th style={{ padding: "7px 9px", textAlign: "right" as const, fontWeight: 700, color: "#555", fontSize: 8 }}>Chiffre d'affaires</th>
                  <th style={{ padding: "7px 9px", textAlign: "right" as const, fontWeight: 700, color: "#555", fontSize: 8 }}>Total cotis. et contrib.</th>
                  <th style={{ padding: "7px 9px", textAlign: "right" as const, fontWeight: 700, color: "#555", fontSize: 8 }}>Cotisations</th>
                  <th style={{ padding: "7px 9px", textAlign: "right" as const, fontWeight: 700, color: "#555", fontSize: 8 }}>CFP</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={i} style={{ borderBottom: i < rows.length - 1 ? `1px solid ${U_BORDER}` : "none", background: row.bold ? "#EFF6FF" : "#fff" }}>
                    <td style={{ padding: "7px 9px", fontWeight: row.bold ? 700 : 400, color: "#333" }}>{row.label}</td>
                    <td style={{ padding: "7px 9px", textAlign: "right" as const, fontWeight: row.bold ? 700 : 400, color: "#333" }}>{row.ca}</td>
                    <td style={{ padding: "7px 9px", textAlign: "right" as const, color: "#333" }}>{row.total}</td>
                    <td style={{ padding: "7px 9px", textAlign: "right" as const, fontWeight: row.bold ? 700 : 400, color: row.bold ? "#DC2626" : "#333", whiteSpace: "pre-wrap" as const }}>{row.cotis}</td>
                    <td style={{ padding: "7px 9px", textAlign: "right" as const, color: "#333" }}>{row.cfp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Buttons */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ border: `1px solid ${U_BORDER}`, color: "#555", padding: "5px 12px", borderRadius: 4, fontSize: 9, fontWeight: 500, display: "flex", alignItems: "center", gap: 4 }}>← Retour à l'étape précédente</div>
            <div style={{ background: U_LINK, color: "#fff", padding: "6px 14px", borderRadius: 4, fontSize: 9.5, fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
              Enregistrer la déclaration <INum n={1} /> →
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main export ───────────────────────────────────────────────────

const TOTAL = 4;

export function GuideDeclarationURSSAF() {
  const navigate = useNavigate();

  return (
    <div>
      <button
        onClick={() => navigate("/app/aide")}
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 mb-8 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        Retour au centre d'aide
      </button>

      <div className="mb-8">
        <h1 className="text-xl font-bold text-slate-900 mb-2">Déclaration URSSAF</h1>
        <p className="text-slate-400 text-sm">
          Comment déclarer votre chiffre d'affaires chaque mois sur l'espace URSSAF — en moins de 5 minutes.
        </p>
      </div>

      <div className="rounded-2xl p-5 mb-10" style={{ background: "#F0FDF4", border: "1.5px solid #86EFAC" }}>
        <p className="text-sm font-bold text-green-800 mb-1">Ce qu'il faut déclarer : votre virement Colibri du mois</p>
        <p className="text-xs text-green-700 leading-relaxed">
          L'URSSAF vous demande votre <strong>chiffre d'affaires encaissé</strong> sur la période. Pour vous, c'est le montant du virement Colibri reçu sur votre compte bancaire — pas le montant des cours facturés. Retrouvez-le dans votre espace <strong>Factures → mois concerné</strong>.
        </p>
      </div>

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

      <Step n={1} total={TOTAL} title="Tableau de bord → Mes échéances en cours"
        mock={<MockDashboard />}
        callouts={<>
          <Note title="① Mes échéances en cours — le bon endroit">
            Sur le tableau de bord, localisez la tuile <strong>«&nbsp;Mes échéances en cours&nbsp;»</strong> ①, en haut à gauche de la grille. C'est ici que se trouvent toutes vos déclarations à faire.
          </Note>
          <Note title="① Déclarer et payer — le bon lien">
            Dans la tuile, cliquez directement sur le lien <strong>«&nbsp;Déclarer et payer&nbsp;»</strong> ①. <strong>Ne cliquez pas sur</strong> «&nbsp;Calendrier des échéances&nbsp;» qui est en lecture seule.
          </Note>
          <Warn title="Ne pas confondre avec « Régulariser ma situation »">
            Ce menu est réservé aux déclarations <strong>en retard</strong>. Si vous déclarez dans les délais, utilisez toujours «&nbsp;Mes échéances en cours&nbsp;».
          </Warn>
        </>}
      />

      <Step n={2} total={TOTAL} title="Cliquer sur Déclarer et payer"
        mock={<MockEcheances />}
        callouts={<>
          <Note title="La déclaration du mois en cours">
            La page affiche la déclaration ouverte pour la période actuelle avec ses deux échéances : <strong>déclaration</strong> et <strong>paiement</strong>. Les deux se font en une seule session.
          </Note>
          <Note title="① Cliquer sur le bouton bleu">
            Appuyez sur le bouton <strong>«&nbsp;Déclarer et payer&nbsp;»</strong> ① sur la carte. Cela ouvre le formulaire en 3 étapes.
          </Note>
          <Warn title="Absent de la liste ?">
            Si aucune déclaration n'apparaît, la période n'est peut-être pas encore ouverte (déclaration mensuelle : ouvre le 1er du mois suivant) ou la date limite est dépassée — dans ce cas, allez dans <strong>«&nbsp;Régulariser ma situation&nbsp;»</strong>.
          </Warn>
        </>}
      />

      <Step n={3} total={TOTAL} title="Saisir le montant BNC → Calculer"
        mock={<MockDeclarationCA />}
        callouts={<>
          <Note title="① Montant BNC — votre virement Colibri">
            Renseignez uniquement dans le champ <strong>«&nbsp;Montant BNC&nbsp;»</strong> ① le montant exact de votre virement Colibri du mois. Ce chiffre est votre chiffre d'affaires déclarable.
          </Note>
          <Note>
            <strong>BIC ventes et BIC prestations</strong> — laissez ces deux champs à <strong>0 €</strong>. Ils concernent d'autres types d'activités commerciales. Les cours particuliers relèvent exclusivement du BNC (activité libérale).
          </Note>
          <Note title="② Calculer les cotisations">
            Une fois le montant saisi, cliquez sur <strong>«&nbsp;Calculer les cotisations et contributions&nbsp;»</strong> ②. L'URSSAF calcule automatiquement le montant dû — aucune formule à faire soi-même.
          </Note>
        </>}
      />

      <Step n={4} total={TOTAL} title="Vérifier le tableau → Enregistrer → Payer"
        mock={<MockCotisations />}
        callouts={<>
          <Note title="ACRE visible dans le récapitulatif">
            Si votre demande ACRE a été acceptée, une ligne le confirme en haut ✓ <strong>«&nbsp;Vous bénéficiez de l'ACRE&nbsp;»</strong>. Le taux affiché dans la colonne Cotisations est alors <strong>~12,80%</strong> au lieu de 21,2% — soit presque la moitié.
          </Note>
          <Note title="① Enregistrer la déclaration">
            Vérifiez les montants du tableau puis cliquez sur <strong>«&nbsp;Enregistrer la déclaration&nbsp;»</strong> ①. L'étape 3 s'ouvre alors pour le <strong>paiement</strong> par virement ou carte bancaire.
          </Note>
          <Warn title="Enregistrer ≠ Payer">
            Cliquer sur «&nbsp;Enregistrer&nbsp;» <strong>ne déclenche pas le paiement</strong>. Vous devez ensuite compléter l'étape 3 (Paiement) pour que la cotisation soit prélevée. La déclaration sans paiement reste en statut <strong>«&nbsp;À payer&nbsp;»</strong>.
          </Warn>
        </>}
      />
    </div>
  );
}
