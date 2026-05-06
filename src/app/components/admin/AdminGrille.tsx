import React, { useEffect, useState, useCallback } from "react";
import { Plus, Trash2, Save, RotateCcw, AlertTriangle } from "lucide-react";
import { supabase } from "../../../lib/supabase";

interface GrilleRow {
  id: string;
  tarif_palier: number;
  taux_plusvalue: number;
  multiplicateur_brut: number;
}

// multiplicateur_brut = (1 + taux_plusvalue) / 0.8185
// net_prof = tarif_palier * (1 + taux_plusvalue)
// virement_brut = tarif_palier * multiplicateur_brut
// marge_colibri = tarif_palier * (2 - multiplicateur_brut)
const TAUX_CHARGES = 0.8185;

function multiFromTaux(taux: number): number {
  return Math.round(((1 + taux) / TAUX_CHARGES) * 10000) / 10000;
}
function tauxFromMulti(multi: number): number {
  return Math.round((multi * TAUX_CHARGES - 1) * 10000) / 10000;
}
function tauxFromNet(netProf: number, palier: number): number {
  if (palier === 0) return 0;
  return (netProf / palier) - 1;
}

interface EditableRow extends GrilleRow {
  dirty: boolean;
  isNew: boolean;
  _palier: string;
  _taux: string;   // en %
  _multi: string;
  _net: string;    // net prof en €, pour 1h au tarif palier
}

function rowToEditable(r: GrilleRow): EditableRow {
  const palier = r.tarif_palier;
  const net = palier * (1 + r.taux_plusvalue);
  return {
    ...r,
    dirty: false,
    isNew: false,
    _palier: String(palier),
    _taux: (r.taux_plusvalue * 100).toFixed(2),
    _multi: String(r.multiplicateur_brut),
    _net: net.toFixed(2),
  };
}

type Field = "_palier" | "_taux" | "_multi" | "_net";

