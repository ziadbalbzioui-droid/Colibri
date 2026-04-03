import { useState, useEffect, useCallback } from "react";
import { supabase } from "../supabase";
import { useAuth } from "../auth";
import { makeDeadline } from "./utils";

export interface CoursRow {
  id: string;
  eleve_id: string | null;
  eleve_nom: string;
  matiere: string;
  date: string;
  duree: string;
  duree_heures: number;
  montant: number;
  statut: "payé" | "en attente" | "planifié";
  recap_id: string | null;
}

export function useCours() {
  const { user, loading: authLoading } = useAuth();
  const [cours, setCours] = useState<CoursRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (staleCheck?: () => boolean) => {
    if (!user) { setLoading(false); return; }
    setError(null);
    setLoading(true);
    const deadline = makeDeadline(5000);
    try {
      const { data, error } = await Promise.race([
        supabase
          .from("cours")
          .select("*")
          .eq("prof_id", user.id)
          .order("date", { ascending: false }),
        deadline,
      ]);
      if (error) throw error;
      if (!staleCheck?.()) setCours(data ?? []);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erreur chargement cours";
      console.error("[useCours]", msg, err);
      if (!staleCheck?.()) setError(msg);
    } finally {
      if (!staleCheck?.()) setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  useEffect(() => {
    if (authLoading) return;
    let stale = false;
    load(() => stale);
    return () => { stale = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user?.id]);

  const addCours = async (data: {
    eleve_id: string | null; eleve_nom: string; matiere: string;
    date: string; duree: string; duree_heures: number; montant: number;
    statut: CoursRow["statut"];
  }) => {
    if (!user) throw new Error("Non connecté");
    const { data: row, error } = await supabase
      .from("cours")
      .insert({ ...data, prof_id: user.id })
      .select()
      .single();
    if (error) throw error;
    setCours((prev) => [row, ...prev]);
  };

  const updateStatut = async (id: string, statut: CoursRow["statut"]) => {
    const { error } = await supabase.from("cours").update({ statut }).eq("id", id);
    if (error) throw error;
    setCours((prev) => prev.map((c) => c.id === id ? { ...c, statut } : c));
  };

  const removeCours = async (id: string) => {
    const { error } = await supabase.from("cours").delete().eq("id", id);
    if (error) throw error;
    setCours((prev) => prev.filter((c) => c.id !== id));
  };

  return { cours, loading, error, reload: load, addCours, updateStatut, removeCours };
}
