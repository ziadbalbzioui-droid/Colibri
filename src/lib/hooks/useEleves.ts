import { useState, useEffect, useCallback } from "react";
import { supabase } from "../supabase";
import { useAuth } from "../auth";
import { makeDeadline } from "./utils";

export interface EleveRow {
  id: string;
  nom: string;
  niveau: string;
  matiere: string;
  tarif_heure: number;
  statut: "actif" | "en attente" | "en pause" | "terminé";
  solde: number;
  notes: string;
  tags: string[];
  total_heures: number;
  total_paye: number;
  dernier_cours: string;
  heures_par_semaine: number[];
  code_invitation?: string;
  telephone_eleve?: string;
  email_eleve?: string;
  adresse_eleve?: string;
}

function computeHeursSemaine(dates: string[]): number[] {
  const now = new Date();
  const weeks = Array(8).fill(0);
  dates.forEach((d) => {
    const diff = Math.floor((now.getTime() - new Date(d).getTime()) / 86400000);
    const weekIdx = 7 - 1 - Math.floor(diff / 7);
    if (weekIdx >= 0 && weekIdx < 8) weeks[weekIdx] += 1.5;
  });
  return weeks;
}

export function useEleves() {
  const { user, loading: authLoading } = useAuth();
  const [eleves, setEleves] = useState<EleveRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (staleCheck?: () => boolean) => {
    if (!user) { setLoading(false); return; }
    setError(null);
    setLoading(true);
    const deadline = makeDeadline(5000);
    try {
      const [{ data: elevesData, error: e1 }, { data: coursData }] = await Promise.race([
        Promise.all([
          supabase
            .from("eleves")
            .select("*, eleve_tags(tag)")
            .eq("prof_id", user.id)
            .order("created_at", { ascending: false }),
          supabase
            .from("cours")
            .select("eleve_id, date, montant, duree_heures")
            .eq("prof_id", user.id),
        ]),
        deadline,
      ]);
      if (e1) throw e1;

      const elevesWithStats = (elevesData ?? []).map((e) => {
        const eleveCoursItems = (coursData ?? []).filter((c) => c.eleve_id === e.id);
        const total_heures = eleveCoursItems.reduce((s, c) => s + (c.duree_heures ?? 0), 0);
        const total_paye = eleveCoursItems.reduce((s, c) => s + (c.montant ?? 0), 0);
        const dates = eleveCoursItems.map((c) => c.date).sort();
        const dernier_cours = dates[dates.length - 1] ?? "";
        const heures_par_semaine = computeHeursSemaine(dates);
        return {
          id: e.id, nom: e.nom, niveau: e.niveau, matiere: e.matiere,
          tarif_heure: e.tarif_heure, statut: e.statut, solde: e.solde, notes: e.notes,
          tags: (e.eleve_tags as { tag: string }[]).map((t) => t.tag),
          total_heures, total_paye, dernier_cours, heures_par_semaine, code_invitation: e.code_invitation,
          telephone_eleve: e.telephone_eleve, email_eleve: e.email_eleve, adresse_eleve: e.adresse_eleve,
        };
      });

      if (!staleCheck?.()) setEleves(elevesWithStats);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erreur chargement élèves";
      console.error("[useEleves]", msg, err);
      if (!staleCheck?.()) setError(msg);
    } finally {
      if (!staleCheck?.()) setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // user?.id en dep suffit — load est stable tant que user?.id ne change pas
  useEffect(() => {
    if (authLoading) return;
    let stale = false;
    load(() => stale);
    return () => { stale = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user?.id]);

  const addEleve = async (data: {
    nom: string; niveau: string; matiere: string;
    tarif_heure: number; statut: EleveRow["statut"];
  }, tags: string[]) => {
    if (!user) throw new Error("Non connecté");
    const { data: row, error } = await supabase
      .from("eleves")
      .insert({ ...data, prof_id: user.id, solde: 0, notes: "" })
      .select()
      .single();
    if (error) throw error;
    if (tags.length > 0) {
      const { error: te } = await supabase.from("eleve_tags").insert(tags.map((tag) => ({ eleve_id: row.id, tag })));
      if (te) console.error("[useEleves] tag insert error:", te.message);
    }
    setEleves((prev) => [{
      ...row, tags,
      total_heures: 0, total_paye: 0, dernier_cours: "", heures_par_semaine: Array(8).fill(0),
    }, ...prev]);
  };

  const updateNotes = async (id: string, notes: string) => {
    const { error } = await supabase.from("eleves").update({ notes }).eq("id", id);
    if (error) throw error;
    setEleves((prev) => prev.map((e) => e.id === id ? { ...e, notes } : e));
  };

  const updateStatut = async (id: string, statut: EleveRow["statut"]) => {
    const { error } = await supabase.from("eleves").update({ statut }).eq("id", id);
    if (error) throw error;
    setEleves((prev) => prev.map((e) => e.id === id ? { ...e, statut } : e));
  };

  const updateTags = async (id: string, tags: string[]) => {
    const { error: de } = await supabase.from("eleve_tags").delete().eq("eleve_id", id);
    if (de) throw de;
    if (tags.length > 0) {
      const { error: ie } = await supabase.from("eleve_tags").insert(tags.map((tag) => ({ eleve_id: id, tag })));
      if (ie) throw ie;
    }
    setEleves((prev) => prev.map((e) => e.id === id ? { ...e, tags } : e));
  };

  const removeEleve = async (id: string) => {
    const { error } = await supabase.from("eleves").delete().eq("id", id);
    if (error) throw error;
    setEleves((prev) => prev.filter((e) => e.id !== id));
  };

  const updateCoordinates = async (id: string, data: { telephone_eleve?: string; email_eleve?: string; adresse_eleve?: string }) => {
    const { error } = await supabase.from("eleves").update(data).eq("id", id);
    if (error) throw error;
    setEleves((prev) => prev.map((e) => e.id === id ? { ...e, ...data } : e));
  };

  return { eleves, loading, error, reload: load, addEleve, updateNotes, updateStatut, updateTags, removeEleve, updateCoordinates };
}
