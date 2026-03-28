import { useState } from "react";
import { BookOpen, Clock, CheckCircle, CalendarDays } from "lucide-react";

interface Cours {
  id: number;
  matiere: string;
  jourHeure: string;
  date: string;
  dureeMin: number;
  statut: "à venir" | "à confirmer" | "effectué";
}

const cours: Cours[] = [
  { id: 1, matiere: "Mathématiques", date: "2026-03-31", jourHeure: "Lundi 31 mars · 17h00", dureeMin: 90, statut: "à venir" },
  { id: 2, matiere: "Physique-Chimie", date: "2026-04-02", jourHeure: "Mercredi 2 avril · 16h00", dureeMin: 90, statut: "à venir" },
  { id: 3, matiere: "Mathématiques", date: "2026-04-07", jourHeure: "Lundi 7 avril · 17h00", dureeMin: 90, statut: "à confirmer" },
  { id: 4, matiere: "Mathématiques", date: "2026-03-24", jourHeure: "Lundi 24 mars · 17h00", dureeMin: 90, statut: "effectué" },
  { id: 5, matiere: "Physique-Chimie", date: "2026-03-19", jourHeure: "Mercredi 19 mars · 16h00", dureeMin: 90, statut: "effectué" },
  { id: 6, matiere: "Mathématiques", date: "2026-03-17", jourHeure: "Lundi 17 mars · 17h00", dureeMin: 90, statut: "effectué" },
  { id: 7, matiere: "Physique-Chimie", date: "2026-03-12", jourHeure: "Mercredi 12 mars · 16h00", dureeMin: 90, statut: "effectué" },
  { id: 8, matiere: "Mathématiques", date: "2026-03-10", jourHeure: "Lundi 10 mars · 17h00", dureeMin: 90, statut: "effectué" },
  { id: 9, matiere: "Physique-Chimie", date: "2026-02-26", jourHeure: "Jeudi 26 fév. · 16h00", dureeMin: 90, statut: "effectué" },
  { id: 10, matiere: "Mathématiques", date: "2026-02-23", jourHeure: "Lundi 23 fév. · 17h00", dureeMin: 90, statut: "effectué" },
];

const matiereStyle: Record<string, string> = {
  "Mathématiques": "bg-blue-50 text-blue-700 border-blue-100",
  "Physique-Chimie": "bg-purple-50 text-purple-700 border-purple-100",
};

const statutStyle: Record<string, string> = {
  "effectué": "bg-green-50 text-green-700",
  "à venir": "bg-blue-50 text-blue-700",
  "à confirmer": "bg-amber-50 text-amber-700",
};

const iconStyle: Record<string, string> = {
  "effectué": "bg-green-50 text-green-600",
  "à venir": "bg-blue-50 text-blue-600",
  "à confirmer": "bg-amber-50 text-amber-500",
};

type Filter = "tous" | "à venir" | "passés";

export function ParentCours() {
  const [filter, setFilter] = useState<Filter>("tous");

  const filtered = cours.filter((c) => {
    if (filter === "à venir") return c.statut === "à venir" || c.statut === "à confirmer";
    if (filter === "passés") return c.statut === "effectué";
    return true;
  });

  const avenir = cours.filter((c) => c.statut === "à venir" || c.statut === "à confirmer").length;
  const effectues = cours.filter((c) => c.statut === "effectué").length;
  const totalHeures = (effectues * 90) / 60;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Cours de Thomas</h1>
        <p className="text-muted-foreground text-sm mt-1">Historique et prochaines séances</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "À venir", value: avenir, icon: CalendarDays, color: "text-blue-600 bg-blue-50" },
          { label: "Effectués", value: effectues, icon: CheckCircle, color: "text-green-600 bg-green-50" },
          { label: "Heures totales", value: `${totalHeures}h`, icon: Clock, color: "text-purple-600 bg-purple-50" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-border p-4 text-center">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center mx-auto mb-2 ${s.color}`}>
              <s.icon className="w-4.5 h-4.5" />
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
              filter === f
                ? "bg-primary text-white"
                : "text-muted-foreground hover:text-foreground"
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
            Aucun cours à afficher
          </div>
        )}
        {filtered.map((c) => (
          <div
            key={c.id}
            className="bg-white rounded-xl border border-border px-5 py-4 flex items-center gap-4"
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${iconStyle[c.statut]}`}>
              <BookOpen className="w-4.5 h-4.5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-medium text-gray-900">{c.matiere}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full border ${matiereStyle[c.matiere] ?? "bg-gray-50 text-gray-600 border-gray-100"}`}>
                  {c.matiere}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {c.jourHeure} · {c.dureeMin} min
              </p>
            </div>
            <span className={`text-xs px-2.5 py-1 rounded-full flex-shrink-0 ${statutStyle[c.statut]}`}>
              {c.statut}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
