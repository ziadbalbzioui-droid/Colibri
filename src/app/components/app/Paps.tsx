import { useState } from "react";
import { MapPin, Clock, Plus, X, AlertTriangle, Loader2, Trash2, ChevronDown, Mail, Phone, Users, Lock } from "lucide-react";
import { LoadingGuard } from "../layout/LoadingGuard";
import { usePaps } from "../../../lib/hooks/usePaps";
import { useAuth } from "../../../lib/auth";
import type { AnnonceRow, PapsCandidatureWithProfile } from "../../../lib/hooks/usePaps";

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

const MATIERE_STYLE: Record<string, { pill: string; strip: string; abbr: string }> = {
  "Mathématiques":   { pill: "bg-blue-50 text-blue-700",    strip: "bg-blue-500",    abbr: "MA" },
  "Physique-Chimie": { pill: "bg-purple-50 text-purple-700", strip: "bg-purple-500", abbr: "PC" },
  "SVT":             { pill: "bg-emerald-50 text-emerald-700", strip: "bg-emerald-500", abbr: "SV" },
  "Français":        { pill: "bg-orange-50 text-orange-700", strip: "bg-orange-500", abbr: "FR" },
  "Anglais":         { pill: "bg-sky-50 text-sky-700",       strip: "bg-sky-500",    abbr: "EN" },
  "Espagnol":        { pill: "bg-red-50 text-red-700",       strip: "bg-red-500",    abbr: "ES" },
  "Histoire-Géo":    { pill: "bg-amber-50 text-amber-700",   strip: "bg-amber-500",  abbr: "HG" },
  "SES":             { pill: "bg-lime-50 text-lime-700",     strip: "bg-lime-500",   abbr: "SE" },
  "Philosophie":     { pill: "bg-indigo-50 text-indigo-700", strip: "bg-indigo-500", abbr: "PH" },
  "Informatique":    { pill: "bg-teal-50 text-teal-700",     strip: "bg-teal-500",   abbr: "IT" },
};

function getMatiereStyle(matiere: string) {
  return MATIERE_STYLE[matiere] ?? { pill: "bg-slate-100 text-slate-700", strip: "bg-slate-400", abbr: matiere.slice(0, 2).toUpperCase() };
}

