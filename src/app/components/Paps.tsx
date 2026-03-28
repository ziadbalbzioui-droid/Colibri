import { useState, useMemo } from "react";
import { Search, Plus, X, MapPin, Clock, CheckCircle2, SlidersHorizontal, Zap, User } from "lucide-react";

interface AnnonceEleve {
  id: number;
  matiere: string;
  niveauEleve: string;
  prix: number; // €/h
  horaires: string;
  frequence: string;
  localisation: string;
  descriptionEleve: string;
  publiePar: string;
  joursDepuis: number;
  tags: string[];
  urgent: boolean;
}

const MATIERES_FILTER = ["Toutes", "Mathématiques", "Physique-Chimie", "Anglais", "Français", "SVT", "Informatique", "SES", "Philosophie"];
const NIVEAUX_FILTER = ["Tous", "Primaire", "Collège", "Lycée", "Prépa", "Supérieur"];
const PRIX_FILTER = ["Tous", "< 20 €", "20–30 €", "> 30 €"];

const MATIERES_FORM = ["Mathématiques", "Physique-Chimie", "Anglais", "Français", "SVT", "Informatique", "SES", "Philosophie", "Histoire-Géo", "Espagnol", "Autre"];
const NIVEAUX_FORM = ["CE1", "CE2", "CM1", "CM2", "6ème", "5ème", "4ème", "3ème", "2nde", "1ère", "Terminale", "CPGE", "Licence", "Master"];

const initialAnnonces: AnnonceEleve[] = [
  {
    id: 1, matiere: "Mathématiques", niveauEleve: "Terminale S", prix: 28,
    horaires: "Lundi & mercredi soir (18h–20h)", frequence: "2h / semaine",
    localisation: "Paris 15e", publiePar: "Camille F.", joursDepuis: 1, urgent: true,
    descriptionEleve: "Élève sérieux mais qui panique aux examens. Bonnes bases en algèbre, grosses lacunes en analyse (limites, dérivées). Parents très présents et exigeants. Cherche un suivi régulier jusqu'au bac.",
    tags: ["Objectif bac", "Parents impliqués", "Patience requise"],
  },
  {
    id: 2, matiere: "Anglais", niveauEleve: "3ème", prix: 22,
    horaires: "Mercredi après-midi ou samedi matin",frequence: "1h30 / semaine",
    localisation: "Montrouge (92)", publiePar: "Léonie V.", joursDepuis: 3, urgent: false,
    descriptionEleve: "Collégien timide, niveau scolaire correct mais très inhibé à l'oral. L'objectif est de le préparer à l'oral du brevet et de lui donner confiance. La famille préfère que les cours se déroulent chez eux.",
    tags: ["Cours à domicile", "Oral brevet", "Profil discret"],
  },
  {
    id: 3, matiere: "Physique-Chimie", niveauEleve: "1ère S", prix: 30,
    horaires: "Mardi ou jeudi soir", frequence: "2h / semaine",
    localisation: "Boulogne-Billancourt", publiePar: "Théo M.", joursDepuis: 5, urgent: false,
    descriptionEleve: "Élève en filière générale avec physique en spécialité. Bonne volonté mais méthode très approximative (raisonnements incomplets, unités ignorées). Besoin de reprendre les bases proprement.",
    tags: ["Méthode à construire", "Spécialité", "Bac général"],
  },
  {
    id: 4, matiere: "Mathématiques", niveauEleve: "6ème", prix: 18,
    horaires: "Samedi matin 9h–11h", frequence: "2h / semaine",
    localisation: "Vincennes (94)", publiePar: "Antoine L.", joursDepuis: 2, urgent: false,
    descriptionEleve: "Petite 6ème en grande difficulté depuis le CM2. Lacunes fondamentales sur les fractions et la numération. Très gentille et volontaire. Besoin d'un tuteur patient et rassurant.",
    tags: ["Bases fondamentales", "Profil fragile", "Patient requis"],
  },
  {
    id: 5, matiere: "Français", niveauEleve: "Terminale", prix: 25,
    horaires: "Vendredi soir ou dimanche", frequence: "1h30 / semaine",
    localisation: "Paris 5e / 13e", publiePar: "Sara N.", joursDepuis: 7, urgent: true,
    descriptionEleve: "Lycéen très à l'aise à l'oral mais qui peine à l'écrit (structure de la dissertation catastrophique). Grand lecteur, idées intéressantes. Urgence : il passe le bac de français dans 6 semaines.",
    tags: ["URGENT – 6 sem. avant bac", "Dissertation", "Écrit uniquement"],
  },
  {
    id: 6, matiere: "SVT", niveauEleve: "Terminale", prix: 27,
    horaires: "Flexible, à définir", frequence: "2h / semaine",
    localisation: "Levallois-Perret", publiePar: "Maxime G.", joursDepuis: 10, urgent: false,
    descriptionEleve: "Élève visant médecine (PASS). Niveau correct mais veut aller plus loin que le programme. Très motivé, cherche quelqu'un capable de l'emmener vers des questions de concours.",
    tags: ["PASS / médecine", "Haut niveau", "Très motivé"],
  },
  {
    id: 7, matiere: "Informatique", niveauEleve: "Licence 1", prix: 22,
    horaires: "Week-end", frequence: "2h / semaine",
    localisation: "Paris 13e", publiePar: "Inès B.", joursDepuis: 4, urgent: false,
    descriptionEleve: "Étudiant en L1 info qui n'a jamais codé avant. Bloqué sur les bases de la programmation (Python, boucles, fonctions). A du mal à lire la doc et à débugger. Besoin d'un accompagnement très progressif.",
    tags: ["Débutant complet", "Python", "Accompagnement progressif"],
  },
];

