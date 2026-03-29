import { useState, useEffect, useCallback } from "react";
import { supabase } from "../supabase";
import { useAuth } from "../auth";

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
}

export function useCours() {
  const { user, loading: authLoading } = useAuth();
  const [cours, setCours] = useState<CoursRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from("cours")
        .select("*")
        .eq("prof_id", user.id)
        .order("date", { ascending: false });
      if (error) throw error;
      setCours(data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur chargement cours");
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

  const addCours = async (data: {
    eleve_id: string | null;
    eleve_nom: string;
    matiere: string;
    date: string;
    duree: string;
    duree_heures: number;
    montant: number;
    statut: CoursRow["statut"];
  }) => {
    if (!user) return;
    const { data: row, error } = await supabase
      .from("cours")
      .insert({ ...data, prof_id: user.id })
      .select()
      .single();
    if (error) throw error;
    setCours((prev) => [row, ...prev]);
  };

  const updateStatut = async (id: string, statut: CoursRow["statut"]) => {
    await supabase.from("cours").update({ statut }).eq("id", id);
    setCours((prev) => prev.map((c) => c.id === id ? { ...c, statut } : c));
  };

  const removeCours = async (id: string) => {
    await supabase.from("cours").delete().eq("id", id);
    setCours((prev) => prev.filter((c) => c.id !== id));
  };

  return { cours, loading, error, reload: load, addCours, updateStatut, removeCours };
}
