import { useState, useEffect } from "react";
import { Search, Plus, X, ChevronRight, Copy } from "lucide-react";
import { useEleves } from "../../../lib/hooks/useEleves";
import type { EleveRow } from "../../../lib/hooks/useEleves";
import { useAuth } from "../../../lib/auth";
import { LoadingGuard } from "../layout/LoadingGuard";
import { supabase } from "../../../lib/supabase";
import { toast } from "sonner";

const TODAY = new Date();

function daysSince(dateStr: string): number {
  if (!dateStr) return Infinity;
  return Math.floor((TODAY.getTime() - new Date(dateStr).getTime()) / 86400000);
}

function formatDernierCours(dateStr: string): string {
  if (!dateStr) return "—";
  const days = daysSince(dateStr);
  if (days === 0) return "Aujourd'hui";
  if (days === 1) return "Hier";
  if (days < 7) return `Il y a ${days}j`;
  if (days < 30) return `Il y a ${Math.floor(days / 7)}sem`;
  return `Il y a ${Math.floor(days / 30)}mois`;
}

const niveaux = ["6ème", "5ème", "4ème", "3ème", "2nde", "1ère S", "1ère ES", "Terminale S", "Terminale ES", "BTS", "Licence 1", "Licence 2", "Licence 3"];
const MATIERES = ["Mathématiques", "Physique", "Chimie", "Français", "Anglais", "Espagnol", "Allemand", "Histoire-Géographie", "SES", "SVT", "NSI", "Philosophie", "Autre"];
const emptyForm = { nom: "", niveau: "2nde", matieres: [] as string[], tarif_heure: 25, statut: "actif" as EleveRow["statut"] };

