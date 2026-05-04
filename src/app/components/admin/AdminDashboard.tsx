import React, { useEffect, useState } from "react";
import {
  GraduationCap, Users, BookOpen, AlertTriangle, Banknote, LogOut,
  Search, ClipboardList, X, Check, Pencil, Loader2, Megaphone, Plus, Trash2, Copy, RotateCcw, Link2,
} from "lucide-react";
import { supabase } from "../../../lib/supabase";
import { useAuth } from "../../../lib/auth";
import logo from "@/assets/colibri.png";
import { ProfFicheModal } from "./ProfFicheModal";
import { CreateRecapModal } from "./CreateRecapModal";
import { AdminSearch } from "./AdminSearch";
import { AdminOrphelins } from "./AdminOrphelins";

const PROF_MULTIPLIER = parseFloat(import.meta.env.VITE_COLIBRI_PROF_MULTIPLIER ?? "1.25");
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;

interface ProfPaiement {
  prof_id: string; prenom: string; nom: string; iban: string | null;
  recap_ids: string[]; montant_brut: number; montant_net: number; mois_annees: string[];
}
type DispatchState = "idle" | "loading" | "success" | "error";
type Section = "paiements" | "profs" | "eleves" | "cours" | "recaps" | "contestations" | "paps" | "search" | "orphelins";

const NAV: { key: Section; label: string; Icon: React.ElementType }[] = [
  { key: "paiements",     label: "Dispatch paiements", Icon: Banknote },
  { key: "profs",         label: "Profs",              Icon: GraduationCap },
  { key: "eleves",        label: "Élèves",             Icon: Users },
  { key: "cours",         label: "Cours",              Icon: BookOpen },
  { key: "recaps",        label: "Récaps mensuels",    Icon: ClipboardList },
  { key: "contestations", label: "Contestations",      Icon: AlertTriangle },
  { key: "paps",          label: "PAPS",               Icon: Megaphone },
  { key: "search",        label: "Recherche globale",  Icon: Search },
  { key: "orphelins",    label: "Cours orphelins",    Icon: Link2 },
];

const MOIS_LABELS = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];
const MATIERES_FORM = ["Mathématiques","Physique-Chimie","SVT","Français","Anglais","Espagnol","Histoire-Géo","SES","Philosophie","Informatique","Autre"];
const NIVEAUX_FORM  = ["6ème","5ème","4ème","3ème","2nde","1ère S","1ère ES","Terminale S","Terminale ES","BTS","Licence 1","Licence 2","Licence 3","Autre"];

const RECAP_STATUTS = ["en_cours","en_attente_parent","en_attente_paiement","valide","paye"] as const;
const RECAP_STATUT_STYLE: Record<string, { bg: string; label: string }> = {
  en_cours:            { bg: "bg-blue-100 text-blue-700",     label: "En cours" },
  en_attente_parent:   { bg: "bg-amber-100 text-amber-700",   label: "En attente parent" },
  en_attente_paiement: { bg: "bg-purple-100 text-purple-700", label: "En attente paiement" },
  valide:              { bg: "bg-emerald-100 text-emerald-700",label: "Validé" },
  paye:                { bg: "bg-teal-100 text-teal-700",      label: "Payé" },
};
const VALIDATION_STATUT_STYLE: Record<string, { bg: string; label: string }> = {
  en_attente_parent:     { bg: "bg-amber-100 text-amber-700",    label: "En attente" },
  en_attente_validation: { bg: "bg-blue-100 text-blue-700",      label: "En validation" },
  valide:                { bg: "bg-emerald-100 text-emerald-700", label: "Validé" },
  conteste:              { bg: "bg-red-100 text-red-700",         label: "Contesté" },
};

// ── Shared UI ─────────────────────────────────────────────────────────────────

function SearchInput({ value, onChange, placeholder, className }: {
  value: string; onChange: (v: string) => void; placeholder?: string; className?: string;
}) {
  return (
    <div className={`relative ${className ?? "mb-5 max-w-xs"}`}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder ?? "Rechercher…"}
        className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-200 rounded-xl outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 placeholder:text-slate-400" />
    </div>
  );
}

function CopyID({ id }: { id: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard.writeText(id); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
      title={id} className="font-mono text-[10px] text-slate-400 hover:text-primary transition-colors flex items-center gap-1 group">
      <span>{id.slice(0, 8)}</span>
      {copied ? <Check className="w-2.5 h-2.5 text-emerald-500" /> : <Copy className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />}
    </button>
  );
}

function AdminEditModal({ title, onClose, onSave, saving, children }: {
  title: string; onClose: () => void; onSave: () => void; saving: boolean; children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] px-4 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="border-b border-slate-100 px-5 py-3.5 flex items-center justify-between">
          <span className="font-mono text-xs font-bold text-slate-500 uppercase tracking-wide">{title}</span>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"><X className="w-3.5 h-3.5 text-slate-400" /></button>
        </div>
        <div className="p-5 space-y-3.5">{children}</div>
        <div className="border-t border-slate-100 px-5 py-3.5 flex gap-2.5">
          <button onClick={onClose} className="flex-1 px-4 py-2 text-sm font-medium border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">Annuler</button>
          <button onClick={onSave} disabled={saving}
            className="flex-1 px-4 py-2 text-sm font-semibold bg-slate-900 text-white rounded-xl hover:bg-primary disabled:opacity-50 flex items-center justify-center gap-2 transition-colors">
            {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}

const FL = "block mb-1 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wide";
const FI = "w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-primary";
const FS = "w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-primary";

const TH = "text-left px-3 py-2.5 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wide whitespace-nowrap";
const TD = "px-3 py-2.5 text-sm";

// ── AdminProfs ────────────────────────────────────────────────────────────────
function AdminProfs() {
  const [profs, setProfs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<any | null>(null);
  const [editF, setEditF] = useState({ siret: "", iban: "" });
  const [saving, setSaving] = useState(false);
  const [ficheProf, setFicheProf] = useState<any | null>(null);

  async function load() {
    const { data } = await supabase.from("profiles")
      .select("id, prenom, nom, email, siret, iban, role, created_at")
      .eq("role", "prof").order("created_at", { ascending: false });
    setProfs(data ?? []); setLoading(false);
  }
  useEffect(() => { load(); }, []);

  function openEdit(p: any) { setEditing(p); setEditF({ siret: p.siret ?? "", iban: p.iban ?? "" }); }

  async function saveEdit() {
    if (!editing) return;
    setSaving(true);
    await supabase.from("profiles").update({ siret: editF.siret || null, iban: editF.iban || null }).eq("id", editing.id);
    setProfs((prev) => prev.map((p) => p.id === editing.id ? { ...p, ...editF } : p));
    setSaving(false); setEditing(null);
  }

  async function deleteProf(p: any) {
    if (!window.confirm(`ATTENTION : supprimer ${p.prenom} ${p.nom} supprimera aussi tous ses élèves et cours (cascade). Continuer ?`)) return;
    if (!window.confirm("Dernière confirmation — action irréversible.")) return;
    await supabase.from("profiles").delete().eq("id", p.id);
    setProfs((prev) => prev.filter((x) => x.id !== p.id));
  }

  const filtered = profs.filter((p) => `${p.prenom} ${p.nom} ${p.email}`.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div><h1 className="text-xl font-bold text-slate-900">Profs</h1><p className="text-xs font-mono text-slate-400 mt-0.5">{profs.length} rows · profiles WHERE role='prof'</p></div>
      </div>
      <SearchInput value={search} onChange={setSearch} placeholder="Rechercher…" />
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(15,23,42,.06)" }}>
        {loading ? <div className="p-8 text-center text-slate-400 text-sm">Chargement…</div> : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr><th className={TH}>id</th><th className={TH}>prenom / nom</th><th className={TH}>email</th><th className={TH}>siret</th><th className={TH}>iban</th><th className={TH}>created_at</th><th className={TH}>actions</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className={TD}><CopyID id={p.id} /></td>
                  <td className={`${TD} font-medium text-slate-900`}>
                    <button onClick={() => setFicheProf(p)} className="hover:text-primary hover:underline transition-colors text-left">{p.prenom} {p.nom}</button>
                  </td>
                  <td className={`${TD} text-slate-500 font-mono text-xs`}>{p.email}</td>
                  <td className={TD}>
                    {p.siret ? <span className="font-mono text-xs text-slate-600">{p.siret}</span>
                      : <span className="text-xs bg-amber-100 text-amber-700 font-semibold px-2 py-0.5 rounded-full">null</span>}
                  </td>
                  <td className={TD}>
                    {p.iban ? <span className="font-mono text-xs text-slate-600">{p.iban.slice(0, 8)}…</span>
                      : <span className="text-xs bg-amber-100 text-amber-700 font-semibold px-2 py-0.5 rounded-full">null</span>}
                  </td>
                  <td className={`${TD} font-mono text-xs text-slate-400`}>{new Date(p.created_at).toLocaleDateString("fr-FR")}</td>
                  <td className={TD}>
                    <div className="flex gap-1.5">
                      <button onClick={() => openEdit(p)} className="flex items-center gap-1 px-2 py-1 text-xs font-semibold bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"><Pencil className="w-3 h-3" /> Edit</button>
                      <button onClick={() => deleteProf(p)} className="flex items-center gap-1 px-2 py-1 text-xs font-semibold bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"><Trash2 className="w-3 h-3" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={7} className="p-8 text-center text-slate-400">Aucun résultat.</td></tr>}
            </tbody>
          </table>
        )}
      </div>

      {editing && (
        <AdminEditModal title={`EDIT profiles · ${editing.id.slice(0,8)}`} onClose={() => setEditing(null)} onSave={saveEdit} saving={saving}>
          <div><label className={FL}>siret</label><input value={editF.siret} onChange={(e) => setEditF({ ...editF, siret: e.target.value })} placeholder="null" className={FI} /></div>
          <div><label className={FL}>iban</label><input value={editF.iban} onChange={(e) => setEditF({ ...editF, iban: e.target.value })} placeholder="null" className={FI} /></div>
          <p className="text-xs text-slate-400 font-mono">UPDATE profiles SET siret=?, iban=? WHERE id='{editing.id}'</p>
        </AdminEditModal>
      )}
      {ficheProf && <ProfFicheModal prof={ficheProf} onClose={() => setFicheProf(null)} />}
    </div>
  );
}

