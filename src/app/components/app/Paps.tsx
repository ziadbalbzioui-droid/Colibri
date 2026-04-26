import { useState } from "react";
import { MapPin, Clock, Plus, X, AlertTriangle, Euro, Loader2, Trash2, ChevronRight, GraduationCap } from "lucide-react";
import { LoadingGuard } from "../layout/LoadingGuard";
import { usePaps } from "../../../lib/hooks/usePaps";
import { useAuth } from "../../../lib/auth";
import type { AnnonceRow } from "../../../lib/hooks/usePaps";

const MATIERES_FILTER = ["Toutes", "Mathématiques", "Physique-Chimie", "SVT", "Français", "Anglais", "Histoire-Géo", "SES", "Philosophie", "Informatique"];
const NIVEAUX_FILTER = ["Tous", "Collège", "Lycée", "Terminale", "BTS", "Licence"];
const MATIERES_FORM = ["Mathématiques", "Physique-Chimie", "SVT", "Français", "Anglais", "Espagnol", "Histoire-Géo", "SES", "Philosophie", "Informatique", "Autre"];
const NIVEAUX_FORM = ["6ème", "5ème", "4ème", "3ème", "2nde", "1ère S", "1ère ES", "Terminale S", "Terminale ES", "BTS", "Licence 1", "Licence 2", "Licence 3", "Autre"];

