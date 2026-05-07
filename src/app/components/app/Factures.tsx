import { useState, useEffect, useCallback } from "react";
import { Download, FileText, X, CheckCircle2, Clock, AlertCircle, Info } from "lucide-react";
import { LoadingGuard } from "../layout/LoadingGuard";
import { useAuth } from "../../../lib/auth";
import { supabase } from "../../../lib/supabase";
import type { FactureRow, LigneRow } from "../../../lib/hooks/useFactures";

const MOIS_NOMS = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];

const S = {
  card: { background: "#fff", border: "1px solid #E2E8F0", borderRadius: 16, boxShadow: "0 1px 3px rgba(15,23,42,.06)" } as React.CSSProperties,
  btnPrimary: { display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 10, background: "#2E6BEA", color: "#fff", fontSize: 12, fontWeight: 600, border: "none", cursor: "pointer" } as React.CSSProperties,
  btnGhost: { display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 10, background: "transparent", color: "#334155", fontSize: 12, fontWeight: 600, border: "1px solid #E2E8F0", cursor: "pointer" } as React.CSSProperties,
  serif: { fontFamily: "'Fraunces', Georgia, serif" } as React.CSSProperties,
};

const fmt = (n: number) => n.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function calcTotal(lignes: LigneRow[]) {
  return lignes.reduce((acc, l) => acc + l.heures * l.tarif_heure, 0);
}

function FacturePreview({ facture, onClose, profInfo }: {
  facture: FactureRow;
  onClose: () => void;
  profInfo: { nom: string; siret: string; adresse: string; email: string };
}) {
  const brut = calcTotal(facture.lignes);
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
            <button onClick={() => window.print()} style={S.btnPrimary}><Download className="w-3.5 h-3.5" />Télécharger</button>
            <button onClick={onClose} style={{ ...S.btnGhost, padding: "8px 10px" }}><X className="w-3.5 h-3.5" /></button>
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
        </div>
      </div>
    </div>
  );
}

function StatutBadge({ statut }: { statut: string }) {
  if (statut === "payée") {
    return (
      <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 999, fontSize: 12, fontWeight: 600, background: "#ECFDF5", color: "#065F46" }}>
        <CheckCircle2 style={{ width: 13, height: 13 }} />Payée
      </span>
    );
  }
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 999, fontSize: 12, fontWeight: 600, background: "#FFFBEB", color: "#92400E" }}>
      <Clock style={{ width: 13, height: 13 }} />En attente
    </span>
  );
}

export function Factures() {
  const { user, profile } = useAuth();
  const [factures, setFactures] = useState<FactureRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<FactureRow | null>(null);

  const load = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from("factures")
        .select("*, lignes_facture(*)")
        .eq("prof_id", user.id)
        .order("date_emission", { ascending: false });
      if (err) throw err;
      setFactures((data ?? []).map((f) => ({ ...f, lignes: f.lignes_facture as LigneRow[] })));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => { load(); }, [load]);

  const profInfo = {
    nom: profile ? `${profile.prenom} ${profile.nom}` : "—",
    siret: profile?.siret ?? "",
    adresse: profile?.adresse ?? "",
    email: profile?.email ?? "",
  };

  const totalPaye = factures.filter((f) => f.statut === "payée").reduce((s, f) => s + f.montant_brut, 0);
  const totalEnAttente = factures.filter((f) => f.statut === "en attente").reduce((s, f) => s + f.montant_brut, 0);

  return (
    <LoadingGuard loading={loading} error={error} onRetry={load}>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-.02em", color: "#0F172A", marginBottom: 4 }}>Factures & Paiements</h1>
          <p style={{ color: "#64748B", fontSize: 13 }}>Factures envoyées aux familles et suivi des paiements.</p>
        </div>

        {/* Explanatory banner */}
        <div style={{ background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: 14, padding: "16px 20px", marginBottom: 28, display: "flex", gap: 14, alignItems: "flex-start" }}>
          <Info style={{ width: 18, height: 18, color: "#2563EB", flexShrink: 0, marginTop: 1 }} />
          <p style={{ fontSize: 13, color: "#1E40AF", lineHeight: 1.65, margin: 0 }}>
            <strong>Pourquoi Colibri vous vire plus que vos récaps ?</strong><br />
            Les gains promis et affichés avec leurs pourcentages correspondent aux gains que vous touchez <strong>après cotisations et impôts</strong>. C'est pour cette raison que Colibri vous vire plus que ce qui est affiché dans vos récaps du mois — ainsi, après avoir payé vos cotisations et vos impôts, il vous restera exactement le montant promis.
          </p>
        </div>

        {/* Stats */}
        {factures.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
            <div style={{ ...S.card, padding: "16px 20px" }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 4 }}>Total payé</p>
              <p style={{ ...S.serif, fontSize: 24, color: "#15803D", fontWeight: 400 }}>{fmt(totalPaye)} €</p>
            </div>
            <div style={{ ...S.card, padding: "16px 20px" }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 4 }}>En attente</p>
              <p style={{ ...S.serif, fontSize: 24, color: totalEnAttente > 0 ? "#D97706" : "#94A3B8", fontWeight: 400 }}>{fmt(totalEnAttente)} €</p>
            </div>
          </div>
        )}

        {/* Factures list */}
        <div style={S.card}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid #F1F5F9" }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: "#0F172A", margin: 0 }}>Historique des factures</h3>
          </div>

          {factures.length === 0 ? (
            <div style={{ padding: "56px 24px", textAlign: "center" }}>
              <div style={{ width: 48, height: 48, background: "#F1F5F9", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
                <AlertCircle style={{ width: 20, height: 20, color: "#94A3B8" }} />
              </div>
              <p style={{ fontSize: 14, color: "#94A3B8", margin: 0 }}>Aucune facture pour le moment.</p>
            </div>
          ) : (
            <div>
              {factures.map((f, i) => (
                <div key={f.id} style={{
                  display: "flex", alignItems: "center", gap: 16,
                  padding: "14px 20px",
                  borderBottom: i < factures.length - 1 ? "1px solid #F8FAFC" : "none",
                }}>
                  {/* Icon */}
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: "#F8FAFC", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <FileText style={{ width: 16, height: 16, color: "#64748B" }} />
                  </div>

                  {/* Month */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 600, fontSize: 14, color: "#0F172A", margin: 0 }}>{f.mois}</p>
                    <p style={{ fontSize: 11, color: "#94A3B8", marginTop: 2, marginBottom: 0 }}>
                      {f.date_emission ? `Émise le ${new Date(f.date_emission).toLocaleDateString("fr-FR")}` : ""}
                      {" · "}{f.lignes.reduce((s, l) => s + l.heures, 0)}h
                    </p>
                  </div>

                  {/* Amount */}
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <p style={{ fontWeight: 700, fontSize: 15, color: "#0F172A", margin: 0 }}>{fmt(f.montant_brut)} €</p>
                    <p style={{ fontSize: 11, color: "#94A3B8", marginTop: 1, marginBottom: 0 }}>payé par la famille</p>
                  </div>

                  {/* Status */}
                  <div style={{ flexShrink: 0 }}>
                    <StatutBadge statut={f.statut} />
                  </div>

                  {/* Download */}
                  <button onClick={() => setPreview(f)} style={S.btnGhost}>
                    <Download style={{ width: 13, height: 13 }} />Télécharger
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {preview && <FacturePreview facture={preview} onClose={() => setPreview(null)} profInfo={profInfo} />}
      </div>
    </LoadingGuard>
  );
}
