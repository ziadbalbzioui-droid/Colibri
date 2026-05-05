import { useState, useMemo } from "react";
import { FileText, Download, CheckCircle2, Clock, Plus, X, ChevronDown, Loader2 } from "lucide-react";
import { LoadingGuard } from "../layout/LoadingGuard";
import { useFactures } from "../../../lib/hooks/useFactures";
import { useAuth } from "../../../lib/auth";
import type { FactureRow, LigneRow } from "../../../lib/hooks/useFactures";

const URSSAF = 0.211;
const MOIS_NOMS = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];

function calcTotal(lignes: LigneRow[]) {
  return lignes.reduce((acc, l) => acc + l.heures * l.tarif_heure, 0);
}

function getMoisDisponibles(dateInscriptionStr: string | null | undefined): string[] {
  const now = new Date();
  if (!dateInscriptionStr) return [`${MOIS_NOMS[now.getMonth()]} ${now.getFullYear()}`];
  const dateInscription = new Date(dateInscriptionStr);
  const result: string[] = [];
  let current = new Date(now.getFullYear(), now.getMonth(), 1);
  const limit = new Date(dateInscription.getFullYear(), dateInscription.getMonth(), 1);
  let count = 0;
  while (current >= limit && count < 24) {
    result.push(`${MOIS_NOMS[current.getMonth()]} ${current.getFullYear()}`);
    current.setMonth(current.getMonth() - 1); count++;
  }
  return result;
}

const emptyLigne: LigneRow = { eleve_nom: "", matiere: "", heures: 1, tarif_heure: 25 };

