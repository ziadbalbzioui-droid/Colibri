import { Link } from "react-router";
import {
  Calendar, Clock, CreditCard, ChevronRight,
  CheckCircle, AlertCircle, BookOpen,
} from "lucide-react";

const enfant = {
  prenom: "Thomas",
  nom: "Dupont",
  niveau: "Terminale",
  matieres: ["Mathématiques", "Physique-Chimie"],
  prof: "Ziad Balbzioui",
};

const prochaines = [
  { id: 1, matiere: "Mathématiques", date: "Lundi 31 mars", heure: "17h00 – 18h30", statut: "confirmé" },
  { id: 2, matiere: "Physique-Chimie", date: "Mercredi 2 avril", heure: "16h00 – 17h30", statut: "confirmé" },
  { id: 3, matiere: "Mathématiques", date: "Lundi 7 avril", heure: "17h00 – 18h30", statut: "à confirmer" },
];

const dernieres_factures = [
  { id: "F-2026-03", mois: "Mars 2026", montant: 210, net: 105, statut: "en attente" },
  { id: "F-2026-02", mois: "Février 2026", montant: 180, net: 90, statut: "payée" },
];

export function ParentDashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Bonjour, Marie</h1>
        <p className="text-muted-foreground text-sm mt-1">Tableau de bord de suivi pour Thomas</p>
      </div>

      {/* Child card */}
      <div className="bg-gradient-to-r from-primary to-[#1565C0] rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-2xl font-bold flex-shrink-0">
              T
            </div>
            <div>
              <h2 className="text-lg font-semibold">{enfant.prenom} {enfant.nom}</h2>
              <p className="text-blue-100 text-sm">{enfant.niveau}</p>
              <p className="text-blue-100 text-xs mt-0.5">Prof : {enfant.prof}</p>
            </div>
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-blue-100 text-xs mb-1">Matières</p>
            <div className="flex flex-col gap-1 items-end">
              {enfant.matieres.map((m) => (
                <span key={m} className="inline-block bg-white/20 text-xs px-2.5 py-0.5 rounded-full">
                  {m}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            label: "Prochaine séance",
            value: "Lundi 31 mars",
            sub: "17h00 · Mathématiques",
            icon: Calendar,
            color: "bg-blue-50 text-blue-600",
          },
          {
            label: "Heures ce mois",
            value: "6h",
            sub: "4 séances effectuées",
            icon: Clock,
            color: "bg-green-50 text-green-600",
          },
          {
            label: "Montant en attente",
            value: "210 €",
            sub: "Après crédit d'impôt : 105 €",
            icon: CreditCard,
            color: "bg-amber-50 text-amber-600",
          },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-border p-5">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${stat.color}`}>
              <stat.icon className="w-4.5 h-4.5" />
            </div>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
            <p className="text-lg font-semibold text-gray-900 mt-0.5">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
            {prochaines.map((s) => (
              <div key={s.id} className="px-5 py-3.5 flex items-center gap-4">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  s.statut === "confirmé" ? "bg-green-50" : "bg-amber-50"
                }`}>
                  <BookOpen className={`w-4 h-4 ${
                    s.statut === "confirmé" ? "text-green-600" : "text-amber-500"
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{s.matiere}</p>
                  <p className="text-xs text-muted-foreground">{s.date} · {s.heure}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${
                  s.statut === "confirmé"
                    ? "bg-green-50 text-green-700"
                    : "bg-amber-50 text-amber-700"
                }`}>
                  {s.statut}
                </span>
              </div>
            ))}
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
            {dernieres_factures.map((f) => (
              <div key={f.id} className="px-5 py-3.5 flex items-center gap-4">
                <div className={`flex-shrink-0 ${f.statut === "payée" ? "text-green-500" : "text-amber-500"}`}>
                  {f.statut === "payée"
                    ? <CheckCircle className="w-4.5 h-4.5" />
                    : <AlertCircle className="w-4.5 h-4.5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{f.mois}</p>
                  <p className="text-xs text-muted-foreground">
                    {f.montant}€ brut · {f.net}€ après CI
                  </p>
                </div>
                {f.statut === "en attente" ? (
                  <Link
                    to="/parent/factures"
                    className="text-xs bg-primary text-white px-3 py-1.5 rounded-lg hover:bg-primary/90 transition-colors font-medium flex-shrink-0"
                  >
                    Payer
                  </Link>
                ) : (
                  <span className="text-xs bg-green-50 text-green-700 px-2.5 py-1.5 rounded-lg flex-shrink-0">
                    Payée
                  </span>
                )}
              </div>
            ))}
          </div>
          <div className="px-5 py-3 bg-blue-50/60 border-t border-blue-100">
            <p className="text-xs text-blue-700">
              Crédit d'impôt : vous récupérez <strong>50%</strong> du montant payé chaque année (Art. 199 sexdecies)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
