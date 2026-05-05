import { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { ChevronLeft, Loader2 } from "lucide-react";
import { useCours } from "../../../lib/hooks/useCours";
import { useRecapMensuel } from "../../../lib/hooks/useRecapMensuel";
import { useAuth } from "../../../lib/auth";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";

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
  const { profile } = useAuth();
  const { cours } = useCours();
  const { validerMois } = useRecapMensuel();
  const hasIban = !!profile?.iban;
  const [saving, setSaving] = useState(false);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const [monthValidationError, setMonthValidationError] = useState<string | null>(null);

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

  async function handleValiderClick() {
    // Vérifier que le mois est passé
    const lastDayOfMonth = new Date(anneeNum, moisNum, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    lastDayOfMonth.setHours(0, 0, 0, 0);

    if (lastDayOfMonth > today) {
      const nextMonth = moisNum === 12 ? 1 : moisNum + 1;
      const nextYear = moisNum === 12 ? anneeNum + 1 : anneeNum;
      const monthName = MOIS[nextMonth - 1];
      setMonthValidationError(
        `Vous pouvez clôturer ce mois à partir du 1er ${monthName} ${nextYear}`
      );
      return;
    }

    setMonthValidationError(null);
    setShowCloseConfirm(true);
  }

  async function confirmValider() {
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
      setShowCloseConfirm(false);
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
          <span style={{ fontWeight: 600 }}>{totalMontant.toLocaleString("fr-FR", { maximumFractionDigits: 2 })} €</span>
        </div>
      </div>

      {/* Action */}
      <button
        onClick={handleValiderClick}
        disabled={saving || coursDuMois.length === 0 || !hasIban}
        title={!hasIban ? "Renseignez votre IBAN pour pouvoir clore un mois" : undefined}
        className="w-full bg-primary text-primary-foreground px-4 py-3 rounded-lg hover:opacity-90 disabled:opacity-40 flex items-center justify-center gap-2 transition-opacity"
        style={{ fontWeight: 500 }}
      >
        {saving && <Loader2 className="w-4 h-4 animate-spin" />}
        Valider le mois
      </button>

      {monthValidationError && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {monthValidationError}
        </div>
      )}

      {/* Alert Dialog */}
      <AlertDialog open={showCloseConfirm} onOpenChange={setShowCloseConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clore le mois de {MOIS[moisNum - 1]} {annee}</AlertDialogTitle>
            <AlertDialogDescription>
              Ceci est une action irréversible. Une fois le mois clôturé, vous ne pourrez plus ajouter ou modifier les cours de ce mois. Les parents recevront une demande de validation des heures.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3">
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmValider} className="bg-red-600 hover:bg-red-700">
              Clôturer définitivement
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