const S = {
  card: { background: "#fff", border: "1px solid #E2E8F0", borderRadius: 16, boxShadow: "0 1px 3px rgba(15,23,42,.06)" } as React.CSSProperties,
  badge: (bg: string, color: string) => ({ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 8px", borderRadius: 999, fontSize: 11, fontWeight: 700, background: bg, color } as React.CSSProperties),
  btnPrimary: { display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: 12, background: "#2E6BEA", color: "#fff", fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer" } as React.CSSProperties,
  btnGhost: { display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: 12, background: "transparent", color: "#334155", fontSize: 13, fontWeight: 600, border: "1px solid #E2E8F0", cursor: "pointer" } as React.CSSProperties,
  input: { width: "100%", padding: "10px 14px", borderRadius: 12, border: "1px solid #E2E8F0", background: "#F1F5F9", fontFamily: "inherit", fontSize: 13, color: "#0F172A", outline: "none" } as React.CSSProperties,
  label: { display: "block", fontSize: 12, fontWeight: 600, color: "#334155", marginBottom: 5 } as React.CSSProperties,
  serif: { fontFamily: "'Fraunces', Georgia, serif" } as React.CSSProperties,
};

function FacturePreview({ facture, onClose, profInfo }: { facture: FactureRow; onClose: () => void; profInfo: { nom: string; siret: string; adresse: string; email: string } }) {
  const brut = calcTotal(facture.lignes);
  const urssaf = Math.round(brut * URSSAF);
  const net = brut - urssaf;
  const creditImpot = Math.round(brut * 0.5);
  const dateStr = facture.date_emission ? new Date(facture.date_emission).toLocaleDateString("fr-FR") : "—";

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 16 }}>
      <div style={{ background: "#fff", borderRadius: 20, width: "100%", maxWidth: 640, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 4px 24px rgba(15,23,42,.12)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px", borderBottom: "1px solid #E2E8F0" }}>
          <div>
            <p style={{ fontSize: 12, color: "#64748B" }}>Aperçu de la facture</p>
            <h3 style={{ fontWeight: 700, fontSize: 15, color: "#0F172A", marginTop: 2 }}>{facture.id.slice(0, 8).toUpperCase()} — {facture.mois}</h3>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => window.print()} style={{ ...S.btnPrimary, fontSize: 12 }}><Download className="w-3.5 h-3.5" />Télécharger</button>
            <button onClick={onClose} style={{ ...S.btnGhost, padding: "9px 10px" }}><X className="w-3.5 h-3.5" /></button>
          </div>
        </div>

        <div style={{ padding: 32 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24 }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: 17, color: "#0F172A" }}>{profInfo.nom}</div>
              <div style={{ fontSize: 12, color: "#64748B", marginTop: 4 }}>Auto-entrepreneur</div>
              {profInfo.siret && <div style={{ fontSize: 12, color: "#64748B" }}>SIRET : {profInfo.siret}</div>}
              {profInfo.adresse && <div style={{ fontSize: 12, color: "#64748B" }}>{profInfo.adresse}</div>}
              <div style={{ fontSize: 12, color: "#64748B" }}>{profInfo.email}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ ...S.serif, fontSize: 28, color: "#2E6BEA" }}>{facture.id.slice(0, 8).toUpperCase()}</div>
              <div style={{ fontSize: 12, color: "#64748B", marginTop: 4 }}>Émise le {dateStr}</div>
              <div style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>Période : {facture.mois}</div>
              <span style={{ ...S.badge("#ECFDF5", "#065F46"), marginTop: 8, display: "inline-flex" }}>Payée</span>
            </div>
          </div>

          <div style={{ background: "#F1F5F9", borderRadius: 10, padding: "12px 16px", marginBottom: 20, fontSize: 13, color: "#0F172A" }}>
            <div style={{ fontWeight: 600 }}>Objet : Prestations de cours particuliers — {facture.mois}</div>
            <div style={{ color: "#64748B", marginTop: 2 }}>Services d'enseignement à domicile — Crédit d'impôt applicable (50%)</div>
          </div>

          <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 20 }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #E2E8F0" }}>
                {["Élève", "Matière", "Heures", "Tarif/h", "Total"].map((h, i) => (
                  <th key={h} style={{ textAlign: i < 2 ? "left" : "right", padding: "8px 0", fontSize: 12, fontWeight: 600, color: "#64748B" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {facture.lignes.map((l, i) => (
                <tr key={i} style={{ borderBottom: "1px solid #E2E8F0" }}>
                  <td style={{ padding: "12px 0", fontWeight: 600, fontSize: 13, color: "#0F172A" }}>{l.eleve_nom}</td>
                  <td style={{ padding: "12px 0", fontSize: 13, color: "#64748B" }}>{l.matiere}</td>
                  <td style={{ padding: "12px 0", textAlign: "right", fontSize: 13, color: "#64748B" }}>{l.heures}h</td>
                  <td style={{ padding: "12px 0", textAlign: "right", fontSize: 13, color: "#64748B" }}>{l.tarif_heure} €</td>
                  <td style={{ padding: "12px 0", textAlign: "right", fontSize: 13, fontWeight: 600, color: "#0F172A" }}>{(l.heures * l.tarif_heure).toFixed(2)} €</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ marginLeft: "auto", width: 280 }}>
            {[["Sous-total HT", `${brut.toFixed(2)} €`], ["TVA", "Non applicable (AE)"]].map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #E2E8F0", fontSize: 13, color: "#64748B" }}>
                <span>{k}</span><span>{v}</span>
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 14px", background: "#EFF6FF", borderRadius: 10, marginTop: 6 }}>
              <span style={{ fontWeight: 700, color: "#0F172A" }}>Total TTC</span>
              <span style={{ fontWeight: 700, fontSize: 18, color: "#2E6BEA" }}>{brut.toFixed(2)} €</span>
            </div>
          </div>

          <div style={{ marginTop: 20, padding: "14px 16px", background: "#ECFDF5", border: "1px solid #BBF7D0", borderRadius: 12, fontSize: 13 }}>
            <div style={{ fontWeight: 600, color: "#059669", marginBottom: 4 }}>Crédit d'impôt services à la personne (Art. 199 sexdecies CGI)</div>
            <div style={{ color: "#047857" }}>Les familles bénéficient d'un crédit d'impôt de 50% sur ces prestations, soit <strong>{creditImpot.toFixed(2)} €</strong>.</div>
          </div>

          <div style={{ marginTop: 12, padding: "12px 16px", background: "#F1F5F9", borderRadius: 10, fontSize: 12, color: "#64748B" }}>
            Note interne · URSSAF : <strong style={{ color: "#EF4444" }}>−{urssaf} €</strong> · Net réel : <strong style={{ color: "#059669" }}>{net} €</strong>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Factures() {
  const { factures, loading, error, reload, createFacture } = useFactures();
  const { profile } = useAuth();

  const moisDisponibles = useMemo(() => getMoisDisponibles(profile?.created_at), [profile?.created_at]);

  const [preview, setPreview] = useState<FactureRow | null>(null);
  const [showGenerate, setShowGenerate] = useState(false);
  const [genMois, setGenMois] = useState(moisDisponibles[0] || "");
  const [genLignes, setGenLignes] = useState<LigneRow[]>([{ ...emptyLigne }]);
  const [genSuccess, setGenSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  const profInfo = { nom: profile ? `${profile.prenom} ${profile.nom}` : "—", siret: profile?.siret ?? "", adresse: profile?.adresse ?? "", email: profile?.email ?? "" };

  function addLigne() { setGenLignes((prev) => [...prev, { ...emptyLigne }]); }
  function removeLigne(i: number) { setGenLignes((prev) => prev.filter((_, idx) => idx !== i)); }
  function updateLigne(i: number, field: keyof LigneRow, value: string | number) {
    setGenLignes((prev) => prev.map((l, idx) => idx === i ? { ...l, [field]: value } : l));
  }

  async function handleGenerate() {
    setSaving(true);
    try { await createFacture(genMois, genLignes); setGenSuccess(true); } finally { setSaving(false); }
  }

  function closeGenerate() { setShowGenerate(false); setGenSuccess(false); setGenLignes([{ ...emptyLigne }]); setGenMois(moisDisponibles[0]); }

  const moisAvecFacture = new Set(factures.map((f) => f.mois));

  return (
    <LoadingGuard loading={loading} error={error} onRetry={reload}>
      <div style={{ maxWidth: 900, margin: "0 auto", opacity: profile?.siret ? 1 : 0.5, pointerEvents: profile?.siret ? "auto" : "none" }}>

        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-.02em", color: "#0F172A", marginBottom: 4 }}>Factures</h1>
          <p style={{ color: "#64748B", fontSize: 13 }}>Consultez et téléchargez vos factures mensuelles de cours particuliers.</p>
        </div>

        {/* List */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {factures.map((f) => {
            const brut = calcTotal(f.lignes);
            const net = Math.round(brut * (1 - URSSAF));
            return (
              <div key={f.id} style={{ ...S.card, padding: 18, display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: f.statut === "payée" ? "#ECFDF5" : "#FFFBEB", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {f.statut === "payée" ? <CheckCircle2 style={{ width: 18, height: 18, color: "#059669" }} /> : <Clock style={{ width: 18, height: 18, color: "#F59E0B" }} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: "#0F172A", marginBottom: 3 }}>{f.mois}</div>
                  <div style={{ display: "flex", gap: 16, fontSize: 12, color: "#64748B" }}>
                    <span>{f.lignes.length} élève{f.lignes.length > 1 ? "s" : ""}</span>
                    <span>{f.lignes.reduce((a, l) => a + l.heures, 0)}h</span>
                    <span>Net {net.toLocaleString("fr-FR", { maximumFractionDigits: 2 })} €</span>
                  </div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ ...S.serif, fontSize: 22, fontWeight: 400, color: "#0F172A" }}>{brut.toLocaleString("fr-FR", { maximumFractionDigits: 2 })} €</div>
                  <span style={{ ...S.badge(f.statut === "payée" ? "#ECFDF5" : "#FFFBEB", f.statut === "payée" ? "#065F46" : "#92400E") }}>{f.statut === "payée" ? "Payée" : "En attente"}</span>
                </div>
                <button onClick={() => setPreview(f)} style={{ ...S.btnGhost, flexShrink: 0, fontSize: 12 }}>
                  <FileText className="w-3.5 h-3.5" />Voir
                </button>
              </div>
            );
          })}

          {moisDisponibles.filter((m) => !moisAvecFacture.has(m)).map((m) => (
            <div key={m} style={{ ...S.card, padding: 18, display: "flex", alignItems: "center", gap: 16, borderStyle: "dashed" }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: "#F1F5F9", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <FileText style={{ width: 18, height: 18, color: "#94A3B8" }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: "#0F172A", marginBottom: 2 }}>{m}</div>
                <div style={{ fontSize: 12, color: "#94A3B8" }}>Aucune facture générée</div>
              </div>
              <button onClick={() => { setGenMois(m); setShowGenerate(true); setGenSuccess(false); }} style={{ ...S.btnPrimary, flexShrink: 0, fontSize: 12 }}>
                <Plus className="w-3.5 h-3.5" />Générer la facture
              </button>
            </div>
          ))}
        </div>

        {preview && <FacturePreview facture={preview} onClose={() => setPreview(null)} profInfo={profInfo} />}

        {/* Generate modal */}
        {showGenerate && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 16 }}>
            <div style={{ background: "#fff", borderRadius: 22, width: "100%", maxWidth: 520, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 4px 24px rgba(15,23,42,.12)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "22px 24px 0" }}>
                <div>
                  <h2 style={{ fontWeight: 700, fontSize: 16, color: "#0F172A" }}>Générer une facture</h2>
                  <p style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>{genMois}</p>
                </div>
                <button onClick={closeGenerate} style={{ background: "none", border: "none", cursor: "pointer" }}><X className="w-4 h-4 text-slate-400" /></button>
              </div>

              <div style={{ padding: "20px 24px 24px" }}>
                {genSuccess ? (
                  <div style={{ textAlign: "center", paddingTop: 16, paddingBottom: 8 }}>
                    <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#ECFDF5", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                      <CheckCircle2 className="w-7 h-7 text-emerald-500" />
                    </div>
                    <p style={{ fontWeight: 600, fontSize: 16, color: "#0F172A", marginBottom: 4 }}>Facture générée !</p>
                    <p style={{ color: "#64748B", fontSize: 13, marginBottom: 24 }}>La facture pour <strong>{genMois}</strong> a été enregistrée.</p>
                    <button onClick={closeGenerate} style={S.btnPrimary}>Fermer</button>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    <div>
                      <label style={S.label}>Mois de la facture</label>
                      <div style={{ position: "relative" }}>
                        <select style={S.input} value={genMois} onChange={(e) => setGenMois(e.target.value)}>
                          {moisDisponibles.map((m) => <option key={m}>{m}</option>)}
                        </select>
                        <ChevronDown style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", width: 14, height: 14, color: "#94A3B8", pointerEvents: "none" }} />
                      </div>
                    </div>

                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                        <label style={{ ...S.label, margin: 0 }}>Cours effectués</label>
                        <button onClick={addLigne} style={{ fontSize: 13, color: "#2E6BEA", background: "none", border: "none", cursor: "pointer", fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                          <Plus className="w-3.5 h-3.5" />Ajouter une ligne
                        </button>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {genLignes.map((l, i) => (
                          <div key={i} style={{ background: "#F1F5F9", borderRadius: 12, padding: 14 }}>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
                              <input style={{ ...S.input, background: "#fff" }} value={l.eleve_nom} onChange={(e) => updateLigne(i, "eleve_nom", e.target.value)} placeholder="Nom de l'élève" />
                              <input style={{ ...S.input, background: "#fff" }} value={l.matiere} onChange={(e) => updateLigne(i, "matiere", e.target.value)} placeholder="Matière" />
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 8, alignItems: "center" }}>
                              <input type="number" style={{ ...S.input, background: "#fff" }} value={l.heures} onChange={(e) => updateLigne(i, "heures", Number(e.target.value))} min={0.5} step={0.5} />
                              <input type="number" style={{ ...S.input, background: "#fff" }} value={l.tarif_heure} onChange={(e) => updateLigne(i, "tarif_heure", Number(e.target.value))} />
                              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <span style={{ fontWeight: 700, fontSize: 13, color: "#0F172A" }}>{(l.heures * l.tarif_heure).toFixed(0)} €</span>
                                {genLignes.length > 1 && <button onClick={() => removeLigne(i)} style={{ background: "none", border: "none", cursor: "pointer" }}><X style={{ width: 14, height: 14, color: "#94A3B8" }} /></button>}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: 10 }}>
                      <button onClick={closeGenerate} style={{ ...S.btnGhost, flex: 1, justifyContent: "center" }}>Annuler</button>
                      <button onClick={handleGenerate} disabled={saving} style={{ ...S.btnPrimary, flex: 1, justifyContent: "center", opacity: saving ? 0.5 : 1 }}>
                        {saving && <Loader2 className="w-4 h-4 animate-spin" />}Générer la facture
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </LoadingGuard>
  );
}
