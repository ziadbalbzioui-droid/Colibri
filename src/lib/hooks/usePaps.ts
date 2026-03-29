import { useState, useEffect, useCallback } from "react";
import { supabase } from "../supabase";
import { useAuth } from "../auth";

export interface AnnonceRow {
  id: string;
  prof_id: string;
  prof_nom: string;
  matiere: string;
  niveau_eleve: string;
  prix: number;
  horaires: string;
  frequence: string;
  localisation: string;
  description_eleve: string;
  tags: string[];
  urgent: boolean;
  active: boolean;
  created_at: string;
}

export function usePaps() {
  const { user } = useAuth();
  const [annonces, setAnnonces] = useState<AnnonceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from("paps_annonces")
        .select("*")
        .eq("active", true)
        .order("urgent", { ascending: false })
        .order("created_at", { ascending: false });
      if (error) throw error;
      setAnnonces(data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur chargement annonces");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const createAnnonce = async (data: {
    matiere: string; niveau_eleve: string; prix: number; horaires: string;
    frequence: string; localisation: string; description_eleve: string;
    tags: string[]; urgent: boolean; prof_nom: string;
  }) => {
    if (!user) return;
    const { data: row, error } = await supabase
      .from("paps_annonces")
      .insert({ ...data, prof_id: user.id, active: true })
      .select()
      .single();
    if (error) throw error;
    setAnnonces((prev) => [row, ...prev]);
  };

  const closeAnnonce = async (id: string) => {
    await supabase.from("paps_annonces").update({ active: false }).eq("id", id);
    setAnnonces((prev) => prev.filter((a) => a.id !== id));
  };

  const isOwn = (annonceId: string) =>
    annonces.find((a) => a.id === annonceId)?.prof_id === user?.id;

  return { annonces, loading, error, reload: load, createAnnonce, closeAnnonce, isOwn };
}
