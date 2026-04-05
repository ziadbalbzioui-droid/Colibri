import { useState } from "react";
import { Link } from "react-router";
import { BookOpen, Clock, CheckCircle, CalendarDays, Loader2, AlertCircle, X, FileText } from "lucide-react";
import { useParentData } from "../../../lib/hooks/useParentData";
import type { CoursRow } from "../../../lib/hooks/useCours";
import type { ValidationWithRecap } from "../../../lib/hooks/useParentData";

const matiereStyle: Record<string, string> = {
  "Mathématiques": "bg-blue-50 text-blue-700 border-blue-100",
  "Physique-Chimie": "bg-purple-50 text-purple-700 border-purple-100",
};

const statutStyle: Record<string, string> = {
  effectué: "bg-green-50 text-green-700",
  planifié: "bg-blue-50 text-blue-700",
  "en attente": "bg-amber-50 text-amber-700",
  payé: "bg-green-50 text-green-700",
};

type Filter = "tous" | "à venir" | "passés";

const MOIS = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];

function formatDate(d: string) {
  const dt = new Date(d);
  const jours = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
  return `${jours[dt.getDay()]} ${dt.getDate()} ${MOIS[dt.getMonth()]}`;
}

export function ParentCours() {
  const { cours, validations, validerRecap, loading } = useParentData();
  const [filter, setFilter] = useState<Filter>("tous");
  const [recapModal, setRecapModal] = useState<ValidationWithRecap | null>(null);
  const [validating, setValidating] = useState(false);
  const [validError, setValidError] = useState<string | null>(null);
  const [validated, setValidated] = useState(false);

  const pending = validations.filter((v) => v.statut === "en_attente_parent");

  function moisLabel(v: ValidationWithRecap) {
    return `${MOIS[v.recap_mensuel.mois - 1]} ${v.recap_mensuel.annee}`;
  }

  function coursDuRecap(v: ValidationWithRecap) {
    const prefix = `${v.recap_mensuel.annee}-${String(v.recap_mensuel.mois).padStart(2, "0")}`;
    return cours.filter((c) => c.eleve_id === v.eleve_id && c.date.startsWith(prefix));
  }

  async function handleValider() {
    if (!recapModal) return;
    setValidating(true);
    setValidError(null);
    try {
      await validerRecap(recapModal.id, recapModal.recap_id);
      setValidated(true);
    } catch (err) {
      setValidError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setValidating(false);
    }
  }

  function closeModal() {
    setRecapModal(null);
    setValidated(false);
    setValidError(null);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        <Loader2 className="w-6 h-6 animate-spin mr-2" /> Chargement...
      </div>
    );
  }

  const now = new Date();

  const filtered = cours.filter((c: CoursRow) => {
    const isPast = new Date(c.date) < now;
    if (filter === "à venir") return !isPast;
    if (filter === "passés") return isPast;
    return true;
  });

  const avenir = cours.filter((c: CoursRow) => new Date(c.date) >= now).length;
  const passes = cours.filter((c: CoursRow) => new Date(c.date) < now).length;
  const totalHeures = cours.reduce((s: number, c: CoursRow) => s + c.duree_heures, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Cours</h1>
        <p className="text-muted-foreground text-sm mt-1">Historique et prochaines séances</p>
      </div>

      {/* Mois en attente de validation */}
      {pending.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-3">
          <p className="text-sm font-semibold text-amber-800">
            {pending.length === 1 ? "1 mois en attente de votre validation" : `${pending.length} mois en attente de validation`}
          </p>
          {pending.map((r) => {
            const items = coursDuRecap(r);
            const totalH = items.reduce((s, c) => s + c.duree_heures, 0);
            const totalM = items.reduce((s, c) => s + c.montant, 0);
            return (
              <div key={r.id} className="flex items-center justify-between bg-white rounded-lg px-4 py-3 border border-amber-100">
                <div>
                  <p className="text-sm font-medium text-gray-900">{moisLabel(r)}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{items.length} cours · {totalH}h · {totalM.toLocaleString("fr-FR")} €</p>
                </div>
                <button
                  onClick={() => setRecapModal(r)}
                  className="text-xs bg-primary text-white px-3 py-1.5 rounded-lg hover:bg-primary/90 font-medium shrink-0"
                >
                  Voir & Valider
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "À venir", value: avenir, icon: CalendarDays, color: "text-blue-600 bg-blue-50" },
          { label: "Effectués", value: passes, icon: CheckCircle, color: "text-green-600 bg-green-50" },
          { label: "Heures totales", value: `${totalHeures.toFixed(1)}h`, icon: Clock, color: "text-purple-600 bg-purple-50" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-border p-4 text-center">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center mx-auto mb-2 ${s.color}`}>
              <s.icon className="w-4 h-4" />
            </div>
            <p className="text-xl font-bold text-gray-900">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex bg-white border border-border rounded-lg p-1 w-fit">
        {(["tous", "à venir", "passés"] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-md text-sm transition-colors ${
              filter === f ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Course list */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground text-sm bg-white rounded-xl border border-border">
            <AlertCircle className="w-6 h-6 mx-auto mb-2 text-muted-foreground/50" />
            Aucun cours à afficher
          </div>
        )}
        {filtered.map((c: CoursRow) => {
          const isPast = new Date(c.date) < now;
          const statut = isPast && c.statut === "planifié" ? "effectué" : c.statut;
          const matStyle = matiereStyle[c.matiere] ?? "bg-gray-50 text-gray-600 border-gray-100";
          const stStyle = statutStyle[statut] ?? "bg-gray-50 text-gray-600";
          return (
            <div key={c.id} className="bg-white rounded-xl border border-border px-5 py-4 flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isPast ? "bg-green-50" : "bg-blue-50"}`}>
                <BookOpen className={`w-4 h-4 ${isPast ? "text-green-600" : "text-blue-600"}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-medium text-gray-900">{c.matiere}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${matStyle}`}>
                    {c.matiere}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {formatDate(c.date)} · {c.duree}
                </p>
              </div>
              <span className={`text-xs px-2.5 py-1 rounded-full shrink-0 ${stStyle}`}>
                {statut}
              </span>
            </div>
          );
        })}
      </div>

      {/* Modale de validation */}
      {recapModal && (() => {
        const items = coursDuRecap(recapModal);
        const totalH = items.reduce((s, c) => s + c.duree_heures, 0);
        const totalM = items.reduce((s, c) => s + c.montant, 0);
        return (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6 max-h-[90vh] flex flex-col">
              {validated ? (
                /* ── État succès ── */
                <div className="text-center py-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 text-lg mb-1">Mois validé !</h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    {moisLabel(recapModal)} a bien été validé. Le professeur en sera notifié.
                  </p>
                  <div className="flex flex-col gap-3">
                    <Link
                      to="/parent/factures"
                      className="flex items-center justify-center gap-2 bg-primary text-white px-4 py-2.5 rounded-lg hover:bg-primary/90 text-sm font-medium transition-colors"
                    >
                      <FileText className="w-4 h-4" />
                      Voir mes factures
                    </Link>
                    <button
                      onClick={closeModal}
                      className="px-4 py-2.5 rounded-lg border border-border hover:bg-muted text-sm"
                    >
                      Fermer
                    </button>
                  </div>
                </div>
              ) : (
                /* ── État normal : détails + bouton valider ── */
                <>
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h3 className="font-semibold text-gray-900">Valider {moisLabel(recapModal)}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">{items.length} cours · {totalH}h · {totalM.toLocaleString("fr-FR")} €</p>
                    </div>
                    <button onClick={closeModal} className="p-1.5 rounded-lg hover:bg-muted">
                      <X className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </div>

                  <div className="overflow-y-auto flex-1 space-y-1.5 mb-5">
                    {items.map((c) => (
                      <div key={c.id} className="flex items-center justify-between px-3 py-2.5 bg-muted rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{c.matiere}</p>
                          <p className="text-xs text-muted-foreground">{formatDate(c.date)} · {c.duree}</p>
                        </div>
                        <span className="text-sm font-medium">{c.montant} €</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-border mb-4">
                    <span className="text-sm font-semibold">Total</span>
                    <span className="text-sm font-semibold">{totalM.toLocaleString("fr-FR")} €</span>
                  </div>

                  {validError && (
                    <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2 mb-3">{validError}</p>
                  )}

                  <div className="flex gap-3">
                    <button onClick={closeModal} className="flex-1 px-4 py-2.5 rounded-lg border border-border hover:bg-muted text-sm">
                      Annuler
                    </button>
                    <button
                      onClick={handleValider}
                      disabled={validating}
                      className="flex-1 bg-primary text-white px-4 py-2.5 rounded-lg hover:bg-primary/90 disabled:opacity-40 flex items-center justify-center gap-2 text-sm font-medium transition-colors"
                    >
                      {validating && <Loader2 className="w-4 h-4 animate-spin" />}
                      Confirmer la validation
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
