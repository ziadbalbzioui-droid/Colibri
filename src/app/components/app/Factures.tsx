import { useState, useEffect, useCallback } from "react";
import { Info, Download, FileText, X } from "lucide-react";
import { LoadingGuard } from "../layout/LoadingGuard";
import { useAuth } from "../../../lib/auth";
import { useGrilleCommission, getMultiplicateurBrut } from "../../../lib/hooks/useGrilleCommission";
import { supabase } from "../../../lib/supabase";
import type { FactureRow, LigneRow } from "../../../lib/hooks/useFactures";

const MOIS_NOMS = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];

interface CoursResume {
  montant: number;
  taux_plusvalue: number | null;
  duree_heures: number;
}

interface RecapPaiement {
  id: string;
  mois: number;
  annee: number;
  statut: string;
  cours: CoursResume[];
}

const S = {
  card: { background: "#fff", border: "1px solid #E2E8F0", borderRadius: 16, boxShadow: "0 1px 3px rgba(15,23,42,.06)" } as React.CSSProperties,
  badge: (bg: string, color: string) => ({ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 8px", borderRadius: 999, fontSize: 11, fontWeight: 700, background: bg, color } as React.CSSProperties),
  btnPrimary: { display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: 12, background: "#2E6BEA", color: "#fff", fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer" } as React.CSSProperties,
  btnGhost: { display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: 12, background: "transparent", color: "#334155", fontSize: 13, fontWeight: 600, border: "1px solid #E2E8F0", cursor: "pointer" } as React.CSSProperties,
  serif: { fontFamily: "'Fraunces', Georgia, serif" } as React.CSSProperties,
};

function calcTotal(lignes: LigneRow[]) {
  return lignes.reduce((acc, l) => acc + l.heures * l.tarif_heure, 0);
}

function FacturePreview({ facture, onClose, profInfo }: { facture: FactureRow; onClose: () => void; profInfo: { nom: string; siret: string; adresse: string; email: string } }) {
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
        </div>
      </div>
    </div>
  );
}

function statutLabel(statut: string) {
  switch (statut) {
    case "en_attente_parent": return "En attente parent";
    case "en_attente_paiement": return "En attente paiement";
    case "valide": return "Validé";
    case "paye": return "Payé";
    default: return statut;
  }
}

function statutColors(statut: string): [string, string] {
  if (statut === "paye") return ["#ECFDF5", "#065F46"];
  if (statut === "valide") return ["#EFF6FF", "#1D4ED8"];
  if (statut === "en_attente_paiement") return ["#FFF7ED", "#9A3412"];
  return ["#FFFBEB", "#92400E"];
}

const fmt = (n: number) => n.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function Factures() {
  const { user, profile } = useAuth();
  const { grille } = useGrilleCommission();

  const [recaps, setRecaps] = useState<RecapPaiement[]>([]);
  const [factures, setFactures] = useState<FactureRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<FactureRow | null>(null);

  const load = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    setLoading(true);
    setError(null);
    try {
      const [recapRes, coursRes, facturesRes] = await Promise.all([
        supabase
          .from("recap_mensuel")
          .select("id, mois, annee, statut")
          .eq("prof_id", user.id)
          .neq("statut", "en_cours")
          .order("annee", { ascending: false })
          .order("mois", { ascending: false }),
        supabase
          .from("cours")
          .select("recap_id, montant, taux_plusvalue, duree_heures")
          .eq("prof_id", user.id)
          .not("recap_id", "is", null),
        supabase
          .from("factures")
          .select("*, lignes_facture(*)")
          .eq("prof_id", user.id),
      ]);

      if (recapRes.error) throw recapRes.error;
      if (coursRes.error) throw coursRes.error;
      if (facturesRes.error) throw facturesRes.error;

      const coursParRecap = new Map<string, CoursResume[]>();
      for (const c of coursRes.data ?? []) {
        if (!c.recap_id) continue;
        const list = coursParRecap.get(c.recap_id) ?? [];
        list.push({ montant: c.montant, taux_plusvalue: c.taux_plusvalue, duree_heures: c.duree_heures });
        coursParRecap.set(c.recap_id, list);
      }

      setRecaps((recapRes.data ?? []).map((r) => ({ ...r, cours: coursParRecap.get(r.id) ?? [] })));
      setFactures((facturesRes.data ?? []).map((f) => ({ ...f, lignes: f.lignes_facture as LigneRow[] })));
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

  function getMontantPromis(recap: RecapPaiement) {
    return recap.cours.reduce((sum, c) => sum + c.montant * (1 + (c.taux_plusvalue ?? 0)), 0);
  }

  function getMontantVerse(recap: RecapPaiement) {
    return recap.cours.reduce((sum, c) => {
      const tarifHeure = c.duree_heures > 0 ? c.montant / c.duree_heures : 0;
      return sum + c.montant * getMultiplicateurBrut(grille, tarifHeure);
    }, 0);
  }

  function getFacturePourRecap(recap: RecapPaiement): FactureRow | undefined {
    const moisStr = `${MOIS_NOMS[recap.mois - 1]} ${recap.annee}`;
    return factures.find((f) => f.mois === moisStr);
  }

  return (
    <LoadingGuard loading={loading} error={error} onRetry={load}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-.02em", color: "#0F172A", marginBottom: 4 }}>Factures & Paiements</h1>
          <p style={{ color: "#64748B", fontSize: 13 }}>Retrouvez vos montants mensuels et téléchargez vos factures.</p>
        </div>

        {/* Explanatory banner */}
        <div style={{ background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: 14, padding: "16px 20px", marginBottom: 28, display: "flex", gap: 14, alignItems: "flex-start" }}>
          <Info style={{ width: 18, height: 18, color: "#2563EB", flexShrink: 0, marginTop: 1 }} />
          <p style={{ fontSize: 13, color: "#1E40AF", lineHeight: 1.65, margin: 0 }}>
            <strong>Pourquoi Colibri vous vire plus que vos récaps ?</strong><br />
            Les gains promis et affichés avec leurs pourcentages correspondent aux gains que vous touchez <strong>après cotisations et impôts</strong>. C'est pour cette raison que Colibri vous vire plus que ce qui est affiché dans vos récaps du mois — ainsi, après avoir payé vos cotisations et vos impôts, il vous restera exactement le montant promis.
          </p>
        </div>

        {/* Recaps list */}
        {recaps.length === 0 ? (
          <div style={{ textAlign: "center", padding: "56px 0", color: "#94A3B8", fontSize: 14 }}>
            Aucun mois clôturé pour le moment.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {recaps.map((recap) => {
              const moisLabel = `${MOIS_NOMS[recap.mois - 1]} ${recap.annee}`;
              const montantPromis = getMontantPromis(recap);
              const montantVerse = getMontantVerse(recap);
              const facture = getFacturePourRecap(recap);
              const [badgeBg, badgeColor] = statutColors(recap.statut);

              return (
                <div key={recap.id} style={{ ...S.card, padding: 20 }}>
                  {/* Top row */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 44, height: 44, borderRadius: 12, background: "#F1F5F9", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <FileText style={{ width: 18, height: 18, color: "#64748B" }} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 15, color: "#0F172A", marginBottom: 4 }}>{moisLabel}</div>
                        <span style={S.badge(badgeBg, badgeColor)}>{statutLabel(recap.statut)}</span>
                      </div>
                    </div>
                    {facture ? (
                      <button onClick={() => setPreview(facture)} style={S.btnGhost}>
                        <Download style={{ width: 14, height: 14 }} />Télécharger la facture
                      </button>
                    ) : (
                      <button disabled style={{ ...S.btnGhost, opacity: 0.4, cursor: "not-allowed" }}>
                        <Download style={{ width: 14, height: 14 }} />Facture en attente
                      </button>
                    )}
                  </div>

                  {/* Amounts */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <div style={{ background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: 12, padding: "14px 16px" }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#166534", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 4 }}>Montant promis</div>
                      <div style={{ fontSize: 12, color: "#4ADE80", marginBottom: 8 }}>Net après impôts &amp; cotisations</div>
                      <div style={{ ...S.serif, fontSize: 26, color: "#15803D", fontWeight: 400 }}>{fmt(montantPromis)} €</div>
                    </div>
                    <div style={{ background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: 12, padding: "14px 16px" }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#1E40AF", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 4 }}>Montant versé par Colibri</div>
                      <div style={{ fontSize: 12, color: "#93C5FD", marginBottom: 8 }}>Virement brut reçu sur votre compte</div>
                      <div style={{ ...S.serif, fontSize: 26, color: "#2563EB", fontWeight: 400 }}>{fmt(montantVerse)} €</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {preview && <FacturePreview facture={preview} onClose={() => setPreview(null)} profInfo={profInfo} />}
      </div>
    </LoadingGuard>
  );
}
