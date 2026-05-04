import React, { useEffect, useState } from "react";
import {
  GraduationCap, Users, BookOpen, AlertTriangle, Banknote, LogOut,
  Search, ClipboardList, X, Check, Pencil, Loader2, Megaphone, Plus, Trash2,
} from "lucide-react";
import { supabase } from "../../../lib/supabase";
import { useAuth } from "../../../lib/auth";
import logo from "@/assets/colibri.png";

const PROF_MULTIPLIER = parseFloat(import.meta.env.VITE_COLIBRI_PROF_MULTIPLIER ?? "1.25");
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;

interface ProfPaiement {
  prof_id: string; prenom: string; nom: string; iban: string | null;
  recap_ids: string[]; montant_brut: number; montant_net: number; mois_annees: string[];
}
type DispatchState = "idle" | "loading" | "success" | "error";
type Section = "paiements" | "profs" | "eleves" | "cours" | "recaps" | "contestations" | "paps";

const NAV: { key: Section; label: string; Icon: React.ElementType }[] = [
  { key: "paiements",     label: "Dispatch paiements", Icon: Banknote },
  { key: "profs",         label: "Profs",              Icon: GraduationCap },
  { key: "eleves",        label: "Élèves",             Icon: Users },
  { key: "cours",         label: "Cours",              Icon: BookOpen },
  { key: "recaps",        label: "Récaps mensuels",    Icon: ClipboardList },
  { key: "contestations", label: "Contestations",      Icon: AlertTriangle },
  { key: "paps",          label: "PAPS",               Icon: Megaphone },
];

const MOIS_LABELS = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];
const MATIERES_FORM = ["Mathématiques","Physique-Chimie","SVT","Français","Anglais","Espagnol","Histoire-Géo","SES","Philosophie","Informatique","Autre"];
const NIVEAUX_FORM  = ["6ème","5ème","4ème","3ème","2nde","1ère S","1ère ES","Terminale S","Terminale ES","BTS","Licence 1","Licence 2","Licence 3","Autre"];

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