const S = {
  card: { background: "#fff", border: "1px solid #E2E8F0", borderRadius: 16, boxShadow: "0 1px 3px rgba(15,23,42,.06)" } as React.CSSProperties,
  eyebrow: { fontSize: 11, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase" as const, color: "#64748B" } as React.CSSProperties,
  badge: (bg: string, color: string) => ({ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 8px", borderRadius: 999, fontSize: 11, fontWeight: 700, background: bg, color } as React.CSSProperties),
  btnPrimary: { display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: 12, background: "#2E6BEA", color: "#fff", fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer" } as React.CSSProperties,
  btnGhost: { display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: 12, background: "transparent", color: "#334155", fontSize: 13, fontWeight: 600, border: "1px solid #E2E8F0", cursor: "pointer" } as React.CSSProperties,
  input: { width: "100%", padding: "10px 14px", borderRadius: 12, border: "1px solid #E2E8F0", background: "#F1F5F9", fontFamily: "inherit", fontSize: 13, color: "#0F172A", outline: "none" } as React.CSSProperties,
  label: { display: "block", fontSize: 12, fontWeight: 600, color: "#334155", marginBottom: 5 } as React.CSSProperties,
};

function StatutBadge({ statut }: { statut: string }) {
  if (statut === "actif") return <span style={S.badge("#ECFDF5", "#065F46")}>actif</span>;
  if (statut === "en pause") return <span style={S.badge("#FFFBEB", "#92400E")}>en pause</span>;
  if (statut === "en attente") return <span style={S.badge("#EFF6FF", "#1E3A8A")}>en attente</span>;
  return <span style={S.badge("#F1F5F9", "#64748B")}>{statut}</span>;
}

export function Eleves() {
  const { profile } = useAuth();
  const { eleves, loading, error, reload, addEleve } = useEleves();
  const hasSiret = !!profile?.siret;
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [matiereInput, setMatiereInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [parentsMap, setParentsMap] = useState<Record<string, boolean>>({});
  const [parentContacts, setParentContacts] = useState<Record<string, any>>({});

  useEffect(() => {
    async function fetchParents() {
      if (!eleves || eleves.length === 0) return;
      const { data } = await supabase.from("parent_eleve").select("eleve_id").in("eleve_id", eleves.map((e: EleveRow) => e.id));
      if (data) { const map: Record<string, boolean> = {}; data.forEach((d) => { map[d.eleve_id] = true; }); setParentsMap(map); }
    }
    fetchParents();
  }, [eleves]);

  useEffect(() => {
    if (!selectedId) return;
    (async () => {
      const { data: pe } = await supabase
        .from("parent_eleve")
        .select("parent_id")
        .eq("eleve_id", selectedId)
        .maybeSingle();
      if (!pe?.parent_id) return;
      const { data: prof } = await supabase
        .from("profiles")
        .select("prenom, nom, telephone, email, adresse_postale")
        .eq("id", pe.parent_id)
        .single();
      if (prof) setParentContacts((prev) => ({ ...prev, [selectedId]: prof }));
    })();
  }, [selectedId]);

  const filtered = eleves.filter((e: EleveRow) =>
    e.nom.toLowerCase().includes(search.toLowerCase()) ||
    e.matiere.toLowerCase().includes(search.toLowerCase())
  );

  const selectedEleve = eleves.find((e: EleveRow) => e.id === selectedId) ?? null;

  async function handleAdd() {
    if (!form.nom || form.matieres.length === 0) return;
    setSaving(true); setAddError(null);
    try {
      await addEleve({ nom: form.nom, niveau: form.niveau, matiere: form.matieres.join(", "), tarif_heure: form.tarif_heure, statut: form.statut }, []);
      setShowAdd(false); setForm(emptyForm);
    } catch (err) {
      setAddError(err instanceof Error ? err.message : "Erreur lors de l'ajout");
    } finally { setSaving(false); }
  }

  return (
    <LoadingGuard loading={loading} error={error} onRetry={reload}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 28 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-.02em", color: "#0F172A" }}>Élèves</h1>
            <p style={{ color: "#64748B", marginTop: 4, fontSize: 13 }}>{eleves.length} élève{eleves.length !== 1 ? "s" : ""} enregistré{eleves.length !== 1 ? "s" : ""}</p>
          </div>
          <button style={{ ...S.btnPrimary, opacity: hasSiret ? 1 : 0.4 }} onClick={() => hasSiret && setShowAdd(true)} disabled={!hasSiret}>
            <Plus className="w-4 h-4" />Ajouter un élève
          </button>
        </div>

        {/* Table card */}
        <div style={{ ...S.card, overflow: "hidden" }}>
          <div style={{ padding: "14px 16px", borderBottom: "1px solid #E2E8F0" }}>
            <div style={{ position: "relative", maxWidth: 320 }}>
              <Search style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", width: 14, height: 14, color: "#94A3B8" }} />
              <input
                style={{ ...S.input, paddingLeft: 36 }}
                placeholder="Rechercher un élève ou une matière..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["Nom", "Niveau", "Matière", "Tarif/h", "Statut", "Dernier cours", ""].map((h) => (
                  <th key={h} style={{ textAlign: "left", padding: "10px 16px", fontSize: 12, fontWeight: 600, color: "#64748B", background: "#F8FAFC" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((e: EleveRow) => {
                const inactive = e.statut === "actif" && daysSince(e.dernier_cours ?? "") >= 14;
                return (
                  <tr key={e.id} style={{ cursor: "pointer" }} onClick={() => setSelectedId(e.id)}
                    onMouseEnter={(ev) => (ev.currentTarget.style.background = "#F8FAFC")}
                    onMouseLeave={(ev) => (ev.currentTarget.style.background = "")}>
                    <td style={{ padding: "12px 16px", borderTop: "1px solid #F1F5F9" }}>
                      <div style={{ fontWeight: 600, fontSize: 13, color: "#0F172A" }}>{e.nom}</div>
                    </td>
                    <td style={{ padding: "12px 16px", borderTop: "1px solid #F1F5F9", fontSize: 13, color: "#64748B" }}>{e.niveau}</td>
                    <td style={{ padding: "12px 16px", borderTop: "1px solid #F1F5F9", fontSize: 13, color: "#64748B" }}>{e.matiere}</td>
                    <td style={{ padding: "12px 16px", borderTop: "1px solid #F1F5F9", fontSize: 13, fontWeight: 600, color: "#0F172A" }}>{e.tarif_heure} €</td>
                    <td style={{ padding: "12px 16px", borderTop: "1px solid #F1F5F9" }}><StatutBadge statut={e.statut === "actif" && !parentsMap[e.id] ? "en attente" : e.statut} /></td>
                    <td style={{ padding: "12px 16px", borderTop: "1px solid #F1F5F9", fontSize: 13, color: inactive ? "#92400E" : "#64748B" }}>{formatDernierCours(e.dernier_cours ?? "")}</td>
                    <td style={{ padding: "12px 16px", borderTop: "1px solid #F1F5F9" }}><ChevronRight style={{ width: 14, height: 14, color: "#94A3B8" }} /></td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={7} style={{ padding: 32, textAlign: "center", fontSize: 13, color: "#94A3B8" }}>Aucun élève trouvé.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Drawer */}
        {selectedEleve && (
          <div style={{ position: "fixed", inset: 0, zIndex: 40 }} onClick={() => setSelectedId(null)}>
            <div style={{ position: "absolute", right: 0, top: 0, height: "100%", width: 440, background: "#fff", boxShadow: "-4px 0 32px rgba(15,23,42,.12)", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
              <div style={{ padding: 24 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
                  <div>
                    <h2 style={{ fontWeight: 700, fontSize: 18, color: "#0F172A" }}>{selectedEleve.nom}</h2>
                    <p style={{ color: "#64748B", fontSize: 13, marginTop: 2 }}>{selectedEleve.niveau} · {selectedEleve.matiere}</p>
                  </div>
                  <button onClick={() => setSelectedId(null)} style={{ background: "none", border: "none", cursor: "pointer", padding: 6, borderRadius: 8 }}><X style={{ width: 16, height: 16, color: "#94A3B8" }} /></button>
                </div>

                {/* Stats */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
                  {[{ label: "Total heures", val: `${selectedEleve.total_heures ?? 0}h` }, { label: "Total payé", val: `${selectedEleve.total_paye ?? 0} €` }].map((s) => (
                    <div key={s.label} style={{ background: "#F1F5F9", borderRadius: 12, padding: 16 }}>
                      <div style={S.eyebrow}>{s.label}</div>
                      <div style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 28, marginTop: 6, color: "#0F172A" }}>{s.val}</div>
                    </div>
                  ))}
                </div>

                {/* Coordonnées */}
                <div style={{ marginBottom: 20 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 600, color: "#0F172A", marginBottom: 10 }}>Coordonnées</h3>

                  {/* Élève — lecture seule */}
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ ...S.eyebrow, marginBottom: 8 }}>Élève</div>
                    {selectedEleve.telephone_eleve || selectedEleve.email_eleve || selectedEleve.adresse_eleve ? (
                      <div style={{ background: "#F8FAFC", borderRadius: 10, padding: "12px 14px" }}>
                        {selectedEleve.telephone_eleve && (
                          <p style={{ fontSize: 13, color: "#334155", marginBottom: 3 }}>📞 {selectedEleve.telephone_eleve}</p>
                        )}
                        {selectedEleve.email_eleve && (
                          <p style={{ fontSize: 13, color: "#334155", marginBottom: 3 }}>✉️ {selectedEleve.email_eleve}</p>
                        )}
                        {selectedEleve.adresse_eleve && (
                          <p style={{ fontSize: 13, color: "#334155" }}>📍 {selectedEleve.adresse_eleve}</p>
                        )}
                      </div>
                    ) : (
                      <p style={{ fontSize: 12, color: "#94A3B8" }}>Aucune coordonnée renseignée</p>
                    )}
                  </div>

                  {/* Parent — lecture seule */}
                  {parentContacts[selectedEleve.id] && (
                    <div style={{ background: "#F8FAFC", borderRadius: 10, padding: "12px 14px" }}>
                      <div style={{ ...S.eyebrow, marginBottom: 8 }}>Parent</div>
                      <p style={{ fontSize: 13, fontWeight: 600, color: "#0F172A", marginBottom: 4 }}>
                        {parentContacts[selectedEleve.id].prenom} {parentContacts[selectedEleve.id].nom}
                      </p>
                      {parentContacts[selectedEleve.id].telephone && (
                        <p style={{ fontSize: 13, color: "#334155", marginBottom: 3 }}>📞 {parentContacts[selectedEleve.id].telephone}</p>
                      )}
                      {parentContacts[selectedEleve.id].email && (
                        <p style={{ fontSize: 13, color: "#334155", marginBottom: 3 }}>✉️ {parentContacts[selectedEleve.id].email}</p>
                      )}
                      {parentContacts[selectedEleve.id].adresse_postale && (
                        <p style={{ fontSize: 13, color: "#334155" }}>📍 {parentContacts[selectedEleve.id].adresse_postale}</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Code parent */}
                <div style={{ background: "#EFF6FF", border: "1px solid #C7D8FB", borderRadius: 12, padding: 16 }}>
                  <div style={{ ...S.eyebrow, color: "#1E3A8A", marginBottom: 8 }}>Code d'accès Parent</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ fontFamily: "monospace", fontSize: 20, fontWeight: 700, letterSpacing: ".2em", color: "#0F172A" }}>
                      {selectedEleve.code_invitation ?? selectedEleve.id.slice(0, 6).toUpperCase()}
                    </div>
                    <button
                      onClick={() => {
                        const code = selectedEleve.code_invitation ?? selectedEleve.id.slice(0, 6).toUpperCase();
                        navigator.clipboard.writeText(code);
                        toast.success("Code copié !");
                      }}
                      style={{ background: "none", border: "none", cursor: "pointer", padding: 4, borderRadius: 6, display: "flex", alignItems: "center" }}
                      title="Copier le code"
                    >
                      <Copy style={{ width: 15, height: 15, color: "#1E3A8A" }} />
                    </button>
                  </div>
                  {parentsMap[selectedEleve.id] && (
                    <p style={{ fontSize: 12, color: "#10B981", marginTop: 8 }}>✓ Parent connecté</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal ajouter */}
        {showAdd && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 16 }}>
            <div style={{ background: "#fff", borderRadius: 22, width: "100%", maxWidth: 480, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 4px 24px rgba(15,23,42,.12)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "22px 24px 0" }}>
                <h2 style={{ fontWeight: 700, fontSize: 16, color: "#0F172A" }}>Ajouter un élève</h2>
                <button onClick={() => { setShowAdd(false); setForm(emptyForm); }} style={{ background: "none", border: "none", cursor: "pointer" }}><X className="w-4 h-4 text-slate-400" /></button>
              </div>
              <div style={{ padding: "20px 24px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
                <div><label style={S.label}>Nom complet</label><input style={S.input} value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} placeholder="Jean Dupont" /></div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div><label style={S.label}>Niveau</label>
                    <select style={S.input} value={form.niveau} onChange={(e) => setForm({ ...form, niveau: e.target.value })}>
                      {niveaux.map((n) => <option key={n}>{n}</option>)}
                    </select>
                  </div>
                  <div><label style={S.label}>Tarif / heure — net parent (€)</label>
                    <input type="number" style={S.input} value={form.tarif_heure} onChange={(e) => setForm({ ...form, tarif_heure: Number(e.target.value) })} />
                  </div>
                </div>
                <div>
                  <label style={S.label}>Matières</label>
                  <div style={{ position: "relative" }}>
                    <input style={S.input} value={matiereInput} onChange={(e) => setMatiereInput(e.target.value)} placeholder="Chercher une matière..." />
                    {matiereInput && (
                      <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: "#fff", border: "1px solid #E2E8F0", borderRadius: 12, boxShadow: "0 4px 16px rgba(15,23,42,.08)", zIndex: 10, overflow: "hidden" }}>
                        {MATIERES.filter((m) => m.toLowerCase().includes(matiereInput.toLowerCase()) && !form.matieres.includes(m)).map((m) => (
                          <button key={m} style={{ display: "block", width: "100%", textAlign: "left", padding: "10px 14px", fontSize: 13, background: "none", border: "none", cursor: "pointer", color: "#0F172A" }}
                            onClick={() => { setForm({ ...form, matieres: [...form.matieres, m] }); setMatiereInput(""); }}>
                            {m}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
                    {form.matieres.map((m) => (
                      <span key={m} style={{ ...S.badge("#EFF6FF", "#1E3A8A"), cursor: "pointer" }} onClick={() => setForm({ ...form, matieres: form.matieres.filter((x) => x !== m) })}>
                        {m} <X style={{ width: 10, height: 10 }} />
                      </span>
                    ))}
                  </div>
                </div>
                {addError && <p style={{ fontSize: 12, color: "#EF4444" }}>{addError}</p>}
                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={() => { setShowAdd(false); setForm(emptyForm); }} style={{ ...S.btnGhost, flex: 1, justifyContent: "center" }}>Annuler</button>
                  <button onClick={handleAdd} disabled={!form.nom || form.matieres.length === 0 || saving} style={{ ...S.btnPrimary, flex: 1, justifyContent: "center", opacity: (!form.nom || form.matieres.length === 0 || saving) ? 0.5 : 1 }}>
                    {saving ? "Ajout..." : "Ajouter"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </LoadingGuard>
  );
}