const emptyForm = {
  matiere: "Mathématiques", niveauEleve: "3ème", prix: 25,
  horaires: "", frequence: "1h30 / semaine",
  localisation: "", descriptionEleve: "", tags: "", urgent: false,
};

function dayLabel(n: number) {
  if (n === 0) return "Aujourd'hui";
  if (n === 1) return "Hier";
  return `Il y a ${n} j`;
}

export function Paps() {
  const [annonces, setAnnonces] = useState<AnnonceEleve[]>(initialAnnonces);
  const [search, setSearch] = useState("");
  const [filterMatiere, setFilterMatiere] = useState("Toutes");
  const [filterNiveau, setFilterNiveau] = useState("Tous");
  const [filterPrix, setFilterPrix] = useState("Tous");
  const [showFilters, setShowFilters] = useState(false);
  const [showPost, setShowPost] = useState(false);
  const [contactTarget, setContactTarget] = useState<AnnonceEleve | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [postSuccess, setPostSuccess] = useState(false);
  const [contactSuccess, setContactSuccess] = useState(false);
  const [contactMsg, setContactMsg] = useState("");

  const filtered = useMemo(() => {
    return annonces.filter((a) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        a.matiere.toLowerCase().includes(q) ||
        a.localisation.toLowerCase().includes(q) ||
        a.niveauEleve.toLowerCase().includes(q) ||
        a.descriptionEleve.toLowerCase().includes(q) ||
        a.tags.some((t) => t.toLowerCase().includes(q));
      const matchMatiere = filterMatiere === "Toutes" || a.matiere === filterMatiere;
      const matchNiveau =
        filterNiveau === "Tous" ||
        (filterNiveau === "Collège" && ["6ème","5ème","4ème","3ème"].some(n => a.niveauEleve.includes(n.replace("ème","")))) ||
        (filterNiveau === "Lycée" && ["2nde","1ère","Terminale"].some(n => a.niveauEleve.includes(n))) ||
        (filterNiveau === "Prépa" && a.niveauEleve.includes("CPGE")) ||
        (filterNiveau === "Supérieur" && ["Licence","Master"].some(n => a.niveauEleve.includes(n))) ||
        (filterNiveau === "Primaire" && ["CE","CM"].some(n => a.niveauEleve.includes(n)));
      const matchPrix =
        filterPrix === "Tous" ||
        (filterPrix === "< 20 €" && a.prix < 20) ||
        (filterPrix === "20–30 €" && a.prix >= 20 && a.prix <= 30) ||
        (filterPrix === "> 30 €" && a.prix > 30);
      return matchSearch && matchMatiere && matchNiveau && matchPrix;
    });
  }, [annonces, search, filterMatiere, filterNiveau, filterPrix]);

  function handlePost() {
    const newAnnonce: AnnonceEleve = {
      id: Date.now(),
      matiere: form.matiere,
      niveauEleve: form.niveauEleve,
      prix: form.prix,
      horaires: form.horaires,
      frequence: form.frequence,
      localisation: form.localisation,
      descriptionEleve: form.descriptionEleve,
      publiePar: "Vous",
      joursDepuis: 0,
      tags: form.tags.split(",").map((s) => s.trim()).filter(Boolean),
      urgent: form.urgent,
    };
    setAnnonces((prev) => [newAnnonce, ...prev]);
    setPostSuccess(true);
  }

  function closePost() {
    setShowPost(false);
    setPostSuccess(false);
    setForm(emptyForm);
  }

  function closeContact() {
    setContactTarget(null);
    setContactSuccess(false);
    setContactMsg("");
  }

  const activeFilters = [filterMatiere !== "Toutes", filterNiveau !== "Tous", filterPrix !== "Tous"].filter(Boolean).length;

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="mb-1">PAPS</h1>
          <p className="text-muted-foreground" style={{ fontSize: 14 }}>
            Échangez des élèves entre profs — postez un cours disponible ou trouvez un élève à reprendre.
          </p>
        </div>
        <button
          onClick={() => { setShowPost(true); setPostSuccess(false); }}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-lg hover:opacity-90 transition-opacity shrink-0"
        >
          <Plus className="w-4 h-4" />
          Poster un cours
        </button>
      </div>

      {/* Search + filters toggle */}
      <div className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Matière, ville, niveau, mot-clé..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-border rounded-lg outline-none"
            style={{ fontSize: 14 }}
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-colors ${
            showFilters || activeFilters > 0
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-white border-border hover:bg-muted"
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span style={{ fontSize: 14 }}>Filtres</span>
          {activeFilters > 0 && (
            <span className="bg-white text-primary rounded-full w-5 h-5 flex items-center justify-center" style={{ fontSize: 11, fontWeight: 700 }}>
              {activeFilters}
            </span>
          )}
        </button>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="bg-white border border-border rounded-xl p-4 mb-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-muted-foreground mb-1.5" style={{ fontSize: 12 }}>Matière</label>
            <select value={filterMatiere} onChange={(e) => setFilterMatiere(e.target.value)}
              className="w-full px-3 py-2 bg-muted rounded-lg outline-none" style={{ fontSize: 13 }}>
              {MATIERES_FILTER.map((m) => <option key={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-muted-foreground mb-1.5" style={{ fontSize: 12 }}>Niveau de l'élève</label>
            <select value={filterNiveau} onChange={(e) => setFilterNiveau(e.target.value)}
              className="w-full px-3 py-2 bg-muted rounded-lg outline-none" style={{ fontSize: 13 }}>
              {NIVEAUX_FILTER.map((n) => <option key={n}>{n}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-muted-foreground mb-1.5" style={{ fontSize: 12 }}>Tarif horaire</label>
            <select value={filterPrix} onChange={(e) => setFilterPrix(e.target.value)}
              className="w-full px-3 py-2 bg-muted rounded-lg outline-none" style={{ fontSize: 13 }}>
              {PRIX_FILTER.map((p) => <option key={p}>{p}</option>)}
            </select>
          </div>
        </div>
      )}

      {/* Count */}
      <p className="text-muted-foreground mb-4" style={{ fontSize: 13 }}>
        {filtered.length} cours disponible{filtered.length !== 1 ? "s" : ""}
        {filtered.filter((a) => a.urgent).length > 0 && (
          <span className="ml-2 text-red-500">· {filtered.filter((a) => a.urgent).length} urgent{filtered.filter((a) => a.urgent).length > 1 ? "s" : ""}</span>
        )}
      </p>

      {/* Cards */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground bg-white rounded-xl border border-border">
          <User className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>Aucun cours ne correspond à votre recherche.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map((a) => (
            <div
              key={a.id}
              className={`bg-white border rounded-xl p-5 flex flex-col hover:shadow-sm transition-shadow ${
                a.urgent ? "border-red-200" : "border-border"
              }`}
            >
              {/* Top row: subject + level + price */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex flex-wrap items-center gap-2">
                  {a.urgent && (
                    <span className="flex items-center gap-1 bg-red-100 text-red-600 px-2.5 py-0.5 rounded-full" style={{ fontSize: 12, fontWeight: 500 }}>
                      <Zap className="w-3 h-3" /> Urgent
                    </span>
                  )}
                  <span className="bg-primary/10 text-primary px-2.5 py-0.5 rounded-full" style={{ fontSize: 13, fontWeight: 500 }}>
                    {a.matiere}
                  </span>
                  <span className="bg-secondary text-secondary-foreground px-2.5 py-0.5 rounded-full" style={{ fontSize: 13 }}>
                    {a.niveauEleve}
                  </span>
                </div>
                <span className="shrink-0 text-primary" style={{ fontSize: 22, fontWeight: 700, lineHeight: 1 }}>
                  {a.prix} €<span className="text-muted-foreground" style={{ fontSize: 12, fontWeight: 400 }}>/h</span>
                </span>
              </div>

              {/* Logistics: location + schedule */}
              <div className="flex flex-wrap gap-x-5 gap-y-1 mb-3">
                <span className="flex items-center gap-1.5 text-muted-foreground" style={{ fontSize: 13 }}>
                  <MapPin className="w-3.5 h-3.5 shrink-0" />
                  {a.localisation}
                </span>
                <span className="flex items-center gap-1.5 text-muted-foreground" style={{ fontSize: 13 }}>
                  <Clock className="w-3.5 h-3.5 shrink-0" />
                  {a.horaires} · {a.frequence}
                </span>
              </div>

              {/* Student description */}
              <p className="text-muted-foreground mb-3 flex-1" style={{ fontSize: 13, lineHeight: 1.6 }}>
                {a.descriptionEleve}
              </p>

              {/* Tags */}
              {a.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {a.tags.map((t) => (
                    <span key={t} className="border border-border text-muted-foreground px-2 py-0.5 rounded" style={{ fontSize: 11 }}>
                      {t}
                    </span>
                  ))}
                </div>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-border">
                <span className="text-muted-foreground" style={{ fontSize: 12 }}>
                  Posté par <strong>{a.publiePar}</strong> · {dayLabel(a.joursDepuis)}
                </span>
                <button
                  onClick={() => { setContactTarget(a); setContactSuccess(false); setContactMsg(""); }}
                  className="flex items-center gap-2 bg-primary text-primary-foreground px-3.5 py-2 rounded-lg hover:opacity-90 transition-opacity"
                  style={{ fontSize: 13 }}
                >
                  Je suis disponible
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Modal: Poster un cours ── */}
      {showPost && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3>Poster un cours disponible</h3>
                <p className="text-muted-foreground mt-0.5" style={{ fontSize: 13 }}>
                  Décrivez l'élève que vous proposez à un collègue.
                </p>
              </div>
              <button onClick={closePost} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            {postSuccess ? (
              <div className="text-center py-6">
                <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-7 h-7 text-green-600" />
                </div>
                <p style={{ fontWeight: 600, fontSize: 16 }} className="mb-1">Cours publié !</p>
                <p className="text-muted-foreground mb-6" style={{ fontSize: 14 }}>
                  Votre annonce est visible par les autres profs inscrits sur Colibri.
                </p>
                <button onClick={closePost} className="bg-primary text-primary-foreground px-6 py-2.5 rounded-lg hover:opacity-90 transition-opacity">
                  Fermer
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-muted-foreground mb-1.5" style={{ fontSize: 13 }}>Matière</label>
                    <select value={form.matiere} onChange={(e) => setForm({ ...form, matiere: e.target.value })}
                      className="w-full px-4 py-2.5 bg-muted rounded-lg outline-none">
                      {MATIERES_FORM.map((m) => <option key={m}>{m}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-muted-foreground mb-1.5" style={{ fontSize: 13 }}>Niveau de l'élève</label>
                    <select value={form.niveauEleve} onChange={(e) => setForm({ ...form, niveauEleve: e.target.value })}
                      className="w-full px-4 py-2.5 bg-muted rounded-lg outline-none">
                      {NIVEAUX_FORM.map((n) => <option key={n}>{n}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-muted-foreground mb-1.5" style={{ fontSize: 13 }}>Prix proposé (€/h)</label>
                    <input type="number" value={form.prix} onChange={(e) => setForm({ ...form, prix: Number(e.target.value) })}
                      className="w-full px-4 py-2.5 bg-muted rounded-lg outline-none" />
                  </div>
                  <div>
                    <label className="block text-muted-foreground mb-1.5" style={{ fontSize: 13 }}>Fréquence</label>
                    <input value={form.frequence} onChange={(e) => setForm({ ...form, frequence: e.target.value })}
                      placeholder="2h / semaine" className="w-full px-4 py-2.5 bg-muted rounded-lg outline-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-muted-foreground mb-1.5" style={{ fontSize: 13 }}>Horaires disponibles</label>
                  <input value={form.horaires} onChange={(e) => setForm({ ...form, horaires: e.target.value })}
                    placeholder="Lundi & mercredi soir, samedi matin..." className="w-full px-4 py-2.5 bg-muted rounded-lg outline-none" />
                </div>

                <div>
                  <label className="block text-muted-foreground mb-1.5" style={{ fontSize: 13 }}>Localisation</label>
                  <input value={form.localisation} onChange={(e) => setForm({ ...form, localisation: e.target.value })}
                    placeholder="Paris 15e, Montrouge..." className="w-full px-4 py-2.5 bg-muted rounded-lg outline-none" />
                </div>

                <div>
                  <label className="block text-muted-foreground mb-1.5" style={{ fontSize: 13 }}>Description de l'élève</label>
                  <textarea value={form.descriptionEleve} onChange={(e) => setForm({ ...form, descriptionEleve: e.target.value })}
                    placeholder="Niveau, difficultés spécifiques, personnalité, attentes de la famille..."
                    rows={4} className="w-full px-4 py-3 bg-muted rounded-lg outline-none resize-none" style={{ fontSize: 13 }} />
                </div>

                <div>
                  <label className="block text-muted-foreground mb-1.5" style={{ fontSize: 13 }}>
                    Tags <span className="opacity-60">(séparés par virgule)</span>
                  </label>
                  <input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })}
                    placeholder="Patient requis, Objectif bac, Cours à domicile..." className="w-full px-4 py-2.5 bg-muted rounded-lg outline-none" />
                </div>

                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input type="checkbox" checked={form.urgent} onChange={(e) => setForm({ ...form, urgent: e.target.checked })}
                    className="w-4 h-4 rounded accent-primary" />
                  <span style={{ fontSize: 13 }}>Marquer comme urgent</span>
                </label>

                <div className="flex gap-3 pt-2">
                  <button onClick={closePost} className="flex-1 px-4 py-2.5 rounded-lg border border-border hover:bg-muted transition-colors">
                    Annuler
                  </button>
                  <button
                    onClick={handlePost}
                    disabled={!form.localisation || !form.horaires || !form.descriptionEleve}
                    className="flex-1 bg-primary text-primary-foreground px-4 py-2.5 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-40"
                  >
                    Publier
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Modal: Je suis disponible ── */}
      {contactTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h3>Prendre ce cours</h3>
              <button onClick={closeContact} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            {contactSuccess ? (
              <div className="text-center py-4">
                <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-7 h-7 text-green-600" />
                </div>
                <p style={{ fontWeight: 600, fontSize: 16 }} className="mb-1">Demande envoyée !</p>
                <p className="text-muted-foreground mb-6" style={{ fontSize: 14 }}>
                  {contactTarget.publiePar} va recevoir votre message et vous recontactera pour la mise en relation avec l'élève.
                </p>
                <button onClick={closeContact} className="bg-primary text-primary-foreground px-6 py-2.5 rounded-lg hover:opacity-90 transition-opacity">
                  Fermer
                </button>
              </div>
            ) : (
              <>
                {/* Annonce recap */}
                <div className="bg-secondary rounded-xl p-4 mb-5 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="bg-primary/10 text-primary px-2.5 py-0.5 rounded-full" style={{ fontSize: 13, fontWeight: 500 }}>
                        {contactTarget.matiere}
                      </span>
                      <span className="text-secondary-foreground" style={{ fontSize: 13 }}>{contactTarget.niveauEleve}</span>
                    </div>
                    <span style={{ fontWeight: 700 }} className="text-primary">{contactTarget.prix} €/h</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground" style={{ fontSize: 13 }}>
                    <MapPin className="w-3.5 h-3.5" /> {contactTarget.localisation}
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground" style={{ fontSize: 13 }}>
                    <Clock className="w-3.5 h-3.5" /> {contactTarget.horaires}
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-muted-foreground mb-1.5" style={{ fontSize: 13 }}>
                    Message à {contactTarget.publiePar}
                  </label>
                  <textarea
                    value={contactMsg}
                    onChange={(e) => setContactMsg(e.target.value)}
                    placeholder={`Bonjour ${contactTarget.publiePar.split(" ")[0]}, je suis disponible pour prendre cet élève en ${contactTarget.matiere}...`}
                    rows={4}
                    className="w-full px-4 py-3 bg-muted rounded-lg outline-none resize-none"
                    style={{ fontSize: 13 }}
                  />
                </div>

                <div className="flex gap-3">
                  <button onClick={closeContact} className="flex-1 px-4 py-2.5 rounded-lg border border-border hover:bg-muted transition-colors">
                    Annuler
                  </button>
                  <button
                    onClick={() => setContactSuccess(true)}
                    disabled={!contactMsg.trim()}
                    className="flex-1 bg-primary text-primary-foreground px-4 py-2.5 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-40"
                  >
                    Envoyer la demande
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
