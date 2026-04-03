import { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { ChevronLeft, Loader2 } from "lucide-react";
import { useCours } from "../../lib/hooks/useCours";
import { useRecapMensuel } from "../../lib/hooks/useRecapMensuel";

const MOIS = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

function formatDate(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return `${d} ${MOIS[m - 1]} ${y}`;
}

export function RecapMensuel() {
  const { eleveId, mois, annee } = useParams<{ eleveId: string; mois: string; annee: string }>();
  const navigate = useNavigate();
  const { cours } = useCours();
  const { validerMois } = useRecapMensuel();
  const [saving, setSaving] = useState(false);

  const moisNum = Number(mois);
  const anneeNum = Number(annee);

  const coursDuMois = useMemo(
    () =>
      cours.filter(
        (c) =>
          c.eleve_id === eleveId &&
          c.date.startsWith(`${annee}-${String(moisNum).padStart(2, "0")}`),
      ),
    [cours, eleveId, mois, annee],
  );

  const totalHeures = coursDuMois.reduce((s, c) => s + c.duree_heures, 0);
  const totalMontant = coursDuMois.reduce((s, c) => s + c.montant, 0);
  const eleveNom = coursDuMois[0]?.eleve_nom ?? "";

  async function handleValider() {
    if (!eleveId) return;
    setSaving(true);
    try {
      await validerMois(
        eleveId,
        moisNum,
        anneeNum,
        coursDuMois.map((c) => c.id),
      );
      navigate("/app/cours");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={() => navigate("/app/cours")}
          className="p-1.5 rounded-lg hover:bg-muted transition-colors"
        >
          <ChevronLeft className="w-4 h-4 text-muted-foreground" />
        </button>
        <div>
          <h1>Récapitulatif mensuel</h1>
          <p className="text-muted-foreground mt-1">
            {eleveNom} — {MOIS[moisNum - 1]} {annee}
          </p>
        </div>
      </div>

      {/* Liste des cours */}
      <div className="bg-white rounded-xl border border-border overflow-hidden mb-5">
        <div className="p-5 border-b border-border">
          <h3>Cours du mois</h3>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left px-6 py-3 text-muted-foreground" style={{ fontSize: 13, fontWeight: 500 }}>Date</th>
              <th className="text-left px-6 py-3 text-muted-foreground" style={{ fontSize: 13, fontWeight: 500 }}>Matière</th>
              <th className="text-left px-6 py-3 text-muted-foreground" style={{ fontSize: 13, fontWeight: 500 }}>Durée</th>
              <th className="text-right px-6 py-3 text-muted-foreground" style={{ fontSize: 13, fontWeight: 500 }}>Montant</th>
            </tr>
          </thead>
          <tbody>
            {coursDuMois.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                  Aucun cours ce mois-ci
                </td>
              </tr>
            ) : coursDuMois.map((c) => (
              <tr key={c.id} className="border-b border-border last:border-0">
                <td className="px-6 py-4 text-muted-foreground">{formatDate(c.date)}</td>
                <td className="px-6 py-4 text-muted-foreground">{c.matiere}</td>
                <td className="px-6 py-4 text-muted-foreground">{c.duree}</td>
                <td className="px-6 py-4 text-right" style={{ fontWeight: 500 }}>{c.montant} €</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totaux */}
      <div className="bg-white rounded-xl border border-border p-5 mb-5">
        <div className="flex items-center justify-between py-2 border-b border-border">
          <span className="text-muted-foreground" style={{ fontSize: 14 }}>Total heures</span>
          <span style={{ fontWeight: 600 }}>{totalHeures}h</span>
        </div>
        <div className="flex items-center justify-between py-2">
          <span className="text-muted-foreground" style={{ fontSize: 14 }}>Montant total</span>
          <span style={{ fontWeight: 600 }}>{totalMontant.toLocaleString("fr-FR")} €</span>
        </div>
      </div>

      {/* Action */}
      <button
        onClick={handleValider}
        disabled={saving || coursDuMois.length === 0}
        className="w-full bg-primary text-primary-foreground px-4 py-3 rounded-lg hover:opacity-90 disabled:opacity-40 flex items-center justify-center gap-2 transition-opacity"
        style={{ fontWeight: 500 }}
      >
        {saving && <Loader2 className="w-4 h-4 animate-spin" />}
        Valider le mois
      </button>
    </div>
  );
}
