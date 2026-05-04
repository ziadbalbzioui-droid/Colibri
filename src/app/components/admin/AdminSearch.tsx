import React, { useState, useEffect, useRef } from "react";
import { Search, Loader2, GraduationCap, Users, BookOpen } from "lucide-react";
import { supabase } from "../../../lib/supabase";
import { TH, TD, CopyID } from "./adminShared";

interface SearchResults {
  profs: any[];
  eleves: any[];
  cours: any[];
}

export function AdminSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults>({ profs: [], eleves: [], cours: [] });
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.trim().length < 2) {
      setResults({ profs: [], eleves: [], cours: [] });
      return;
    }
    debounceRef.current = setTimeout(() => runSearch(query.trim()), 350);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query]);

  async function runSearch(q: string) {
    setLoading(true);
    const like = `%${q}%`;
    const [{ data: profs }, { data: eleves }, { data: cours }] = await Promise.all([
      supabase.from("profiles").select("id, prenom, nom, email, siret, iban")
        .eq("role", "prof")
        .or(`prenom.ilike.${like},nom.ilike.${like},email.ilike.${like}`)
        .limit(10),
      supabase.from("eleves").select("id, nom, matiere, niveau, statut, tarif_heure, profiles!eleves_prof_id_fkey(prenom, nom)")
        .or(`nom.ilike.${like},matiere.ilike.${like}`)
        .limit(10),
      supabase.from("cours").select("id, eleve_nom, matiere, date, montant, statut, recap_id, profiles!cours_prof_id_fkey(prenom, nom)")
        .or(`eleve_nom.ilike.${like},matiere.ilike.${like}`)
        .limit(15),
    ]);
    setResults({ profs: profs ?? [], eleves: eleves ?? [], cours: cours ?? [] });
    setLoading(false);
  }

  const total = results.profs.length + results.eleves.length + results.cours.length;
  const hasQuery = query.trim().length >= 2;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Recherche globale</h1>
          <p className="text-xs font-mono text-slate-400 mt-0.5">profiles · eleves · cours · ilike search</p>
        </div>
      </div>

      <div className="relative mb-6 max-w-xl">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        {loading && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 animate-spin" />}
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Nom, prénom, email, matière… (min 2 car.)"
          className="w-full pl-11 pr-11 py-3 text-sm bg-white border border-slate-200 rounded-2xl outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 placeholder:text-slate-400 shadow-sm"
        />
      </div>

      {hasQuery && !loading && total === 0 && (
        <p className="text-sm text-slate-400 font-mono">Aucun résultat pour "{query}".</p>
      )}

      {results.profs.length > 0 && (
        <ResultSection icon={<GraduationCap className="w-3.5 h-3.5" />} label="Profs" count={results.profs.length}>
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className={TH}>id</th><th className={TH}>prenom nom</th><th className={TH}>email</th>
                <th className={TH}>siret</th><th className={TH}>iban</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {results.profs.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/60">
                  <td className={TD}><CopyID id={p.id} /></td>
                  <td className={`${TD} font-medium text-slate-900`}>{p.prenom} {p.nom}</td>
                  <td className={`${TD} font-mono text-xs text-slate-500`}>{p.email}</td>
                  <td className={TD}>{p.siret || <span className="font-mono text-xs text-slate-300">null</span>}</td>
                  <td className={TD}>{p.iban
                    ? <span className="font-mono text-xs text-slate-600">{p.iban.slice(0, 8)}…</span>
                    : <span className="font-mono text-xs text-slate-300">null</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </ResultSection>
      )}

      {results.eleves.length > 0 && (
        <ResultSection icon={<Users className="w-3.5 h-3.5" />} label="Élèves" count={results.eleves.length}>
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className={TH}>id</th><th className={TH}>nom</th><th className={TH}>matiere</th>
                <th className={TH}>niveau</th><th className={TH}>tarif/h</th><th className={TH}>statut</th><th className={TH}>prof</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {results.eleves.map((e) => (
                <tr key={e.id} className="hover:bg-slate-50/60">
                  <td className={TD}><CopyID id={e.id} /></td>
                  <td className={`${TD} font-medium text-slate-900`}>{e.nom}</td>
                  <td className={`${TD} text-slate-500`}>{e.matiere}</td>
                  <td className={`${TD} text-slate-500`}>{e.niveau}</td>
                  <td className={`${TD} font-mono text-slate-700`}>{e.tarif_heure} €/h</td>
                  <td className={TD}>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${e.statut === "actif" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                      {e.statut}
                    </span>
                  </td>
                  <td className={`${TD} text-xs text-slate-500`}>
                    {e.profiles ? `${e.profiles.prenom} ${e.profiles.nom}` : <span className="text-slate-300 font-mono">null</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </ResultSection>
      )}

      {results.cours.length > 0 && (
        <ResultSection icon={<BookOpen className="w-3.5 h-3.5" />} label="Cours" count={results.cours.length}>
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className={TH}>id</th><th className={TH}>date</th><th className={TH}>eleve_nom</th>
                <th className={TH}>matiere</th><th className={TH}>montant</th><th className={TH}>statut</th>
                <th className={TH}>recap_id</th><th className={TH}>prof</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {results.cours.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/60">
                  <td className={TD}><CopyID id={c.id} /></td>
                  <td className={`${TD} font-mono text-xs text-slate-500`}>{c.date}</td>
                  <td className={`${TD} font-medium text-slate-900`}>{c.eleve_nom}</td>
                  <td className={`${TD} text-slate-500`}>{c.matiere}</td>
                  <td className={`${TD} font-mono font-semibold text-slate-700`}>{Number(c.montant).toFixed(2)} €</td>
                  <td className={TD}>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      c.statut === "déclaré" ? "bg-blue-100 text-blue-700"
                      : c.statut === "contesté" ? "bg-red-100 text-red-700"
                      : "bg-emerald-100 text-emerald-700"}`}>
                      {c.statut}
                    </span>
                  </td>
                  <td className={TD}>{c.recap_id ? <CopyID id={c.recap_id} /> : <span className="font-mono text-xs text-slate-300">null</span>}</td>
                  <td className={`${TD} text-xs text-slate-500`}>{c.profiles ? `${c.profiles.prenom} ${c.profiles.nom}` : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </ResultSection>
      )}
    </div>
  );
}

function ResultSection({ icon, label, count, children }: {
  icon: React.ReactNode; label: string; count: number; children: React.ReactNode;
}) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-slate-500">{icon}</span>
        <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wide">{label}</span>
        <span className="text-xs bg-slate-100 text-slate-500 font-semibold px-2 py-0.5 rounded-full">{count}</span>
      </div>
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(15,23,42,.06)" }}>
        {children}
      </div>
    </div>
  );
}
