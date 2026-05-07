import React, { useEffect, useState } from "react";
import {
  GraduationCap, Users, BookOpen, AlertTriangle, Banknote, LogOut,
  Search, ClipboardList, X, Check, Pencil, Loader2, Megaphone, Plus, Trash2, Copy, RotateCcw, Link2, CalendarDays, Percent, Receipt,
} from "lucide-react";
import { supabase } from "../../../lib/supabase";
import { useAuth } from "../../../lib/auth";
import logo from "@/assets/colibri.svg";
import { ProfFicheModal } from "./ProfFicheModal";
import { EleveFicheModal } from "./EleveFicheModal";
import { CreateRecapModal } from "./CreateRecapModal";
import { AdminSearch } from "./AdminSearch";
import { AdminOrphelins } from "./AdminOrphelins";
import { AdminGrille } from "./AdminGrille";
import { AdminCompta } from "./AdminCompta";
import { getMultiplicateurBrut, GrilleRow } from "../../../lib/hooks/useGrilleCommission";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;

interface ProfPaiement {
  prof_id: string; prenom: string; nom: string; iban: string | null;
  recap_ids: string[];
  montant_brut: number;      // ce que le parent a payé
  montant_net_prof: number;  // ce que le prof touchera après impôts (brut × taux_plusvalue)
  montant_virement: number;  // ce qu'on vire réellement (montant_net_prof / 0.8264)
  mois_annees: string[];
}
type DispatchState = "idle" | "loading" | "success" | "error";
type SingleDispatchState = Record<string, "idle" | "loading" | "done" | "error">;
type Section = "paiements" | "echeancier" | "profs" | "eleves" | "cours" | "recaps" | "contestations" | "paps" | "search" | "orphelins" | "grille" | "compta";

