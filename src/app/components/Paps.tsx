import { useState } from "react";
import { MapPin, Clock, Plus, X, AlertTriangle, Euro, Loader2, Trash2 } from "lucide-react";
import { usePaps } from "../../lib/hooks/usePaps";
import { useAuth } from "../../lib/auth";
import type { AnnonceRow } from "../../lib/hooks/usePaps";

const MATIERES_FILTER = ["Toutes", "Mathématiques", "Physique-Chimie", "SVT", "Français", "Anglais", "Histoire-Géo", "SES", "Philosophie", "Informatique"];
const NIVEAUX_FILTER = ["Tous", "Collège", "Lycée", "Terminale", "BTS", "Licence"];
const MATIERES_FORM = ["Mathématiques", "Physique-Chimie", "SVT", "Français", "Anglais", "Espagnol", "Histoire-Géo", "SES", "Philosophie", "Informatique", "Autre"];
const NIVEAUX_FORM = ["6ème", "5ème", "4ème", "3ème", "2nde", "1ère S", "1ère ES", "Terminale S", "Terminale ES", "BTS", "Licence 1", "Licence 2", "Licence 3", "Autre"];

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

export function Paps() {
  const { annonces, loading, error, createAnnonce, closeAnnonce, isOwn } = usePaps();
  const { profile } = useAuth();

  const [filterMatiere, setFilterMatiere] = useState("Toutes");
  const [filterNiveau, setFilterNiveau] = useState("Tous");
  const [showPost, setShowPost] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [newTag, setNewTag] = useState("");
  const [saving, setSaving] = useState(false);
  const [contactModal, setContactModal] = useState<AnnonceRow | null>(null);
  const [contactMsg, setContactMsg] = useState("");
  const [contactSent, setContactSent] = useState(false);

  const filtered = annonces.filter((a: AnnonceRow) => {
    if (filterMatiere !== "Toutes" && a.matiere !== filterMatiere) return false;
    if (filterNiveau !== "Tous" && !a.niveau_eleve.toLowerCase().includes(filterNiveau.toLowerCase())) return false;
    return true;
  });

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        <Loader2 className="w-6 h-6 animate-spin mr-2" /> Chargement...
      </div>
    );
  }

  if (error) {
    return <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-700">{error}</div>;
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1>PAPS — Échange entre profs</h1>
          <p className="text-muted-foreground mt-1">Transmets un élève à un autre professeur de confiance</p>
        </div>
        <button
          onClick={() => setShowPost(true)}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-lg hover:opacity-90"
        >
          <Plus className="w-4 h-4" />
          Poster un cours
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
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground bg-white rounded-xl border border-border">
          <p className="text-lg font-medium text-gray-700 mb-1">Aucune annonce pour l'instant</p>
          <p className="text-sm">Sois le premier à poster un élève à transmettre</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filtered.map((a: AnnonceRow) => (
            <div key={a.id} className={`bg-white rounded-xl border-2 p-5 hover:shadow-md transition-all ${a.urgent ? "border-red-200" : "border-border"}`}>
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
                  {a.tags.map((tag: string) => (
                    <span key={tag} className="bg-accent text-accent-foreground px-2 py-0.5 rounded text-xs">{tag}</span>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-border">
                <span className="text-xs text-muted-foreground">
                  {a.prof_nom} · {Math.floor((Date.now() - new Date(a.created_at).getTime()) / 86400000)}j
                </span>
                {isOwn(a.id) ? (
                  <button
                    onClick={() => closeAnnonce(a.id)}
                    className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Retirer
                  </button>
                ) : (
                  <button
                    onClick={() => setContactModal(a)}
                    className="bg-primary text-primary-foreground text-xs px-4 py-2 rounded-lg hover:opacity-90"
                  >
                    Je suis disponible
                  </button>
                )}
              </div>
            </div>
          ))}
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
  );
}
