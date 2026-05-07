import React, { useEffect, useState, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Download } from "lucide-react";
import { supabase } from "../../../lib/supabase";
import { getMultiplicateurBrut, GrilleRow } from "../../../lib/hooks/useGrilleCommission";

const MOIS_LABELS = ["Jan","Fév","Mar","Avr","Mai","Jun","Jul","Aoû","Sep","Oct","Nov","Déc"];

interface MoisData {
  mois: string;
  ca: number;
  virement: number;
  marge: number;
  nb_cours: number;
}

function StatCard({ label, value, sub, color }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5" style={{ boxShadow: "0 1px 3px rgba(15,23,42,.06)" }}>
      <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${color ?? "text-slate-900"}`}>{value}</p>
      {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
    </div>
  );
}

function fmt(n: number) {
  return n.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";
}

function exportCSV(data: MoisData[]) {
  const header = "Mois;CA (parent);Virement prof;Marge Colibri;Nb cours\n";
  const rows = data.map((d) =>
    `${d.mois};${d.ca.toFixed(2)};${d.virement.toFixed(2)};${d.marge.toFixed(2)};${d.nb_cours}`
  ).join("\n");
  const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `comptabilite_colibri_${new Date().toISOString().slice(0, 7)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function AdminCompta() {
  const [recaps, setRecaps] = useState<any[]>([]);
  const [grille, setGrille] = useState<GrilleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [annee, setAnnee] = useState(new Date().getFullYear());
  const [tab, setTab] = useState<"dashboard" | "factures" | "journal">("dashboard");

  const [factures, setFactures] = useState<any[]>([]);
  const [facturesLoading, setFacturesLoading] = useState(false);

  // Source unique : récaps avec statut 'paye' + leurs cours
  useEffect(() => {
    async function load() {
      setLoading(true);
      const [{ data: recapsData }, { data: grilleData }] = await Promise.all([
        supabase
          .from("recap_mensuel")
          .select(`id, mois, annee, prof_id, profiles!prof_id(prenom, nom, iban), cours(montant, duree_heures, eleves(tarif_heure))`)
          .eq("statut", "paye")
          .order("annee", { ascending: false })
          .order("mois", { ascending: false }),
        supabase
          .from("grille_commission")
          .select("tarif_palier, taux_plusvalue, multiplicateur_brut")
          .order("tarif_palier"),
      ]);
      setRecaps(recapsData ?? []);
      setGrille(grilleData ?? []);
      setLoading(false);
    }
    load();
  }, []);

  useEffect(() => {
    if (tab !== "factures") return;
    setFacturesLoading(true);
    supabase
      .from("factures")
      .select("*, lignes_facture(*), profiles!prof_id(prenom, nom)")
      .order("date_emission", { ascending: false })
      .then(({ data }) => { setFactures(data ?? []); setFacturesLoading(false); });
  }, [tab]);

  // Calcul marge par récap (réutilisé par dashboard et journal)
  const recapsAvecMarge = useMemo(() => {
    return recaps.map((r) => {
      let ca = 0, virement = 0, nb_cours = 0;
      for (const c of (r.cours ?? [])) {
        const tarif = c.eleves?.tarif_heure ?? 0;
        const multi = getMultiplicateurBrut(grille, tarif);
        const heures = c.duree_heures ?? 0;
        ca += c.montant ?? 0;
        virement += tarif * multi * heures;
        nb_cours += 1;
      }
      const marge = 2 * ca - virement;
      return { ...r, ca, virement, marge, nb_cours };
    });
  }, [recaps, grille]);

  // Agrégation par mois pour le tableau de bord
  const moisData = useMemo<MoisData[]>(() => {
    const map = new Map<string, MoisData>();
    for (let m = 1; m <= 12; m++) {
      const key = `${annee}-${String(m).padStart(2, "0")}`;
      map.set(key, { mois: MOIS_LABELS[m - 1], ca: 0, virement: 0, marge: 0, nb_cours: 0 });
    }
    for (const r of recapsAvecMarge) {
      if (Number(r.annee) !== annee) continue;
      const key = `${annee}-${String(r.mois).padStart(2, "0")}`;
      const row = map.get(key);
      if (!row) continue;
      row.ca += r.ca;
      row.virement += r.virement;
      row.marge += r.marge;
      row.nb_cours += r.nb_cours;
    }
    return Array.from(map.values());
  }, [recapsAvecMarge, annee]);

  const totaux = useMemo(() => ({
    ca: moisData.reduce((s, m) => s + m.ca, 0),
    virement: moisData.reduce((s, m) => s + m.virement, 0),
    marge: moisData.reduce((s, m) => s + m.marge, 0),
    nb_cours: moisData.reduce((s, m) => s + m.nb_cours, 0),
  }), [moisData]);

  const TABS = [
    { key: "dashboard", label: "Tableau de bord" },
    { key: "factures",  label: "Factures" },
    { key: "journal",   label: "Journal des paiements" },
  ] as const;

  return (
    <div className="max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Comptabilité</h1>
          <p className="text-sm text-slate-500 mt-1">Basé sur les récaps payés · Marge = 2 × montant cours − virement prof</p>
        </div>
        <div className="flex items-center gap-2">
          {tab === "dashboard" && (
            <>
              <select
                value={annee}
                onChange={(e) => setAnnee(Number(e.target.value))}
                className="px-3 py-1.5 text-sm bg-white border border-slate-200 rounded-xl outline-none focus:border-primary"
              >
                {[2024, 2025, 2026].map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
              <button
                onClick={() => exportCSV(moisData)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-slate-900 text-white rounded-xl hover:bg-primary transition-colors"
              >
                <Download className="w-3.5 h-3.5" /> Export CSV
              </button>
            </>
          )}
        </div>
      </div>

      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${
              tab === t.key ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Dashboard ── */}
      {tab === "dashboard" && (
        <>
          {loading ? (
            <div className="p-10 text-center text-slate-400 text-sm">Chargement…</div>
          ) : (
            <>
              <div className="grid grid-cols-4 gap-4">
                <StatCard label="Montant cours total" value={fmt(totaux.ca)} sub={`${totaux.nb_cours} cours`} />
                <StatCard label="Virements profs" value={fmt(totaux.virement)} color="text-blue-600" />
                <StatCard label="Marge brute Colibri" value={fmt(totaux.marge)} color="text-emerald-600" sub={totaux.ca > 0 ? `${((totaux.marge / totaux.ca) * 100).toFixed(1)} % des montants cours` : undefined} />
                <StatCard label="Taux de marge" value={totaux.ca > 0 ? `${((totaux.marge / totaux.ca) * 100).toFixed(1)} %` : "—"} color="text-violet-600" />
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-5" style={{ boxShadow: "0 1px 3px rgba(15,23,42,.06)" }}>
                <h2 className="text-sm font-semibold text-slate-800 mb-4">Évolution mensuelle {annee}</h2>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={moisData} barGap={4}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="mois" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v} €`} />
                    <Tooltip
                      formatter={(value: number, name: string) => [fmt(value), name]}
                      contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }}
                    />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Bar dataKey="ca" name="Montant cours" fill="#6366f1" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="virement" name="Virement prof" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="marge" name="Marge Colibri" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(15,23,42,.06)" }}>
                <div className="px-5 py-4 border-b border-slate-100">
                  <h2 className="text-sm font-semibold text-slate-800">Détail mensuel</h2>
                </div>
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                      {["Mois","Cours","Montant cours","Virement prof","Marge Colibri","Taux (marge / montant cours)"].map((h) => (
                        <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {moisData.map((m) => (
                      <tr key={m.mois} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-5 py-3 font-medium text-slate-900">{m.mois}</td>
                        <td className="px-5 py-3 text-slate-500">{m.nb_cours}</td>
                        <td className="px-5 py-3 text-slate-700">{fmt(m.ca)}</td>
                        <td className="px-5 py-3 text-blue-700">{fmt(m.virement)}</td>
                        <td className="px-5 py-3 font-semibold text-emerald-700">{fmt(m.marge)}</td>
                        <td className="px-5 py-3 text-slate-500">
                          {m.ca > 0 ? `${((m.marge / m.ca) * 100).toFixed(1)} %` : "—"}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-slate-50 font-semibold border-t-2 border-slate-200">
                      <td className="px-5 py-3 text-slate-800">Total</td>
                      <td className="px-5 py-3 text-slate-700">{totaux.nb_cours}</td>
                      <td className="px-5 py-3 text-slate-800">{fmt(totaux.ca)}</td>
                      <td className="px-5 py-3 text-blue-800">{fmt(totaux.virement)}</td>
                      <td className="px-5 py-3 text-emerald-800">{fmt(totaux.marge)}</td>
                      <td className="px-5 py-3 text-slate-700">{totaux.ca > 0 ? `${((totaux.marge / totaux.ca) * 100).toFixed(1)} %` : "—"}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </>
          )}
        </>
      )}

      {/* ── Factures ── */}
      {tab === "factures" && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(15,23,42,.06)" }}>
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="text-sm font-semibold text-slate-800">Toutes les factures</h2>
          </div>
          {facturesLoading ? (
            <div className="p-10 text-center text-slate-400 text-sm">Chargement…</div>
          ) : factures.length === 0 ? (
            <div className="p-10 text-center text-slate-400 text-sm">Aucune facture.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  {["Prof","Mois","Date émission","Montant brut","Montant net","Statut"].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {factures.map((f) => (
                  <tr key={f.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-3 font-medium text-slate-900">{f.profiles?.prenom} {f.profiles?.nom}</td>
                    <td className="px-5 py-3 text-slate-600">{f.mois}</td>
                    <td className="px-5 py-3 text-slate-500">{new Date(f.date_emission).toLocaleDateString("fr-FR")}</td>
                    <td className="px-5 py-3 text-slate-700">{fmt(f.montant_brut)}</td>
                    <td className="px-5 py-3 text-blue-700">{fmt(f.montant_net)}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        f.statut === "payée" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                      }`}>
                        {f.statut}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ── Journal des paiements ── */}
      {tab === "journal" && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(15,23,42,.06)" }}>
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="text-sm font-semibold text-slate-800">Récapitulatifs payés</h2>
          </div>
          {loading ? (
            <div className="p-10 text-center text-slate-400 text-sm">Chargement…</div>
          ) : recapsAvecMarge.length === 0 ? (
            <div className="p-10 text-center text-slate-400 text-sm">Aucun récap payé.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  {["Prof","Période","IBAN","Cours","Montant cours","Virement prof","Marge Colibri"].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {recapsAvecMarge.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-3 font-medium text-slate-900">{r.profiles?.prenom} {r.profiles?.nom}</td>
                    <td className="px-5 py-3 text-slate-600">{MOIS_LABELS[Number(r.mois) - 1]} {r.annee}</td>
                    <td className="px-5 py-3">
                      {r.profiles?.iban
                        ? <span className="font-mono text-xs text-slate-500">{r.profiles.iban}</span>
                        : <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-semibold">Manquant</span>}
                    </td>
                    <td className="px-5 py-3 text-slate-500">{r.nb_cours}</td>
                    <td className="px-5 py-3 text-slate-700">{fmt(r.ca)}</td>
                    <td className="px-5 py-3 text-blue-700">{fmt(r.virement)}</td>
                    <td className="px-5 py-3 font-semibold text-emerald-700">{fmt(r.marge)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