const EXEMPLE_ANNONCES: AnnonceRow[] = [
  {
    id: "ex-1",
    prof_id: "example-prof-1",
    matiere: "Mathématiques",
    niveau_eleve: "Sup PTSI",
    prix: 35,
    frequence: "2x/semaine",
    horaires: "Mercredi 17h-18h, Samedi 10h-11h",
    localisation: "Paris 6e",
    description_eleve: "Aide en analyse et algèbre, préparation khôlle",
    tags: ["Khôlle", "Analyse"],
    urgent: false,
    prof_nom: "Jean Mathieu",
    created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
  },
  {
    id: "ex-2",
    prof_id: "example-prof-2",
    matiere: "Physique-Chimie",
    niveau_eleve: "Licence 2",
    prix: 30,
    frequence: "1x/semaine",
    horaires: "Dimanche 15h-17h",
    localisation: "Paris 5e",
    description_eleve: "Mécanique quantique, optique géométrique",
    tags: ["Optique", "Mécanique"],
    urgent: false,
    prof_nom: "Sophie Dupont",
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: "ex-3",
    prof_id: "example-prof-3",
    matiere: "Informatique",
    niveau_eleve: "1ère ES",
    prix: 28,
    frequence: "Flexible",
    horaires: "À convenir",
    localisation: "Paris 16e",
    description_eleve: "Python, structures de données, algorithmique",
    tags: ["Python", "Algo"],
    urgent: false,
    prof_nom: "Thomas Lefebvre",
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: "ex-4",
    prof_id: "example-prof-4",
    matiere: "Anglais",
    niveau_eleve: "BTS",
    prix: 25,
    frequence: "3x/semaine",
    horaires: "Lundi, Mercredi, Vendredi 18h",
    localisation: "Boulogne",
    description_eleve: "TOEIC, expression orale, grammaire",
    tags: ["TOEIC", "Speaking"],
    urgent: false,
    prof_nom: "Jessica Brown",
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: "ex-5",
    prof_id: "example-prof-5",
    matiere: "Histoire-Géo",
    niveau_eleve: "Terminale ES",
    prix: 22,
    frequence: "1x/semaine",
    horaires: "Jeudi 19h-20h30",
    localisation: "Paris 12e",
    description_eleve: "Géopolitique, bac blanc, méthodologie dissertation",
    tags: ["Bac", "Géopolitique"],
    urgent: false,
    prof_nom: "Marc Renard",
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: "ex-6",
    prof_id: "example-prof-6",
    matiere: "SVT",
    niveau_eleve: "Terminale S",
    prix: 32,
    frequence: "Intensive",
    horaires: "À partir de ce week-end",
    localisation: "Paris 13e",
    description_eleve: "Révision intensive avant bac. Biologie cellulaire et génétique.",
    tags: ["Bac", "Révision"],
    urgent: true,
    prof_nom: "Amélie Rousseau",
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
];

const emptyForm = {
  matiere: MATIERES_FORM[0],
  niveau_eleve: NIVEAUX_FORM[0],
  prix: 25,
  frequence: "",
  horaires: "",
  localisation: "",
  description_eleve: "",
  tags: [] as string[],
  urgent: false,
};

function AnnonceCard({
  a,
  own,
  onDetail,
  onContact,
  onClose,
}: {
  a: AnnonceRow;
  own: boolean;
  onDetail: () => void;
  onContact: () => void;
  onClose: () => void;
}) {
  const daysAgo = Math.floor((Date.now() - new Date(a.created_at).getTime()) / 86400000);
  return (
    <div
      className={`bg-white rounded-xl border-2 p-5 hover:shadow-md transition-all cursor-pointer ${a.urgent ? "border-red-200" : "border-border"}`}
      onClick={onDetail}
    >
      {a.urgent && (
        <div className="flex items-center gap-1.5 text-red-600 mb-3 text-xs font-semibold">
          <AlertTriangle className="w-3.5 h-3.5" /> URGENT
        </div>
      )}

      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="bg-primary/10 text-primary px-2.5 py-0.5 rounded-full text-xs font-medium">{a.matiere}</span>
          <span className="bg-secondary text-secondary-foreground px-2.5 py-0.5 rounded-full text-xs">{a.niveau_eleve}</span>
        </div>
        <div className="flex items-center gap-1 text-primary font-semibold text-lg shrink-0">
          <Euro className="w-4 h-4" />{a.prix}/h
        </div>
      </div>

      <div className="space-y-1.5 mb-3">
        {a.localisation && (
          <p className="flex items-center gap-1.5 text-muted-foreground text-sm">
            <MapPin className="w-3.5 h-3.5 shrink-0" /> {a.localisation}
          </p>
        )}
        {(a.horaires || a.frequence) && (
          <p className="flex items-center gap-1.5 text-muted-foreground text-sm">
            <Clock className="w-3.5 h-3.5 shrink-0" />
            {[a.horaires, a.frequence].filter(Boolean).join(" · ")}
          </p>
        )}
      </div>

      {a.description_eleve && (
        <p className="text-sm text-gray-700 bg-muted/50 rounded-lg px-3 py-2 mb-3 line-clamp-2">
          {a.description_eleve}
        </p>
      )}

      {a.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {a.tags.map((tag) => (
            <span key={tag} className="bg-accent text-accent-foreground px-2 py-0.5 rounded text-xs">{tag}</span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-border">
        <span className="text-xs text-muted-foreground">
          {a.prof_nom} · {daysAgo === 0 ? "aujourd'hui" : `${daysAgo}j`}
        </span>
        {own ? (
          <button
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" /> Retirer
          </button>
        ) : (
          <button
            onClick={(e) => { e.stopPropagation(); onContact(); }}
            className="bg-primary text-primary-foreground text-xs px-4 py-2 rounded-lg hover:opacity-90"
          >
            Je suis disponible
          </button>
        )}
      </div>
    </div>
  );
}

export function Paps() {
  const { annonces, loading, error, reload, createAnnonce, closeAnnonce, isOwn } = usePaps();
  const { profile } = useAuth();

  const isMinesParis = profile?.etablissement?.toLowerCase().includes("mines") ?? false;

  const [filterMatiere, setFilterMatiere] = useState("Toutes");
  const [filterNiveau, setFilterNiveau] = useState("Tous");
  const [showPost, setShowPost] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [newTag, setNewTag] = useState("");
  const [saving, setSaving] = useState(false);
  const [contactModal, setContactModal] = useState<AnnonceRow | null>(null);
  const [contactMsg, setContactMsg] = useState("");
  const [contactSent, setContactSent] = useState(false);
  const [detailCard, setDetailCard] = useState<AnnonceRow | null>(null);

  const filtered = annonces.filter((a: AnnonceRow) => {
    if (filterMatiere !== "Toutes" && a.matiere !== filterMatiere) return false;
    if (filterNiveau !== "Tous" && !a.niveau_eleve.toLowerCase().includes(filterNiveau.toLowerCase())) return false;
    return true;
  });

  const hasRealAnnonces = annonces.length > 0;
  const displayedCards: AnnonceRow[] = hasRealAnnonces ? filtered : EXEMPLE_ANNONCES;

  function addTag() {
    const t = newTag.trim();
    if (t && !form.tags.includes(t)) setForm({ ...form, tags: [...form.tags, t] });
    setNewTag("");
  }

  async function handlePost() {
    if (!form.matiere || !form.niveau_eleve) return;
    setSaving(true);
    try {
      await createAnnonce({
        matiere: form.matiere,
        niveau_eleve: form.niveau_eleve,
        prix: form.prix,
        frequence: form.frequence,
        horaires: form.horaires,
        localisation: form.localisation,
        description_eleve: form.description_eleve,
        tags: form.tags,
        urgent: form.urgent,
        prof_nom: profile ? `${profile.prenom} ${profile.nom}` : "Prof",
      });
      setShowPost(false);
      setForm(emptyForm);
    } finally {
      setSaving(false);
    }
  }

  function handleContact() {
    setContactSent(true);
    setTimeout(() => {
      setContactModal(null);
      setContactMsg("");
      setContactSent(false);
    }, 2000);
  }

  if (!isMinesParis) {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-5">
            <GraduationCap className="w-7 h-7 text-slate-400" />
          </div>
          <h2 className="text-lg font-semibold text-slate-800 mb-2">Accès restreint</h2>
          <p className="text-slate-500 text-sm max-w-xs leading-relaxed">
            La marketplace PAPS est réservée aux étudiants des Mines Paris · PSL.
            Renseigne ton établissement dans <a href="/app/profil" className="text-primary underline underline-offset-2">Mon profil</a> pour y accéder.
          </p>
        </div>
      </div>
    );
  }

  return (
    <LoadingGuard loading={loading} error={error} onRetry={reload}>
    <div className={`max-w-5xl mx-auto ${!profile?.siret ? "opacity-50 pointer-events-none select-none" : ""}`}>
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1.5">
            <h1 className="text-xl font-bold text-slate-900">PAPS</h1>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 bg-blue-50 text-blue-600 rounded-full border border-blue-100">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
              Mines Paris · PSL
            </span>
          </div>
          <p className="text-slate-500 text-sm">Transmets un élève à un autre professeur de confiance</p>
        </div>
        <button
          onClick={() => setShowPost(true)}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-lg hover:opacity-90 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Poster une annonce
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <select
          value={filterMatiere}
          onChange={(e) => setFilterMatiere(e.target.value)}
          className="px-4 py-2 bg-white border border-border rounded-lg outline-none text-sm"
        >
          {MATIERES_FILTER.map((m) => <option key={m}>{m}</option>)}
        </select>
        <select
          value={filterNiveau}
          onChange={(e) => setFilterNiveau(e.target.value)}
          className="px-4 py-2 bg-white border border-border rounded-lg outline-none text-sm"
        >
          {NIVEAUX_FILTER.map((n) => <option key={n}>{n}</option>)}
        </select>
      </div>

      {/* Cards */}
      {hasRealAnnonces && filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground bg-white rounded-xl border border-border">
          <p className="text-lg font-medium text-gray-700 mb-1">Aucune annonce ne correspond aux filtres</p>
          <p className="text-sm">Modifie les filtres pour voir plus d'annonces</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {displayedCards.map((a) => (
            <AnnonceCard
              key={a.id}
              a={a}
              own={isOwn(a.id)}
              onDetail={() => setDetailCard(a)}
              onContact={() => setContactModal(a)}
              onClose={() => closeAnnonce(a.id)}
            />
          ))}
        </div>
      )}

      {/* Detail modal */}
      {detailCard && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex items-center gap-2 flex-wrap">
                {detailCard.urgent && (
                  <div className="flex items-center gap-1.5 text-red-600 text-xs font-semibold">
                    <AlertTriangle className="w-3.5 h-3.5" /> URGENT
                  </div>
                )}
                <span className="bg-primary/10 text-primary px-2.5 py-0.5 rounded-full text-xs font-medium">{detailCard.matiere}</span>
                <span className="bg-secondary text-secondary-foreground px-2.5 py-0.5 rounded-full text-xs">{detailCard.niveau_eleve}</span>
              </div>
              <button onClick={() => setDetailCard(null)} className="p-1.5 rounded-lg hover:bg-muted shrink-0">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            <div className="flex items-center gap-1 text-primary font-bold text-2xl mb-4">
              <Euro className="w-5 h-5" />{detailCard.prix}/h
            </div>

            <div className="space-y-2 mb-4">
              {detailCard.localisation && (
                <p className="flex items-center gap-2 text-sm text-gray-700">
                  <MapPin className="w-4 h-4 text-muted-foreground shrink-0" /> {detailCard.localisation}
                </p>
              )}
              {(detailCard.horaires || detailCard.frequence) && (
                <p className="flex items-center gap-2 text-sm text-gray-700">
                  <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
                  {[detailCard.horaires, detailCard.frequence].filter(Boolean).join(" · ")}
                </p>
              )}
            </div>

            {detailCard.description_eleve && (
              <div className="bg-muted/50 rounded-lg px-4 py-3 mb-4">
                <p className="text-sm font-medium text-gray-500 mb-1">Description de l'élève</p>
                <p className="text-sm text-gray-700">{detailCard.description_eleve}</p>
              </div>
            )}

            {detailCard.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-4">
                {detailCard.tags.map((tag) => (
                  <span key={tag} className="bg-accent text-accent-foreground px-2 py-0.5 rounded text-xs">{tag}</span>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-border">
              <div>
                <p className="text-sm font-medium text-gray-800">{detailCard.prof_nom}</p>
                <p className="text-xs text-muted-foreground">
                  Posté {Math.floor((Date.now() - new Date(detailCard.created_at).getTime()) / 86400000) === 0
                    ? "aujourd'hui"
                    : `il y a ${Math.floor((Date.now() - new Date(detailCard.created_at).getTime()) / 86400000)}j`}
                </p>
              </div>
              {isOwn(detailCard.id) ? (
                <button
                  onClick={() => { closeAnnonce(detailCard.id); setDetailCard(null); }}
                  className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-700 transition-colors"
                >
                  <Trash2 className="w-4 h-4" /> Retirer l'annonce
                </button>
              ) : (
                <button
                  onClick={() => { setContactModal(detailCard); setDetailCard(null); }}
                  className="bg-primary text-primary-foreground text-sm px-5 py-2.5 rounded-lg hover:opacity-90 flex items-center gap-2"
                >
                  Je suis disponible <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Post modal */}
      {showPost && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h3>Poster un élève à transmettre</h3>
              <button onClick={() => setShowPost(false)} className="p-1.5 rounded-lg hover:bg-muted">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1.5 text-muted-foreground" style={{ fontSize: 13 }}>Matière</label>
                  <select value={form.matiere} onChange={(e) => setForm({ ...form, matiere: e.target.value })} className="w-full px-4 py-2.5 bg-muted rounded-lg outline-none">
                    {MATIERES_FORM.map((m) => <option key={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block mb-1.5 text-muted-foreground" style={{ fontSize: 13 }}>Niveau élève</label>
                  <select value={form.niveau_eleve} onChange={(e) => setForm({ ...form, niveau_eleve: e.target.value })} className="w-full px-4 py-2.5 bg-muted rounded-lg outline-none">
                    {NIVEAUX_FORM.map((n) => <option key={n}>{n}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1.5 text-muted-foreground" style={{ fontSize: 13 }}>Prix (€/h)</label>
                  <input type="number" value={form.prix} onChange={(e) => setForm({ ...form, prix: Number(e.target.value) })} className="w-full px-4 py-2.5 bg-muted rounded-lg outline-none" />
                </div>
                <div>
                  <label className="block mb-1.5 text-muted-foreground" style={{ fontSize: 13 }}>Fréquence</label>
                  <input value={form.frequence} onChange={(e) => setForm({ ...form, frequence: e.target.value })} placeholder="1x/semaine..." className="w-full px-4 py-2.5 bg-muted rounded-lg outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1.5 text-muted-foreground" style={{ fontSize: 13 }}>Horaires</label>
                  <input value={form.horaires} onChange={(e) => setForm({ ...form, horaires: e.target.value })} placeholder="Mercredi 16h..." className="w-full px-4 py-2.5 bg-muted rounded-lg outline-none" />
                </div>
                <div>
                  <label className="block mb-1.5 text-muted-foreground" style={{ fontSize: 13 }}>Localisation</label>
                  <input value={form.localisation} onChange={(e) => setForm({ ...form, localisation: e.target.value })} placeholder="Paris 15e..." className="w-full px-4 py-2.5 bg-muted rounded-lg outline-none" />
                </div>
              </div>

              <div>
                <label className="block mb-1.5 text-muted-foreground" style={{ fontSize: 13 }}>Description de l'élève</label>
                <textarea value={form.description_eleve} onChange={(e) => setForm({ ...form, description_eleve: e.target.value })} rows={3} placeholder="Niveau, difficultés, objectifs..." className="w-full px-4 py-2.5 bg-muted rounded-lg outline-none resize-none" />
              </div>

              <div>
                <label className="block mb-1.5 text-muted-foreground" style={{ fontSize: 13 }}>Tags</label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {form.tags.map((tag: string) => (
                    <span key={tag} className="flex items-center gap-1 bg-secondary px-2 py-0.5 rounded text-xs">
                      {tag}
                      <button onClick={() => setForm({ ...form, tags: form.tags.filter((t: string) => t !== tag) })}>
                        <X className="w-3 h-3 text-muted-foreground hover:text-red-500" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input value={newTag} onChange={(e) => setNewTag(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") addTag(); }} placeholder="Ajouter un tag..." className="flex-1 px-3 py-1.5 bg-muted rounded-lg outline-none text-sm" />
                  <button onClick={addTag} className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm hover:opacity-90">+</button>
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.urgent} onChange={(e) => setForm({ ...form, urgent: e.target.checked })} className="w-4 h-4 accent-primary" />
                <span className="text-sm font-medium text-red-600">Marquer comme urgent</span>
              </label>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowPost(false)} className="flex-1 px-4 py-2.5 rounded-lg border border-border hover:bg-muted">Annuler</button>
              <button
                onClick={handlePost}
                disabled={!form.matiere || saving}
                className="flex-1 bg-primary text-primary-foreground px-4 py-2.5 rounded-lg hover:opacity-90 disabled:opacity-40 flex items-center justify-center gap-2"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                Publier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contact modal */}
      {contactModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            {contactSent ? (
              <div className="text-center py-4">
                <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">✓</span>
                </div>
                <p className="font-semibold text-gray-900">Message envoyé !</p>
                <p className="text-sm text-muted-foreground mt-1">{contactModal.prof_nom} sera notifié.</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h3 style={{ fontSize: 16 }}>Contacter {contactModal.prof_nom}</h3>
                  <button onClick={() => setContactModal(null)} className="p-1.5 rounded-lg hover:bg-muted">
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Annonce : <strong>{contactModal.matiere} — {contactModal.niveau_eleve}</strong>
                </p>
                <textarea
                  value={contactMsg}
                  onChange={(e) => setContactMsg(e.target.value)}
                  rows={4}
                  placeholder="Décris-toi et tes disponibilités..."
                  className="w-full px-4 py-3 bg-muted rounded-lg outline-none resize-none text-sm"
                />
                <div className="flex gap-3 mt-4">
                  <button onClick={() => setContactModal(null)} className="flex-1 px-4 py-2 rounded-lg border border-border hover:bg-muted text-sm">Annuler</button>
                  <button onClick={handleContact} disabled={!contactMsg.trim()} className="flex-1 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90 disabled:opacity-40 text-sm">
                    Envoyer
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
    </LoadingGuard>
  );
}
