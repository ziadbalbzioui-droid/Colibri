import { useState, useMemo } from "react";
import { Euro, Users, BookOpen, Plus, CheckCircle2, X, Loader2, TrendingUp, ChevronRight } from "lucide-react";
import { LoadingGuard } from "../layout/LoadingGuard";
import { useEleves } from "../../../lib/hooks/useEleves";
import { useCours } from "../../../lib/hooks/useCours";
import { useAuth } from "../../../lib/auth";
import { useGrilleCommission, getTauxPlusvalue, getMultiplicateurBrut } from "../../../lib/hooks/useGrilleCommission";
import type { EleveRow } from "../../../lib/hooks/useEleves";
import type { CoursRow } from "../../../lib/hooks/useCours";

const MOIS = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
const MATIERES = ["Mathématiques", "Physique", "Chimie", "Français", "Anglais", "Espagnol", "Allemand", "Histoire-Géographie", "SES", "SVT", "NSI", "Philosophie", "Autre"];
const niveaux = ["6ème", "5ème", "4ème", "3ème", "2nde", "1ère S", "1ère ES", "Terminale S", "Terminale ES", "BTS", "Licence 1"];

function formatDuree(mins: number): string {
  if (mins <= 0) return "0min";
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m}min`;
  return m > 0 ? `${h}h${m}min` : `${h}h`;
}

type ModalType = "cours" | "eleve" | null;

const S = {
  card: {
    background: "#fff",
    border: "1px solid #E2E8F0",
    borderRadius: 16,
    boxShadow: "0 1px 3px rgba(15,23,42,.06)",
  } as React.CSSProperties,
  serif: { fontFamily: "'Fraunces', Georgia, serif" } as React.CSSProperties,
  eyebrow: {
    fontSize: 11, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase" as const, color: "#64748B",
  } as React.CSSProperties,
  badge: (bg: string, color: string) => ({
    display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 8px",
    borderRadius: 999, fontSize: 11, fontWeight: 700, background: bg, color,
  } as React.CSSProperties),
  btnPrimary: {
    display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 16px",
    borderRadius: 12, background: "#2E6BEA", color: "#fff", fontSize: 13, fontWeight: 600,
    border: "none", cursor: "pointer",
  } as React.CSSProperties,
  btnGhost: {
    display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 16px",
    borderRadius: 12, background: "transparent", color: "#334155", fontSize: 13, fontWeight: 600,
    border: "1px solid #E2E8F0", cursor: "pointer",
  } as React.CSSProperties,
  input: {
    width: "100%", padding: "10px 14px", borderRadius: 12, border: "1px solid #E2E8F0",
    background: "#F1F5F9", fontFamily: "inherit", fontSize: 13, color: "#0F172A", outline: "none",
  } as React.CSSProperties,
  label: {
    display: "block", fontSize: 12, fontWeight: 600, color: "#334155", marginBottom: 5,
  } as React.CSSProperties,
};

function ModalOverlay({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 16 }}>
      <div style={{ background: "#fff", borderRadius: 22, width: "100%", maxWidth: 480, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 4px 24px rgba(15,23,42,.12)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "22px 24px 0" }}>
          <h2 style={{ fontWeight: 700, fontSize: 16 }}>{title}</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: 6, borderRadius: 8 }}><X className="w-4 h-4 text-slate-400" /></button>
        </div>
        <div style={{ padding: "20px 24px 24px" }}>{children}</div>
      </div>
    </div>
  );
}

function SuccessState({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <div style={{ textAlign: "center", paddingTop: 16, paddingBottom: 8 }}>
      <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#ECFDF5", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
        <CheckCircle2 className="w-7 h-7 text-emerald-500" />
      </div>
      <p style={{ fontWeight: 600, fontSize: 16, marginBottom: 4 }}>{message}</p>
      <p style={{ color: "#64748B", fontSize: 13, marginBottom: 24 }}>L'opération a bien été enregistrée.</p>
      <button onClick={onClose} style={S.btnPrimary}>Fermer</button>
    </div>
  );
}

function Initials({ name, index }: { name: string; index: number }) {
  const initials = name.split(" ").map((x) => x[0]).join("").slice(0, 2);
  const hues = [200, 230, 170, 260, 140];
  const hue = hues[index % hues.length];
  return (
    <div style={{ width: 28, height: 28, borderRadius: "50%", background: `hsl(${hue} 65% 82%)`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 11, flexShrink: 0 }}>
      {initials}
    </div>
  );
}

export function Dashboard() {
  const { profile } = useAuth();
  const { eleves, loading: elevesLoading, error: elevesError, reload: reloadEleves, addEleve } = useEleves();
  const { cours, loading: coursLoading, error: coursError, reload: reloadCours, addCours } = useCours();
  const { grille } = useGrilleCommission();
  const dataLoading = elevesLoading || coursLoading;
  const dataError = elevesError ?? coursError;

  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [success, setSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  const [coursForm, setCoursForm] = useState({ eleve_id: "", eleve_nom: "", matiere: "", date: "", duree_minutes: 60, tarif_heure: 30 });
  const [matiereInput, setMatiereInput] = useState("");
  const [showMatiereDropdown, setShowMatiereDropdown] = useState(false);
  const [eleveForm, setEleveForm] = useState({ nom: "", niveau: "2nde", matiere: "", tarif_heure: 25 });

  const selectedCoursEleve = eleves.find((e: EleveRow) => e.id === coursForm.eleve_id);

  function openModal(type: ModalType) {
    setSuccess(false); setSaving(false); setActiveModal(type);
    if (type === "cours" && eleves.length > 0) {
      const first = eleves[0];
      setCoursForm({ eleve_id: first.id, eleve_nom: first.nom, matiere: first.matiere?.split(",")[0].trim() ?? "", date: "", duree_minutes: 60, tarif_heure: first.tarif_heure ?? 30 });
      setMatiereInput("");
    }
  }
  function closeModal() { setActiveModal(null); setSuccess(false); setMatiereInput(""); setShowMatiereDropdown(false); }

  async function submitCours() {
    if (!coursForm.matiere || !coursForm.date || coursForm.duree_minutes <= 0) return;
    setSaving(true);
    try {
      const heures = coursForm.duree_minutes / 60;
      await addCours({ eleve_id: coursForm.eleve_id || null, eleve_nom: coursForm.eleve_nom, matiere: coursForm.matiere, date: coursForm.date, duree: formatDuree(coursForm.duree_minutes), duree_heures: heures, montant: coursForm.tarif_heure * heures, statut: "déclaré", multiplicateur_brut: getMultiplicateurBrut(grille, coursForm.tarif_heure) });
      setSuccess(true);
    } finally { setSaving(false); }
  }

  async function submitEleve() {
    if (!eleveForm.nom || !eleveForm.matiere) return;
    setSaving(true);
    try {
      await addEleve({ nom: eleveForm.nom, niveau: eleveForm.niveau, matiere: eleveForm.matiere, tarif_heure: eleveForm.tarif_heure, statut: "actif" });
      setSuccess(true);
    } finally { setSaving(false); }
  }

  const now = new Date();
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const prenomAffiche = profile?.prenom ?? "Prof";
  const hasSiret = !!profile?.siret;

  const coursThisMonth = useMemo(() => cours.filter((c: CoursRow) => c.date.startsWith(thisMonth)), [cours, thisMonth]);
  const brutThisMonth = useMemo(() => coursThisMonth.reduce((s: number, c: CoursRow) => s + c.montant, 0), [coursThisMonth]);
  const revenuBrutMois = useMemo(() =>
    coursThisMonth.reduce((s: number, c: CoursRow) => {
      return s + c.montant * (1 + (c.taux_plusvalue ?? 0));
    }, 0),
    [coursThisMonth]
  );
  const netThisMonth = Math.round(revenuBrutMois);
  const heuresThisMonth = useMemo(() => coursThisMonth.reduce((s: number, c: CoursRow) => s + c.duree_heures, 0), [coursThisMonth]);

  const elevesActifs = useMemo(() => eleves.filter((e: EleveRow) => e.statut === "actif").length, [eleves]);

  const recentCours = useMemo(() => [...cours].sort((a: CoursRow, b: CoursRow) => b.date.localeCompare(a.date)).slice(0, 5), [cours]);

  const elevePayTotals = useMemo(() => {
    const map: Record<string, number> = {};
    cours.forEach((c: CoursRow) => { map[c.eleve_nom] = (map[c.eleve_nom] ?? 0) + c.montant; });
    return map;
  }, [cours]);

  const eleveNetTotals = useMemo(() => {
    const map: Record<string, number> = {};
    cours.forEach((c: CoursRow) => {
      map[c.eleve_nom] = (map[c.eleve_nom] ?? 0) + Math.round(c.montant * (1 + (c.taux_plusvalue ?? 0)));
    });
    return map;
  }, [cours]);

  const weekLabel = (() => {
    const weekNum = Math.ceil((now.getDate() + new Date(now.getFullYear(), now.getMonth(), 1).getDay()) / 7);
    return `${now.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })} · semaine ${weekNum}`;
  })();

  return (
    <LoadingGuard loading={dataLoading} error={dataError} onRetry={() => { reloadEleves(); reloadCours(); }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", opacity: hasSiret ? 1 : 0.5, pointerEvents: hasSiret ? "auto" : "none" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 36 }}>
          <div>
            <p style={{ ...S.eyebrow, marginBottom: 10 }}>{weekLabel}</p>
            <h1 style={{ ...S.serif, fontWeight: 400, fontSize: 48, lineHeight: 1.05, letterSpacing: "-.02em", color: "#0F172A" }}>
              Bonjour {prenomAffiche}.<br />
              <span style={{ color: "#94A3B8" }}>Voici votre mois, déclaré et en ordre.</span>
            </h1>
          </div>
          <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
            <button style={S.btnGhost}>Exporter</button>
          </div>
        </div>

        {/* Money hero */}
        <div style={{ ...S.card, padding: "32px 36px", marginBottom: 16, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -30, right: -30, width: 240, height: 240, borderRadius: "50%", background: "radial-gradient(circle,rgba(46,107,234,.12),transparent 65%)" }} />
          <div style={{ position: "relative" }}>
            <div style={{ ...S.eyebrow, display: "flex", alignItems: "center", gap: 6, marginBottom: 12, color: "#1E3A8A" }}>
              <Euro className="w-3 h-3 text-blue-600" /> Revenu du mois après impots et cotisations
            </div>
            <div style={{ ...S.serif, fontSize: 88, fontWeight: 400, letterSpacing: "-.02em", lineHeight: 1, fontVariantNumeric: "tabular-nums", color: "#0F172A" }}>
              {netThisMonth.toLocaleString("fr-FR", { maximumFractionDigits: 2 })}<span style={{ fontSize: 40, marginLeft: 4 }}>€</span>
            </div>
            <p style={{ marginTop: 12, fontSize: 14, color: "#334155", lineHeight: 1.6, maxWidth: 400 }}>
              Sur <strong>{heuresThisMonth.toFixed(1)}&nbsp;h</strong> de cours déclarés ce mois-ci.
            </p>
            <div style={{ display: "flex", gap: 8, marginTop: 18, flexWrap: "wrap" }}>
              <span style={S.badge("#ECFDF5", "#065F46")}><CheckCircle2 className="w-3 h-3" />Légal &amp; déclaré</span>
              <span style={S.badge("#EFF6FF", "#1E3A8A")}><BookOpen className="w-3 h-3" />{heuresThisMonth.toFixed(1)}h travaillées</span>
              <span style={S.badge("#0F172A", "#fff")}><Users className="w-3 h-3" />{elevesActifs} élèves</span>
            </div>
          </div>
        </div>

        {/* Actions rapides */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
          {[
            { label: "Déclarer un cours", sub: "Enregistrez une séance en quelques secondes", icon: <Plus style={{ width: 22, height: 22, color: "#2E6BEA" }} />, iconBg: "#EFF6FF", action: () => openModal("cours") },
            { label: "Ajouter un élève", sub: "Intégrez un nouvel élève à votre suivi", icon: <Users style={{ width: 22, height: 22, color: "#16A34A" }} />, iconBg: "#F0FDF4", action: () => openModal("eleve") },
          ].map(({ label, sub, icon, iconBg, action }) => (
            <button key={label} onClick={action} style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 16, boxShadow: "0 1px 3px rgba(15,23,42,.06)", padding: "18px 20px", display: "flex", alignItems: "center", gap: 16, cursor: "pointer", textAlign: "left", width: "100%" }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: iconBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {icon}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: "#0F172A", marginBottom: 3 }}>{label}</div>
                <div style={{ fontSize: 12, color: "#94A3B8" }}>{sub}</div>
              </div>
              <ChevronRight style={{ width: 16, height: 16, color: "#CBD5E1", flexShrink: 0 }} />
            </button>
          ))}
        </div>

        {/* Journal */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 16, padding: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
              <BookOpen className="w-4 h-4 text-slate-400" />
              <h2 style={{ ...S.serif, fontSize: 20, fontWeight: 400, letterSpacing: "-.02em", color: "#0F172A" }}>Journal récent</h2>
            </div>
            <p style={{ fontSize: 12, color: "#64748B", marginBottom: 14 }}>Vos cours des derniers jours.</p>
            {recentCours.length === 0 ? (
              <p style={{ fontSize: 13, color: "#94A3B8" }}>Aucun cours enregistré.</p>
            ) : (
              <>
                {recentCours.map((c: CoursRow, i: number) => {
                  const tarifH = c.duree_heures > 0 ? c.montant / c.duree_heures : 0;
                  const taux = c.taux_plusvalue ?? 0;
                  const netProf = Math.round(c.montant * (1 + taux));
                  return (
                    <div key={c.id} style={{ padding: "10px 0", borderBottom: i < recentCours.length - 1 ? "1px dashed #E2E8F0" : "none" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#0F172A" }}>
                          {c.eleve_nom}<span style={{ fontWeight: 400, color: "#94A3B8", marginLeft: 6 }}>· {c.matiere}</span>
                        </div>
                        <div style={{ fontSize: 13, color: "#64748B" }}>{c.montant}€ famille</div>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 2 }}>
                        <div style={{ fontSize: 11, color: "#64748B" }}>{new Date(c.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })} · {Math.round(tarifH)}€/h · {c.duree}</div>
                        <div style={{ fontSize: 11 }}><span style={{ color: "#6366F1" }}>+{Math.round(taux * 100)}%</span><span style={{ color: "#16A34A" }}> → {netProf}€ pour vous, après impôts et cotisations</span></div>
                      </div>
                    </div>
                  );
                })}
                <p style={{ marginTop: 16, fontSize: 12, color: "#64748B" }}>
                  {recentCours.length} séances récentes — {recentCours.reduce((a: number, r: CoursRow) => a + r.montant, 0).toLocaleString("fr-FR", { maximumFractionDigits: 2 })}€ famille · <span style={{ color: "#16A34A" }}>{recentCours.reduce((a: number, r: CoursRow) => {
                    return a + Math.round(r.montant * (1 + (r.taux_plusvalue ?? 0)));
                  }, 0).toLocaleString("fr-FR", { maximumFractionDigits: 2 })}€ pour vous, après impôts et cotisations</span>
                </p>
              </>
            )}
          </div>
        </div>

        {/* Eleves */}
        {eleves.length > 0 && (
          <div style={{ ...S.card, padding: 22 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: "#0F172A" }}>Vos élèves</h3>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => hasSiret && openModal("eleve")} style={{ ...S.btnGhost, fontSize: 12, padding: "6px 12px" }}>
                  <Plus className="w-3.5 h-3.5" />Ajouter
                </button>
                <span style={{ fontSize: 12, color: "#2E6BEA", fontWeight: 600, cursor: "pointer" }}>Tous →</span>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 10 }}>
              {eleves.slice(0, 6).map((e: EleveRow, i: number) => {
                const totalPaye = elevePayTotals[e.nom] ?? 0;
                const netTotal = eleveNetTotals[e.nom] ?? 0;
                return (
                  <div key={e.id} style={{ padding: 14, borderRadius: 12, background: "#F8FAFC", border: "1px solid #E2E8F0" }}>
                    <Initials name={e.nom} index={i} />
                    <div style={{ fontSize: 13, fontWeight: 700, marginTop: 8, marginBottom: 2, color: "#0F172A" }}>{e.nom.split(" ")[0]}</div>
                    <div style={{ fontSize: 11, color: "#64748B", marginBottom: 8 }}>{e.niveau}</div>
                    <div style={{ fontSize: 11, color: "#94A3B8", marginBottom: 2 }}>{totalPaye.toLocaleString("fr-FR", { maximumFractionDigits: 2 })}€ famille</div>
                    <div style={{ ...S.serif, fontSize: 18, color: "#16A34A" }}>{netTotal.toLocaleString("fr-FR", { maximumFractionDigits: 2 })}€ <span style={{ fontSize: 10, fontFamily: "inherit", color: "#64748B" }}>pour vous</span></div>
                    <div style={{ fontSize: 9, color: "#94A3B8", marginTop: 1, fontFamily: "inherit" }}>après impôts et cotisations</div>
                    {e.statut === "en pause" && <span style={{ ...S.badge("#FFFBEB", "#92400E"), marginTop: 6 }}>Relancer</span>}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Modal Déclarer un cours */}
        {activeModal === "cours" && (
          <ModalOverlay title="Ajouter un cours" onClose={closeModal}>
            {success ? <SuccessState message="Cours enregistré !" onClose={closeModal} /> : (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {/* Élève */}
                <div><label style={S.label}>Élève</label>
                  <select style={S.input} value={coursForm.eleve_id} onChange={(e) => { const elv = eleves.find((el: EleveRow) => el.id === e.target.value); setCoursForm({ ...coursForm, eleve_id: e.target.value, eleve_nom: elv?.nom ?? "", tarif_heure: elv?.tarif_heure ?? 30, matiere: elv?.matiere?.split(",")[0].trim() ?? coursForm.matiere }); }}>
                    <option value="" disabled>Sélectionner un élève</option>
                    {eleves.map((e: EleveRow) => <option key={e.id} value={e.id}>{e.nom}</option>)}
                  </select>
                </div>
                {/* Matière avec suggestions */}
                <div><label style={S.label}>Matière</label>
                  <div style={{ position: "relative" }}>
                    <input
                      style={S.input}
                      value={matiereInput || coursForm.matiere}
                      onChange={(e) => { setMatiereInput(e.target.value); setCoursForm({ ...coursForm, matiere: e.target.value }); setShowMatiereDropdown(true); }}
                      onFocus={() => setShowMatiereDropdown(true)}
                      onBlur={() => setTimeout(() => setShowMatiereDropdown(false), 150)}
                      placeholder="Ex: Mathématiques..."
                    />
                    {showMatiereDropdown && (
                      <ul style={{ position: "absolute", zIndex: 10, width: "100%", background: "#fff", border: "1px solid #E2E8F0", borderRadius: 12, boxShadow: "0 4px 16px rgba(15,23,42,.08)", marginTop: 4, maxHeight: 192, overflowY: "auto", padding: 0 }}>
                        {[
                          ...(selectedCoursEleve?.matiere ? selectedCoursEleve.matiere.split(",").map((m) => m.trim()).filter(Boolean) : []),
                          ...MATIERES.filter((m) => !selectedCoursEleve?.matiere?.split(",").map((x) => x.trim()).includes(m)),
                        ].filter((m) => m.toLowerCase().includes((matiereInput || coursForm.matiere).toLowerCase())).map((m) => (
                          <li key={m} onMouseDown={() => { setCoursForm({ ...coursForm, matiere: m }); setMatiereInput(""); setShowMatiereDropdown(false); }}
                            style={{ padding: "10px 14px", fontSize: 13, cursor: "pointer", listStyle: "none", color: "#0F172A" }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = "#F1F5F9")}
                            onMouseLeave={(e) => (e.currentTarget.style.background = "")}>
                            {m}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
                {/* Date + Durée */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div><label style={S.label}>Date</label><input type="date" style={S.input} value={coursForm.date} onChange={(e) => setCoursForm({ ...coursForm, date: e.target.value })} /></div>
                  <div>
                    <label style={S.label}>Durée (minutes)</label>
                    <input
                      type="number" min={5} step={5} style={S.input}
                      value={coursForm.duree_minutes || ""}
                      placeholder="ex. 90"
                      onChange={(e) => setCoursForm({ ...coursForm, duree_minutes: Math.max(0, Number(e.target.value)) })}
                    />
                    {coursForm.duree_minutes > 0 && (
                      <p style={{ fontSize: 11, color: "#64748B", marginTop: 4 }}>= {formatDuree(coursForm.duree_minutes)}</p>
                    )}
                  </div>
                </div>
                {/* Tarif */}
                <div><label style={S.label}>Tarif / heure — net parent (€)</label>
                  <input type="number" style={S.input} value={coursForm.tarif_heure} onChange={(e) => setCoursForm({ ...coursForm, tarif_heure: Number(e.target.value) })} />
                </div>
                {/* Récap montants */}
                {(() => {
                  const heures = coursForm.duree_minutes / 60;
                  const montantFamille = coursForm.tarif_heure * heures;
                  const taux = getTauxPlusvalue(grille, coursForm.tarif_heure);
                  const netProf = Math.round(montantFamille * (1 + taux));
                  return (
                    <div style={{ background: "#EFF6FF", borderRadius: 10, padding: "12px 14px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#1E3A8A", marginBottom: 6 }}>
                        <span>Prix famille ({coursForm.tarif_heure}€/h × {formatDuree(coursForm.duree_minutes)})</span>
                        <span style={{ fontWeight: 700 }}>{montantFamille.toFixed(2)} €</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                        <span style={{ color: "#059669" }}>Pour vous (+{Math.round(taux * 100)}%, après impôts et cotisations)</span>
                        <span style={{ fontWeight: 700, color: "#059669" }}>{netProf} €</span>
                      </div>
                    </div>
                  );
                })()}
                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={closeModal} style={{ ...S.btnGhost, flex: 1, justifyContent: "center" }}>Annuler</button>
                  <button onClick={submitCours} disabled={!coursForm.matiere || !coursForm.date || coursForm.duree_minutes <= 0 || saving} style={{ ...S.btnPrimary, flex: 1, justifyContent: "center", opacity: (!coursForm.matiere || !coursForm.date || coursForm.duree_minutes <= 0 || saving) ? 0.5 : 1 }}>
                    {saving && <Loader2 className="w-4 h-4 animate-spin" />}Enregistrer
                  </button>
                </div>
              </div>
            )}
          </ModalOverlay>
        )}

        {/* Modal Ajouter un élève */}
        {activeModal === "eleve" && (
          <ModalOverlay title="Ajouter un élève" onClose={closeModal}>
            {success ? <SuccessState message="Élève ajouté !" onClose={closeModal} /> : (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div><label style={S.label}>Nom complet</label><input style={S.input} value={eleveForm.nom} onChange={(e) => setEleveForm({ ...eleveForm, nom: e.target.value })} placeholder="Jean Dupont" /></div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div><label style={S.label}>Niveau</label>
                    <select style={S.input} value={eleveForm.niveau} onChange={(e) => setEleveForm({ ...eleveForm, niveau: e.target.value })}>
                      {niveaux.map((n) => <option key={n}>{n}</option>)}
                    </select>
                  </div>
                  <div><label style={S.label}>Matière</label><input style={S.input} value={eleveForm.matiere} onChange={(e) => setEleveForm({ ...eleveForm, matiere: e.target.value })} placeholder="Maths..." /></div>
                </div>
                <div>
                  <label style={S.label}>Tarif / heure (€)</label>
                  <input type="number" style={S.input} value={eleveForm.tarif_heure} onChange={(e) => setEleveForm({ ...eleveForm, tarif_heure: Number(e.target.value) })} />
                  {eleveForm.tarif_heure > 0 && (() => {
                    const taux = getTauxPlusvalue(grille, eleveForm.tarif_heure);
                    const netH = Math.round(eleveForm.tarif_heure * (1 + taux));
                    return taux > 0
                      ? <p style={{ fontSize: 11, color: "#6366F1", marginTop: 5 }}>vous toucherez +{Math.round(taux * 100)}% soit {netH}€/h (après impôts et cotisations sociales)</p>
                      : null;
                  })()}
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={closeModal} style={{ ...S.btnGhost, flex: 1, justifyContent: "center" }}>Annuler</button>
                  <button onClick={submitEleve} disabled={!eleveForm.nom || !eleveForm.matiere || saving} style={{ ...S.btnPrimary, flex: 1, justifyContent: "center", opacity: (!eleveForm.nom || !eleveForm.matiere || saving) ? 0.5 : 1 }}>
                    {saving && <Loader2 className="w-4 h-4 animate-spin" />}Ajouter
                  </button>
                </div>
              </div>
            )}
          </ModalOverlay>
        )}
      </div>
    </LoadingGuard>
  );
}