const NAV: { key: Section; label: string; Icon: React.ElementType }[] = [
  { key: "paiements",     label: "Dispatch paiements", Icon: Banknote },
  { key: "echeancier",    label: "Échéancier",         Icon: CalendarDays },
  { key: "profs",         label: "Profs",              Icon: GraduationCap },
  { key: "eleves",        label: "Élèves",             Icon: Users },
  { key: "cours",         label: "Cours",              Icon: BookOpen },
  { key: "recaps",        label: "Récaps mensuels",    Icon: ClipboardList },
  { key: "contestations", label: "Contestations",      Icon: AlertTriangle },
  { key: "paps",          label: "PAPS",               Icon: Megaphone },
  { key: "search",        label: "Recherche globale",  Icon: Search },
  { key: "orphelins",     label: "Cours orphelins",    Icon: Link2 },
  { key: "grille",        label: "Grille commission",  Icon: Percent },
  { key: "compta",        label: "Comptabilité",       Icon: Receipt },
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
  const [bulkSelected, setBulkSelected] = useState<Set<string>>(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);

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
    const [{ count: eleveCount }, { count: coursCount }] = await Promise.all([
      supabase.from("eleves").select("id", { count: "exact", head: true }).eq("prof_id", p.id),
      supabase.from("cours").select("id", { count: "exact", head: true }).eq("prof_id", p.id),
    ]);
    if (!window.confirm(
      `⚠ SUPPRESSION PROF — ${p.prenom} ${p.nom}\n\n` +
      `Conséquences IRRÉVERSIBLES (cascade) :\n` +
      `• ${eleveCount ?? "?"} élève(s) supprimé(s)\n` +
      `• ${coursCount ?? "?"} cours supprimé(s)\n` +
      `• Tous ses récaps et validations parentes associées\n\n` +
      `Cette action ne peut pas être annulée. Continuer ?`
    )) return;
    if (!window.confirm(`Dernière confirmation — supprimer définitivement ${p.prenom} ${p.nom} et toutes ses données ?`)) return;
    await supabase.from("profiles").delete().eq("id", p.id);
    setProfs((prev) => prev.filter((x) => x.id !== p.id));
  }

  const filtered = profs.filter((p) => `${p.prenom} ${p.nom} ${p.email}`.toLowerCase().includes(search.toLowerCase()));

  function toggleBulkP(id: string) {
    setBulkSelected((prev) => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
  }
  function toggleAllBulkP() {
    if (bulkSelected.size === filtered.length) setBulkSelected(new Set());
    else setBulkSelected(new Set(filtered.map((p) => p.id)));
  }
  async function bulkDeleteProfs() {
    if (!bulkSelected.size || !window.confirm(`Supprimer ${bulkSelected.size} prof(s) ? Les élèves et cours associés seront aussi supprimés (cascade). Action irréversible.`)) return;
    if (!window.confirm("Dernière confirmation.")) return;
    setBulkLoading(true);
    await supabase.from("profiles").delete().in("id", [...bulkSelected]);
    setProfs((prev) => prev.filter((p) => !bulkSelected.has(p.id)));
    setBulkSelected(new Set()); setBulkLoading(false);
  }

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
              <tr>
                <th className="px-3 py-2.5 w-8"><input type="checkbox" checked={bulkSelected.size > 0 && bulkSelected.size === filtered.length} onChange={toggleAllBulkP} className="rounded w-3.5 h-3.5 accent-primary" /></th>
                <th className={TH}>id</th><th className={TH}>prenom / nom</th><th className={TH}>email</th><th className={TH}>siret</th><th className={TH}>iban</th><th className={TH}>created_at</th><th className={TH}>actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((p) => (
                <tr key={p.id} className={`transition-colors ${bulkSelected.has(p.id) ? "bg-primary/5" : "hover:bg-slate-50/60"}`}>
                  <td className="px-3 py-2.5 text-center"><input type="checkbox" checked={bulkSelected.has(p.id)} onChange={() => toggleBulkP(p.id)} className="rounded w-3.5 h-3.5 accent-primary" /></td>
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
              {filtered.length === 0 && <tr><td colSpan={8} className="p-8 text-center text-slate-400">Aucun résultat.</td></tr>}
            </tbody>
          </table>
        )}
      </div>

      {bulkSelected.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white rounded-2xl shadow-2xl px-5 py-3.5 flex items-center gap-4 min-w-max">
          <span className="text-sm font-semibold text-slate-300">{bulkSelected.size} prof(s)</span>
          <div className="w-px h-5 bg-slate-700" />
          <button onClick={bulkDeleteProfs} disabled={bulkLoading}
            className="px-3 py-1.5 text-xs font-semibold bg-red-600 hover:bg-red-700 rounded-lg disabled:opacity-50 transition-colors flex items-center gap-1.5">
            {bulkLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />} Supprimer
          </button>
          <button onClick={() => setBulkSelected(new Set())} className="ml-1 p-1 hover:text-slate-400 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

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
  const [ficheEleve, setFicheEleve] = useState<any | null>(null);
  const [bulkSelectedE, setBulkSelectedE] = useState<Set<string>>(new Set());
  const [bulkLoadingE, setBulkLoadingE] = useState(false);
  const [bulkStatutE, setBulkStatutE] = useState("actif");

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

  const filtered = eleves.filter((e) =>
    `${e.nom} ${e.matiere} ${e.niveau} ${e.profiles ? `${e.profiles.prenom} ${e.profiles.nom}` : ""}`.toLowerCase().includes(search.toLowerCase())
  );
  const STATUTS_ELEVE = ["actif","en pause","en attente","terminé"];

  function toggleBulkE(id: string) {
    setBulkSelectedE((prev) => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
  }
  function toggleAllBulkE() {
    if (bulkSelectedE.size === filtered.length) setBulkSelectedE(new Set());
    else setBulkSelectedE(new Set(filtered.map((e) => e.id)));
  }
  async function bulkChangeStatutE() {
    if (!bulkSelectedE.size || !window.confirm(`Changer le statut de ${bulkSelectedE.size} élève(s) en "${bulkStatutE}" ?`)) return;
    setBulkLoadingE(true);
    await supabase.from("eleves").update({ statut: bulkStatutE }).in("id", [...bulkSelectedE]);
    setEleves((prev) => prev.map((e) => bulkSelectedE.has(e.id) ? { ...e, statut: bulkStatutE } : e));
    setBulkSelectedE(new Set()); setBulkLoadingE(false);
  }
  async function bulkDeleteEleves() {
    if (!bulkSelectedE.size || !window.confirm(`Supprimer ${bulkSelectedE.size} élève(s) ? Les cours resteront (eleve_id → null). Action irréversible.`)) return;
    if (!window.confirm("Dernière confirmation.")) return;
    setBulkLoadingE(true);
    await supabase.from("eleves").delete().in("id", [...bulkSelectedE]);
    setEleves((prev) => prev.filter((e) => !bulkSelectedE.has(e.id)));
    setBulkSelectedE(new Set()); setBulkLoadingE(false);
  }

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
              <tr>
                <th className="px-3 py-2.5 w-8"><input type="checkbox" checked={bulkSelectedE.size > 0 && bulkSelectedE.size === filtered.length} onChange={toggleAllBulkE} className="rounded w-3.5 h-3.5 accent-primary" /></th>
                <th className={TH}>id</th><th className={TH}>nom</th><th className={TH}>niveau</th><th className={TH}>matiere</th><th className={TH}>tarif_heure</th><th className={TH}>statut</th><th className={TH}>prof</th><th className={TH}>actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((e) => (
                <tr key={e.id} className={`transition-colors ${bulkSelectedE.has(e.id) ? "bg-primary/5" : "hover:bg-slate-50/60"}`}>
                  <td className="px-3 py-2.5 text-center"><input type="checkbox" checked={bulkSelectedE.has(e.id)} onChange={() => toggleBulkE(e.id)} className="rounded w-3.5 h-3.5 accent-primary" /></td>
                  <td className={TD}><CopyID id={e.id} /></td>
                  <td className={`${TD} font-medium text-slate-900`}>
                    <button onClick={() => setFicheEleve(e)} className="hover:text-primary hover:underline transition-colors text-left">{e.nom}</button>
                  </td>
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
              {filtered.length === 0 && <tr><td colSpan={9} className="p-8 text-center text-slate-400">Aucun résultat.</td></tr>}
            </tbody>
          </table>
        )}
      </div>

      {bulkSelectedE.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white rounded-2xl shadow-2xl px-5 py-3.5 flex items-center gap-4 min-w-max">
          <span className="text-sm font-semibold text-slate-300">{bulkSelectedE.size} élève(s)</span>
          <div className="w-px h-5 bg-slate-700" />
          <div className="flex items-center gap-2">
            <select value={bulkStatutE} onChange={(e) => setBulkStatutE(e.target.value)}
              className="text-xs bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 outline-none text-slate-200 cursor-pointer">
              {STATUTS_ELEVE.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <button onClick={bulkChangeStatutE} disabled={bulkLoadingE}
              className="px-3 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 transition-colors flex items-center gap-1.5">
              {bulkLoadingE ? <Loader2 className="w-3 h-3 animate-spin" /> : null} Statut
            </button>
          </div>
          <div className="w-px h-5 bg-slate-700" />
          <button onClick={bulkDeleteEleves} disabled={bulkLoadingE}
            className="px-3 py-1.5 text-xs font-semibold bg-red-600 hover:bg-red-700 rounded-lg disabled:opacity-50 transition-colors flex items-center gap-1.5">
            <Trash2 className="w-3 h-3" /> Supprimer
          </button>
          <button onClick={() => setBulkSelectedE(new Set())} className="ml-1 p-1 hover:text-slate-400 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

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
      {ficheEleve && <EleveFicheModal eleve={ficheEleve} onClose={() => setFicheEleve(null)} />}
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
  const [editErr, setEditErr] = useState("");

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
    return !q || `${c.eleve_nom} ${c.matiere} ${c.profiles ? `${c.profiles.prenom} ${c.profiles.nom}` : ""}`.toLowerCase().includes(q);
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
    setBulkLoading(true);

    if (newId) {
      // Valider que le recap cible existe et appartient aux bons profs
      const { data: targetRecap } = await supabase.from("recap_mensuel")
        .select("id, prof_id, mois, annee, statut, profiles!inner(prenom, nom)").eq("id", newId).maybeSingle();
      if (!targetRecap) {
        alert("❌ recap_id introuvable — vérifie l'UUID."); setBulkLoading(false); return;
      }
      if ((targetRecap as any).statut === "paye") {
        alert("❌ Ce récap est «Payé». Impossible d'y rattacher des cours."); setBulkLoading(false); return;
      }
      const selectedCours = cours.filter((c) => bulkSelected.has(c.id));
      const wrongProf = selectedCours.filter((c) => c.prof_id !== targetRecap.prof_id);
      if (wrongProf.length > 0) {
        alert(
          `❌ ${wrongProf.length} cours sélectionné(s) n'appartiennent pas au même prof que ce récap.\n\n` +
          `Le récap cible est celui de ${(targetRecap as any).profiles?.prenom} ${(targetRecap as any).profiles?.nom}.\n` +
          `Cours incompatibles : ${wrongProf.map((c) => `${c.eleve_nom} (${c.date})`).join(", ")}\n\n` +
          `Annulation — ne réassigner que des cours du même prof.`
        );
        setBulkLoading(false); return;
      }
      if (!window.confirm(
        `Réassigner ${bulkSelected.size} cours vers le récap ${MOIS_LABELS[(targetRecap as any).mois - 1]} ${(targetRecap as any).annee} ` +
        `(${(targetRecap as any).profiles?.prenom} ${(targetRecap as any).profiles?.nom}, statut : ${(targetRecap as any).statut}) ?\n\n` +
        `Les totaux du récap source et cible seront modifiés.`
      )) { setBulkLoading(false); return; }
    } else {
      if (!window.confirm(
        `Détacher ${bulkSelected.size} cours de tout récap (recap_id → null) ?\n\n` +
        `Ces cours deviendront orphelins. Si c'est le dernier cours d'un élève dans un récap, sa validation parente restera en attente indéfiniment — pense à la supprimer.`
      )) { setBulkLoading(false); return; }
    }

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
    setEditErr(""); setSaving(true);
    const newRecapId = editF.recap_id.trim() || null;

    // Valider la FK recap_id si elle a changé
    if (newRecapId && newRecapId !== editing.recap_id) {
      const { data: targetRecap } = await supabase.from("recap_mensuel")
        .select("id, prof_id, mois, annee, statut, profiles!inner(prenom, nom)").eq("id", newRecapId).maybeSingle();
      if (!targetRecap) {
        setEditErr("recap_id introuvable — vérifie l'UUID."); setSaving(false); return;
      }
      if (targetRecap.prof_id !== editing.prof_id) {
        setEditErr(`Ce récap appartient à un autre prof (${(targetRecap as any).profiles?.prenom} ${(targetRecap as any).profiles?.nom}). Le cours doit rester avec ${editing.profiles?.prenom ?? "son prof"}.`);
        setSaving(false); return;
      }
      if ((targetRecap as any).statut === "paye") {
        setEditErr("Ce récap est déjà «Payé». Impossible d'y rattacher un cours."); setSaving(false); return;
      }
    }

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
    if (!window.confirm(
      `Supprimer le cours du ${c.date} — ${c.eleve_nom} (${c.matiere}, ${Number(c.montant).toFixed(2)} €) ?\n\n` +
      (c.recap_id ? `⚠ Ce cours est rattaché à un récap. Le montant du récap sera recalculé à la baisse.` : `Ce cours est orphelin (pas de récap associé).`)
    )) return;

    // Si le cours est dans un récap et a un eleve_id, vérifier si c'est le dernier cours de cet élève dans ce récap
    if (c.recap_id && c.eleve_id) {
      const { data: autresCours } = await supabase.from("cours")
        .select("id").eq("recap_id", c.recap_id).eq("eleve_id", c.eleve_id).neq("id", c.id);
      if (!autresCours?.length) {
        if (!window.confirm(
          `C'est le DERNIER cours de ${c.eleve_nom} dans ce récap.\n\n` +
          `La validation parente de cet élève sera aussi supprimée (sinon le récap restera bloqué en attente d'une validation fantôme).\n\n` +
          `Confirmer la suppression du cours + de la validation ?`
        )) return;
        await supabase.from("recap_eleve_validation")
          .delete().eq("recap_id", c.recap_id).eq("eleve_id", c.eleve_id);
      }
    }

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
        <AdminEditModal title={`EDIT cours · ${editing.id.slice(0,8)}`} onClose={() => { setEditing(null); setEditErr(""); }} onSave={saveEdit} saving={saving}>
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
          {editing.recap_id && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-800">
                <p className="font-semibold">Ce cours est rattaché au récap <span className="font-mono">{editing.recap_id.slice(0,8)}…</span></p>
                <p className="mt-0.5">Modifier <strong>montant</strong> ou <strong>duree_heures</strong> changera le calcul du net du prof sur ce récap. Si le récap est en attente de paiement, le virement sera basé sur le nouveau montant.</p>
              </div>
            </div>
          )}
          <div>
            <label className={FL}>recap_id (UUID ou vide pour null)</label>
            <input value={editF.recap_id} onChange={(e) => setEditF({ ...editF, recap_id: e.target.value })} placeholder="null" className={FI} />
            <p className="text-xs text-slate-400 mt-1">⚠ Ne changer que vers un récap du même prof. Laisser vide = cours orphelin.</p>
          </div>
          {editErr && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
              <p className="text-xs text-red-800 font-semibold">{editErr}</p>
            </div>
          )}
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
  const [showCreate, setShowCreate]   = useState(false);
  const [profsList, setProfsList]     = useState<{ id: string; prenom: string; nom: string }[]>([]);
  const [showAddCours, setShowAddCours] = useState(false);
  const [addCoursEleves, setAddCoursEleves] = useState<any[]>([]);
  const [addCoursF, setAddCoursF] = useState({ eleve_id: "", eleve_nom: "", matiere: "", date: "", duree: "", duree_heures: "", montant: "" });
  const [addCoursLoading, setAddCoursLoading] = useState(false);
  const [bulkSelectedR, setBulkSelectedR] = useState<Set<string>>(new Set());
  const [bulkLoadingR, setBulkLoadingR] = useState(false);
  const [bulkStatutR, setBulkStatutR] = useState("en_cours");


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
    loadRecaps();
    supabase.from("profiles").select("id, prenom, nom").eq("role", "prof").order("nom")
      .then(({ data }) => setProfsList(data ?? []));
  }, []);

  async function openRecap(recap: any) {
    setSelected(recap); setCoursLoading(true);
    const { data } = await supabase.from("cours")
      .select("id, date, eleve_nom, matiere, duree, duree_heures, montant, taux_plusvalue")
      .eq("recap_id", recap.id).order("date", { ascending: true });
    setRecapCours(data ?? []); setCoursLoading(false);
  }

  async function changeRecapStatut(newStatut: string) {
    if (!selected) return;
    if (newStatut === selected.statut) return;

    if (newStatut === "paye") {
      if (!window.confirm(
        `⚠ PASSAGE À «PAYÉ» — Action sensible\n\n` +
        `Ce statut signifie que le virement a été envoyé au prof.\n` +
        `Il NE déclenche PAS de virement réel — c'est uniquement un marquage manuel.\n\n` +
        `À utiliser UNIQUEMENT si le virement a été confirmé hors-plateforme (virement bancaire direct, etc.).\n\n` +
        `Si tu utilises le bouton «Dispatcher» dans la section Paiements, ne pas passer à «Payé» manuellement — c'est automatique.\n\n` +
        `Confirmer le passage à «Payé» ?`
      )) return;
    }

    const ORDRE = ["en_cours","en_attente_parent","en_attente_paiement","valide","paye"];
    const currentIdx = ORDRE.indexOf(selected.statut);
    const newIdx = ORDRE.indexOf(newStatut);
    if (newIdx > currentIdx + 1 && newIdx >= 0 && currentIdx >= 0) {
      if (!window.confirm(
        `Tu passes de «${RECAP_STATUT_STYLE[selected.statut]?.label ?? selected.statut}» directement à «${RECAP_STATUT_STYLE[newStatut]?.label ?? newStatut}» en sautant des étapes.\n\n` +
        `Les validations parentes ne seront pas vérifiées. Continuer ?`
      )) return;
    }

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
    if (!selected) return;
    const { data: contestes } = await supabase.from("cours")
      .select("id, eleve_nom, date").eq("recap_id", selected.id).eq("statut", "contesté");
    const hasContestes = (contestes?.length ?? 0) > 0;
    if (!window.confirm(
      (hasContestes
        ? `⚠ ATTENTION : ${contestes!.length} cours en statut «contesté» dans ce récap :\n` +
          contestes!.map((c: any) => `  · ${c.eleve_nom} (${c.date})`).join("\n") +
          `\n\nForcer quand même ? Le parent sera considéré comme ayant validé malgré sa contestation ouverte.\n\n`
        : "") +
      `Forcer la validation de TOUS les élèves de ce récap ?`
    )) return;
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
    const coursCount = recapCours.length;
    const valsCount = (selected.recap_eleve_validation ?? []).length;
    if (!window.confirm(
      `⚠ SUPPRESSION RÉCAP — ${MOIS_LABELS[selected.mois - 1]} ${selected.annee} (${selected.profiles?.prenom} ${selected.profiles?.nom})\n\n` +
      `Conséquences IRRÉVERSIBLES :\n` +
      `• ${valsCount} validation(s) parente(s) supprimées (cascade)\n` +
      `• ${coursCount} cours détaché(s) → recap_id mis à null (cours orphelins)\n\n` +
      `Les cours ne seront PAS supprimés — ils resteront dans la section «Cours orphelins».\n\n` +
      `Continuer ?`
    )) return;
    if (!window.confirm("Dernière confirmation — supprimer définitivement ce récap ?")) return;
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

    // Valider que la date est dans le mois/année du récap
    const [dateYear, dateMonth] = addCoursF.date.split("-").map(Number);
    if (dateYear !== selected.annee || dateMonth !== selected.mois) {
      if (!window.confirm(
        `⚠ La date ${addCoursF.date} n'est pas dans la période du récap (${MOIS_LABELS[selected.mois - 1]} ${selected.annee}).\n\n` +
        `Ajouter un cours d'un autre mois dans ce récap peut créer des incohérences comptables et compliquer la vérification.\n\n` +
        `Continuer quand même ?`
      )) { setAddCoursLoading(false); return; }
    }

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

  function toggleBulkR(id: string) {
    setBulkSelectedR((prev) => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
  }
  function toggleAllBulkR() {
    if (bulkSelectedR.size === filtered.length) setBulkSelectedR(new Set());
    else setBulkSelectedR(new Set(filtered.map((r) => r.id)));
  }
  async function bulkChangeStatutR() {
    if (!bulkSelectedR.size || !window.confirm(`Passer ${bulkSelectedR.size} récap(s) à «${RECAP_STATUT_STYLE[bulkStatutR]?.label ?? bulkStatutR}» ?`)) return;
    setBulkLoadingR(true);
    await supabase.from("recap_mensuel").update({ statut: bulkStatutR }).in("id", [...bulkSelectedR]);
    setRecaps((prev) => prev.map((r) => bulkSelectedR.has(r.id) ? { ...r, statut: bulkStatutR } : r));
    setBulkSelectedR(new Set()); setBulkLoadingR(false);
  }
  async function bulkDeleteRecaps() {
    if (!bulkSelectedR.size || !window.confirm(`Supprimer ${bulkSelectedR.size} récap(s) ? Les cours associés deviendront orphelins. Action irréversible.`)) return;
    if (!window.confirm("Dernière confirmation.")) return;
    setBulkLoadingR(true);
    await supabase.from("recap_mensuel").delete().in("id", [...bulkSelectedR]);
    setRecaps((prev) => prev.filter((r) => !bulkSelectedR.has(r.id)));
    if (selected && bulkSelectedR.has(selected.id)) setSelected(null);
    setBulkSelectedR(new Set()); setBulkLoadingR(false);
  }

  const totalNet = (_r: any) => recapCours.reduce((s, c) => {
    return s + c.montant * (1 + (c.taux_plusvalue ?? 0));
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
              <tr>
                <th className="px-3 py-2.5 w-8"><input type="checkbox" checked={bulkSelectedR.size > 0 && bulkSelectedR.size === filtered.length} onChange={toggleAllBulkR} className="rounded w-3.5 h-3.5 accent-primary" /></th>
                <th className={TH}>id</th><th className={TH}>créé le</th><th className={TH}>mois / annee</th><th className={TH}>prof</th><th className={TH}>statut</th><th className={TH}>validations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((r) => {
                const vals: any[] = r.recap_eleve_validation ?? [];
                const nbV = vals.filter((v) => v.statut === "valide").length;
                const nbC = vals.filter((v) => v.statut === "conteste").length;
                const nbA = vals.filter((v) => v.statut !== "valide").length;
                const si  = RECAP_STATUT_STYLE[r.statut] ?? { bg: "bg-slate-100 text-slate-500", label: r.statut };
                return (
                  <tr key={r.id} className={`transition-colors cursor-pointer ${bulkSelectedR.has(r.id) ? "bg-primary/5" : "hover:bg-slate-50/60"}`}
                    onClick={(ev) => { if ((ev.target as HTMLElement).closest("input[type=checkbox]")) return; openRecap(r); }}>
                    <td className="px-3 py-2.5 text-center" onClick={(ev) => ev.stopPropagation()}>
                      <input type="checkbox" checked={bulkSelectedR.has(r.id)} onChange={() => toggleBulkR(r.id)} className="rounded w-3.5 h-3.5 accent-primary" />
                    </td>
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
              {selected.statut === "paye" && (
                <div className="bg-teal-50 border border-teal-200 rounded-xl p-3 flex gap-2">
                  <Check className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <div className="text-xs text-teal-800">
                    <p className="font-semibold">Ce récap est marqué «Payé» — le virement a été effectué.</p>
                    <p className="mt-0.5">Les validations ne peuvent plus être modifiées (forcer / révoquer désactivés). Le statut peut être révisé manuellement via le sélecteur ci-dessus si nécessaire.</p>
                  </div>
                </div>
              )}
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
                          const taux   = c.taux_plusvalue ?? 0;
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
                  {(selected.recap_eleve_validation ?? []).some((v: any) => v.statut !== "valide") && selected.statut !== "paye" && (
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
                                  {v.statut !== "valide" && selected.statut !== "paye" && (
                                    <button onClick={() => forcerValidation(v.id)} disabled={actionLoading === v.id}
                                      className="flex items-center gap-1 px-2 py-1 text-xs font-semibold bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 disabled:opacity-50 transition-colors">
                                      {actionLoading === v.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                                      Forcer
                                    </button>
                                  )}
                                  {v.statut === "valide" && (
                                    <button
                                      onClick={() => selected.statut !== "paye" && revoquerValidation(v.id)}
                                      disabled={actionLoading === v.id || selected.statut === "paye"}
                                      title={selected.statut === "paye" ? "Récap payé — révocation impossible" : "Révoquer cette validation"}
                                      className={`flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-lg transition-colors ${selected.statut === "paye" ? "bg-slate-100 text-slate-400 cursor-not-allowed" : "bg-amber-100 text-amber-700 hover:bg-amber-200 disabled:opacity-50"}`}>
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

      {bulkSelectedR.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white rounded-2xl shadow-2xl px-5 py-3.5 flex items-center gap-4 min-w-max">
          <span className="text-sm font-semibold text-slate-300">{bulkSelectedR.size} récap(s)</span>
          <div className="w-px h-5 bg-slate-700" />
          <div className="flex items-center gap-2">
            <select value={bulkStatutR} onChange={(e) => setBulkStatutR(e.target.value)}
              className="text-xs bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 outline-none text-slate-200 cursor-pointer">
              {RECAP_STATUTS.map((s) => <option key={s} value={s}>{RECAP_STATUT_STYLE[s]?.label ?? s}</option>)}
            </select>
            <button onClick={bulkChangeStatutR} disabled={bulkLoadingR}
              className="px-3 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 transition-colors flex items-center gap-1.5">
              {bulkLoadingR ? <Loader2 className="w-3 h-3 animate-spin" /> : null} Statut
            </button>
          </div>
          <div className="w-px h-5 bg-slate-700" />
          <button onClick={bulkDeleteRecaps} disabled={bulkLoadingR}
            className="px-3 py-1.5 text-xs font-semibold bg-red-600 hover:bg-red-700 rounded-lg disabled:opacity-50 transition-colors flex items-center gap-1.5">
            <Trash2 className="w-3 h-3" /> Supprimer
          </button>
          <button onClick={() => setBulkSelectedR(new Set())} className="ml-1 p-1 hover:text-slate-400 transition-colors">
            <X className="w-4 h-4" />
          </button>
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
  const [bulkSelectedC, setBulkSelectedC] = useState<Set<string>>(new Set());
  const [bulkLoadingC, setBulkLoadingC] = useState(false);

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
    `${item.cours?.eleve_nom ?? ""} ${item.cours?.matiere ?? ""} ${item.raison ?? ""} ${item.cours?.profiles ? `${item.cours.profiles.prenom} ${item.cours.profiles.nom}` : ""}`.toLowerCase().includes(search.toLowerCase())
  );

  function toggleBulkC(id: string) {
    setBulkSelectedC((prev) => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
  }
  function toggleAllBulkC() {
    if (bulkSelectedC.size === filtered.length) setBulkSelectedC(new Set());
    else setBulkSelectedC(new Set(filtered.map((i) => i.id)));
  }
  async function bulkRejectContestations() {
    if (!bulkSelectedC.size || !window.confirm(`Rejeter ${bulkSelectedC.size} contestation(s) ? Les cours repasseront à «déclaré». Action irréversible.`)) return;
    setBulkLoadingC(true);
    const toReject = items.filter((i) => bulkSelectedC.has(i.id));
    await Promise.all(toReject.map(async (item) => {
      await supabase.from("contestation_cours").delete().eq("id", item.id);
      await supabase.from("cours").update({ statut: "déclaré" }).eq("id", item.cours.id);
      if (item.cours.recap_id && item.cours.eleve_id) {
        await supabase.from("recap_eleve_validation").update({ statut: "en_attente_parent" })
          .eq("recap_id", item.cours.recap_id).eq("eleve_id", item.cours.eleve_id);
      }
    }));
    setItems((prev) => prev.filter((i) => !bulkSelectedC.has(i.id)));
    setBulkSelectedC(new Set()); setBulkLoadingC(false);
  }

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
              <tr>
                <th className="px-3 py-2.5 w-8"><input type="checkbox" checked={bulkSelectedC.size > 0 && bulkSelectedC.size === filtered.length} onChange={toggleAllBulkC} className="rounded w-3.5 h-3.5 accent-primary" /></th>
                <th className={TH}>id</th><th className={TH}>created_at</th><th className={TH}>eleve_nom</th><th className={TH}>matiere</th><th className={TH}>date cours</th><th className={TH}>montant</th><th className={TH}>raison</th><th className={TH}>prof</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((item) => (
                <tr key={item.id} className={`transition-colors cursor-pointer ${bulkSelectedC.has(item.id) ? "bg-primary/5" : "hover:bg-slate-50/60"}`}
                  onClick={(ev) => { if ((ev.target as HTMLElement).closest("input[type=checkbox]")) return; openItem(item); }}>
                  <td className="px-3 py-2.5 text-center" onClick={(ev) => ev.stopPropagation()}>
                    <input type="checkbox" checked={bulkSelectedC.has(item.id)} onChange={() => toggleBulkC(item.id)} className="rounded w-3.5 h-3.5 accent-primary" />
                  </td>
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

      {bulkSelectedC.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white rounded-2xl shadow-2xl px-5 py-3.5 flex items-center gap-4 min-w-max">
          <span className="text-sm font-semibold text-slate-300">{bulkSelectedC.size} contestation(s)</span>
          <div className="w-px h-5 bg-slate-700" />
          <button onClick={bulkRejectContestations} disabled={bulkLoadingC}
            className="px-3 py-1.5 text-xs font-semibold bg-amber-600 hover:bg-amber-700 rounded-lg disabled:opacity-50 transition-colors flex items-center gap-1.5">
            {bulkLoadingC ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />} Rejeter tout
          </button>
          <button onClick={() => setBulkSelectedC(new Set())} className="ml-1 p-1 hover:text-slate-400 transition-colors">
            <X className="w-4 h-4" />
          </button>
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
  const [annonces, setAnnonces]         = useState<any[]>([]);
  const [loading, setLoading]           = useState(true);
  const [showForm, setShowForm]         = useState(false);
  const [editing, setEditing]           = useState<any | null>(null);
  const [form, setForm]                 = useState(PAPS_EMPTY);
  const [newTag, setNewTag]             = useState("");
  const [saving, setSaving]             = useState(false);
  const [search, setSearch]             = useState("");
  const [candCounts, setCandCounts]     = useState<Record<string, number>>({});
  const [viewingCands, setViewingCands] = useState<any | null>(null);
  const [cands, setCands]               = useState<any[]>([]);
  const [candsLoading, setCandsLoading] = useState(false);
  const [bulkSelectedPA, setBulkSelectedPA] = useState<Set<string>>(new Set());
  const [bulkLoadingPA, setBulkLoadingPA] = useState(false);

  async function load() {
    const { data } = await supabase.from("paps_annonces").select("*").order("created_at", { ascending: false });
    const list = data ?? [];
    setAnnonces(list);
    if (list.length > 0) {
      const { data: cd } = await supabase.from("paps_candidatures")
        .select("annonce_id").in("annonce_id", list.map((a) => a.id));
      const counts: Record<string, number> = {};
      (cd ?? []).forEach((c) => { counts[c.annonce_id] = (counts[c.annonce_id] ?? 0) + 1; });
      setCandCounts(counts);
    }
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function openCandidatures(a: any) {
    setViewingCands(a); setCandsLoading(true); setCands([]);
    const { data: cd } = await supabase.from("paps_candidatures")
      .select("id, candidat_id, message, created_at").eq("annonce_id", a.id)
      .order("created_at", { ascending: false });
    if (cd && cd.length > 0) {
      const { data: profiles } = await supabase.from("profiles")
        .select("id, prenom, nom, email, telephone")
        .in("id", [...new Set(cd.map((c) => c.candidat_id))]);
      const pm = Object.fromEntries((profiles ?? []).map((p) => [p.id, p]));
      setCands(cd.map((c) => ({ ...c, profile: pm[c.candidat_id] ?? {} })));
    }
    setCandsLoading(false);
  }

  async function deleteCandidature(id: string, annonceId: string) {
    if (!window.confirm("Supprimer cette candidature ? Le candidat ne sera pas notifié.")) return;
    await supabase.from("paps_candidatures").delete().eq("id", id);
    setCands((prev) => prev.filter((c) => c.id !== id));
    setCandCounts((prev) => ({ ...prev, [annonceId]: Math.max(0, (prev[annonceId] ?? 1) - 1) }));
  }

  function openCreate() {
    setEditing(null); setForm(PAPS_EMPTY); setNewTag(""); setShowForm(true);
  }

  function openEdit(a: any) {
    setEditing(a);
    setForm({ prof_nom: a.prof_nom, matiere: a.matiere, niveau_eleve: a.niveau_eleve,
      prix: a.prix, frequence: a.frequence ?? "", horaires: a.horaires ?? "",
      localisation: a.localisation ?? "", description_eleve: a.description_eleve ?? "",
      tags: a.tags ?? [], urgent: a.urgent ?? false });
    setNewTag(""); setShowForm(true);
  }

  function addTag() {
    const t = newTag.trim();
    if (t && !form.tags.includes(t)) setForm({ ...form, tags: [...form.tags, t] });
    setNewTag("");
  }

  async function handleSave() {
    if (!form.prof_nom.trim() || !user) return;
    setSaving(true);
    try {
      const payload = {
        prof_nom: form.prof_nom.trim(), matiere: form.matiere, niveau_eleve: form.niveau_eleve,
        prix: form.prix, frequence: form.frequence, horaires: form.horaires,
        localisation: form.localisation, description_eleve: form.description_eleve,
        tags: form.tags, urgent: form.urgent,
      };
      if (editing) {
        await supabase.from("paps_annonces").update(payload).eq("id", editing.id);
        setAnnonces((prev) => prev.map((a) => a.id === editing.id ? { ...a, ...payload } : a));
      } else {
        await supabase.from("paps_annonces").insert({ ...payload, prof_id: user.id, active: true });
        load();
      }
      setShowForm(false); setEditing(null); setForm(PAPS_EMPTY);
    } finally { setSaving(false); }
  }

  async function toggleActive(id: string, active: boolean) {
    await supabase.from("paps_annonces").update({ active: !active }).eq("id", id);
    setAnnonces((prev) => prev.map((a) => a.id === id ? { ...a, active: !active } : a));
  }

  async function deleteAnnonce(id: string) {
    const count = candCounts[id] ?? 0;
    if (!window.confirm(
      `Supprimer cette annonce définitivement ?\n\n` +
      (count > 0 ? `⚠ ${count} candidature(s) associée(s) seront aussi supprimées.\n\n` : "") +
      `Action irréversible.`
    )) return;
    await supabase.from("paps_annonces").delete().eq("id", id);
    setAnnonces((prev) => prev.filter((a) => a.id !== id));
  }

  const filtered = annonces.filter((a) =>
    `${a.prof_nom} ${a.matiere} ${a.niveau_eleve} ${a.localisation}`.toLowerCase().includes(search.toLowerCase())
  );
  const INP = "w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm focus:border-primary";

  function toggleBulkPA(id: string) {
    setBulkSelectedPA((prev) => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
  }
  function toggleAllBulkPA() {
    if (bulkSelectedPA.size === filtered.length) setBulkSelectedPA(new Set());
    else setBulkSelectedPA(new Set(filtered.map((a) => a.id)));
  }
  async function bulkToggleActive(active: boolean) {
    if (!bulkSelectedPA.size) return;
    setBulkLoadingPA(true);
    await supabase.from("paps_annonces").update({ active }).in("id", [...bulkSelectedPA]);
    setAnnonces((prev) => prev.map((a) => bulkSelectedPA.has(a.id) ? { ...a, active } : a));
    setBulkSelectedPA(new Set()); setBulkLoadingPA(false);
  }
  async function bulkDeleteAnnonces() {
    if (!bulkSelectedPA.size || !window.confirm(`Supprimer ${bulkSelectedPA.size} annonce(s) et leurs candidatures ? Action irréversible.`)) return;
    if (!window.confirm("Dernière confirmation.")) return;
    setBulkLoadingPA(true);
    await supabase.from("paps_annonces").delete().in("id", [...bulkSelectedPA]);
    setAnnonces((prev) => prev.filter((a) => !bulkSelectedPA.has(a.id)));
    setBulkSelectedPA(new Set()); setBulkLoadingPA(false);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">PAPS</h1>
          <p className="text-xs font-mono text-slate-400 mt-0.5">{annonces.length} rows · paps_annonces</p>
        </div>
        <button onClick={openCreate}
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
              <tr>
                <th className="px-3 py-2.5 w-8"><input type="checkbox" checked={bulkSelectedPA.size > 0 && bulkSelectedPA.size === filtered.length} onChange={toggleAllBulkPA} className="rounded w-3.5 h-3.5 accent-primary" /></th>
                <th className={TH}>id</th><th className={TH}>créé le</th><th className={TH}>prof_nom</th><th className={TH}>matiere</th><th className={TH}>niveau</th><th className={TH}>prix</th><th className={TH}>localisation</th><th className={TH}>active</th><th className={TH}>candidatures</th><th className={TH}>actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((a) => {
                const nb = candCounts[a.id] ?? 0;
                return (
                  <tr key={a.id} className={`transition-colors ${bulkSelectedPA.has(a.id) ? "bg-primary/5" : "hover:bg-slate-50/60"}`}>
                    <td className="px-3 py-2.5 text-center"><input type="checkbox" checked={bulkSelectedPA.has(a.id)} onChange={() => toggleBulkPA(a.id)} className="rounded w-3.5 h-3.5 accent-primary" /></td>
                    <td className={TD}><CopyID id={a.id} /></td>
                    <td className={`${TD} font-mono text-xs text-slate-400`}>{new Date(a.created_at).toLocaleDateString("fr-FR")}</td>
                    <td className={`${TD} font-medium text-slate-900`}>{a.prof_nom}</td>
                    <td className={`${TD} text-slate-500`}>{a.matiere}</td>
                    <td className={`${TD} text-slate-500`}>{a.niveau_eleve}</td>
                    <td className={`${TD} font-mono text-slate-700`}>{a.prix} €/h</td>
                    <td className={`${TD} text-slate-400 text-xs`}>{a.localisation || "—"}</td>
                    <td className={TD}>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${a.active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                        {a.active ? "active" : "inactive"}
                      </span>
                      {a.urgent && <span className="ml-1.5 text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-600">urgent</span>}
                    </td>
                    <td className={TD}>
                      <button onClick={() => openCandidatures(a)}
                        className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors ${nb > 0 ? "bg-indigo-100 text-indigo-700 hover:bg-indigo-200" : "bg-slate-100 text-slate-400 hover:bg-slate-200"}`}>
                        {nb > 0 ? `${nb} candidature${nb > 1 ? "s" : ""}` : "aucune"}
                      </button>
                    </td>
                    <td className={TD}>
                      <div className="flex gap-1.5">
                        <button onClick={() => openEdit(a)}
                          className="flex items-center gap-1 px-2 py-1 text-xs font-semibold bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors">
                          <Pencil className="w-3 h-3" /> Éditer
                        </button>
                        <button onClick={() => toggleActive(a.id, a.active)}
                          className={`text-xs font-semibold px-2 py-1 rounded-lg transition-colors ${a.active ? "bg-amber-50 text-amber-700 hover:bg-amber-100" : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"}`}>
                          {a.active ? "Désactiver" : "Activer"}
                        </button>
                        <button onClick={() => deleteAnnonce(a.id)} className="flex items-center px-2 py-1 text-xs font-semibold bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Modal candidatures ── */}
      {viewingCands && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4 backdrop-blur-sm" onClick={() => setViewingCands(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="border-b border-slate-100 px-6 py-4 flex items-start justify-between flex-shrink-0">
              <div>
                <h3 className="font-bold text-slate-900">Candidatures — {viewingCands.prof_nom}</h3>
                <p className="text-xs font-mono text-slate-400 mt-0.5">
                  {viewingCands.matiere} · {viewingCands.niveau_eleve} · {viewingCands.prix} €/h
                  {viewingCands.localisation ? ` · ${viewingCands.localisation}` : ""}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">Annonce créée le {new Date(viewingCands.created_at).toLocaleDateString("fr-FR")}</p>
              </div>
              <button onClick={() => setViewingCands(null)} className="p-2 rounded-xl hover:bg-slate-100 transition-colors flex-shrink-0">
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {candsLoading ? (
                <div className="flex items-center justify-center gap-2 p-8 text-slate-400">
                  <Loader2 className="w-4 h-4 animate-spin" /> Chargement…
                </div>
              ) : cands.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-sm font-mono">Aucune candidature pour cette annonce.</div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200 sticky top-0">
                    <tr>
                      <th className={TH}>postulé le</th>
                      <th className={TH}>candidat</th>
                      <th className={TH}>email</th>
                      <th className={TH}>tél</th>
                      <th className={TH}>message</th>
                      <th className={TH}></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {cands.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50/60">
                        <td className={`${TD} font-mono text-xs text-slate-400 whitespace-nowrap`}>
                          {new Date(c.created_at).toLocaleDateString("fr-FR")}<br />
                          <span className="text-slate-300">{new Date(c.created_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</span>
                        </td>
                        <td className={`${TD} font-medium text-slate-900 whitespace-nowrap`}>
                          {c.profile.prenom} {c.profile.nom}
                        </td>
                        <td className={`${TD} font-mono text-xs text-slate-500`}>{c.profile.email || "—"}</td>
                        <td className={`${TD} font-mono text-xs text-slate-500 whitespace-nowrap`}>{c.profile.telephone || "—"}</td>
                        <td className={`${TD} text-slate-700 text-xs max-w-[240px]`}>
                          {c.message ? (
                            <p className="whitespace-pre-wrap leading-relaxed">{c.message}</p>
                          ) : (
                            <span className="text-slate-300 font-mono italic">sans message</span>
                          )}
                        </td>
                        <td className={TD}>
                          <button onClick={() => deleteCandidature(c.id, viewingCands.id)}
                            className="flex items-center px-2 py-1 text-xs font-semibold bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto flex flex-col">
            <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
              <h3 className="font-bold text-slate-900">{editing ? "Modifier l'annonce PAPS" : "Nouvelle annonce PAPS"}</h3>
              <button onClick={() => { setShowForm(false); setEditing(null); }} className="p-2 rounded-xl hover:bg-slate-100 transition-colors"><X className="w-4 h-4 text-slate-500" /></button>
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
              <button onClick={() => { setShowForm(false); setEditing(null); }} className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-sm font-medium transition-colors">Annuler</button>
              <button onClick={handleSave} disabled={!form.prof_nom.trim() || saving}
                className="flex-1 bg-slate-900 text-white px-4 py-2.5 rounded-xl hover:bg-primary transition-colors disabled:opacity-40 flex items-center justify-center gap-2 text-sm font-semibold">
                {saving && <Loader2 className="w-4 h-4 animate-spin" />} {editing ? "Enregistrer" : "Publier l'annonce"}
              </button>
            </div>
          </div>
        </div>
      )}

      {bulkSelectedPA.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white rounded-2xl shadow-2xl px-5 py-3.5 flex items-center gap-4 min-w-max">
          <span className="text-sm font-semibold text-slate-300">{bulkSelectedPA.size} annonce(s)</span>
          <div className="w-px h-5 bg-slate-700" />
          <button onClick={() => bulkToggleActive(true)} disabled={bulkLoadingPA}
            className="px-3 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 rounded-lg disabled:opacity-50 transition-colors">
            Activer
          </button>
          <button onClick={() => bulkToggleActive(false)} disabled={bulkLoadingPA}
            className="px-3 py-1.5 text-xs font-semibold bg-amber-600 hover:bg-amber-700 rounded-lg disabled:opacity-50 transition-colors">
            Désactiver
          </button>
          <div className="w-px h-5 bg-slate-700" />
          <button onClick={bulkDeleteAnnonces} disabled={bulkLoadingPA}
            className="px-3 py-1.5 text-xs font-semibold bg-red-600 hover:bg-red-700 rounded-lg disabled:opacity-50 transition-colors flex items-center gap-1.5">
            {bulkLoadingPA ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />} Supprimer
          </button>
          <button onClick={() => setBulkSelectedPA(new Set())} className="ml-1 p-1 hover:text-slate-400 transition-colors">
            <X className="w-4 h-4" />
          </button>
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
  const [showDispatchConfirm, setShowDispatchConfirm] = useState(false);
  const [confirmSingleProf, setConfirmSingleProf] = useState<ProfPaiement | null>(null);
  const [singleDispatchState, setSingleDispatchState] = useState<SingleDispatchState>({});

  useEffect(() => { loadPendingPayments(); }, [lastRefresh]);

  async function loadPendingPayments() {
    setFetching(true);
    const [{ data, error }, { data: grilleData }] = await Promise.all([
      supabase.from("recap_mensuel")
        .select(`id, prof_id, mois, annee, profiles!inner ( prenom, nom, iban ), cours ( montant, multiplicateur_brut, eleves ( tarif_heure ) )`)
        .eq("statut", "valide"),
      supabase.from("grille_commission").select("tarif_palier, taux_plusvalue, multiplicateur_brut"),
    ]);
    if (error || !data) { setFetching(false); return; }
    const grille = (grilleData ?? []) as GrilleRow[];
    const byProf = new Map<string, ProfPaiement>();
    for (const recap of data as any[]) {
      const label = `${String(recap.mois).padStart(2, "0")}/${recap.annee}`;
      let montantRecap = 0;
      let virementRecap = 0;
      for (const cours of recap.cours ?? []) {
        const montant = Number(cours.montant);
        // Utilise le multiplicateur figé sur le cours ; fallback grille si null
        const multiplicateur = cours.multiplicateur_brut != null
          ? Number(cours.multiplicateur_brut)
          : getMultiplicateurBrut(grille, Number(cours.eleves?.tarif_heure ?? 0));
        montantRecap += montant;
        virementRecap += montant * multiplicateur;
      }
      const existing = byProf.get(recap.prof_id);
      if (existing) {
        existing.recap_ids.push(recap.id);
        existing.montant_brut += montantRecap;
        existing.montant_virement += virementRecap;
        existing.montant_net_prof = Math.round(existing.montant_virement * 0.8264 * 100) / 100;
        existing.mois_annees.push(label);
      } else {
        const montantVirement = Math.round(virementRecap * 100) / 100;
        byProf.set(recap.prof_id, {
          prof_id: recap.prof_id, prenom: recap.profiles.prenom, nom: recap.profiles.nom,
          iban: recap.profiles.iban ?? null, recap_ids: [recap.id],
          montant_brut: montantRecap,
          montant_net_prof: Math.round(montantVirement * 0.8264 * 100) / 100,
          montant_virement: montantVirement,
          mois_annees: [label],
        });
      }
    }
    setProfs(Array.from(byProf.values())); setFetching(false);
  }

  async function handleDispatch(profId?: string) {
    if (!session) return;
    if (profId) {
      setSingleDispatchState((s) => ({ ...s, [profId]: "loading" }));
    } else {
      setDispatchState("loading"); setDispatchResult(null);
    }
    try {
      const body = profId ? JSON.stringify({ prof_id: profId }) : "{}";
      const res = await fetch(`${SUPABASE_URL}/functions/v1/dispatch-payments`, {
        method: "POST",
        headers: { Authorization: `Bearer ${session.access_token}`, "Content-Type": "application/json" },
        body,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? `HTTP ${res.status}`);
      if (profId) {
        setSingleDispatchState((s) => ({ ...s, [profId]: json.errors?.length > 0 ? "error" : "done" }));
        setLastRefresh(new Date());
      } else {
        setDispatchResult(json); setDispatchState(json.errors?.length > 0 ? "error" : "success"); setLastRefresh(new Date());
      }
    } catch (e) {
      if (profId) {
        setSingleDispatchState((s) => ({ ...s, [profId]: "error" }));
      } else {
        setDispatchResult({ success: [], errors: [{ prof_id: "global", error: e instanceof Error ? e.message : String(e) }] });
        setDispatchState("error");
      }
    }
  }

  const totalVirement = profs.reduce((s, p) => s + p.montant_virement, 0);
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
        <div className="mx-3 mb-3 px-3 py-2.5 bg-slate-50 rounded-xl border border-slate-100">
          <p className="text-sm font-medium text-slate-800">Admin</p>
        </div>
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
        {/* ── Bandeau avertissement global ── */}
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-800 space-y-0.5">
            <p><span className="font-bold">Outil de production.</span> Toutes les modifications sont immédiates et impactent les profs, parents et calculs de paiement.</p>
            <p>Règles importantes : <span className="font-semibold">ne jamais passer un récap à «Payé» manuellement</span> sans virement réel confirmé · <span className="font-semibold">supprimer un prof efface aussi tous ses élèves et cours</span> · toute modification de montant sur un cours affecte le net du prof.</p>
          </div>
        </div>

        {section === "paiements" && (
          <div className="max-w-5xl space-y-6">
            <div className="flex items-center justify-between">
              <div><h1 className="text-xl font-bold text-slate-900">Dispatch des paiements</h1><p className="text-sm text-slate-500 mt-1">Montants calculés depuis le multiplicateur figé sur chaque cours</p></div>
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
                { label: "Profs à payer",         value: fetching ? "…" : String(profs.filter((p) => p.iban).length), color: "text-slate-900" },
                { label: "Total brut (parents)",   value: fetching ? "…" : `${profs.reduce((s, p) => s + p.montant_brut, 0).toFixed(2)} €`, color: "text-slate-900" },
                { label: "Total à virer (brut)",   value: fetching ? "…" : `${totalVirement.toFixed(2)} €`, color: "text-emerald-600" },
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
                    <tr>{["Prof","Périodes","Montant cours","Net prof (après impôts)","Virement à envoyer","IBAN","Action"].map((h) => <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>)}</tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {profs.map((p) => {
                      const st = singleDispatchState[p.prof_id] ?? "idle";
                      return (
                      <tr key={p.prof_id} className={!p.iban ? "bg-amber-50/50" : "hover:bg-slate-50/60 transition-colors"}>
                        <td className="px-5 py-4 font-medium text-slate-900">{p.prenom} {p.nom}</td>
                        <td className="px-5 py-4 text-slate-500">{p.mois_annees.join(", ")}</td>
                        <td className="px-5 py-4 text-slate-700">{p.montant_brut.toFixed(2)} €</td>
                        <td className="px-5 py-4 text-blue-700">{p.montant_net_prof.toFixed(2)} €</td>
                        <td className="px-5 py-4 font-semibold text-emerald-700">{p.montant_virement.toFixed(2)} €</td>
                        <td className="px-5 py-4">{p.iban ? <span className="font-mono text-xs text-slate-600">{p.iban}</span> : <span className="text-xs bg-amber-100 text-amber-700 font-semibold px-2 py-0.5 rounded-full">IBAN manquant</span>}</td>
                        <td className="px-5 py-4">
                          {st === "done" ? (
                            <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1"><Check className="w-3.5 h-3.5" />Envoyé</span>
                          ) : st === "error" ? (
                            <span className="text-xs font-semibold text-red-600">Échec</span>
                          ) : (
                            <button
                              disabled={!p.iban || st === "loading" || dispatchState === "loading"}
                              onClick={() => setConfirmSingleProf(p)}
                              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5"
                            >
                              {st === "loading" ? <><Loader2 className="w-3 h-3 animate-spin" />Envoi…</> : "Virer"}
                            </button>
                          )}
                        </td>
                      </tr>
                    )})}
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
              <button onClick={() => setShowDispatchConfirm(true)} disabled={dispatchState === "loading" || profs.filter((p) => p.iban).length === 0}
                className="px-6 py-3 rounded-xl font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                {dispatchState === "loading" ? "Envoi en cours…" : `Dispatcher ${profs.filter((p) => p.iban).length} virement(s) — ${totalVirement.toFixed(2)} €`}
              </button>
            </div>

            {confirmSingleProf && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4">
                  <h3 className="font-bold text-slate-900 text-base mb-1">Confirmer le virement</h3>
                  <p className="text-xs text-slate-500 mb-4">Cette action est irréversible</p>
                  <div className="bg-slate-50 rounded-xl p-4 mb-5 space-y-1.5 text-sm">
                    <div className="flex justify-between"><span className="text-slate-500">Prof</span><span className="font-medium text-slate-900">{confirmSingleProf.prenom} {confirmSingleProf.nom}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Périodes</span><span className="text-slate-700">{confirmSingleProf.mois_annees.join(", ")}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">IBAN</span><span className="font-mono text-xs text-slate-600">{confirmSingleProf.iban}</span></div>
                    <div className="flex justify-between border-t border-slate-200 pt-1.5 mt-1.5"><span className="text-slate-500">Virement</span><span className="font-bold text-emerald-700">{confirmSingleProf.montant_virement.toFixed(2)} €</span></div>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => setConfirmSingleProf(null)} className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">Annuler</button>
                    <button onClick={() => { const p = confirmSingleProf; setConfirmSingleProf(null); handleDispatch(p.prof_id); }} className="flex-1 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-colors">Confirmer</button>
                  </div>
                </div>
              </div>
            )}

            {showDispatchConfirm && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                      <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-base">Confirmer le dispatch</h3>
                      <p className="text-xs text-slate-500 mt-0.5">Cette action est irréversible</p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-700 mb-3">
                    Tu t'apprêtes à envoyer <span className="font-semibold text-slate-900">{profs.filter((p) => p.iban).length} virement(s)</span> pour un total de <span className="font-semibold text-emerald-700">{totalVirement.toFixed(2)} €</span>.
                  </p>
                  <ul className="mb-5 space-y-1.5">
                    {profs.filter((p) => p.iban).map((p) => (
                      <li key={p.prof_id} className="flex justify-between text-sm">
                        <span className="text-slate-700">{p.prenom} {p.nom}</span>
                        <span className="text-xs text-blue-600 ml-2">(net prof : {p.montant_net_prof.toFixed(2)} €)</span>
                        <span className="font-semibold text-emerald-700 ml-auto">{p.montant_virement.toFixed(2)} € viré</span>
                      </li>
                    ))}
                  </ul>
                  <div className="flex gap-3">
                    <button onClick={() => setShowDispatchConfirm(false)}
                      className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                      Annuler
                    </button>
                    <button onClick={() => { setShowDispatchConfirm(false); handleDispatch(undefined); }}
                      className="flex-1 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-colors">
                      Confirmer l'envoi
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        {section === "echeancier"    && <AdminEcheancier />}
        {section === "profs"         && <AdminProfs />}
        {section === "eleves"        && <AdminEleves />}
        {section === "cours"         && <AdminCours />}
        {section === "recaps"        && <AdminRecaps />}
        {section === "contestations" && <AdminContestations />}
        {section === "paps"          && <AdminPaps />}
        {section === "search"        && <AdminSearch />}
        {section === "orphelins"     && <AdminOrphelins />}
        {section === "grille"        && <AdminGrille />}
        {section === "compta"        && <AdminCompta />}
      </main>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section Échéancier
// ─────────────────────────────────────────────────────────────────────────────

function AdminEcheancier() {
  const now   = new Date();
  const day   = now.getDate();
  const month = now.getMonth();
  const year  = now.getFullYear();
  const MOIS  = ["janvier","février","mars","avril","mai","juin","juillet","août","septembre","octobre","novembre","décembre"];

  // Détermination de la phase courante et du cycle N / N+1
  type Phase = "cloture" | "validation" | "atp" | "virements" | "calme";
  let phase: Phase;
  let N: number, N1: number;
  if      (day <= 5)  { phase = "cloture";    N = (month - 1 + 12) % 12; N1 = month; }
  else if (day <= 7)  { phase = "validation"; N = (month - 1 + 12) % 12; N1 = month; }
  else if (day === 8) { phase = "atp";        N = (month - 1 + 12) % 12; N1 = month; }
  else if (day <= 12) { phase = "virements";  N = (month - 1 + 12) % 12; N1 = month; }
  else                { phase = "calme";      N = (month - 1 + 12) % 12; N1 = month; }

  const MOIS_COURT = ["jan.","fév.","mars","avr.","mai","juin","juil.","août","sept.","oct.","nov.","déc."];
  const n   = MOIS[N];
  const n1  = MOIS[N1];
  const n2  = MOIS[(N1 + 1) % 12];
  const n1c = MOIS_COURT[N1];  // version courte pour la frise

  const phaseOrder: Phase[] = ["cloture", "validation", "atp", "virements", "calme"];
  const phaseIdx = phaseOrder.indexOf(phase);
  // Le jalon "cible" de la phase courante (index dans milestones[])
  // cloture→1, validation→2, atp→3, virements→4, calme→tous passés (5)
  const targetMs = phaseIdx + 1;

  function msState(i: number): "past" | "active" | "future" {
    if (i === 0)              return "past";
    if (phase === "calme")    return "past";
    if (i < targetMs)         return "past";
    if (i === targetMs)       return "active";
    return "future";
  }

  // Largeur de la ligne de progression (va jusqu'au dernier jalon "past")
  const progressPct = phase === "calme" ? 100 : Math.max(0, ((targetMs - 1) / 4) * 100);

  // Config du bandeau selon la phase
  const banner = {
    cloture: {
      label: "Phase en cours — Clôture des récaps",
      deadline: `Jusqu'au 5 ${n1} à minuit`,
      border: "border-l-slate-700", bg: "bg-slate-50", badge: "bg-slate-900 text-white",
      text: `Les profs ont jusqu'au 5 ${n1} à minuit pour créer et soumettre leur récap mensuel de ${n}. À cette échéance, le système génère automatiquement les récaps manquants avec tous les cours déclarés.`,
      vigilance: null as string | null,
    },
    validation: {
      label: "Phase en cours — Validation par les parents",
      deadline: `Jusqu'au 7 ${n1} à minuit`,
      border: "border-l-amber-500", bg: "bg-amber-50", badge: "bg-amber-500 text-white",
      text: `Les parents valident ou contestent le récap mensuel de ${n}. Sans action de leur part au 7 ${n1} à minuit, la validation est automatique.`,
      vigilance: `C'est la période la plus critique du cycle. Toutes les contestations doivent être résolues avant le 8 ${n1} au matin pour que les déclarations ATP et les virements partent à l'heure. Objectif : 100 % des récaps en statut « validé ».`,
    },
    atp: {
      label: "Phase en cours — Déclarations ATP",
      deadline: `Aujourd'hui — 8 ${n1}`,
      border: "border-l-slate-400", bg: "bg-slate-50", badge: "bg-slate-500 text-white",
      text: `Le serveur envoie les déclarations à l'API Tierce de Prestation pour chaque séance du mois de ${n} validée par les parents. Traitement entièrement automatique — aucune action requise.`,
      vigilance: null as string | null,
    },
    virements: {
      label: "Phase en cours — Virements aux profs",
      deadline: `Virements attendus autour du 12 ${n1}`,
      border: "border-l-emerald-500", bg: "bg-emerald-50", badge: "bg-emerald-600 text-white",
      text: `Le serveur a calculé le montant à verser à chaque prof. Les virements sont prêts à être envoyés depuis « Dispatch paiements ». Les profs attendent leur paiement autour du 12 ${n1}.`,
      vigilance: `Aller dans « Dispatch paiements », vérifier les montants et les IBAN, puis cliquer sur Dispatcher. Ne pas tarder — les profs s'attendent à recevoir leur virement rapidement.`,
    },
    calme: {
      label: "Période calme — pas de cycle actif",
      deadline: `Prochain cycle : 1er ${n2}`,
      border: "border-l-slate-300", bg: "bg-slate-50", badge: "bg-slate-200 text-slate-600",
      text: `Le cycle de paiement de ${n} est terminé. Les profs déclarent actuellement leurs cours de ${n1}. Le prochain cycle de clôture s'ouvrira le 1er ${n2}.`,
      vigilance: null as string | null,
    },
  }[phase];

  // 4 étapes du cycle (pas les jalons de la frise)
  const steps = [
    { key: "cloture",    num: 1, label: "Clôture des récaps",    dates: `1er ${n} – 5 ${n1}` },
    { key: "validation", num: 2, label: "Validation parents",     dates: `5 – 7 ${n1}` },
    { key: "atp",        num: 3, label: "Déclarations ATP",       dates: `8 ${n1}` },
    { key: "virements",  num: 4, label: "Virements aux profs",    dates: `8 – ~12 ${n1}` },
  ];

  // done = phase passée, current = phase en cours, upcoming = à venir
  function stepState(i: number): "done" | "current" | "upcoming" {
    if (phase === "calme") return "done";
    if (i < phaseIdx)     return "done";
    if (i === phaseIdx)   return "current";
    return "upcoming";
  }

  return (
    <div className="max-w-4xl">

      {/* ── En-tête ── */}
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1">Paiement en cours de traitement</p>
        <h1 className="text-2xl font-bold text-slate-900">Cours du mois de {n}</h1>
        <p className="text-sm text-slate-500 mt-1">Règlement effectué en {n1} {year} · Aujourd'hui : {day} {n1} {year}</p>
      </div>

      {/* ── Bandeau phase actuelle ── */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden mb-6" style={{ boxShadow: "0 1px 3px rgba(15,23,42,.06)" }}>
        <div className={`px-6 py-4 flex items-center justify-between ${phase === "calme" ? "bg-slate-50" : "bg-slate-900"}`}>
          <div className="flex items-center gap-3">
            <span className={`text-xs font-mono font-semibold ${phase === "calme" ? "text-slate-400" : "text-slate-500"}`}>
              {phase === "calme" ? "Aucune phase active" : `Phase ${phaseIdx + 1} sur 4`}
            </span>
            <span className={`w-px h-3 ${phase === "calme" ? "bg-slate-300" : "bg-slate-700"}`} />
            <span className={`text-sm font-semibold ${phase === "calme" ? "text-slate-700" : "text-white"}`}>{banner.title}</span>
          </div>
          <span className={`text-xs ${phase === "calme" ? "text-slate-400" : "text-slate-400"}`}>{banner.deadline}</span>
        </div>
        <div className="px-6 py-5">
          <p className="text-sm text-slate-700 leading-relaxed">{banner.text}</p>
          {banner.vigilance && (
            <div className="mt-4 flex gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-sm text-amber-800 leading-relaxed">
                <span className="font-semibold">Point de vigilance — </span>{banner.vigilance}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Stepper 4 phases ── */}
      <div className="bg-white rounded-2xl border border-slate-200 px-8 py-8 mb-6" style={{ boxShadow: "0 1px 3px rgba(15,23,42,.06)" }}>
        <div className="flex items-start">
          {steps.map((step, i) => {
            const state  = stepState(i);
            const isLast = i === steps.length - 1;
            return (
              <React.Fragment key={step.key}>
                <div className="flex flex-col items-center text-center" style={{ minWidth: 90 }}>
                  <div className={[
                    "flex items-center justify-center rounded-full font-bold shrink-0",
                    state === "done"     ? "w-8 h-8 bg-slate-700 text-white text-sm"                          : "",
                    state === "current"  ? "w-10 h-10 bg-slate-900 text-white text-sm shadow ring-4 ring-slate-200" : "",
                    state === "upcoming" ? "w-8 h-8 border-2 border-slate-200 text-slate-300 text-sm bg-white" : "",
                  ].filter(Boolean).join(" ")}>
                    {state === "done" ? <Check className="w-3.5 h-3.5" /> : step.num}
                  </div>
                  <p className={`text-xs font-semibold mt-3 leading-snug ${state === "current" ? "text-slate-900" : state === "done" ? "text-slate-500" : "text-slate-300"}`}>
                    {step.label}
                  </p>
                  <p className={`text-[11px] mt-1 ${state === "current" ? "text-slate-500" : state === "done" ? "text-slate-400" : "text-slate-300"}`}>
                    {step.dates}
                  </p>
                  <p className={`text-[10px] font-bold uppercase tracking-wide mt-1.5 ${state === "current" ? "text-slate-700" : state === "done" ? "text-slate-400" : "text-slate-300"}`}>
                    {state === "done" ? "Terminé" : state === "current" ? "En cours" : "À venir"}
                  </p>
                </div>
                {!isLast && (
                  <div className="flex-1 pt-4">
                    <div className={`h-px ${state === "done" || phase === "calme" ? "bg-slate-500" : "bg-slate-200"}`} />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* ── Encadrés détail ── */}
      <div className="grid grid-cols-2 gap-4">

        <div className={`bg-white rounded-2xl border p-5 ${phase === "cloture" ? "border-slate-500 ring-1 ring-slate-200" : "border-slate-200"}`} style={{ boxShadow: "0 1px 3px rgba(15,23,42,.06)" }}>
          <div className="flex items-start justify-between gap-2 mb-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Phase 1</p>
              <h3 className="text-sm font-bold text-slate-900">Clôture des récaps</h3>
              <p className="text-xs text-slate-400 mt-0.5">1er {n} – 5 {n1}</p>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wide bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md shrink-0">Profs</span>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">
            Chaque prof crée son récap mensuel depuis son espace et le soumet aux parents pour validation.
          </p>
          <p className="text-xs text-slate-500 leading-relaxed mt-3 pt-3 border-t border-slate-100">
            <span className="font-semibold text-slate-700">Auto le 5 {n1} à minuit</span> — Si un prof n'a pas agi, le système génère son récap avec tous ses cours du mois.
          </p>
        </div>

        <div className={`bg-white rounded-2xl border p-5 ${phase === "validation" ? "border-amber-400 ring-1 ring-amber-100" : "border-slate-200"}`} style={{ boxShadow: "0 1px 3px rgba(15,23,42,.06)" }}>
          <div className="flex items-start justify-between gap-2 mb-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Phase 2</p>
              <h3 className="text-sm font-bold text-slate-900">Validation parents</h3>
              <p className="text-xs text-slate-400 mt-0.5">5 – 7 {n1}</p>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wide bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md shrink-0">Parents</span>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">
            Les parents valident ou contestent les heures déclarées. Un commentaire est obligatoire en cas de contestation.
          </p>
          <p className="text-xs text-slate-500 leading-relaxed mt-3 pt-3 border-t border-slate-100 mb-3">
            <span className="font-semibold text-slate-700">Auto le 7 {n1} à minuit</span> — Sans action du parent, le récap est validé automatiquement.
          </p>
          <div className="bg-amber-50 rounded-lg px-3 py-2.5">
            <p className="text-xs text-amber-800"><span className="font-semibold">Vigilance —</span> Résoudre toutes les contestations avant le 8 {n1} au matin. Objectif : 100 % validés.</p>
          </div>
        </div>

        <div className={`bg-white rounded-2xl border p-5 ${phase === "atp" ? "border-slate-500 ring-1 ring-slate-200" : "border-slate-200"}`} style={{ boxShadow: "0 1px 3px rgba(15,23,42,.06)" }}>
          <div className="flex items-start justify-between gap-2 mb-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Phase 3</p>
              <h3 className="text-sm font-bold text-slate-900">Déclarations ATP</h3>
              <p className="text-xs text-slate-400 mt-0.5">8 {n1} — toute la journée</p>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wide bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md shrink-0">Auto</span>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">
            Le serveur envoie les déclarations à l'API Tierce de Prestation (ATP) pour chaque séance du mois de {n} validée. Entièrement automatique — peut prendre plusieurs heures.
          </p>
        </div>

        <div className={`bg-white rounded-2xl border p-5 ${phase === "virements" ? "border-emerald-500 ring-1 ring-emerald-50" : "border-slate-200"}`} style={{ boxShadow: "0 1px 3px rgba(15,23,42,.06)" }}>
          <div className="flex items-start justify-between gap-2 mb-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Phase 4</p>
              <h3 className="text-sm font-bold text-slate-900">Virements aux profs</h3>
              <p className="text-xs text-slate-400 mt-0.5">À partir du 8 {n1} — ~12 {n1}</p>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wide bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md shrink-0">Admin</span>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed mb-3">
            Le serveur calcule le <strong className="text-slate-800">montant augmenté</strong> de chaque prof (le net qu'il doit toucher in fine), puis remonte au <strong className="text-slate-800">montant à verser</strong> : le brut à virer pour qu'après cotisations et impôts il lui reste exactement ce net.
          </p>
          <div className="bg-amber-50 rounded-lg px-3 py-2.5">
            <p className="text-xs text-amber-800"><span className="font-semibold">Action admin —</span> Aller dans « Dispatch paiements », vérifier les montants et IBAN, puis cliquer sur Dispatcher.</p>
          </div>
        </div>

      </div>
    </div>
  );
}
