import { Link, useNavigate } from "react-router";
import { Calendar, Clock, CreditCard, ChevronRight, CheckCircle, AlertCircle, BookOpen, Loader2, Zap, Clock3 } from "lucide-react";
import { useParentData } from "../../../lib/hooks/useParentData";

const MOIS = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];

function formatDate(d: string) {
  const dt = new Date(d);
  return `${dt.getDate()} ${MOIS[dt.getMonth()]}`;
}

export function ParentDashboard() {
  const { children, cours, factures, loading, profile } = useParentData();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        <Loader2 className="w-6 h-6 animate-spin mr-2" /> Chargement...
      </div>
    );
  }

  const isActivationPending = profile?.urssaf_status === "activation_pending";
  const needsActivation = !profile?.onboarding_complete && !isActivationPending;

  const prenom = profile?.prenom ?? "parent";
  const today = new Date();

  const prochaines = cours.filter((c) => new Date(c.date) >= today).slice(0, 3);

  const heuresCeMois = cours
    .filter((c) => {
      const d = new Date(c.date);
      return d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
    })
    .reduce((s, c) => s + c.duree_heures, 0);

  const enAttente = factures
    .filter((f) => f.statut === "en attente")
    .reduce((s, f) => s + f.montant_brut, 0);

  const dernieresFactures = factures.slice(0, 2);

  return (
    <div className="space-y-6">
      {/* ── Banner: URSSAF activation pending ─────────────── */}
      {isActivationPending && (
        <button
          type="button"
          onClick={() => navigate("/onboarding")}
          className="w-full flex items-center gap-3 bg-amber-50 border-2 border-amber-300 rounded-xl px-5 py-4 text-left hover:bg-amber-100 transition-colors group"
        >
          <div className="w-10 h-10 bg-amber-200 rounded-xl flex items-center justify-center shrink-0">
            <Clock3 className="w-5 h-5 text-amber-700" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-amber-800 text-sm">
              Compte Urssaf en attente d'activation
            </p>
            <p className="text-xs text-amber-600 mt-0.5">
              Cliquez ici pour terminer l'activation et débloquer toutes les fonctionnalités
            </p>
          </div>
          <ChevronRight className="w-5 h-5 text-amber-600 shrink-0 group-hover:translate-x-0.5 transition-transform" />
        </button>
      )}

      {/* ── CTA: Activate service ─────────────────────────── */}
      {needsActivation && (
        <div className="bg-gradient-to-r from-primary to-[#1565C0] rounded-2xl p-6 text-white">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-lg">Activez votre service d'avance immédiate</h2>
              <p className="text-blue-100 text-sm mt-0.5">
                Bénéficiez de l'avance immédiate déduite directement de vos factures
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate("/onboarding", { state: { skipToStep: 2 } })}
            className="w-full bg-white text-primary font-semibold py-3 rounded-xl hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
          >
            Activer le service <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className={isActivationPending ? "opacity-40 pointer-events-none select-none" : ""}>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bonjour, {prenom}</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {children.length > 0
              ? `Tableau de bord de suivi`
              : "Tableau de bord parent"}
          </p>
        </div>

        {children.length === 0 ? (
          <div className="max-w-lg mx-auto text-center py-20">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-amber-500" />
            </div>
            <h2 className="font-semibold text-gray-900 mb-2">Aucun élève associé</h2>
            <p className="text-muted-foreground text-sm">
              Votre compte parent n'est pas encore lié à un élève. Contactez votre professeur
              pour qu'il fasse le lien.
            </p>
          </div>
        ) : (
          <>
            {/* Children cards */}
            <div className={`grid gap-4 mt-4 ${children.length > 1 ? "grid-cols-1 md:grid-cols-2" : ""}`}>
              {children.map((child) => (
                <div key={child.id} className="bg-gradient-to-r from-primary to-[#1565C0] rounded-2xl p-6 text-white">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-2xl font-bold shrink-0">
                        {child.nom.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold">{child.nom}</h2>
                        <p className="text-blue-100 text-sm">{child.niveau}</p>
                        <p className="text-blue-100 text-xs mt-0.5">Prof : {child.prof_nom}</p>
                      </div>
                    </div>
                    <div className="text-right hidden sm:block">
                      <p className="text-blue-100 text-xs mb-1">Matière</p>
                      <span className="inline-block bg-white/20 text-xs px-2.5 py-0.5 rounded-full">
                        {child.matiere}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
              {[
                {
                  label: "Prochaine séance",
                  value: prochaines[0] ? formatDate(prochaines[0].date) : "—",
                  sub: prochaines[0] ? prochaines[0].matiere : "Aucune planifiée",
                  icon: Calendar,
                  color: "bg-blue-50 text-blue-600",
                },
                {
                  label: "Heures ce mois",
                  value: `${heuresCeMois.toFixed(1)}h`,
                  sub: `${cours.filter((c) => {
                    const d = new Date(c.date);
                    return (
                      d.getMonth() === today.getMonth() &&
                      d.getFullYear() === today.getFullYear()
                    );
                  }).length} séances`,
                  icon: Clock,
                  color: "bg-green-50 text-green-600",
                },
                {
                  label: "Montant en attente",
                  value: enAttente > 0 ? `${enAttente} €` : "À jour",
                  sub:
                    enAttente > 0
                      ? `Avec avance immédiate : ${Math.round(enAttente * 0.5)} €`
                      : "Tout est payé ✓",
                  icon: CreditCard,
                  color:
                    enAttente > 0
                      ? "bg-amber-50 text-amber-600"
                      : "bg-green-50 text-green-600",
                },
              ].map((stat) => (
                <div key={stat.label} className="bg-white rounded-xl border border-border p-5">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${stat.color}`}
                  >
                    <stat.icon className="w-4 h-4" />
                  </div>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className="text-lg font-semibold text-gray-900 mt-0.5">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.sub}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
              {/* Upcoming sessions */}
              <div className="bg-white rounded-xl border border-border overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                  <h3 className="font-semibold text-gray-900">Prochaines séances</h3>
                  <Link
                    to="/parent/cours"
                    className="text-xs text-primary hover:underline flex items-center gap-0.5"
                  >
                    Voir tout <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
                <div className="divide-y divide-border">
                  {prochaines.length === 0 ? (
                    <p className="px-5 py-6 text-sm text-muted-foreground text-center">
                      Aucune séance planifiée
                    </p>
                  ) : (
                    prochaines.map((c) => (
                      <div key={c.id} className="px-5 py-3.5 flex items-center gap-4">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                          <BookOpen className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">{c.matiere}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(c.date)} · {c.duree}
                          </p>
                        </div>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 shrink-0">
                          {c.statut}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Recent invoices */}
              <div className="bg-white rounded-xl border border-border overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                  <h3 className="font-semibold text-gray-900">Dernières factures</h3>
                  <Link
                    to="/parent/factures"
                    className="text-xs text-primary hover:underline flex items-center gap-0.5"
                  >
                    Voir tout <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
                <div className="divide-y divide-border">
                  {dernieresFactures.length === 0 ? (
                    <p className="px-5 py-6 text-sm text-muted-foreground text-center">
                      Aucune facture
                    </p>
                  ) : (
                    dernieresFactures.map((f) => (
                      <div key={f.id} className="px-5 py-3.5 flex items-center gap-4">
                        <div
                          className={`shrink-0 ${
                            f.statut === "payée" ? "text-green-500" : "text-amber-500"
                          }`}
                        >
                          {f.statut === "payée" ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : (
                            <AlertCircle className="w-4 h-4" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">{f.mois}</p>
                          <p className="text-xs text-muted-foreground">
                            {f.montant_brut}€ brut
                          </p>
                        </div>
                        {f.statut === "en attente" ? (
                          <Link
                            to="/parent/factures"
                            className="text-xs bg-primary text-white px-3 py-1.5 rounded-lg hover:bg-primary/90 font-medium shrink-0"
                          >
                            Payer
                          </Link>
                        ) : (
                          <span className="text-xs bg-green-50 text-green-700 px-2.5 py-1.5 rounded-lg shrink-0">
                            Payée
                          </span>
                        )}
                      </div>
                    ))
                  )}
                </div>
                <div className="px-5 py-3 bg-blue-50/60 border-t border-blue-100">
                  <p className="text-xs text-blue-700">
                    Avance immédiate Urssaf — le montant est déduit directement de vos factures.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