export function AdminGrille() {
  const [rows, setRows] = useState<EditableRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("grille_commission")
      .select("id, tarif_palier, taux_plusvalue, multiplicateur_brut")
      .order("tarif_palier");
    if (error) { setError(error.message); setLoading(false); return; }
    setRows((data ?? []).map(rowToEditable));
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  function updateField(id: string, field: Field, value: string) {
    setRows((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        const u = { ...r, [field]: value, dirty: true };
        const palier = parseFloat(field === "_palier" ? value : u._palier);

        if (field === "_taux") {
          const taux = parseFloat(value) / 100;
          if (!isNaN(taux)) {
            u._multi = String(multiFromTaux(taux));
            if (!isNaN(palier)) u._net = (palier * (1 + taux)).toFixed(2);
          }
        } else if (field === "_multi") {
          const multi = parseFloat(value);
          if (!isNaN(multi)) {
            const taux = tauxFromMulti(multi);
            u._taux = (taux * 100).toFixed(2);
            if (!isNaN(palier)) u._net = (palier * (1 + taux)).toFixed(2);
          }
        } else if (field === "_net") {
          const net = parseFloat(value);
          if (!isNaN(net) && !isNaN(palier) && palier > 0) {
            const taux = tauxFromNet(net, palier);
            u._taux = (taux * 100).toFixed(2);
            u._multi = String(multiFromTaux(taux));
          }
        } else if (field === "_palier") {
          // recalcule _net à partir du taux existant
          const taux = parseFloat(u._taux) / 100;
          if (!isNaN(palier) && !isNaN(taux) && palier > 0) {
            u._net = (palier * (1 + taux)).toFixed(2);
          }
        }

        return u;
      })
    );
  }

  async function saveRow(id: string) {
    const row = rows.find((r) => r.id === id);
    if (!row) return;

    const tarif_palier = parseFloat(row._palier);
    const taux_plusvalue = parseFloat(row._taux) / 100;
    const multiplicateur_brut = parseFloat(row._multi);

    if (isNaN(tarif_palier) || isNaN(taux_plusvalue) || isNaN(multiplicateur_brut)) {
      setError("Valeurs invalides");
      return;
    }

    setSaving(id);
    setError(null);

    if (row.isNew) {
      const { data, error } = await supabase
        .from("grille_commission")
        .insert({ tarif_palier, taux_plusvalue, multiplicateur_brut })
        .select("id, tarif_palier, taux_plusvalue, multiplicateur_brut")
        .single();
      if (error) { setError(error.message); setSaving(null); return; }
      setRows((prev) => prev.map((r) => (r.id === id ? rowToEditable(data) : r)));
    } else {
      const { error } = await supabase
        .from("grille_commission")
        .update({ tarif_palier, taux_plusvalue, multiplicateur_brut })
        .eq("id", id);
      if (error) { setError(error.message); setSaving(null); return; }
      setRows((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, tarif_palier, taux_plusvalue, multiplicateur_brut, dirty: false } : r
        )
      );
    }
    setSaving(null);
  }

  async function deleteRow(id: string) {
    const row = rows.find((r) => r.id === id);
    if (!row) return;
    if (row.isNew) { setRows((prev) => prev.filter((r) => r.id !== id)); return; }
    setDeleting(id);
    const { error } = await supabase.from("grille_commission").delete().eq("id", id);
    if (error) { setError(error.message); setDeleting(null); return; }
    setRows((prev) => prev.filter((r) => r.id !== id));
    setDeleting(null);
  }

  function addRow() {
    const tempId = `new_${Date.now()}`;
    const defaultTaux = 0.25;
    const defaultPalier = 30;
    const multi = multiFromTaux(defaultTaux);
    const newRow: EditableRow = {
      id: tempId,
      tarif_palier: defaultPalier,
      taux_plusvalue: defaultTaux,
      multiplicateur_brut: multi,
      dirty: true,
      isNew: true,
      _palier: String(defaultPalier),
      _taux: (defaultTaux * 100).toFixed(2),
      _multi: String(multi),
      _net: (defaultPalier * (1 + defaultTaux)).toFixed(2),
    };
    setRows((prev) => [...prev, newRow]);
  }

  const sortedRows = [...rows].sort((a, b) => parseFloat(a._palier || "0") - parseFloat(b._palier || "0"));

  return (
    <div className="max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Grille de commission</h1>
          <p className="text-sm text-slate-500 mt-1">Taux de plus-value et multiplicateur brut par palier tarifaire</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => load()} className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-colors" title="Recharger">
            <RotateCcw className="w-4 h-4" />
          </button>
          <button onClick={addRow} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-primary transition-colors">
            <Plus className="w-4 h-4" />
            Nouveau palier
          </button>
        </div>
      </div>

      {/* Explication de la formule */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-xs text-blue-800 space-y-2.5">
        <p className="font-semibold text-sm">Formule utilisée</p>
        <div className="font-mono bg-blue-100 px-3 py-2 rounded-lg text-blue-900 text-xs leading-relaxed">
          <p>multiplicateur_brut = (1 + taux_plusvalue) / <span className="font-bold">0,8185</span></p>
        </div>
        <div className="space-y-1.5 text-blue-800 leading-relaxed">
          <p>
            <span className="font-semibold">D'où vient le 0,8185 ?</span> Les profs sont auto-entrepreneurs.
            Sur chaque euro versé par Colibri (le «&nbsp;brut&nbsp;»), ils reversent&nbsp;:
          </p>
          <ul className="ml-3 space-y-0.5 list-none">
            <li><span className="font-mono bg-blue-100 px-1 rounded">21,2 %</span> de cotisations URSSAF (prestation de services)</li>
            <li className="text-blue-700">soit <span className="font-mono bg-blue-100 px-1 rounded">1 − 0,212 = 0,788</span> restant après URSSAF</li>
            <li className="mt-1"><span className="font-mono bg-blue-100 px-1 rounded">−&nbsp;3,05&nbsp;%</span> de CSG/CRDS non déductible (sur le net social)</li>
            <li className="text-blue-700">ce qui donne <span className="font-mono bg-blue-100 px-1 rounded">0,788 × (1 − 0,030) ≈ 0,8185</span></li>
          </ul>
          <p className="pt-1 text-blue-700 border-t border-blue-200">
            Autrement dit : pour que le prof reçoive <strong>1 €</strong> net, Colibri doit virer <strong>1 / 0,8185 ≈ 1,2217 €</strong> brut. La marge Colibri est <strong>tarif_parent × (2 − multiplicateur_brut)</strong>.
          </p>
        </div>
        <div className="border-t border-blue-200 pt-2 text-blue-700">
          Toutes les colonnes sont interconnectées : modifier l'une recalcule automatiquement les autres.
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-2 text-sm text-red-800">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 text-sm">Chargement…</div>
      ) : (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(15,23,42,.06)" }}>
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-slate-800 text-sm">Paliers — simulation pour 1 heure</h2>
                <p className="text-xs text-slate-400 mt-0.5">Toutes les valeurs sont éditables et interconnectées</p>
              </div>
            </div>

            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Palier (€/h parent)</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Taux net</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-blue-500 uppercase tracking-wide">Net prof (après impôts)</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Multiplicateur brut</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Virement brut</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-amber-600 uppercase tracking-wide">Marge Colibri</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sortedRows.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-5 py-8 text-center text-slate-400">
                      Aucun palier. Cliquez sur « Nouveau palier » pour commencer.
                    </td>
                  </tr>
                )}
                {sortedRows.map((row) => {
                  const isSaving = saving === row.id;
                  const isDeleting = deleting === row.id;

                  const palier = parseFloat(row._palier);
                  const multi = parseFloat(row._multi);
                  const virementBrut = !isNaN(palier) && !isNaN(multi) ? palier * multi : null;
                  const margeColibri = !isNaN(palier) && !isNaN(multi) ? palier * (2 - multi) : null;
                  const margePercent = margeColibri != null && palier > 0 ? ((margeColibri / palier) * 100).toFixed(1) : null;

                  return (
                    <tr key={row.id} className={row.dirty ? "bg-amber-50/50" : "hover:bg-slate-50/60 transition-colors"}>

                      {/* Palier */}
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-1">
                          <input
                            type="number" min="0" step="1"
                            value={row._palier}
                            onChange={(e) => updateField(row.id, "_palier", e.target.value)}
                            className="w-20 px-2 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 font-semibold text-slate-900"
                            placeholder="30"
                          />
                          <span className="text-slate-400 text-xs">€/h</span>
                        </div>
                      </td>

                      {/* Taux net */}
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-1">
                          <input
                            type="number" min="0" max="200" step="0.01"
                            value={row._taux}
                            onChange={(e) => updateField(row.id, "_taux", e.target.value)}
                            className="w-20 px-2 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 text-blue-700"
                            placeholder="25"
                          />
                          <span className="text-slate-400 text-xs">%</span>
                        </div>
                      </td>

                      {/* Net prof — colonne mise en avant */}
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-1">
                          <input
                            type="number" min="0" step="0.01"
                            value={row._net}
                            onChange={(e) => updateField(row.id, "_net", e.target.value)}
                            className="w-24 px-2 py-1.5 text-sm border border-blue-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 font-semibold text-slate-900 bg-blue-50/50"
                            placeholder="37.50"
                          />
                          <span className="text-slate-400 text-xs">€</span>
                        </div>
                      </td>

                      {/* Multiplicateur brut */}
                      <td className="px-4 py-2.5">
                        <input
                          type="number" min="0" step="0.0001"
                          value={row._multi}
                          onChange={(e) => updateField(row.id, "_multi", e.target.value)}
                          className="w-24 px-2 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 font-mono text-slate-700"
                          placeholder="1.5272"
                        />
                      </td>

                      {/* Virement brut — calculé, non éditable */}
                      <td className="px-4 py-2.5">
                        <span className="text-emerald-700 font-semibold">
                          {virementBrut != null && palier > 0 ? `${virementBrut.toFixed(2)} €` : "—"}
                        </span>
                      </td>

                      {/* Marge Colibri */}
                      <td className="px-4 py-2.5">
                        {margeColibri != null && palier > 0 ? (
                          <span>
                            <span className="text-amber-700 font-semibold">{margeColibri.toFixed(2)} €</span>
                            {margePercent && <span className="text-slate-400 text-xs ml-1">({margePercent} %)</span>}
                          </span>
                        ) : "—"}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-1.5">
                          {row.dirty && (
                            <button
                              onClick={() => saveRow(row.id)}
                              disabled={isSaving || isDeleting}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                            >
                              {isSaving
                                ? <span className="animate-spin inline-block w-3 h-3 border border-white/50 border-t-white rounded-full" />
                                : <Save className="w-3 h-3" />}
                              {isSaving ? "…" : "Sauver"}
                            </button>
                          )}
                          <button
                            onClick={() => deleteRow(row.id)}
                            disabled={isSaving || isDeleting}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 disabled:opacity-50 transition-colors"
                          >
                            {isDeleting
                              ? <span className="animate-spin inline-block w-3.5 h-3.5 border border-slate-300 border-t-slate-600 rounded-full" />
                              : <Trash2 className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-800 space-y-1">
              <p className="font-semibold">Impact immédiat sur les nouveaux cours</p>
              <p>
                Les taux enregistrés s'appliquent aux <strong>nouveaux cours uniquement</strong>.
                Les cours existants conservent leur <code className="bg-amber-100 px-1 rounded">multiplicateur_brut</code> figé au moment de leur création.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