// ── AdminEleves ───────────────────────────────────────────────────────────────
function AdminEleves() {
  const [eleves, setEleves] = useState<any[]>([]);
  const [profsList, setProfsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<any | null>(null);
  const [editF, setEditF] = useState({ nom: "", niveau: "", matiere: "", tarif_heure: "", statut: "", prof_id: "" });
  const [saving, setSaving] = useState(false);

  async function load() {
    const [{ data: el }, { data: pr }] = await Promise.all([
      supabase.from("eleves").select("id, nom, niveau, matiere, statut, tarif_heure, prof_id, created_at, profiles!eleves_prof_id_fkey(prenom, nom)").order("created_at", { ascending: false }),
      supabase.from("profiles").select("id, prenom, nom").eq("role", "prof").order("nom"),
    ]);
    setEleves(el ?? []); setProfsList(pr ?? []); setLoading(false);
  }
  useEffect(() => { load(); }, []);

  function openEdit(e: any) {
    setEditing(e);
    setEditF({ nom: e.nom, niveau: e.niveau ?? "", matiere: e.matiere ?? "", tarif_heure: String(e.tarif_heure ?? ""), statut: e.statut ?? "", prof_id: e.prof_id ?? "" });
  }

  async function saveEdit() {
    if (!editing) return;
    setSaving(true);
    await supabase.from("eleves").update({
      nom: editF.nom, niveau: editF.niveau, matiere: editF.matiere,
      tarif_heure: parseFloat(editF.tarif_heure), statut: editF.statut,
      prof_id: editF.prof_id || null,
    }).eq("id", editing.id);
    await load();
    setSaving(false); setEditing(null);
  }

  async function updateStatut(id: string, statut: string) {
    await supabase.from("eleves").update({ statut }).eq("id", id);
    setEleves((prev) => prev.map((e) => e.id === id ? { ...e, statut } : e));
  }

  async function deleteEleve(e: any) {
    if (!window.confirm(`Supprimer l'élève ${e.nom} ? Ses cours resteront mais eleve_id sera mis à null.`)) return;
    await supabase.from("eleves").delete().eq("id", e.id);
    setEleves((prev) => prev.filter((x) => x.id !== e.id));
  }

  const filtered = eleves.filter((e) => `${e.nom} ${e.matiere} ${e.niveau}`.toLowerCase().includes(search.toLowerCase()));
  const STATUTS_ELEVE = ["actif","en pause","en attente","terminé"];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div><h1 className="text-xl font-bold text-slate-900">Élèves</h1><p className="text-xs font-mono text-slate-400 mt-0.5">{eleves.length} rows · eleves</p></div>
      </div>
      <SearchInput value={search} onChange={setSearch} placeholder="Rechercher…" />
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(15,23,42,.06)" }}>
        {loading ? <div className="p-8 text-center text-slate-400 text-sm">Chargement…</div> : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr><th className={TH}>id</th><th className={TH}>nom</th><th className={TH}>niveau</th><th className={TH}>matiere</th><th className={TH}>tarif_heure</th><th className={TH}>statut</th><th className={TH}>prof</th><th className={TH}>actions</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((e) => (
                <tr key={e.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className={TD}><CopyID id={e.id} /></td>
                  <td className={`${TD} font-medium text-slate-900`}>{e.nom}</td>
                  <td className={`${TD} text-slate-500`}>{e.niveau}</td>
                  <td className={`${TD} text-slate-500`}>{e.matiere}</td>
                  <td className={`${TD} font-mono text-slate-700`}>{e.tarif_heure} €/h</td>
                  <td className={TD}>
                    <select value={e.statut} onChange={(ev) => updateStatut(e.id, ev.target.value)}
                      className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border-0 cursor-pointer outline-none">
                      {STATUTS_ELEVE.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className={`${TD} text-slate-500 text-xs`}>{e.profiles ? `${e.profiles.prenom} ${e.profiles.nom}` : <span className="text-slate-300 font-mono">null</span>}</td>
                  <td className={TD}>
                    <div className="flex gap-1.5">
                      <button onClick={() => openEdit(e)} className="flex items-center gap-1 px-2 py-1 text-xs font-semibold bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"><Pencil className="w-3 h-3" /> Edit</button>
                      <button onClick={() => deleteEleve(e)} className="flex items-center gap-1 px-2 py-1 text-xs font-semibold bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"><Trash2 className="w-3 h-3" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={8} className="p-8 text-center text-slate-400">Aucun résultat.</td></tr>}
            </tbody>
          </table>
        )}
      </div>

      {editing && (
        <AdminEditModal title={`EDIT eleves · ${editing.id.slice(0,8)}`} onClose={() => setEditing(null)} onSave={saveEdit} saving={saving}>
          <div className="grid grid-cols-2 gap-3">
            <div><label className={FL}>nom</label><input value={editF.nom} onChange={(e) => setEditF({ ...editF, nom: e.target.value })} className={FI} /></div>
            <div><label className={FL}>tarif_heure</label><input type="number" value={editF.tarif_heure} onChange={(e) => setEditF({ ...editF, tarif_heure: e.target.value })} className={FI} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className={FL}>niveau</label><input value={editF.niveau} onChange={(e) => setEditF({ ...editF, niveau: e.target.value })} className={FI} /></div>
            <div><label className={FL}>matiere</label><input value={editF.matiere} onChange={(e) => setEditF({ ...editF, matiere: e.target.value })} className={FI} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={FL}>statut</label>
              <select value={editF.statut} onChange={(e) => setEditF({ ...editF, statut: e.target.value })} className={FS}>
                {STATUTS_ELEVE.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className={FL}>prof_id</label>
              <select value={editF.prof_id} onChange={(e) => setEditF({ ...editF, prof_id: e.target.value })} className={FS}>
                <option value="">— null —</option>
                {profsList.map((p) => <option key={p.id} value={p.id}>{p.prenom} {p.nom}</option>)}
              </select>
            </div>
          </div>
          <p className="text-xs text-slate-400 font-mono">UPDATE eleves SET … WHERE id='{editing.id}'</p>
        </AdminEditModal>
      )}
    </div>
  );
}

// ── AdminCours ────────────────────────────────────────────────────────────────
function AdminCours() {
  const [cours, setCours] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatut, setFilterStatut] = useState("tous");
  const [filterYear, setFilterYear]  = useState("tous");
  const [filterMonth, setFilterMonth] = useState("tous");
  const [editing, setEditing] = useState<any | null>(null);
  const [editF, setEditF] = useState({ eleve_nom: "", matiere: "", date: "", duree: "", duree_heures: "", montant: "", statut: "", recap_id: "" });
  const [saving, setSaving] = useState(false);
  const [bulkSelected, setBulkSelected] = useState<Set<string>>(new Set());
  const [bulkStatut, setBulkStatut] = useState("déclaré");
  const [bulkRecapId, setBulkRecapId] = useState("");
  const [bulkLoading, setBulkLoading] = useState(false);
  const [profsList, setProfsList] = useState<any[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [createF, setCreateF] = useState({ prof_id: "", eleve_nom: "", matiere: "", date: "", duree: "", duree_heures: "", montant: "", statut: "déclaré" });
  const [createSaving, setCreateSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const [{ data: c }, { data: p }] = await Promise.all([
        supabase.from("cours")
          .select("id, eleve_id, eleve_nom, matiere, date, duree, duree_heures, montant, statut, recap_id, prof_id, created_at, profiles!cours_prof_id_fkey(prenom, nom)")
          .order("date", { ascending: false }).limit(500),
        supabase.from("profiles").select("id, prenom, nom").eq("role", "prof").order("nom"),
      ]);
      setCours(c ?? []); setProfsList(p ?? []); setLoading(false);
    })();
  }, []);

  const years = [...new Set(cours.map((c) => c.date.slice(0, 4)))].sort((a, b) => b.localeCompare(a));
  const availableMonths = filterYear === "tous"
    ? [...Array(12)].map((_, i) => String(i + 1))
    : [...new Set(cours.filter((c) => c.date.startsWith(filterYear)).map((c) => String(Number(c.date.slice(5, 7)))))].sort((a, b) => Number(a) - Number(b));

  const filtered = cours.filter((c) => {
    if (filterStatut !== "tous" && c.statut !== filterStatut) return false;
    if (filterYear  !== "tous" && !c.date.startsWith(filterYear)) return false;
    if (filterMonth !== "tous" && Number(c.date.slice(5, 7)) !== Number(filterMonth)) return false;
    const q = search.toLowerCase();
    return !q || `${c.eleve_nom} ${c.matiere}`.toLowerCase().includes(q);
  });

  async function updateStatut(id: string, statut: string) {
    await supabase.from("cours").update({ statut }).eq("id", id);
    setCours((prev) => prev.map((c) => c.id === id ? { ...c, statut } : c));
  }

  function toggleBulk(id: string) {
    setBulkSelected((prev) => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
  }
  function toggleAllBulk() {
    if (bulkSelected.size === filtered.length) setBulkSelected(new Set());
    else setBulkSelected(new Set(filtered.map((c) => c.id)));
  }
  async function bulkChangeStatut() {
    if (!bulkSelected.size || !window.confirm(`Changer ${bulkSelected.size} cours en "${bulkStatut}" ?`)) return;
    setBulkLoading(true);
    const ids = [...bulkSelected];
    await supabase.from("cours").update({ statut: bulkStatut }).in("id", ids);
    setCours((prev) => prev.map((c) => bulkSelected.has(c.id) ? { ...c, statut: bulkStatut } : c));
    setBulkSelected(new Set()); setBulkLoading(false);
  }
  async function bulkReassignRecap() {
    if (!bulkSelected.size) return;
    const newId = bulkRecapId.trim() || null;
    if (!window.confirm(`Réassigner ${bulkSelected.size} cours à recap_id = ${newId ?? "null"} ?`)) return;
    setBulkLoading(true);
    const ids = [...bulkSelected];
    await supabase.from("cours").update({ recap_id: newId }).in("id", ids);
    setCours((prev) => prev.map((c) => bulkSelected.has(c.id) ? { ...c, recap_id: newId } : c));
    setBulkSelected(new Set()); setBulkLoading(false);
  }
  async function bulkDelete() {
    if (!bulkSelected.size || !window.confirm(`Supprimer ${bulkSelected.size} cours ? Action irréversible.`)) return;
    if (!window.confirm("Dernière confirmation.")) return;
    setBulkLoading(true);
    const ids = [...bulkSelected];
    await supabase.from("cours").delete().in("id", ids);
    setCours((prev) => prev.filter((c) => !bulkSelected.has(c.id)));
    setBulkSelected(new Set()); setBulkLoading(false);
  }

  function openEdit(c: any) {
    setEditing(c);
    setEditF({ eleve_nom: c.eleve_nom, matiere: c.matiere, date: c.date, duree: c.duree, duree_heures: String(c.duree_heures), montant: String(c.montant), statut: c.statut, recap_id: c.recap_id ?? "" });
  }

  async function saveEdit() {
    if (!editing) return;
    setSaving(true);
    const newRecapId = editF.recap_id.trim() || null;
    await supabase.from("cours").update({
      eleve_nom: editF.eleve_nom, matiere: editF.matiere, date: editF.date,
      duree: editF.duree, duree_heures: parseFloat(editF.duree_heures),
      montant: parseFloat(editF.montant), statut: editF.statut,
      recap_id: newRecapId,
    }).eq("id", editing.id);
    setCours((prev) => prev.map((c) => c.id === editing.id ? { ...c, ...editF, duree_heures: parseFloat(editF.duree_heures), montant: parseFloat(editF.montant), recap_id: newRecapId } : c));
    setSaving(false); setEditing(null);
  }

  async function deleteCours(c: any) {
    if (!window.confirm(`Supprimer ce cours (${c.eleve_nom} · ${c.date}) ? recap_id de ce cours sera perdu.`)) return;
    await supabase.from("cours").delete().eq("id", c.id);
    setCours((prev) => prev.filter((x) => x.id !== c.id));
  }

  async function handleCreateCours() {
    if (!createF.eleve_nom || !createF.date || !createF.montant) return;
    setCreateSaving(true);
    const { data: newC } = await supabase.from("cours").insert({
      prof_id: createF.prof_id || null,
      eleve_nom: createF.eleve_nom,
      matiere: createF.matiere,
      date: createF.date,
      duree: createF.duree,
      duree_heures: parseFloat(createF.duree_heures) || 0,
      montant: parseFloat(createF.montant),
      statut: createF.statut,
    }).select("id, eleve_id, eleve_nom, matiere, date, duree, duree_heures, montant, statut, recap_id, prof_id, created_at, profiles!cours_prof_id_fkey(prenom, nom)").single();
    if (newC) setCours((prev) => [newC, ...prev]);
    setShowCreate(false);
    setCreateF({ prof_id: "", eleve_nom: "", matiere: "", date: "", duree: "", duree_heures: "", montant: "", statut: "déclaré" });
    setCreateSaving(false);
  }

  const COURS_STATUTS = ["déclaré","contesté","payé"];
  const SEL = "h-9 px-3 text-sm bg-white border border-slate-200 rounded-xl outline-none focus:border-primary text-slate-700 cursor-pointer";

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Cours</h1>
          <p className="text-xs font-mono text-slate-400 mt-0.5">{filtered.length}/{cours.length} rows · cours ORDER BY date DESC LIMIT 500</p>
        </div>
        <div className="flex gap-2 flex-wrap justify-end items-center">
          <button onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-primary transition-colors">
            <Plus className="w-4 h-4" /> Nouveau cours
          </button>
          {["tous","déclaré","contesté","payé"].map((s) => (
            <button key={s} onClick={() => setFilterStatut(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${filterStatut === s ? "bg-slate-900 text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <SearchInput value={search} onChange={setSearch} placeholder="Élève ou matière…" className="relative flex-1 min-w-[180px]" />
        <select value={filterYear} onChange={(e) => { setFilterYear(e.target.value); setFilterMonth("tous"); }} className={SEL}>
          <option value="tous">Toutes les années</option>
          {years.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
        <select value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} className={SEL}>
          <option value="tous">Tous les mois</option>
          {availableMonths.map((m) => <option key={m} value={m}>{MOIS_LABELS[Number(m) - 1]}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(15,23,42,.06)" }}>
        {loading ? <div className="p-8 text-center text-slate-400 text-sm">Chargement…</div> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-3 py-2.5 w-8">
                    <input type="checkbox" checked={bulkSelected.size > 0 && bulkSelected.size === filtered.length} onChange={toggleAllBulk}
                      className="rounded w-3.5 h-3.5 accent-primary" />
                  </th>
                  <th className={TH}>id</th><th className={TH}>déclaré le</th><th className={TH}>date cours</th><th className={TH}>eleve_nom</th><th className={TH}>matiere</th><th className={TH}>duree_h</th><th className={TH}>montant</th><th className={TH}>statut</th><th className={TH}>recap_id</th><th className={TH}>prof</th><th className={TH}>actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((c) => (
                  <tr key={c.id} className={`transition-colors ${bulkSelected.has(c.id) ? "bg-primary/5" : "hover:bg-slate-50/60"}`}>
                    <td className="px-3 py-2.5 text-center">
                      <input type="checkbox" checked={bulkSelected.has(c.id)} onChange={() => toggleBulk(c.id)}
                        className="rounded w-3.5 h-3.5 accent-primary" />
                    </td>
                    <td className={TD}><CopyID id={c.id} /></td>
                    <td className={`${TD} font-mono text-xs text-slate-400`}>{c.created_at ? new Date(c.created_at).toLocaleDateString("fr-FR") : "—"}</td>
                    <td className={`${TD} font-mono text-xs text-slate-500`}>{c.date}</td>
                    <td className={`${TD} font-medium text-slate-900`}>{c.eleve_nom}</td>
                    <td className={`${TD} text-slate-500`}>{c.matiere}</td>
                    <td className={`${TD} font-mono text-slate-600`}>{c.duree_heures}h</td>
                    <td className={`${TD} font-mono font-semibold text-slate-700`}>{Number(c.montant).toFixed(2)} €</td>
                    <td className={TD}>
                      <select value={c.statut} onChange={(ev) => updateStatut(c.id, ev.target.value)}
                        className="text-xs font-semibold px-2 py-0.5 rounded-full border-0 cursor-pointer outline-none bg-slate-100 text-slate-700">
                        {COURS_STATUTS.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td className={TD}>{c.recap_id ? <CopyID id={c.recap_id} /> : <span className="font-mono text-xs text-slate-300">null</span>}</td>
                    <td className={`${TD} text-xs text-slate-500`}>{c.profiles ? `${c.profiles.prenom} ${c.profiles.nom}` : "—"}</td>
                    <td className={TD}>
                      <div className="flex gap-1.5">
                        <button onClick={() => openEdit(c)} className="flex items-center gap-1 px-2 py-1 text-xs font-semibold bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"><Pencil className="w-3 h-3" /> Edit</button>
                        <button onClick={() => deleteCours(c)} className="flex items-center gap-1 px-2 py-1 text-xs font-semibold bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"><Trash2 className="w-3 h-3" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && <tr><td colSpan={12} className="p-8 text-center text-slate-400">Aucun résultat.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editing && (
        <AdminEditModal title={`EDIT cours · ${editing.id.slice(0,8)}`} onClose={() => setEditing(null)} onSave={saveEdit} saving={saving}>
          <div className="grid grid-cols-2 gap-3">
            <div><label className={FL}>eleve_nom</label><input value={editF.eleve_nom} onChange={(e) => setEditF({ ...editF, eleve_nom: e.target.value })} className={FI} /></div>
            <div><label className={FL}>matiere</label><input value={editF.matiere} onChange={(e) => setEditF({ ...editF, matiere: e.target.value })} className={FI} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className={FL}>date</label><input type="date" value={editF.date} onChange={(e) => setEditF({ ...editF, date: e.target.value })} className={FI} /></div>
            <div><label className={FL}>duree (texte)</label><input value={editF.duree} onChange={(e) => setEditF({ ...editF, duree: e.target.value })} placeholder="1h30" className={FI} /></div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div><label className={FL}>duree_heures</label><input type="number" step="0.25" value={editF.duree_heures} onChange={(e) => setEditF({ ...editF, duree_heures: e.target.value })} className={FI} /></div>
            <div><label className={FL}>montant (€)</label><input type="number" step="0.01" value={editF.montant} onChange={(e) => setEditF({ ...editF, montant: e.target.value })} className={FI} /></div>
            <div>
              <label className={FL}>statut</label>
              <select value={editF.statut} onChange={(e) => setEditF({ ...editF, statut: e.target.value })} className={FS}>
                {["déclaré","contesté","payé"].map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className={FL}>recap_id (UUID ou vide pour null)</label>
            <input value={editF.recap_id} onChange={(e) => setEditF({ ...editF, recap_id: e.target.value })} placeholder="null" className={FI} />
          </div>
          <p className="text-xs text-slate-400 font-mono">UPDATE cours SET … WHERE id='{editing.id}'</p>
        </AdminEditModal>
      )}

      {/* Create cours modal */}
      {showCreate && (
        <AdminEditModal title="INSERT INTO cours" onClose={() => setShowCreate(false)} onSave={handleCreateCours} saving={createSaving}>
          <div>
            <label className={FL}>prof</label>
            <select value={createF.prof_id} onChange={(e) => setCreateF({ ...createF, prof_id: e.target.value })} className={FS}>
              <option value="">— null —</option>
              {profsList.map((p) => <option key={p.id} value={p.id}>{p.prenom} {p.nom}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className={FL}>eleve_nom *</label><input value={createF.eleve_nom} onChange={(e) => setCreateF({ ...createF, eleve_nom: e.target.value })} className={FI} /></div>
            <div><label className={FL}>matiere</label><input value={createF.matiere} onChange={(e) => setCreateF({ ...createF, matiere: e.target.value })} className={FI} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className={FL}>date *</label><input type="date" value={createF.date} onChange={(e) => setCreateF({ ...createF, date: e.target.value })} className={FI} /></div>
            <div><label className={FL}>duree (texte)</label><input value={createF.duree} onChange={(e) => setCreateF({ ...createF, duree: e.target.value })} placeholder="1h30" className={FI} /></div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div><label className={FL}>duree_heures</label><input type="number" step="0.25" value={createF.duree_heures} onChange={(e) => setCreateF({ ...createF, duree_heures: e.target.value })} className={FI} /></div>
            <div><label className={FL}>montant (€) *</label><input type="number" step="0.01" value={createF.montant} onChange={(e) => setCreateF({ ...createF, montant: e.target.value })} className={FI} /></div>
            <div>
              <label className={FL}>statut</label>
              <select value={createF.statut} onChange={(e) => setCreateF({ ...createF, statut: e.target.value })} className={FS}>
                {["déclaré","contesté","payé"].map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <p className="text-xs text-slate-400 font-mono">* champs requis · recap_id sera null (cours orphelin)</p>
        </AdminEditModal>
      )}

      {/* Bulk action bar */}
      {bulkSelected.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white rounded-2xl shadow-2xl px-5 py-3.5 flex items-center gap-4 min-w-max">
          <span className="text-sm font-semibold text-slate-300">{bulkSelected.size} cours</span>
          <div className="w-px h-5 bg-slate-700" />
          <div className="flex items-center gap-2">
            <select value={bulkStatut} onChange={(e) => setBulkStatut(e.target.value)}
              className="text-xs bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 outline-none text-slate-200 cursor-pointer">
              {["déclaré","contesté","payé"].map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <button onClick={bulkChangeStatut} disabled={bulkLoading}
              className="px-3 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 transition-colors flex items-center gap-1.5">
              {bulkLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : null} Statut
            </button>
          </div>
          <div className="w-px h-5 bg-slate-700" />
          <div className="flex items-center gap-2">
            <input value={bulkRecapId} onChange={(e) => setBulkRecapId(e.target.value)}
              placeholder="recap_id UUID…"
              className="text-xs bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 outline-none text-slate-200 placeholder:text-slate-500 w-48" />
            <button onClick={bulkReassignRecap} disabled={bulkLoading}
              className="px-3 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 rounded-lg disabled:opacity-50 transition-colors flex items-center gap-1.5">
              {bulkLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : null} Réassigner
            </button>
          </div>
          <div className="w-px h-5 bg-slate-700" />
          <button onClick={bulkDelete} disabled={bulkLoading}
            className="px-3 py-1.5 text-xs font-semibold bg-red-600 hover:bg-red-700 rounded-lg disabled:opacity-50 transition-colors flex items-center gap-1.5">
            <Trash2 className="w-3 h-3" /> Supprimer
          </button>
          <button onClick={() => setBulkSelected(new Set())} className="ml-1 p-1 hover:text-slate-400 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

// ── AdminRecaps ───────────────────────────────────────────────────────────────
function AdminRecaps() {
  const [recaps, setRecaps]           = useState<any[]>([]);
  const [loading, setLoading]         = useState(true);
  const [filterStatut, setFilterStatut] = useState("tous");
  const [search, setSearch]           = useState("");
  const [selected, setSelected]       = useState<any | null>(null);
  const [recapCours, setRecapCours]   = useState<any[]>([]);
  const [coursLoading, setCoursLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [grille, setGrille]           = useState<any[]>([]);
  const [showCreate, setShowCreate]   = useState(false);
  const [profsList, setProfsList]     = useState<{ id: string; prenom: string; nom: string }[]>([]);
  const [showAddCours, setShowAddCours] = useState(false);
  const [addCoursEleves, setAddCoursEleves] = useState<any[]>([]);
  const [addCoursF, setAddCoursF] = useState({ eleve_id: "", eleve_nom: "", matiere: "", date: "", duree: "", duree_heures: "", montant: "" });
  const [addCoursLoading, setAddCoursLoading] = useState(false);

  function getTaux(tarif_heure: number): number {
    const sorted = [...grille].sort((a, b) => b.tarif_palier - a.tarif_palier);
    return sorted.find((g) => g.tarif_palier <= tarif_heure)?.taux_plusvalue ?? 0;
  }

  async function loadGrille() {
    const { data } = await supabase.from("grille_commission").select("tarif_palier, taux_plusvalue").order("tarif_palier");
    setGrille(data ?? []);
  }

  async function loadRecaps() {
    setLoading(true);
    const { data, error } = await supabase.from("recap_mensuel").select(`
        id, mois, annee, statut, prof_id, created_at,
        profiles!inner(prenom, nom),
        recap_eleve_validation(id, statut, eleve_id, created_at)
      `).order("annee", { ascending: false }).order("mois", { ascending: false });
    if (error) console.error("[AdminRecaps]", error.message);
    if (data && data.length > 0) {
      const allEleveIds = [...new Set(data.flatMap((r: any) => (r.recap_eleve_validation ?? []).map((v: any) => v.eleve_id)))];
      const { data: elevesData } = allEleveIds.length > 0
        ? await supabase.from("eleves").select("id, nom").in("id", allEleveIds) : { data: [] };
      const elevesMap: Record<string, string> = {};
      (elevesData ?? []).forEach((e: any) => { elevesMap[e.id] = e.nom; });
      setRecaps(data.map((r: any) => ({
        ...r,
        recap_eleve_validation: (r.recap_eleve_validation ?? []).map((v: any) => ({ ...v, eleve_nom: elevesMap[v.eleve_id] ?? v.eleve_id })),
      })));
    } else { setRecaps(data ?? []); }
    setLoading(false);
  }

  useEffect(() => {
    loadRecaps(); loadGrille();
    supabase.from("profiles").select("id, prenom, nom").eq("role", "prof").order("nom")
      .then(({ data }) => setProfsList(data ?? []));
  }, []);

  async function openRecap(recap: any) {
    setSelected(recap); setCoursLoading(true);
    const { data } = await supabase.from("cours")
      .select("id, date, eleve_nom, matiere, duree, duree_heures, montant")
      .eq("recap_id", recap.id).order("date", { ascending: true });
    setRecapCours(data ?? []); setCoursLoading(false);
  }

  async function changeRecapStatut(newStatut: string) {
    if (!selected) return;
    await supabase.from("recap_mensuel").update({ statut: newStatut }).eq("id", selected.id);
    const updated = { ...selected, statut: newStatut };
    setSelected(updated);
    setRecaps((prev) => prev.map((r) => r.id === selected.id ? updated : r));
  }

  async function forcerValidation(validationId: string) {
    if (!selected || !window.confirm("Forcer cette validation ?")) return;
    setActionLoading(validationId);
    await supabase.from("recap_eleve_validation").update({ statut: "valide" }).eq("id", validationId);
    const updatedVals = selected.recap_eleve_validation.map((v: any) =>
      v.id === validationId ? { ...v, statut: "valide" } : v
    );
    const allValide = updatedVals.every((v: any) => v.statut === "valide");
    let newStatut = selected.statut;
    if (allValide && selected.statut === "en_attente_parent") {
      await supabase.from("recap_mensuel").update({ statut: "en_attente_paiement" }).eq("id", selected.id);
      newStatut = "en_attente_paiement";
    }
    const updated = { ...selected, statut: newStatut, recap_eleve_validation: updatedVals };
    setSelected(updated); setRecaps((prev) => prev.map((r) => r.id === selected.id ? updated : r));
    setActionLoading(null);
  }

  async function forcerTous() {
    if (!selected || !window.confirm("Forcer la validation de TOUS les élèves de ce récap ?")) return;
    setActionLoading("ALL");
    const nonValides = (selected.recap_eleve_validation ?? []).filter((v: any) => v.statut !== "valide");
    await Promise.all(nonValides.map((v: any) =>
      supabase.from("recap_eleve_validation").update({ statut: "valide" }).eq("id", v.id)
    ));
    await supabase.from("recap_mensuel").update({ statut: "en_attente_paiement" }).eq("id", selected.id);
    const updatedVals = (selected.recap_eleve_validation ?? []).map((v: any) => ({ ...v, statut: "valide" }));
    const updated = { ...selected, statut: "en_attente_paiement", recap_eleve_validation: updatedVals };
    setSelected(updated); setRecaps((prev) => prev.map((r) => r.id === selected.id ? updated : r));
    setActionLoading(null);
  }

  async function deleteRecap() {
    if (!selected) return;
    if (!window.confirm("Supprimer ce récap ? Les validations seront supprimées (cascade), les cours auront leur recap_id mis à null.")) return;
    await supabase.from("recap_mensuel").delete().eq("id", selected.id);
    setRecaps((prev) => prev.filter((r) => r.id !== selected.id));
    setSelected(null);
  }

  async function revoquerValidation(validationId: string) {
    if (!selected || !window.confirm("Révoquer cette validation ? Elle repassera en 'en attente parent'.")) return;
    setActionLoading(validationId);
    await supabase.from("recap_eleve_validation").update({ statut: "en_attente_parent" }).eq("id", validationId);
    const updatedVals = (selected.recap_eleve_validation ?? []).map((v: any) =>
      v.id === validationId ? { ...v, statut: "en_attente_parent" } : v
    );
    let newStatut = selected.statut;
    if (["en_attente_paiement", "valide"].includes(selected.statut)) {
      await supabase.from("recap_mensuel").update({ statut: "en_attente_parent" }).eq("id", selected.id);
      newStatut = "en_attente_parent";
    }
    const updated = { ...selected, statut: newStatut, recap_eleve_validation: updatedVals };
    setSelected(updated); setRecaps((prev) => prev.map((r) => r.id === selected.id ? updated : r));
    setActionLoading(null);
  }

  async function openAddCours() {
    if (!selected) return;
    setShowAddCours(true);
    setAddCoursF({ eleve_id: "", eleve_nom: "", matiere: "", date: "", duree: "", duree_heures: "", montant: "" });
    const { data } = await supabase.from("eleves").select("id, nom, matiere").eq("prof_id", selected.prof_id).order("nom");
    setAddCoursEleves(data ?? []);
  }

  async function handleAddCours() {
    if (!selected || !addCoursF.eleve_nom || !addCoursF.date || !addCoursF.montant) return;
    setAddCoursLoading(true);
    const eleveId = addCoursF.eleve_id || null;
    await supabase.from("cours").insert({
      prof_id: selected.prof_id,
      recap_id: selected.id,
      eleve_id: eleveId,
      eleve_nom: addCoursF.eleve_nom,
      matiere: addCoursF.matiere,
      date: addCoursF.date,
      duree: addCoursF.duree,
      duree_heures: parseFloat(addCoursF.duree_heures) || 0,
      montant: parseFloat(addCoursF.montant),
      statut: "déclaré",
    });
    if (eleveId) {
      await supabase.from("recap_eleve_validation").upsert(
        [{ recap_id: selected.id, eleve_id: eleveId, statut: "en_attente_parent" }],
        { onConflict: "recap_id,eleve_id" }
      );
      await loadRecaps();
    }
    const { data } = await supabase.from("cours")
      .select("id, date, eleve_nom, matiere, duree, duree_heures, montant")
      .eq("recap_id", selected.id).order("date", { ascending: true });
    setRecapCours(data ?? []);
    setShowAddCours(false);
    setAddCoursLoading(false);
  }

  const filtered = recaps.filter((r) => {
    if (filterStatut !== "tous" && r.statut !== filterStatut) return false;
    const profName = `${r.profiles?.prenom ?? ""} ${r.profiles?.nom ?? ""}`.toLowerCase();
    return !search || profName.includes(search.toLowerCase()) || `${MOIS_LABELS[r.mois - 1]} ${r.annee}`.toLowerCase().includes(search.toLowerCase());
  });

  const totalNet = (r: any) => recapCours.reduce((s, c) => {
    const tarifH = c.duree_heures > 0 ? c.montant / c.duree_heures : 0;
    return s + c.montant * (1 + getTaux(tarifH));
  }, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Récaps mensuels</h1>
          <p className="text-xs font-mono text-slate-400 mt-0.5">{filtered.length} rows · recap_mensuel</p>
        </div>
        <div className="flex gap-2 flex-wrap justify-end items-center">
          <button onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-primary transition-colors">
            <Plus className="w-4 h-4" /> Nouveau récap
          </button>
          {["tous","en_cours","en_attente_parent","en_attente_paiement","valide"].map((s) => (
            <button key={s} onClick={() => setFilterStatut(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${filterStatut === s ? "bg-slate-900 text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
              {s === "tous" ? "Tous" : (RECAP_STATUT_STYLE[s]?.label ?? s)}
            </button>
          ))}
        </div>
      </div>
      <SearchInput value={search} onChange={setSearch} placeholder="Rechercher par prof ou mois…" />

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(15,23,42,.06)" }}>
        {loading ? <div className="p-8 text-center text-slate-400 text-sm">Chargement…</div>
          : filtered.length === 0 ? <div className="p-8 text-center text-slate-400 text-sm">Aucun résultat.</div>
          : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr><th className={TH}>id</th><th className={TH}>créé le</th><th className={TH}>mois / annee</th><th className={TH}>prof</th><th className={TH}>statut</th><th className={TH}>validations</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((r) => {
                const vals: any[] = r.recap_eleve_validation ?? [];
                const nbV = vals.filter((v) => v.statut === "valide").length;
                const nbC = vals.filter((v) => v.statut === "conteste").length;
                const nbA = vals.filter((v) => v.statut !== "valide").length;
                const si  = RECAP_STATUT_STYLE[r.statut] ?? { bg: "bg-slate-100 text-slate-500", label: r.statut };
                return (
                  <tr key={r.id} className="hover:bg-slate-50/60 transition-colors cursor-pointer" onClick={() => openRecap(r)}>
                    <td className={TD}><CopyID id={r.id} /></td>
                    <td className={`${TD} font-mono text-xs text-slate-400`}>{r.created_at ? new Date(r.created_at).toLocaleDateString("fr-FR") : "—"}</td>
                    <td className={`${TD} font-semibold text-slate-900`}>{MOIS_LABELS[r.mois - 1]} {r.annee}</td>
                    <td className={`${TD} text-slate-600`}>{r.profiles?.prenom} {r.profiles?.nom}</td>
                    <td className={TD}><span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${si.bg}`}>{si.label}</span></td>
                    <td className={TD}>
                      <div className="flex gap-1.5 items-center flex-wrap">
                        {nbV > 0 && <span className="text-xs bg-emerald-100 text-emerald-700 font-semibold px-2 py-0.5 rounded-full">{nbV} ✓</span>}
                        {nbC > 0 && <span className="text-xs bg-red-100 text-red-700 font-semibold px-2 py-0.5 rounded-full">{nbC} contesté</span>}
                        {nbA - nbC > 0 && <span className="text-xs bg-amber-100 text-amber-700 font-semibold px-2 py-0.5 rounded-full">{nbA - nbC} ⏳</span>}
                        {vals.length === 0 && <span className="text-xs text-slate-400">—</span>}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {showCreate && profsList.length > 0 && (
        <CreateRecapModal
          profsList={profsList}
          onClose={() => setShowCreate(false)}
          onCreated={() => { loadRecaps(); }}
        />
      )}

      {/* ── Recap detail modal ── */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4 backdrop-blur-sm" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 z-10 rounded-t-2xl">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-slate-900">{MOIS_LABELS[selected.mois - 1]} {selected.annee}</h3>
                    <span className="font-mono text-xs text-slate-400">· {selected.id.slice(0,8)}</span>
                  </div>
                  <p className="text-sm text-slate-500">{selected.profiles?.prenom} {selected.profiles?.nom}</p>
                  {selected.created_at && (
                    <p className="font-mono text-xs text-slate-400 mt-0.5">
                      créé le {new Date(selected.created_at).toLocaleDateString("fr-FR")} ·{" "}
                      {Math.floor((Date.now() - new Date(selected.created_at).getTime()) / 86400000)} jours
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {/* Statut change */}
                  <select value={selected.statut} onChange={(e) => changeRecapStatut(e.target.value)}
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full border-0 cursor-pointer outline-none ${(RECAP_STATUT_STYLE[selected.statut] ?? { bg: "bg-slate-100 text-slate-500" }).bg}`}>
                    {RECAP_STATUTS.map((s) => <option key={s} value={s}>{RECAP_STATUT_STYLE[s]?.label ?? s}</option>)}
                  </select>
                  <button onClick={deleteRecap} className="flex items-center gap-1 px-2 py-1 text-xs font-semibold bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"><Trash2 className="w-3 h-3" /> Delete</button>
                  <button onClick={() => setSelected(null)} className="p-2 rounded-xl hover:bg-slate-100 transition-colors"><X className="w-4 h-4 text-slate-500" /></button>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Cours list with prof earnings */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wide">cours ({recapCours.length})</h4>
                  <div className="flex items-center gap-3">
                    {!coursLoading && recapCours.length > 0 && (
                      <div className="text-xs font-mono text-slate-500">
                        Total famille : <span className="font-bold text-slate-800">{recapCours.reduce((s, c) => s + Number(c.montant), 0).toFixed(2)} €</span>
                        <span className="mx-2 text-slate-300">·</span>
                        Net prof : <span className="font-bold text-emerald-700">{totalNet(selected).toFixed(2)} €</span>
                      </div>
                    )}
                    <button onClick={openAddCours}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-900 text-white rounded-lg hover:bg-primary transition-colors">
                      <Plus className="w-3 h-3" /> Ajouter cours
                    </button>
                  </div>
                </div>

                {showAddCours && (
                  <div className="mb-4 bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                    <p className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wide">INSERT INTO cours (recap_id = {selected.id.slice(0,8)}…)</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={FL}>élève (optionnel)</label>
                        <select value={addCoursF.eleve_id}
                          onChange={(e) => {
                            const el = addCoursEleves.find(x => x.id === e.target.value);
                            setAddCoursF({ ...addCoursF, eleve_id: e.target.value, eleve_nom: el?.nom ?? addCoursF.eleve_nom, matiere: el?.matiere ?? addCoursF.matiere });
                          }} className={FS}>
                          <option value="">— saisie manuelle —</option>
                          {addCoursEleves.map((e) => <option key={e.id} value={e.id}>{e.nom} · {e.matiere}</option>)}
                        </select>
                      </div>
                      <div><label className={FL}>eleve_nom *</label><input value={addCoursF.eleve_nom} onChange={(e) => setAddCoursF({ ...addCoursF, eleve_nom: e.target.value })} className={FI} /></div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div><label className={FL}>matiere</label><input value={addCoursF.matiere} onChange={(e) => setAddCoursF({ ...addCoursF, matiere: e.target.value })} className={FI} /></div>
                      <div><label className={FL}>date *</label><input type="date" value={addCoursF.date} onChange={(e) => setAddCoursF({ ...addCoursF, date: e.target.value })} className={FI} /></div>
                      <div><label className={FL}>duree (texte)</label><input value={addCoursF.duree} onChange={(e) => setAddCoursF({ ...addCoursF, duree: e.target.value })} placeholder="1h30" className={FI} /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div><label className={FL}>duree_heures</label><input type="number" step="0.25" value={addCoursF.duree_heures} onChange={(e) => setAddCoursF({ ...addCoursF, duree_heures: e.target.value })} className={FI} /></div>
                      <div><label className={FL}>montant (€) *</label><input type="number" step="0.01" value={addCoursF.montant} onChange={(e) => setAddCoursF({ ...addCoursF, montant: e.target.value })} className={FI} /></div>
                    </div>
                    <div className="flex gap-2 pt-1">
                      <button onClick={() => setShowAddCours(false)} className="px-3 py-1.5 text-xs font-medium border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors">Annuler</button>
                      <button onClick={handleAddCours} disabled={addCoursLoading || !addCoursF.eleve_nom || !addCoursF.date || !addCoursF.montant}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors">
                        {addCoursLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                        Créer et attacher
                      </button>
                    </div>
                  </div>
                )}
                {coursLoading ? (
                  <div className="flex items-center gap-2 text-slate-400 text-sm"><Loader2 className="w-4 h-4 animate-spin" /> Chargement…</div>
                ) : recapCours.length === 0 ? (
                  <p className="text-sm text-slate-400 font-mono">Aucun cours lié (cours.recap_id = null ?)</p>
                ) : (
                  <div className="rounded-xl overflow-hidden border border-slate-200">
                    <table className="w-full text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                          <th className={TH}>date</th><th className={TH}>eleve_nom</th><th className={TH}>matiere</th>
                          <th className={TH}>duree_h</th><th className={TH}>montant famille</th>
                          <th className={TH}>tarif/h effectif</th><th className={TH}>taux_plusvalue</th><th className={`${TH} text-emerald-600`}>net prof</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {recapCours.map((c) => {
                          const tarifH = c.duree_heures > 0 ? Number(c.montant) / Number(c.duree_heures) : 0;
                          const taux   = getTaux(tarifH);
                          const netP   = Number(c.montant) * (1 + taux);
                          return (
                            <tr key={c.id}>
                              <td className="px-3 py-2 font-mono text-slate-500">{c.date}</td>
                              <td className="px-3 py-2 font-medium text-slate-800">{c.eleve_nom}</td>
                              <td className="px-3 py-2 text-slate-500">{c.matiere}</td>
                              <td className="px-3 py-2 font-mono text-slate-600">{c.duree_heures}h</td>
                              <td className="px-3 py-2 font-mono font-semibold text-slate-700">{Number(c.montant).toFixed(2)} €</td>
                              <td className="px-3 py-2 font-mono text-slate-500">{tarifH.toFixed(2)} €/h</td>
                              <td className="px-3 py-2 font-mono text-indigo-600 font-semibold">+{(taux * 100).toFixed(0)}%</td>
                              <td className="px-3 py-2 font-mono font-bold text-emerald-700">{netP.toFixed(2)} €</td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot>
                        <tr className="border-t-2 border-slate-200 bg-slate-50">
                          <td colSpan={4} className="px-3 py-2 font-mono text-xs font-bold text-slate-500 text-right">TOTAL</td>
                          <td className="px-3 py-2 font-mono font-bold text-slate-800">{recapCours.reduce((s, c) => s + Number(c.montant), 0).toFixed(2)} €</td>
                          <td className="px-3 py-2" />
                          <td className="px-3 py-2" />
                          <td className="px-3 py-2 font-mono font-bold text-emerald-700">{totalNet(selected).toFixed(2)} €</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}
              </div>

              {/* Validations */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wide">recap_eleve_validation ({(selected.recap_eleve_validation ?? []).length})</h4>
                  {(selected.recap_eleve_validation ?? []).some((v: any) => v.statut !== "valide") && (
                    <button onClick={forcerTous} disabled={actionLoading === "ALL"}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors">
                      {actionLoading === "ALL" ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                      Forcer TOUS
                    </button>
                  )}
                </div>
                {(selected.recap_eleve_validation ?? []).length === 0 ? (
                  <p className="text-sm text-slate-400 font-mono">Aucune validation.</p>
                ) : (
                  <div className="rounded-xl overflow-hidden border border-slate-200">
                    <table className="w-full text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200">
                        <tr><th className={TH}>id</th><th className={TH}>créé le</th><th className={TH}>eleve → nom</th><th className={TH}>statut</th><th className={TH}>actions</th></tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {(selected.recap_eleve_validation ?? []).map((v: any) => {
                          const vs = VALIDATION_STATUT_STYLE[v.statut] ?? { bg: "bg-slate-100 text-slate-500", label: v.statut };
                          return (
                            <tr key={v.id}>
                              <td className="px-3 py-2"><CopyID id={v.id} /></td>
                              <td className="px-3 py-2 font-mono text-xs text-slate-400">
                                {v.created_at ? new Date(v.created_at).toLocaleDateString("fr-FR") : "—"}
                              </td>
                              <td className="px-3 py-2 font-medium text-slate-800">{v.eleve_nom}</td>
                              <td className="px-3 py-2"><span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${vs.bg}`}>{vs.label}</span></td>
                              <td className="px-3 py-2">
                                <div className="flex gap-1.5">
                                  {v.statut !== "valide" && (
                                    <button onClick={() => forcerValidation(v.id)} disabled={actionLoading === v.id}
                                      className="flex items-center gap-1 px-2 py-1 text-xs font-semibold bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 disabled:opacity-50 transition-colors">
                                      {actionLoading === v.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                                      Forcer
                                    </button>
                                  )}
                                  {v.statut === "valide" && (
                                    <button onClick={() => revoquerValidation(v.id)} disabled={actionLoading === v.id}
                                      className="flex items-center gap-1 px-2 py-1 text-xs font-semibold bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 disabled:opacity-50 transition-colors">
                                      {actionLoading === v.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <RotateCcw className="w-3 h-3" />}
                                      Révoquer
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── AdminContestations ────────────────────────────────────────────────────────
function AdminContestations() {
  const [items, setItems]             = useState<any[]>([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState("");
  const [selected, setSelected]       = useState<any | null>(null);
  const [editMode, setEditMode]       = useState(false);
  const [editFields, setEditFields]   = useState({ duree: "", duree_heures: "", montant: "" });
  const [actionLoading, setActionLoading] = useState(false);

  async function loadItems() {
    const { data } = await (supabase as any).from("contestation_cours").select(`
        id, raison, created_at,
        cours ( id, eleve_id, recap_id, eleve_nom, matiere, date, duree, duree_heures, montant, statut,
          profiles!cours_prof_id_fkey(prenom, nom) )
      `).order("created_at", { ascending: false });
    setItems(data ?? []); setLoading(false);
  }
  useEffect(() => { loadItems(); }, []);

  function openItem(item: any) {
    setSelected(item); setEditMode(false);
    setEditFields({ duree: item.cours?.duree ?? "", duree_heures: String(item.cours?.duree_heures ?? ""), montant: String(item.cours?.montant ?? "") });
  }

  async function rejeterContestation() {
    if (!selected || !window.confirm("Rejeter la contestation ? Le cours revient à «déclaré» et la validation parente est réinitialisée.")) return;
    setActionLoading(true);
    await supabase.from("contestation_cours").delete().eq("id", selected.id);
    await supabase.from("cours").update({ statut: "déclaré" }).eq("id", selected.cours.id);
    if (selected.cours.recap_id && selected.cours.eleve_id) {
      await supabase.from("recap_eleve_validation").update({ statut: "en_attente_parent" })
        .eq("recap_id", selected.cours.recap_id).eq("eleve_id", selected.cours.eleve_id);
    }
    setItems((prev) => prev.filter((i) => i.id !== selected.id));
    setSelected(null); setActionLoading(false);
  }

  async function modifierEtResoudre() {
    if (!selected) return;
    setActionLoading(true);
    await supabase.from("cours").update({
      duree: editFields.duree, duree_heures: parseFloat(editFields.duree_heures),
      montant: parseFloat(editFields.montant), statut: "déclaré",
    }).eq("id", selected.cours.id);
    await supabase.from("contestation_cours").delete().eq("id", selected.id);
    if (selected.cours.recap_id && selected.cours.eleve_id) {
      await supabase.from("recap_eleve_validation").update({ statut: "en_attente_parent" })
        .eq("recap_id", selected.cours.recap_id).eq("eleve_id", selected.cours.eleve_id);
    }
    setItems((prev) => prev.filter((i) => i.id !== selected.id));
    setSelected(null); setActionLoading(false);
  }

  const filtered = items.filter((item) =>
    `${item.cours?.eleve_nom ?? ""} ${item.cours?.matiere ?? ""} ${item.raison ?? ""}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Contestations</h1>
          <p className="text-xs font-mono text-slate-400 mt-0.5">{items.length} rows · contestation_cours</p>
        </div>
      </div>
      <SearchInput value={search} onChange={setSearch} placeholder="Élève, matière ou raison…" />

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(15,23,42,.06)" }}>
        {loading ? <div className="p-8 text-center text-slate-400 text-sm">Chargement…</div>
          : filtered.length === 0 ? <div className="p-8 text-center text-slate-400 text-sm">Aucune contestation.</div>
          : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr><th className={TH}>id</th><th className={TH}>created_at</th><th className={TH}>eleve_nom</th><th className={TH}>matiere</th><th className={TH}>date cours</th><th className={TH}>montant</th><th className={TH}>raison</th><th className={TH}>prof</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/60 transition-colors cursor-pointer" onClick={() => openItem(item)}>
                  <td className={TD}><CopyID id={item.id} /></td>
                  <td className={`${TD} font-mono text-xs text-slate-400`}>{new Date(item.created_at).toLocaleDateString("fr-FR")}</td>
                  <td className={`${TD} font-medium text-slate-900`}>{item.cours?.eleve_nom ?? "—"}</td>
                  <td className={`${TD} text-slate-500`}>{item.cours?.matiere ?? "—"}</td>
                  <td className={`${TD} font-mono text-xs text-slate-500`}>{item.cours?.date ?? "—"}</td>
                  <td className={`${TD} font-mono font-semibold text-slate-700`}>{item.cours?.montant != null ? `${Number(item.cours.montant).toFixed(2)} €` : "—"}</td>
                  <td className={`${TD} text-red-700 text-xs max-w-[200px] truncate`}>{item.raison || "—"}</td>
                  <td className={`${TD} text-xs text-slate-500`}>{item.cours?.profiles ? `${item.cours.profiles.prenom} ${item.cours.profiles.nom}` : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4 backdrop-blur-sm" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <div className="border-b border-slate-100 px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900">Contestation</h3>
                <p className="font-mono text-xs text-slate-400">{selected.id}</p>
              </div>
              <button onClick={() => setSelected(null)} className="p-2 rounded-xl hover:bg-slate-100 transition-colors"><X className="w-4 h-4 text-slate-500" /></button>
            </div>
            <div className="p-6 space-y-5">
              <div className="bg-slate-50 rounded-xl p-4 space-y-2 text-sm font-mono">
                {[
                  ["cours.id",           selected.cours?.id],
                  ["eleve_nom",          selected.cours?.eleve_nom],
                  ["matiere",            selected.cours?.matiere],
                  ["date",               selected.cours?.date],
                  ["duree / heures",     `${selected.cours?.duree} / ${selected.cours?.duree_heures}h`],
                  ["montant",            `${selected.cours?.montant} €`],
                  ["recap_id",           selected.cours?.recap_id ?? "null"],
                  ["prof",               selected.cours?.profiles ? `${selected.cours.profiles.prenom} ${selected.cours.profiles.nom}` : "null"],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-4">
                    <span className="text-slate-400 text-xs shrink-0">{k}</span>
                    <span className="text-slate-800 text-xs text-right break-all">{v}</span>
                  </div>
                ))}
              </div>
              <div className="bg-red-50 border border-red-100 rounded-xl p-4">
                <p className="text-xs font-mono font-bold text-red-400 mb-1">raison</p>
                <p className="text-sm text-red-800">{selected.raison || "— aucune raison —"}</p>
              </div>
              {editMode && (
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 space-y-3">
                  <p className="text-xs font-mono font-bold text-blue-500">UPDATE cours SET …</p>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: "duree (texte)", key: "duree", type: "text", step: undefined },
                      { label: "duree_heures",  key: "duree_heures", type: "number", step: "0.25" },
                      { label: "montant (€)",   key: "montant",      type: "number", step: "0.01" },
                    ].map(({ label, key, type, step }) => (
                      <div key={key}>
                        <label className={FL}>{label}</label>
                        <input type={type} step={step} value={editFields[key as keyof typeof editFields]}
                          onChange={(e) => setEditFields({ ...editFields, [key]: e.target.value })}
                          className={FI} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex gap-3 pt-1">
                <button onClick={rejeterContestation} disabled={actionLoading}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold bg-amber-100 text-amber-800 rounded-xl hover:bg-amber-200 disabled:opacity-50 transition-colors">
                  {actionLoading && !editMode && <Loader2 className="w-4 h-4 animate-spin" />}
                  Rejeter (cours → déclaré)
                </button>
                {!editMode ? (
                  <button onClick={() => setEditMode(true)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
                    <Pencil className="w-4 h-4" /> Modifier cours
                  </button>
                ) : (
                  <button onClick={modifierEtResoudre} disabled={actionLoading}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition-colors">
                    {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    Enregistrer + résoudre
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── AdminPaps ─────────────────────────────────────────────────────────────────
const PAPS_EMPTY = {
  prof_nom: "", matiere: MATIERES_FORM[0], niveau_eleve: NIVEAUX_FORM[0],
  prix: 25, frequence: "", horaires: "", localisation: "",
  description_eleve: "", tags: [] as string[], urgent: false,
};

function AdminPaps() {
  const { user } = useAuth();
  const [annonces, setAnnonces] = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]         = useState(PAPS_EMPTY);
  const [newTag, setNewTag]     = useState("");
  const [saving, setSaving]     = useState(false);
  const [search, setSearch]     = useState("");

  async function load() {
    const { data } = await supabase.from("paps_annonces").select("*").order("created_at", { ascending: false });
    setAnnonces(data ?? []); setLoading(false);
  }
  useEffect(() => { load(); }, []);

  function addTag() {
    const t = newTag.trim();
    if (t && !form.tags.includes(t)) setForm({ ...form, tags: [...form.tags, t] });
    setNewTag("");
  }

  async function handlePost() {
    if (!form.prof_nom.trim() || !user) return;
    setSaving(true);
    try {
      await supabase.from("paps_annonces").insert({
        prof_id: user.id, prof_nom: form.prof_nom.trim(), matiere: form.matiere,
        niveau_eleve: form.niveau_eleve, prix: form.prix, frequence: form.frequence,
        horaires: form.horaires, localisation: form.localisation,
        description_eleve: form.description_eleve, tags: form.tags, urgent: form.urgent, active: true,
      });
      setShowForm(false); setForm(PAPS_EMPTY); load();
    } finally { setSaving(false); }
  }

  async function toggleActive(id: string, active: boolean) {
    await supabase.from("paps_annonces").update({ active: !active }).eq("id", id);
    setAnnonces((prev) => prev.map((a) => a.id === id ? { ...a, active: !active } : a));
  }

  async function deleteAnnonce(id: string) {
    if (!window.confirm("Supprimer cette annonce définitivement ?")) return;
    await supabase.from("paps_annonces").delete().eq("id", id);
    setAnnonces((prev) => prev.filter((a) => a.id !== id));
  }

  const filtered = annonces.filter((a) =>
    `${a.prof_nom} ${a.matiere} ${a.niveau_eleve} ${a.localisation}`.toLowerCase().includes(search.toLowerCase())
  );
  const INP = "w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm focus:border-primary";

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">PAPS</h1>
          <p className="text-xs font-mono text-slate-400 mt-0.5">{annonces.length} rows · paps_annonces</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-primary transition-colors">
          <Plus className="w-4 h-4" /> Nouvelle annonce
        </button>
      </div>
      <SearchInput value={search} onChange={setSearch} placeholder="Prof, matière, niveau…" />
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(15,23,42,.06)" }}>
        {loading ? <div className="p-8 text-center text-slate-400 text-sm">Chargement…</div>
          : filtered.length === 0 ? <div className="p-8 text-center text-slate-400 text-sm">Aucune annonce.</div>
          : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr><th className={TH}>id</th><th className={TH}>prof_nom</th><th className={TH}>matiere</th><th className={TH}>niveau</th><th className={TH}>prix</th><th className={TH}>localisation</th><th className={TH}>active</th><th className={TH}>created_at</th><th className={TH}>actions</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((a) => (
                <tr key={a.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className={TD}><CopyID id={a.id} /></td>
                  <td className={`${TD} font-medium text-slate-900`}>{a.prof_nom}</td>
                  <td className={`${TD} text-slate-500`}>{a.matiere}</td>
                  <td className={`${TD} text-slate-500`}>{a.niveau_eleve}</td>
                  <td className={`${TD} font-mono text-slate-700`}>{a.prix} €/h</td>
                  <td className={`${TD} text-slate-400 text-xs`}>{a.localisation || "—"}</td>
                  <td className={TD}>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${a.active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                      {a.active ? "true" : "false"}
                    </span>
                    {a.urgent && <span className="ml-1.5 text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-600">urgent</span>}
                  </td>
                  <td className={`${TD} font-mono text-xs text-slate-400`}>{new Date(a.created_at).toLocaleDateString("fr-FR")}</td>
                  <td className={TD}>
                    <div className="flex gap-1.5">
                      <button onClick={() => toggleActive(a.id, a.active)}
                        className={`text-xs font-semibold px-2 py-1 rounded-lg transition-colors ${a.active ? "bg-slate-100 text-slate-600 hover:bg-slate-200" : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"}`}>
                        {a.active ? "Désactiver" : "Activer"}
                      </button>
                      <button onClick={() => deleteAnnonce(a.id)} className="flex items-center px-2 py-1 text-xs font-semibold bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto flex flex-col">
            <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
              <h3 className="font-bold text-slate-900">Nouvelle annonce PAPS</h3>
              <button onClick={() => setShowForm(false)} className="p-2 rounded-xl hover:bg-slate-100 transition-colors"><X className="w-4 h-4 text-slate-500" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div><label className="block mb-1.5 text-xs font-bold text-slate-500 uppercase tracking-wide">Nom du prof</label>
                <input value={form.prof_nom} onChange={(e) => setForm({ ...form, prof_nom: e.target.value })} placeholder="Prénom Nom…" className={INP} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block mb-1.5 text-xs font-bold text-slate-500 uppercase tracking-wide">Matière</label>
                  <select value={form.matiere} onChange={(e) => setForm({ ...form, matiere: e.target.value })} className={INP}>
                    {MATIERES_FORM.map((m) => <option key={m}>{m}</option>)}</select></div>
                <div><label className="block mb-1.5 text-xs font-bold text-slate-500 uppercase tracking-wide">Niveau élève</label>
                  <select value={form.niveau_eleve} onChange={(e) => setForm({ ...form, niveau_eleve: e.target.value })} className={INP}>
                    {NIVEAUX_FORM.map((n) => <option key={n}>{n}</option>)}</select></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block mb-1.5 text-xs font-bold text-slate-500 uppercase tracking-wide">Prix (€/h)</label>
                  <input type="number" value={form.prix} onChange={(e) => setForm({ ...form, prix: Number(e.target.value) })} className={INP} /></div>
                <div><label className="block mb-1.5 text-xs font-bold text-slate-500 uppercase tracking-wide">Fréquence</label>
                  <input value={form.frequence} onChange={(e) => setForm({ ...form, frequence: e.target.value })} placeholder="1x/semaine…" className={INP} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block mb-1.5 text-xs font-bold text-slate-500 uppercase tracking-wide">Horaires</label>
                  <input value={form.horaires} onChange={(e) => setForm({ ...form, horaires: e.target.value })} placeholder="Mercredi 16h…" className={INP} /></div>
                <div><label className="block mb-1.5 text-xs font-bold text-slate-500 uppercase tracking-wide">Localisation</label>
                  <input value={form.localisation} onChange={(e) => setForm({ ...form, localisation: e.target.value })} placeholder="Paris 15e…" className={INP} /></div>
              </div>
              <div><label className="block mb-1.5 text-xs font-bold text-slate-500 uppercase tracking-wide">Description de l'élève</label>
                <textarea value={form.description_eleve} onChange={(e) => setForm({ ...form, description_eleve: e.target.value })}
                  rows={3} placeholder="Niveau, difficultés, objectifs…" className={`${INP} resize-none`} /></div>
              <div>
                <label className="block mb-1.5 text-xs font-bold text-slate-500 uppercase tracking-wide">Tags</label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {form.tags.map((tag: string) => (
                    <span key={tag} className="flex items-center gap-1 bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg text-xs font-medium">
                      {tag}<button onClick={() => setForm({ ...form, tags: form.tags.filter((t: string) => t !== tag) })}><X className="w-3 h-3 text-slate-400 hover:text-red-500" /></button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input value={newTag} onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                    placeholder="Ajouter un tag…" className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm" />
                  <button onClick={addTag} className="px-3 py-2 bg-slate-900 text-white rounded-xl hover:bg-primary transition-colors"><Plus className="w-4 h-4" /></button>
                </div>
              </div>
              <label className="flex items-start gap-3 p-3.5 bg-red-50 rounded-xl cursor-pointer border border-red-100 hover:bg-red-100/70 transition-colors">
                <input type="checkbox" checked={form.urgent} onChange={(e) => setForm({ ...form, urgent: e.target.checked })} className="w-4 h-4 accent-red-600 mt-0.5" />
                <div><p className="text-sm font-semibold text-red-700">Marquer comme urgent</p><p className="text-xs text-red-400 mt-0.5">L'annonce apparaîtra en haut avec un badge rouge</p></div>
              </label>
            </div>
            <div className="sticky bottom-0 bg-white border-t border-slate-100 px-6 py-4 flex gap-3 rounded-b-2xl">
              <button onClick={() => setShowForm(false)} className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-sm font-medium transition-colors">Annuler</button>
              <button onClick={handlePost} disabled={!form.prof_nom.trim() || saving}
                className="flex-1 bg-slate-900 text-white px-4 py-2.5 rounded-xl hover:bg-primary transition-colors disabled:opacity-40 flex items-center justify-center gap-2 text-sm font-semibold">
                {saving && <Loader2 className="w-4 h-4 animate-spin" />} Publier l'annonce
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export function AdminDashboard() {
  const { session, signOut, profile } = useAuth();
  const [section, setSection] = useState<Section>("paiements");
  const [profs, setProfs]               = useState<ProfPaiement[]>([]);
  const [fetching, setFetching]         = useState(true);
  const [dispatchState, setDispatchState] = useState<DispatchState>("idle");
  const [dispatchResult, setDispatchResult] = useState<{ success: string[]; errors: { prof_id: string; error: string }[] } | null>(null);
  const [lastRefresh, setLastRefresh]   = useState(new Date());

  useEffect(() => { loadPendingPayments(); }, [lastRefresh]);

  async function loadPendingPayments() {
    setFetching(true);
    const { data, error } = await supabase.from("recap_mensuel")
      .select(`id, prof_id, mois, annee, profiles!inner ( prenom, nom, iban ), cours ( montant )`)
      .eq("statut", "valide");
    if (error || !data) { setFetching(false); return; }
    const byProf = new Map<string, ProfPaiement>();
    for (const recap of data as any[]) {
      const montantRecap: number = (recap.cours ?? []).reduce((s: number, c: { montant: number }) => s + Number(c.montant), 0);
      const label = `${String(recap.mois).padStart(2, "0")}/${recap.annee}`;
      const existing = byProf.get(recap.prof_id);
      if (existing) {
        existing.recap_ids.push(recap.id); existing.montant_brut += montantRecap;
        existing.montant_net = Math.round(existing.montant_brut * PROF_MULTIPLIER * 100) / 100;
        existing.mois_annees.push(label);
      } else {
        byProf.set(recap.prof_id, { prof_id: recap.prof_id, prenom: recap.profiles.prenom, nom: recap.profiles.nom, iban: recap.profiles.iban ?? null, recap_ids: [recap.id], montant_brut: montantRecap, montant_net: Math.round(montantRecap * PROF_MULTIPLIER * 100) / 100, mois_annees: [label] });
      }
    }
    setProfs(Array.from(byProf.values())); setFetching(false);
  }

  async function handleDispatch() {
    if (!session) return;
    setDispatchState("loading"); setDispatchResult(null);
    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/dispatch-payments`, { method: "POST", headers: { Authorization: `Bearer ${session.access_token}`, "Content-Type": "application/json" } });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? `HTTP ${res.status}`);
      setDispatchResult(json); setDispatchState(json.errors?.length > 0 ? "error" : "success"); setLastRefresh(new Date());
    } catch (e) {
      setDispatchResult({ success: [], errors: [{ prof_id: "global", error: e instanceof Error ? e.message : String(e) }] });
      setDispatchState("error");
    }
  }

  const totalNet = profs.reduce((s, p) => s + p.montant_net, 0);
  const profsWithoutIban = profs.filter((p) => !p.iban);

  return (
    <div className="flex min-h-screen" style={{ background: "var(--background)" }}>
      <aside className="w-[220px] shrink-0 bg-white border-r border-slate-100 flex flex-col sticky top-0 h-screen">
        <div className="px-4 py-5">
          <div className="flex items-center gap-2.5">
            <img src={logo} alt="Colibri" className="w-8 h-8 rounded-lg" />
            <span className="font-bold text-slate-900 tracking-tight" style={{ fontSize: 17 }}>Colibri</span>
          </div>
        </div>
        {profile && (
          <div className="mx-3 mb-3 px-3 py-2.5 bg-slate-50 rounded-xl border border-slate-100">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide leading-none mb-0.5">Admin</p>
            <p className="text-sm font-medium text-slate-800 truncate">{profile.prenom} {profile.nom}</p>
          </div>
        )}
        <nav className="flex-1 px-2 space-y-0.5 overflow-y-auto">
          {NAV.map(({ key, label, Icon }) => {
            const active = section === key;
            return (
              <button key={key} onClick={() => setSection(key)}
                className={`relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150 group ${active ? "bg-primary/8 text-primary font-semibold" : "text-slate-500 hover:bg-slate-50 hover:text-slate-800 font-medium"}`}>
                {active && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-primary rounded-r-full" />}
                <Icon className={`w-4 h-4 shrink-0 transition-colors ${active ? "text-primary" : "text-slate-400 group-hover:text-slate-600"}`} />
                <span>{label}</span>
              </button>
            );
          })}
        </nav>
        <div className="p-2 border-t border-slate-100">
          <button onClick={() => signOut()}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-red-50 hover:text-red-600 transition-all duration-150">
            <LogOut className="w-4 h-4 shrink-0" /><span>Déconnexion</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 px-8 py-8 overflow-auto">
        {section === "paiements" && (
          <div className="max-w-5xl space-y-6">
            <div className="flex items-center justify-between">
              <div><h1 className="text-xl font-bold text-slate-900">Dispatch des paiements</h1><p className="text-sm text-slate-500 mt-1">Rémunération prof : tarif × {PROF_MULTIPLIER}</p></div>
              <span className="text-xs text-slate-400">Actualisé à {lastRefresh.toLocaleTimeString("fr-FR")}</span>
            </div>
            {profsWithoutIban.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <p className="text-sm font-semibold text-amber-800">{profsWithoutIban.length} prof(s) sans IBAN :</p>
                <ul className="mt-1 text-sm text-amber-700 list-disc list-inside">{profsWithoutIban.map((p) => <li key={p.prof_id}>{p.prenom} {p.nom}</li>)}</ul>
              </div>
            )}
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Profs à payer",    value: fetching ? "…" : String(profs.filter((p) => p.iban).length), color: "text-slate-900" },
                { label: "Total brut",        value: fetching ? "…" : `${profs.reduce((s, p) => s + p.montant_brut, 0).toFixed(2)} €`, color: "text-slate-900" },
                { label: "Total net à virer", value: fetching ? "…" : `${totalNet.toFixed(2)} €`, color: "text-emerald-600" },
              ].map((stat) => (
                <div key={stat.label} className="bg-white rounded-2xl border border-slate-200 p-5" style={{ boxShadow: "0 1px 3px rgba(15,23,42,.06)" }}>
                  <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold">{stat.label}</p>
                  <p className={`text-3xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(15,23,42,.06)" }}>
              <div className="px-5 py-4 border-b border-slate-100"><h2 className="font-semibold text-slate-800 text-sm">Récapitulatifs validés en attente</h2></div>
              {fetching ? <div className="p-8 text-center text-slate-400 text-sm">Chargement…</div>
                : profs.length === 0 ? <div className="p-8 text-center text-slate-400 text-sm">Aucun récapitulatif validé en attente.</div>
                : (
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>{["Prof","Périodes","Brut","Net","IBAN"].map((h) => <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>)}</tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {profs.map((p) => (
                      <tr key={p.prof_id} className={!p.iban ? "bg-amber-50/50" : "hover:bg-slate-50/60 transition-colors"}>
                        <td className="px-5 py-4 font-medium text-slate-900">{p.prenom} {p.nom}</td>
                        <td className="px-5 py-4 text-slate-500">{p.mois_annees.join(", ")}</td>
                        <td className="px-5 py-4 text-slate-700">{p.montant_brut.toFixed(2)} €</td>
                        <td className="px-5 py-4 font-semibold text-emerald-700">{p.montant_net.toFixed(2)} €</td>
                        <td className="px-5 py-4">{p.iban ? <span className="font-mono text-xs text-slate-600">{p.iban}</span> : <span className="text-xs bg-amber-100 text-amber-700 font-semibold px-2 py-0.5 rounded-full">IBAN manquant</span>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            {dispatchResult && (
              <div className={`rounded-xl border p-4 text-sm ${dispatchState === "success" ? "bg-emerald-50 border-emerald-200" : "bg-red-50 border-red-200"}`}>
                {dispatchResult.success.length > 0 && <p className="text-emerald-800 font-semibold">{dispatchResult.success.length} virement(s) envoyé(s).</p>}
                {dispatchResult.errors.map((e) => <p key={e.prof_id} className="text-red-700 mt-1">Échec {e.prof_id === "global" ? "" : `(prof ${e.prof_id})`} : {e.error}</p>)}
              </div>
            )}
            <div className="flex justify-end">
              <button onClick={handleDispatch} disabled={dispatchState === "loading" || profs.filter((p) => p.iban).length === 0}
                className="px-6 py-3 rounded-xl font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                {dispatchState === "loading" ? "Envoi en cours…" : `Dispatcher ${profs.filter((p) => p.iban).length} virement(s) — ${totalNet.toFixed(2)} €`}
              </button>
            </div>
          </div>
        )}
        {section === "profs"         && <AdminProfs />}
        {section === "eleves"        && <AdminEleves />}
        {section === "cours"         && <AdminCours />}
        {section === "recaps"        && <AdminRecaps />}
        {section === "contestations" && <AdminContestations />}
        {section === "paps"          && <AdminPaps />}
        {section === "search"        && <AdminSearch />}
        {section === "orphelins"     && <AdminOrphelins />}
      </main>
    </div>
  );
}
