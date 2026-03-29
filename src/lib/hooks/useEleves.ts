import { useState, useEffect, useCallback } from "react";
import { supabase } from "../supabase";
import { useAuth } from "../auth";

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
  // computed from cours
  total_heures: number;
  total_paye: number;
  dernier_cours: string;
  heures_par_semaine: number[];
}

function computeHeursSemaine(dates: string[]): number[] {
  const now = new Date();
  const weeks = Array(8).fill(0);
  dates.forEach((d) => {
    const diff = Math.floor((now.getTime() - new Date(d).getTime()) / 86400000);
    const weekIdx = 7 - 1 - Math.floor(diff / 7);
    if (weekIdx >= 0 && weekIdx < 8) weeks[weekIdx] += 1.5; // approx 1.5h per cours
  });
  return weeks;
}

export function useEleves() {
  const { user, loading: authLoading } = useAuth();
  const [eleves, setEleves] = useState<EleveRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      // Load eleves + cours in parallel
      const [{ data: elevesData, error: e1 }, { data: coursData }] = await Promise.all([
        supabase
          .from("eleves")
          .select("*, eleve_tags(tag)")
          .eq("prof_id", user.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("cours")
          .select("eleve_id, date, montant, duree_heures")
          .eq("prof_id", user.id),
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
          id: e.id,
          nom: e.nom,
          niveau: e.niveau,
          matiere: e.matiere,
          tarif_heure: e.tarif_heure,
          statut: e.statut,
          solde: e.solde,
          notes: e.notes,
          tags: (e.eleve_tags as { tag: string }[]).map((t) => t.tag),
          total_heures,
          total_paye,
          dernier_cours,
          heures_par_semaine,
        };
      });

      setEleves(elevesWithStats);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur chargement élèves");
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!authLoading && !user) setLoading(false);
  }, [authLoading, user]);

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
      await supabase.from("eleve_tags").insert(tags.map((tag) => ({ eleve_id: row.id, tag })));
    }

    setEleves((prev) => [{
      ...row, tags,
      total_heures: 0, total_paye: 0, dernier_cours: "", heures_par_semaine: Array(8).fill(0),
    }, ...prev]);
  };

  const updateNotes = async (id: string, notes: string) => {
    await supabase.from("eleves").update({ notes }).eq("id", id);
    setEleves((prev) => prev.map((e) => e.id === id ? { ...e, notes } : e));
  };

  const updateStatut = async (id: string, statut: EleveRow["statut"]) => {
    await supabase.from("eleves").update({ statut }).eq("id", id);
    setEleves((prev) => prev.map((e) => e.id === id ? { ...e, statut } : e));
  };

  const updateTags = async (id: string, tags: string[]) => {
    await supabase.from("eleve_tags").delete().eq("eleve_id", id);
    if (tags.length > 0) {
      await supabase.from("eleve_tags").insert(tags.map((tag) => ({ eleve_id: id, tag })));
    }
    setEleves((prev) => prev.map((e) => e.id === id ? { ...e, tags } : e));
  };

  const removeEleve = async (id: string) => {
    await supabase.from("eleves").delete().eq("id", id);
    setEleves((prev) => prev.filter((e) => e.id !== id));
  };

  return { eleves, loading, error, reload: load, addEleve, updateNotes, updateStatut, updateTags, removeEleve };
}