// ── AdminProfs ────────────────────────────────────────────────────────────────
function AdminProfs() {
  const [profs, setProfs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("profiles").select("id, prenom, nom, email, siret, iban, created_at")
        .eq("role", "prof").order("created_at", { ascending: false });
      setProfs(data ?? []); setLoading(false);
    })();
  }, []);

  const filtered = profs.filter((p) => `${p.prenom} ${p.nom} ${p.email}`.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-xl font-bold text-slate-900">Profs</h1><p className="text-sm text-slate-500 mt-0.5">{profs.length} profs enregistrés</p></div>
      </div>
      <SearchInput value={search} onChange={setSearch} placeholder="Rechercher par nom ou email…" />
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(15,23,42,.06)" }}>
        {loading ? <div className="p-8 text-center text-slate-400 text-sm">Chargement…</div> : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>{["Nom","Email","SIRET","IBAN","Inscrit le"].map((h) => <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-5 py-3 font-medium text-slate-900">{p.prenom} {p.nom}</td>
                  <td className="px-5 py-3 text-slate-500">{p.email}</td>
                  <td className="px-5 py-3">{p.siret ? <span className="text-xs font-mono text-slate-600">{p.siret}</span> : <span className="text-xs bg-amber-100 text-amber-700 font-semibold px-2 py-0.5 rounded-full">Manquant</span>}</td>
                  <td className="px-5 py-3">{p.iban ? <span className="text-xs font-mono text-slate-600">{p.iban.slice(0,8)}…</span> : <span className="text-xs bg-amber-100 text-amber-700 font-semibold px-2 py-0.5 rounded-full">Manquant</span>}</td>
                  <td className="px-5 py-3 text-slate-400 text-xs">{new Date(p.created_at).toLocaleDateString("fr-FR")}</td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-slate-400">Aucun résultat.</td></tr>}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ── AdminEleves ───────────────────────────────────────────────────────────────
function AdminEleves() {
  const [eleves, setEleves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("eleves")
        .select("id, nom, niveau, matiere, statut, tarif_heure, created_at, profiles!eleves_prof_id_fkey(prenom, nom)")
        .order("created_at", { ascending: false });
      setEleves(data ?? []); setLoading(false);
    })();
  }, []);

  const filtered = eleves.filter((e) => `${e.nom} ${e.matiere} ${e.niveau}`.toLowerCase().includes(search.toLowerCase()));
  const statutStyle: Record<string, string> = {
    actif: "bg-emerald-100 text-emerald-700", "en pause": "bg-amber-100 text-amber-700",
    "en attente": "bg-blue-100 text-blue-700", "terminé": "bg-slate-100 text-slate-500",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-xl font-bold text-slate-900">Élèves</h1><p className="text-sm text-slate-500 mt-0.5">{eleves.length} élèves enregistrés</p></div>
      </div>
      <SearchInput value={search} onChange={setSearch} placeholder="Rechercher par nom, matière ou niveau…" />
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(15,23,42,.06)" }}>
        {loading ? <div className="p-8 text-center text-slate-400 text-sm">Chargement…</div> : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>{["Élève","Niveau","Matière","Tarif/h","Statut","Prof","Inscrit le"].map((h) => <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((e) => (
                <tr key={e.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-5 py-3 font-medium text-slate-900">{e.nom}</td>
                  <td className="px-5 py-3 text-slate-500">{e.niveau}</td>
                  <td className="px-5 py-3 text-slate-500">{e.matiere}</td>
                  <td className="px-5 py-3 font-semibold text-slate-700">{e.tarif_heure} €</td>
                  <td className="px-5 py-3"><span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statutStyle[e.statut] ?? "bg-slate-100 text-slate-500"}`}>{e.statut}</span></td>
                  <td className="px-5 py-3 text-slate-500">{e.profiles ? `${e.profiles.prenom} ${e.profiles.nom}` : "—"}</td>
                  <td className="px-5 py-3 text-slate-400 text-xs">{new Date(e.created_at).toLocaleDateString("fr-FR")}</td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={7} className="p-8 text-center text-slate-400">Aucun résultat.</td></tr>}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ── AdminCours ────────────────────────────────────────────────────────────────
function AdminCours() {
  const [cours, setCours] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatut, setFilterStatut] = useState("tous");
  const [filterMonth, setFilterMonth] = useState("tous");
  const [filterYear, setFilterYear]  = useState("tous");

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("cours")
        .select("id, eleve_nom, matiere, date, duree, montant, statut, profiles!cours_prof_id_fkey(prenom, nom)")
        .order("date", { ascending: false }).limit(500);
      setCours(data ?? []); setLoading(false);
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
    return !q || `${c.eleve_nom} ${c.matiere} ${c.date}`.toLowerCase().includes(q);
  });

  const statutStyle: Record<string, string> = {
    déclaré: "bg-blue-100 text-blue-700", contesté: "bg-red-100 text-red-700", payé: "bg-emerald-100 text-emerald-700",
  };
  const SEL = "h-9 px-3 text-sm bg-white border border-slate-200 rounded-xl outline-none focus:border-primary text-slate-700 cursor-pointer";

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Cours</h1>
          <p className="text-sm text-slate-500 mt-0.5">{filtered.length} cours affichés</p>
        </div>
        <div className="flex gap-2 flex-wrap justify-end">
          {["tous","déclaré","contesté","payé"].map((s) => (
            <button key={s} onClick={() => setFilterStatut(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${filterStatut === s ? "bg-slate-900 text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 mb-5 flex-wrap">
        <SearchInput value={search} onChange={setSearch} placeholder="Élève, matière ou date…" className="relative flex-1 min-w-[180px]" />
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
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>{["Date","Élève","Matière","Durée","Montant","Statut","Prof"].map((h) => <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-5 py-3 text-slate-500 tabular-nums">{new Date(c.date).toLocaleDateString("fr-FR")}</td>
                  <td className="px-5 py-3 font-medium text-slate-900">{c.eleve_nom}</td>
                  <td className="px-5 py-3 text-slate-500">{c.matiere}</td>
                  <td className="px-5 py-3 text-slate-500">{c.duree}</td>
                  <td className="px-5 py-3 font-semibold text-slate-700 tabular-nums">{c.montant} €</td>
                  <td className="px-5 py-3"><span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statutStyle[c.statut] ?? "bg-slate-100 text-slate-500"}`}>{c.statut}</span></td>
                  <td className="px-5 py-3 text-slate-500">{c.profiles ? `${c.profiles.prenom} ${c.profiles.nom}` : "—"}</td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={7} className="p-8 text-center text-slate-400">Aucun résultat.</td></tr>}
            </tbody>
          </table>
        )}
      </div>
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

  async function loadRecaps() {
    setLoading(true);
    const { data, error } = await supabase.from("recap_mensuel").select(`
        id, mois, annee, statut, prof_id, created_at,
        profiles!inner(prenom, nom),
        recap_eleve_validation(id, statut, eleve_id)
      `).order("annee", { ascending: false }).order("mois", { ascending: false });
    if (error) console.error("[AdminRecaps]", error.message);
    if (data && data.length > 0) {
      const allEleveIds = [...new Set(data.flatMap((r: any) => (r.recap_eleve_validation ?? []).map((v: any) => v.eleve_id)))];
      const { data: elevesData } = allEleveIds.length > 0
        ? await supabase.from("eleves").select("id, nom").in("id", allEleveIds)
        : { data: [] };
      const elevesMap: Record<string, string> = {};
      (elevesData ?? []).forEach((e: any) => { elevesMap[e.id] = e.nom; });
      setRecaps(data.map((r: any) => ({
        ...r,
        recap_eleve_validation: (r.recap_eleve_validation ?? []).map((v: any) => ({ ...v, eleve_nom: elevesMap[v.eleve_id] ?? v.eleve_id })),
      })));
    } else {
      setRecaps(data ?? []);
    }
    setLoading(false);
  }

  useEffect(() => { loadRecaps(); }, []);

  async function openRecap(recap: any) {
    setSelected(recap);
    setCoursLoading(true);
    const { data } = await supabase.from("cours")
      .select("id, date, eleve_nom, matiere, duree, montant")
      .eq("recap_id", recap.id).order("date", { ascending: true });
    setRecapCours(data ?? []);
    setCoursLoading(false);
  }

  async function forcerValidation(validationId: string) {
    if (!selected || !window.confirm("Forcer la validation de cet élève ?")) return;
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
    setSelected(updated);
    setRecaps((prev) => prev.map((r) => r.id === selected.id ? updated : r));
    setActionLoading(null);
  }

  const filtered = recaps.filter((r) => {
    if (filterStatut !== "tous" && r.statut !== filterStatut) return false;
    const profName = `${r.profiles?.prenom ?? ""} ${r.profiles?.nom ?? ""}`.toLowerCase();
    return !search || profName.includes(search.toLowerCase()) || `${MOIS_LABELS[r.mois - 1]} ${r.annee}`.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Récaps mensuels</h1>
          <p className="text-sm text-slate-500 mt-0.5">{filtered.length} récapitulatifs</p>
        </div>
        <div className="flex gap-2 flex-wrap justify-end">
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
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>{["Période","Prof","Statut","Élèves","Validations"].map((h) => <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>)}</tr>
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
                    <td className="px-5 py-3 font-semibold text-slate-900">{MOIS_LABELS[r.mois - 1]} {r.annee}</td>
                    <td className="px-5 py-3 text-slate-600">{r.profiles?.prenom} {r.profiles?.nom}</td>
                    <td className="px-5 py-3"><span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${si.bg}`}>{si.label}</span></td>
                    <td className="px-5 py-3 text-slate-500">{vals.length} élève{vals.length !== 1 ? "s" : ""}</td>
                    <td className="px-5 py-3">
                      <div className="flex gap-1.5 items-center flex-wrap">
                        {nbV > 0 && <span className="text-xs bg-emerald-100 text-emerald-700 font-semibold px-2 py-0.5 rounded-full">{nbV} validé{nbV > 1 ? "s" : ""}</span>}
                        {nbC > 0 && <span className="text-xs bg-red-100 text-red-700 font-semibold px-2 py-0.5 rounded-full">{nbC} contesté{nbC > 1 ? "s" : ""}</span>}
                        {nbA - nbC > 0 && <span className="text-xs bg-amber-100 text-amber-700 font-semibold px-2 py-0.5 rounded-full">{nbA - nbC} en attente</span>}
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

      {/* ── Recap detail modal ── */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4 backdrop-blur-sm" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
              <div>
                <h3 className="font-bold text-slate-900">{MOIS_LABELS[selected.mois - 1]} {selected.annee}</h3>
                <p className="text-sm text-slate-500">{selected.profiles?.prenom} {selected.profiles?.nom}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${(RECAP_STATUT_STYLE[selected.statut] ?? { bg: "bg-slate-100 text-slate-500" }).bg}`}>
                  {(RECAP_STATUT_STYLE[selected.statut] ?? { label: selected.statut }).label}
                </span>
                <button onClick={() => setSelected(null)} className="p-2 rounded-xl hover:bg-slate-100 transition-colors">
                  <X className="w-4 h-4 text-slate-500" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Cours list */}
              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Cours ({recapCours.length})</h4>
                {coursLoading ? (
                  <div className="flex items-center gap-2 text-slate-400 text-sm"><Loader2 className="w-4 h-4 animate-spin" /> Chargement…</div>
                ) : recapCours.length === 0 ? (
                  <p className="text-sm text-slate-400">Aucun cours associé.</p>
                ) : (
                  <div className="rounded-xl overflow-hidden border border-slate-200">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                          {["Date","Élève","Matière","Durée","Montant"].map((h) => (
                            <th key={h} className={`px-4 py-2.5 text-xs font-semibold text-slate-500 ${h === "Montant" ? "text-right" : "text-left"}`}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {recapCours.map((c) => (
                          <tr key={c.id}>
                            <td className="px-4 py-2.5 text-slate-500 tabular-nums text-xs">{new Date(c.date).toLocaleDateString("fr-FR")}</td>
                            <td className="px-4 py-2.5 font-medium text-slate-800">{c.eleve_nom}</td>
                            <td className="px-4 py-2.5 text-slate-500">{c.matiere}</td>
                            <td className="px-4 py-2.5 text-slate-500">{c.duree}</td>
                            <td className="px-4 py-2.5 text-right font-semibold text-slate-700 tabular-nums">{Number(c.montant).toFixed(2)} €</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="border-t border-slate-200 bg-slate-50">
                          <td colSpan={4} className="px-4 py-2.5 text-xs font-bold text-slate-600 text-right">Total élève</td>
                          <td className="px-4 py-2.5 text-right font-bold text-slate-900 tabular-nums">
                            {recapCours.reduce((s, c) => s + Number(c.montant), 0).toFixed(2)} €
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}
              </div>

              {/* Validations */}
              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Validations parents</h4>
                {(selected.recap_eleve_validation ?? []).length === 0 ? (
                  <p className="text-sm text-slate-400">Aucune validation.</p>
                ) : (
                  <div className="space-y-2">
                    {(selected.recap_eleve_validation ?? []).map((v: any) => {
                      const vs = VALIDATION_STATUT_STYLE[v.statut] ?? { bg: "bg-slate-100 text-slate-500", label: v.statut };
                      return (
                        <div key={v.id} className="flex items-center justify-between px-4 py-3 bg-slate-50 rounded-xl">
                          <div className="flex items-center gap-3">
                            <span className="font-medium text-slate-800 text-sm">{v.eleve_nom}</span>
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${vs.bg}`}>{vs.label}</span>
                          </div>
                          {v.statut !== "valide" && (
                            <button onClick={() => forcerValidation(v.id)} disabled={actionLoading === v.id}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors">
                              {actionLoading === v.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                              Forcer validation
                            </button>
                          )}
                        </div>
                      );
                    })}
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Contestations</h1>
          <p className="text-sm text-slate-500 mt-0.5">{items.length} contestation{items.length !== 1 ? "s" : ""}</p>
        </div>
      </div>
      <SearchInput value={search} onChange={setSearch} placeholder="Rechercher par élève, matière ou raison…" />

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(15,23,42,.06)" }}>
        {loading ? <div className="p-8 text-center text-slate-400 text-sm">Chargement…</div>
          : filtered.length === 0 ? <div className="p-8 text-center text-slate-400 text-sm">Aucune contestation.</div>
          : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>{["Date","Élève","Matière","Date cours","Montant","Raison","Prof"].map((h) => <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/60 transition-colors cursor-pointer" onClick={() => openItem(item)}>
                  <td className="px-5 py-3 text-slate-400 text-xs">{new Date(item.created_at).toLocaleDateString("fr-FR")}</td>
                  <td className="px-5 py-3 font-medium text-slate-900">{item.cours?.eleve_nom ?? "—"}</td>
                  <td className="px-5 py-3 text-slate-500">{item.cours?.matiere ?? "—"}</td>
                  <td className="px-5 py-3 text-slate-500">{item.cours?.date ? new Date(item.cours.date).toLocaleDateString("fr-FR") : "—"}</td>
                  <td className="px-5 py-3 font-semibold text-slate-700">{item.cours?.montant ?? "—"} €</td>
                  <td className="px-5 py-3 text-red-700 text-xs max-w-xs truncate">{item.raison || "—"}</td>
                  <td className="px-5 py-3 text-slate-500">{item.cours?.profiles ? `${item.cours.profiles.prenom} ${item.cours.profiles.nom}` : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Contestation detail modal ── */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4 backdrop-blur-sm" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <div className="border-b border-slate-100 px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold text-slate-900">Contestation</h3>
              <button onClick={() => setSelected(null)} className="p-2 rounded-xl hover:bg-slate-100 transition-colors"><X className="w-4 h-4 text-slate-500" /></button>
            </div>

            <div className="p-6 space-y-5">
              {/* Cours info */}
              <div className="bg-slate-50 rounded-xl p-4 space-y-2 text-sm">
                {[
                  ["Élève",         selected.cours?.eleve_nom],
                  ["Matière",       selected.cours?.matiere],
                  ["Date du cours", selected.cours?.date ? new Date(selected.cours.date).toLocaleDateString("fr-FR") : "—"],
                  ["Durée",         `${selected.cours?.duree} (${selected.cours?.duree_heures}h)`],
                  ["Montant",       `${selected.cours?.montant} €`],
                  ["Prof",          selected.cours?.profiles ? `${selected.cours.profiles.prenom} ${selected.cours.profiles.nom}` : "—"],
                ].map(([label, val]) => (
                  <div key={label} className="flex justify-between">
                    <span className="text-slate-500">{label}</span>
                    <span className="font-semibold text-slate-800">{val}</span>
                  </div>
                ))}
              </div>

              {/* Raison */}
              <div className="bg-red-50 border border-red-100 rounded-xl p-4">
                <p className="text-xs font-bold text-red-500 uppercase tracking-wide mb-1.5">Raison de la contestation</p>
                <p className="text-sm text-red-800">{selected.raison || "Aucune raison fournie."}</p>
              </div>

              {/* Edit form */}
              {editMode && (
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 space-y-3">
                  <p className="text-xs font-bold text-blue-600 uppercase tracking-wide">Modifier le cours</p>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: "Durée (texte)", key: "duree",        type: "text",   step: undefined, placeholder: "1h30" },
                      { label: "Durée (heures)",key: "duree_heures", type: "number", step: "0.25",    placeholder: "" },
                      { label: "Montant (€)",   key: "montant",      type: "number", step: "0.01",    placeholder: "" },
                    ].map(({ label, key, type, step, placeholder }) => (
                      <div key={key}>
                        <label className="block mb-1 text-xs font-semibold text-slate-500">{label}</label>
                        <input type={type} step={step} placeholder={placeholder}
                          value={editFields[key as keyof typeof editFields]}
                          onChange={(e) => setEditFields({ ...editFields, [key]: e.target.value })}
                          className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg outline-none focus:border-primary" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-1">
                <button onClick={rejeterContestation} disabled={actionLoading}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold bg-amber-100 text-amber-800 rounded-xl hover:bg-amber-200 disabled:opacity-50 transition-colors">
                  {actionLoading && !editMode && <Loader2 className="w-4 h-4 animate-spin" />}
                  Rejeter la contestation
                </button>
                {!editMode ? (
                  <button onClick={() => setEditMode(true)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
                    <Pencil className="w-4 h-4" /> Modifier le cours
                  </button>
                ) : (
                  <button onClick={modifierEtResoudre} disabled={actionLoading}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition-colors">
                    {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    Enregistrer et résoudre
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
        prof_id: user.id, prof_nom: form.prof_nom.trim(),
        matiere: form.matiere, niveau_eleve: form.niveau_eleve, prix: form.prix,
        frequence: form.frequence, horaires: form.horaires, localisation: form.localisation,
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">PAPS</h1>
          <p className="text-sm text-slate-500 mt-0.5">{annonces.length} annonce{annonces.length !== 1 ? "s" : ""}</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-primary transition-colors">
          <Plus className="w-4 h-4" /> Nouvelle annonce
        </button>
      </div>
      <SearchInput value={search} onChange={setSearch} placeholder="Rechercher par prof, matière, niveau…" />

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(15,23,42,.06)" }}>
        {loading ? <div className="p-8 text-center text-slate-400 text-sm">Chargement…</div>
          : filtered.length === 0 ? <div className="p-8 text-center text-slate-400 text-sm">Aucune annonce.</div>
          : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>{["Prof","Matière","Niveau","Prix","Localisation","Statut","Date","Actions"].map((h) => <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((a) => (
                <tr key={a.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-900">{a.prof_nom}</td>
                  <td className="px-4 py-3 text-slate-500">{a.matiere}</td>
                  <td className="px-4 py-3 text-slate-500">{a.niveau_eleve}</td>
                  <td className="px-4 py-3 font-semibold text-slate-700">{a.prix} €/h</td>
                  <td className="px-4 py-3 text-slate-400 text-xs">{a.localisation || "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${a.active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                      {a.active ? "Active" : "Inactive"}
                    </span>
                    {a.urgent && <span className="ml-1.5 text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-600">Urgent</span>}
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-xs">{new Date(a.created_at).toLocaleDateString("fr-FR")}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => toggleActive(a.id, a.active)}
                        className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-colors ${a.active ? "bg-slate-100 text-slate-600 hover:bg-slate-200" : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"}`}>
                        {a.active ? "Désactiver" : "Activer"}
                      </button>
                      <button onClick={() => deleteAnnonce(a.id)}
                        className="text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors">
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

      {/* ── Post form modal ── */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto flex flex-col">
            <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
              <h3 className="font-bold text-slate-900">Nouvelle annonce PAPS</h3>
              <button onClick={() => setShowForm(false)} className="p-2 rounded-xl hover:bg-slate-100 transition-colors"><X className="w-4 h-4 text-slate-500" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block mb-1.5 text-xs font-bold text-slate-500 uppercase tracking-wide">Nom du prof</label>
                <input value={form.prof_nom} onChange={(e) => setForm({ ...form, prof_nom: e.target.value })}
                  placeholder="Prénom Nom…" className={INP} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1.5 text-xs font-bold text-slate-500 uppercase tracking-wide">Matière</label>
                  <select value={form.matiere} onChange={(e) => setForm({ ...form, matiere: e.target.value })} className={INP}>
                    {MATIERES_FORM.map((m) => <option key={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block mb-1.5 text-xs font-bold text-slate-500 uppercase tracking-wide">Niveau élève</label>
                  <select value={form.niveau_eleve} onChange={(e) => setForm({ ...form, niveau_eleve: e.target.value })} className={INP}>
                    {NIVEAUX_FORM.map((n) => <option key={n}>{n}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1.5 text-xs font-bold text-slate-500 uppercase tracking-wide">Prix (€/h)</label>
                  <input type="number" value={form.prix} onChange={(e) => setForm({ ...form, prix: Number(e.target.value) })} className={INP} />
                </div>
                <div>
                  <label className="block mb-1.5 text-xs font-bold text-slate-500 uppercase tracking-wide">Fréquence</label>
                  <input value={form.frequence} onChange={(e) => setForm({ ...form, frequence: e.target.value })} placeholder="1x/semaine…" className={INP} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1.5 text-xs font-bold text-slate-500 uppercase tracking-wide">Horaires</label>
                  <input value={form.horaires} onChange={(e) => setForm({ ...form, horaires: e.target.value })} placeholder="Mercredi 16h…" className={INP} />
                </div>
                <div>
                  <label className="block mb-1.5 text-xs font-bold text-slate-500 uppercase tracking-wide">Localisation</label>
                  <input value={form.localisation} onChange={(e) => setForm({ ...form, localisation: e.target.value })} placeholder="Paris 15e…" className={INP} />
                </div>
              </div>
              <div>
                <label className="block mb-1.5 text-xs font-bold text-slate-500 uppercase tracking-wide">Description de l'élève</label>
                <textarea value={form.description_eleve} onChange={(e) => setForm({ ...form, description_eleve: e.target.value })}
                  rows={3} placeholder="Niveau, difficultés, objectifs…" className={`${INP} resize-none`} />
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
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                    placeholder="Ajouter un tag…" className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm" />
                  <button onClick={addTag} className="px-3 py-2 bg-slate-900 text-white rounded-xl hover:bg-primary transition-colors">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <label className="flex items-start gap-3 p-3.5 bg-red-50 rounded-xl cursor-pointer border border-red-100 hover:bg-red-100/70 transition-colors">
                <input type="checkbox" checked={form.urgent} onChange={(e) => setForm({ ...form, urgent: e.target.checked })} className="w-4 h-4 accent-red-600 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-red-700">Marquer comme urgent</p>
                  <p className="text-xs text-red-400 mt-0.5">L'annonce apparaîtra en haut avec un badge rouge</p>
                </div>
              </label>
            </div>
            <div className="sticky bottom-0 bg-white border-t border-slate-100 px-6 py-4 flex gap-3 rounded-b-2xl">
              <button onClick={() => setShowForm(false)} className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-sm font-medium transition-colors">Annuler</button>
              <button onClick={handlePost} disabled={!form.prof_nom.trim() || saving}
                className="flex-1 bg-slate-900 text-white px-4 py-2.5 rounded-xl hover:bg-primary transition-colors disabled:opacity-40 flex items-center justify-center gap-2 text-sm font-semibold">
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                Publier l'annonce
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
    if (error || !data) { console.error("Erreur chargement recaps:", error?.message); setFetching(false); return; }
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
              <div>
                <h1 className="text-xl font-bold text-slate-900">Dispatch des paiements</h1>
                <p className="text-sm text-slate-500 mt-1">Rémunération prof : tarif × {PROF_MULTIPLIER}</p>
              </div>
              <span className="text-xs text-slate-400">Actualisé à {lastRefresh.toLocaleTimeString("fr-FR")}</span>
            </div>
            {profsWithoutIban.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <p className="text-sm font-semibold text-amber-800">{profsWithoutIban.length} prof(s) sans IBAN — ignorés lors du dispatch :</p>
                <ul className="mt-1 text-sm text-amber-700 list-disc list-inside">{profsWithoutIban.map((p) => <li key={p.prof_id}>{p.prenom} {p.nom}</li>)}</ul>
              </div>
            )}
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Profs à payer",   value: fetching ? "…" : String(profs.filter((p) => p.iban).length), color: "text-slate-900" },
                { label: "Total brut",       value: fetching ? "…" : `${profs.reduce((s, p) => s + p.montant_brut, 0).toFixed(2)} €`, color: "text-slate-900" },
                { label: "Total net à virer",value: fetching ? "…" : `${totalNet.toFixed(2)} €`, color: "text-emerald-600" },
              ].map((stat) => (
                <div key={stat.label} className="bg-white rounded-2xl border border-slate-200 p-5" style={{ boxShadow: "0 1px 3px rgba(15,23,42,.06)" }}>
                  <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold">{stat.label}</p>
                  <p className={`text-3xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(15,23,42,.06)" }}>
              <div className="px-5 py-4 border-b border-slate-100">
                <h2 className="font-semibold text-slate-800 text-sm">Récapitulatifs validés en attente</h2>
              </div>
              {fetching ? <div className="p-8 text-center text-slate-400 text-sm">Chargement…</div>
                : profs.length === 0 ? <div className="p-8 text-center text-slate-400 text-sm">Aucun récapitulatif validé en attente de paiement.</div>
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
                {dispatchResult.success.length > 0 && <p className="text-emerald-800 font-semibold">{dispatchResult.success.length} virement(s) envoyé(s) avec succès.</p>}
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
      </main>
    </div>
  );
}