function AnnonceCard({ a, onDetail, onContact, applied }: { a: AnnonceRow; onDetail: () => void; onContact: () => void; applied: boolean }) {
  const daysAgo = Math.floor((Date.now() - new Date(a.created_at).getTime()) / 86400000);
  const style = getMatiereStyle(a.matiere);

  return (
    <div
      className={`group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-200 cursor-pointer overflow-hidden flex flex-col ${a.urgent ? "ring-2 ring-red-300" : "border border-slate-100"}`}
      onClick={onDetail}
    >
      <div className={`h-1 ${a.urgent ? "bg-gradient-to-r from-red-500 to-orange-400" : style.strip}`} />
      <div className="p-5 flex flex-col flex-1">
        {a.urgent && (
          <div className="flex items-center gap-1.5 text-red-600 mb-2 text-[11px] font-bold tracking-widest uppercase">
            <AlertTriangle className="w-3.5 h-3.5" /> Urgent
          </div>
        )}

        <div className="flex items-start justify-between gap-2 mb-3">
          <div>
            <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-semibold ${style.pill}`}>{a.matiere}</span>
            <p className="text-sm font-medium text-slate-700 mt-1.5">{a.niveau_eleve}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-2xl font-bold text-slate-900 leading-none">
              {a.prix}<span className="text-sm font-normal text-slate-400 ml-0.5">€/h</span>
            </p>
          </div>
        </div>

        <div className="space-y-1 mb-3">
          {a.localisation && (
            <p className="flex items-center gap-1.5 text-slate-400 text-xs">
              <MapPin className="w-3 h-3 shrink-0" /> {a.localisation}
            </p>
          )}
          {(a.horaires || a.frequence) && (
            <p className="flex items-center gap-1.5 text-slate-400 text-xs">
              <Clock className="w-3 h-3 shrink-0" />
              {[a.horaires, a.frequence].filter(Boolean).join(" · ")}
            </p>
          )}
        </div>

        {a.description_eleve && (
          <p className="text-xs text-slate-500 bg-slate-50 rounded-xl px-3 py-2.5 mb-3 line-clamp-2 leading-relaxed flex-1">
            {a.description_eleve}
          </p>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-auto">
          <div>
            <p className="text-xs font-semibold text-slate-700">{a.prof_nom}</p>
            <p className="text-[11px] text-slate-400">{daysAgo === 0 ? "aujourd'hui" : `il y a ${daysAgo}j`}</p>
          </div>
          {applied ? (
            <span className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl font-semibold">
              ✓ Demande transmise
            </span>
          ) : (
            <button
              onClick={(e) => { e.stopPropagation(); onContact(); }}
              className="bg-slate-900 text-white text-xs px-3.5 py-2 rounded-xl hover:bg-primary transition-colors font-semibold"
            >
              Je suis dispo
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function CandidatureItem({ c }: { c: PapsCandidatureWithProfile }) {
  const date = new Date(c.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
  return (
    <div className="bg-white rounded-xl p-4 border border-slate-100">
      <div className="flex items-center gap-2.5 mb-3">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center shrink-0 text-xs font-bold text-primary">
          {(c.prenom?.[0] ?? "") + (c.nom?.[0] ?? "")}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-slate-900">{c.prenom} {c.nom}</p>
          <p className="text-xs text-slate-400">{date}</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 mb-3">
        {c.email && (
          <a href={`mailto:${c.email}`}
            className="flex items-center gap-1.5 text-xs bg-blue-50 text-blue-700 px-2.5 py-1.5 rounded-lg hover:bg-blue-100 transition-colors font-medium"
            onClick={(e) => e.stopPropagation()}>
            <Mail className="w-3 h-3" /> {c.email}
          </a>
        )}
        {c.telephone && (
          <a href={`tel:${c.telephone}`}
            className="flex items-center gap-1.5 text-xs bg-emerald-50 text-emerald-700 px-2.5 py-1.5 rounded-lg hover:bg-emerald-100 transition-colors font-medium"
            onClick={(e) => e.stopPropagation()}>
            <Phone className="w-3 h-3" /> {c.telephone}
          </a>
        )}
      </div>
      {c.message && (
        <p className="text-sm text-slate-600 bg-slate-50 rounded-xl px-3 py-2.5 border-l-2 border-primary/30 italic leading-relaxed">
          « {c.message} »
        </p>
      )}
    </div>
  );
}

export function Paps() {
  const { annonces, candidatures, appliedIds, loading, error, reload, createAnnonce, closeAnnonce, candidater, isOwn } = usePaps();
  const { profile, user } = useAuth();

  const isMines = !!profile?.etablissement?.toLowerCase().includes("mine");

  const [filterMatiere, setFilterMatiere] = useState("Toutes");
  const [filterNiveau, setFilterNiveau] = useState("Tous");
  const [showPost, setShowPost] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [newTag, setNewTag] = useState("");
  const [saving, setSaving] = useState(false);
  const [contactModal, setContactModal] = useState<AnnonceRow | null>(null);
  const [contactMsg, setContactMsg] = useState("");
  const [contactSending, setContactSending] = useState(false);
  const [contactSent, setContactSent] = useState(false);
  const [detailCard, setDetailCard] = useState<AnnonceRow | null>(null);
  const [expandedAnnonce, setExpandedAnnonce] = useState<string | null>(null);

  const mesAnnonces = annonces.filter((a) => a.prof_id === user?.id);
  const autresAnnonces = annonces.filter((a) => a.prof_id !== user?.id);

  const filtered = autresAnnonces.filter((a) => {
    if (filterMatiere !== "Toutes" && a.matiere !== filterMatiere) return false;
    if (filterNiveau !== "Tous" && !a.niveau_eleve.toLowerCase().includes(filterNiveau.toLowerCase())) return false;
    return true;
  });

  const urgentAnnonces = filtered.filter((a) => a.urgent);
  const normalAnnonces = filtered.filter((a) => !a.urgent);

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

  async function handleContact() {
    if (!contactModal || !contactMsg.trim()) return;
    setContactSending(true);
    try {
      await candidater(contactModal.id, contactMsg.trim());
      setContactSent(true);
      setTimeout(() => {
        setContactModal(null);
        setContactMsg("");
        setContactSent(false);
      }, 2000);
    } catch (e) {
      console.error(e);
    } finally {
      setContactSending(false);
    }
  }

  return (
    <LoadingGuard loading={loading} error={error} onRetry={reload}>
    <div className="max-w-5xl mx-auto">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-bold text-slate-900">PAPS</h1>
            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-semibold">Mineurs</span>
          </div>
          <p className="text-slate-500 text-sm">Transmets un élève à un collègue de confiance dans ton réseau.</p>
          {annonces.length > 0 && (
            <p className="text-xs text-slate-400 mt-1">
              {annonces.length} annonce{annonces.length > 1 ? "s" : ""}
              {urgentAnnonces.length > 0 && ` · ${urgentAnnonces.length} urgente${urgentAnnonces.length > 1 ? "s" : ""}`}
            </p>
          )}
        </div>
        {isMines && (
          <button
            onClick={() => setShowPost(true)}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-lg hover:opacity-90 shadow-sm shrink-0 text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Poster une annonce
          </button>
        )}
      </div>

      {/* ── Locked state ── */}
      {!isMines && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-7 h-7 text-slate-400" />
          </div>
          <p className="text-lg font-bold text-slate-900 mb-1">Accès réservé aux Mineurs</p>
          <p className="text-sm text-slate-500 max-w-xs mx-auto leading-relaxed">
            PAPS est exclusif aux professeurs diplômés de l'École des Mines de Paris.
          </p>
        </div>
      )}

      {/* ── Main content ── */}
      {isMines && (
        <>
          {/* Mes annonces */}
          {mesAnnonces.length > 0 && (
            <section className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-xs font-bold text-slate-900 uppercase tracking-widest">Mes annonces</h2>
                <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-0.5 rounded-full">{mesAnnonces.length}</span>
              </div>
              <div className="space-y-2">
                {mesAnnonces.map((annonce) => {
                  const cands = candidatures[annonce.id] ?? [];
                  const isExpanded = expandedAnnonce === annonce.id;
                  const style = getMatiereStyle(annonce.matiere);
                  return (
                    <div key={annonce.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                      <button
                        className="w-full text-left p-4 flex items-center gap-4 hover:bg-slate-50/80 transition-colors"
                        onClick={() => setExpandedAnnonce(isExpanded ? null : annonce.id)}
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-[11px] font-black ${style.pill}`}>
                          {style.abbr}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                            <p className="font-semibold text-sm text-slate-900">{annonce.matiere}</p>
                            <span className="text-slate-300 text-xs">·</span>
                            <p className="text-sm text-slate-500">{annonce.niveau_eleve}</p>
                            {annonce.urgent && (
                              <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wide">Urgent</span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400">
                            {[annonce.localisation, `${annonce.prix}€/h`].filter(Boolean).join(" · ")}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          {cands.length > 0 ? (
                            <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-2.5 py-1.5 rounded-xl text-xs font-bold">
                              <Users className="w-3 h-3" />
                              {cands.length} candidature{cands.length > 1 ? "s" : ""}
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400">En attente…</span>
                          )}
                          <button
                            onClick={(e) => { e.stopPropagation(); closeAnnonce(annonce.id); }}
                            className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                            title="Retirer l'annonce"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="border-t border-slate-100 p-4 bg-slate-50/50">
                          {cands.length === 0 ? (
                            <div className="text-center py-6">
                              <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                              <p className="text-sm text-slate-400">Aucune candidature pour l'instant</p>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {cands.map((c) => <CandidatureItem key={c.id} c={c} />)}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Section divider */}
          {mesAnnonces.length > 0 && (
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 h-px bg-slate-100" />
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em]">Toutes les annonces</span>
              <div className="flex-1 h-px bg-slate-100" />
            </div>
          )}

          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-6">
            <select value={filterMatiere} onChange={(e) => setFilterMatiere(e.target.value)}
              className="px-4 py-2 bg-white border border-slate-200 rounded-xl outline-none text-sm text-slate-700 shadow-sm">
              {MATIERES_FILTER.map((m) => <option key={m}>{m}</option>)}
            </select>
            <select value={filterNiveau} onChange={(e) => setFilterNiveau(e.target.value)}
              className="px-4 py-2 bg-white border border-slate-200 rounded-xl outline-none text-sm text-slate-700 shadow-sm">
              {NIVEAUX_FILTER.map((n) => <option key={n}>{n}</option>)}
            </select>
          </div>

          {/* Cards grid */}
          {filtered.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-slate-400" />
              </div>
              <p className="font-semibold text-slate-700 mb-1">Aucune annonce</p>
              <p className="text-sm text-slate-400 mb-5">Sois le premier à poster une annonce</p>
              <button onClick={() => setShowPost(true)}
                className="inline-flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl hover:bg-primary transition-colors text-sm font-semibold">
                <Plus className="w-4 h-4" /> Poster une annonce
              </button>
            </div>
          ) : (
            <>
              {urgentAnnonces.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                    <span className="text-[11px] font-bold text-red-600 uppercase tracking-widest">Urgent</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {urgentAnnonces.map((a) => (
                      <AnnonceCard key={a.id} a={a} applied={appliedIds.has(a.id)} onDetail={() => setDetailCard(a)} onContact={() => setContactModal(a)} />
                    ))}
                  </div>
                </div>
              )}
              {normalAnnonces.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {normalAnnonces.map((a) => (
                    <AnnonceCard key={a.id} a={a} applied={appliedIds.has(a.id)} onDetail={() => setDetailCard(a)} onContact={() => setContactModal(a)} />
                  ))}
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* ── Detail modal ── */}
      {detailCard && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className={`h-1.5 ${getMatiereStyle(detailCard.matiere).strip}`} />
            <div className="p-6">
              <div className="flex items-start justify-between gap-3 mb-5">
                <div className="flex items-center gap-2 flex-wrap">
                  {detailCard.urgent && (
                    <span className="flex items-center gap-1 text-[10px] bg-red-100 text-red-600 px-2 py-1 rounded-md font-bold uppercase tracking-wide">
                      <AlertTriangle className="w-3 h-3" /> Urgent
                    </span>
                  )}
                  <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-semibold ${getMatiereStyle(detailCard.matiere).pill}`}>{detailCard.matiere}</span>
                  <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg font-medium">{detailCard.niveau_eleve}</span>
                </div>
                <button onClick={() => setDetailCard(null)} className="p-2 rounded-xl hover:bg-slate-100 transition-colors shrink-0">
                  <X className="w-4 h-4 text-slate-500" />
                </button>
              </div>

              <p className="text-4xl font-black text-slate-900 mb-5">
                {detailCard.prix}<span className="text-xl font-normal text-slate-400 ml-1">€/h</span>
              </p>

              <div className="space-y-2 mb-5">
                {detailCard.localisation && (
                  <p className="flex items-center gap-2 text-sm text-slate-600">
                    <MapPin className="w-4 h-4 text-slate-400 shrink-0" /> {detailCard.localisation}
                  </p>
                )}
                {(detailCard.horaires || detailCard.frequence) && (
                  <p className="flex items-center gap-2 text-sm text-slate-600">
                    <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                    {[detailCard.horaires, detailCard.frequence].filter(Boolean).join(" · ")}
                  </p>
                )}
              </div>

              {detailCard.description_eleve && (
                <div className="bg-slate-50 rounded-xl px-4 py-3.5 mb-5">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Description de l'élève</p>
                  <p className="text-sm text-slate-700 leading-relaxed">{detailCard.description_eleve}</p>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <div>
                  <p className="text-sm font-semibold text-slate-800">{detailCard.prof_nom}</p>
                  <p className="text-xs text-slate-400">
                    {Math.floor((Date.now() - new Date(detailCard.created_at).getTime()) / 86400000) === 0
                      ? "Posté aujourd'hui"
                      : `Posté il y a ${Math.floor((Date.now() - new Date(detailCard.created_at).getTime()) / 86400000)}j`}
                  </p>
                </div>
                {!isOwn(detailCard.id) && (
                  appliedIds.has(detailCard.id) ? (
                    <span className="flex items-center gap-1.5 text-sm text-emerald-700 bg-emerald-50 px-4 py-2.5 rounded-xl font-semibold">
                      ✓ Demande transmise
                    </span>
                  ) : (
                    <button
                      onClick={() => { setContactModal(detailCard); setDetailCard(null); }}
                      className="bg-slate-900 text-white text-sm px-5 py-2.5 rounded-xl hover:bg-primary transition-colors font-semibold"
                    >
                      Je suis disponible →
                    </button>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Post modal ── */}
      {showPost && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto flex flex-col">
            <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
              <h3 className="font-bold text-slate-900">Poster une annonce</h3>
              <button onClick={() => setShowPost(false)} className="p-2 rounded-xl hover:bg-slate-100 transition-colors">
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1.5 text-xs font-bold text-slate-500 uppercase tracking-wide">Matière</label>
                  <select value={form.matiere} onChange={(e) => setForm({ ...form, matiere: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm">
                    {MATIERES_FORM.map((m) => <option key={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block mb-1.5 text-xs font-bold text-slate-500 uppercase tracking-wide">Niveau élève</label>
                  <select value={form.niveau_eleve} onChange={(e) => setForm({ ...form, niveau_eleve: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm">
                    {NIVEAUX_FORM.map((n) => <option key={n}>{n}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1.5 text-xs font-bold text-slate-500 uppercase tracking-wide">Prix (€/h)</label>
                  <input type="number" value={form.prix} onChange={(e) => setForm({ ...form, prix: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm" />
                </div>
                <div>
                  <label className="block mb-1.5 text-xs font-bold text-slate-500 uppercase tracking-wide">Fréquence</label>
                  <input value={form.frequence} onChange={(e) => setForm({ ...form, frequence: e.target.value })}
                    placeholder="1x/semaine…"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1.5 text-xs font-bold text-slate-500 uppercase tracking-wide">Horaires</label>
                  <input value={form.horaires} onChange={(e) => setForm({ ...form, horaires: e.target.value })}
                    placeholder="Mercredi 16h…"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm" />
                </div>
                <div>
                  <label className="block mb-1.5 text-xs font-bold text-slate-500 uppercase tracking-wide">Localisation</label>
                  <input value={form.localisation} onChange={(e) => setForm({ ...form, localisation: e.target.value })}
                    placeholder="Paris 15e…"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm" />
                </div>
              </div>

              <div>
                <label className="block mb-1.5 text-xs font-bold text-slate-500 uppercase tracking-wide">Description de l'élève</label>
                <textarea value={form.description_eleve} onChange={(e) => setForm({ ...form, description_eleve: e.target.value })}
                  rows={3} placeholder="Niveau, difficultés, objectifs…"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none resize-none text-sm" />
              </div>

              <div>
                <label className="block mb-1.5 text-xs font-bold text-slate-500 uppercase tracking-wide">Tags</label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {form.tags.map((tag: string) => (
                    <span key={tag} className="flex items-center gap-1 bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg text-xs font-medium">
                      {tag}
                      <button onClick={() => setForm({ ...form, tags: form.tags.filter((t: string) => t !== tag) })}>
                        <X className="w-3 h-3 text-slate-400 hover:text-red-500" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input value={newTag} onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") addTag(); }}
                    placeholder="Ajouter un tag…"
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm" />
                  <button onClick={addTag} className="px-3 py-2 bg-slate-900 text-white rounded-xl text-sm hover:bg-primary transition-colors font-bold">+</button>
                </div>
              </div>

              <label className="flex items-start gap-3 p-3.5 bg-red-50 rounded-xl cursor-pointer border border-red-100 hover:bg-red-100/70 transition-colors">
                <input type="checkbox" checked={form.urgent} onChange={(e) => setForm({ ...form, urgent: e.target.checked })}
                  className="w-4 h-4 accent-red-600 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-red-700">Marquer comme urgent</p>
                  <p className="text-xs text-red-400 mt-0.5">L'annonce apparaîtra en haut avec un badge rouge</p>
                </div>
              </label>
            </div>
            <div className="sticky bottom-0 bg-white border-t border-slate-100 px-6 py-4 flex gap-3 rounded-b-2xl">
              <button onClick={() => setShowPost(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-sm font-medium transition-colors">
                Annuler
              </button>
              <button
                onClick={handlePost}
                disabled={!form.matiere || saving}
                className="flex-1 bg-slate-900 text-white px-4 py-2.5 rounded-xl hover:bg-primary transition-colors disabled:opacity-40 flex items-center justify-center gap-2 text-sm font-semibold"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                Publier l'annonce
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Contact modal ── */}
      {contactModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            {contactSent ? (
              <div className="text-center py-14 px-6">
                <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">✓</span>
                </div>
                <p className="font-bold text-slate-900 text-lg mb-1">Candidature envoyée !</p>
                <p className="text-sm text-slate-500">{contactModal.prof_nom} peut maintenant voir tes coordonnées.</p>
              </div>
            ) : (
              <>
                <div className={`h-1 ${getMatiereStyle(contactModal.matiere).strip}`} />
                <div className="p-6">
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div>
                      <h3 className="font-bold text-slate-900">Je suis disponible</h3>
                      <p className="text-sm text-slate-500 mt-0.5">{contactModal.matiere} · {contactModal.niveau_eleve}</p>
                    </div>
                    <button onClick={() => setContactModal(null)} className="p-2 rounded-xl hover:bg-slate-100 transition-colors">
                      <X className="w-4 h-4 text-slate-500" />
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 bg-slate-50 rounded-xl px-3 py-2.5 mb-4">
                    Ton nom, email et téléphone seront partagés avec <strong className="text-slate-700">{contactModal.prof_nom}</strong>.
                  </p>
                  <textarea
                    value={contactMsg}
                    onChange={(e) => setContactMsg(e.target.value)}
                    rows={4}
                    placeholder="Présente-toi et décris tes disponibilités…"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none resize-none text-sm"
                  />
                  <div className="flex gap-3 mt-4">
                    <button onClick={() => setContactModal(null)}
                      className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-sm transition-colors">
                      Annuler
                    </button>
                    <button
                      onClick={handleContact}
                      disabled={!contactMsg.trim() || contactSending}
                      className="flex-1 bg-slate-900 text-white px-4 py-2.5 rounded-xl hover:bg-primary transition-colors disabled:opacity-40 text-sm font-semibold flex items-center justify-center gap-2"
                    >
                      {contactSending && <Loader2 className="w-4 h-4 animate-spin" />}
                      Envoyer ma candidature
                    </button>
                  </div>
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
