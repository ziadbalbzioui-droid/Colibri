import { useState, useEffect, useCallback } from "react";
import { supabase } from "../supabase";
import { useAuth } from "../auth";
import { makeDeadline } from "./utils";

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
  const { user, loading: authLoading } = useAuth();
  const [annonces, setAnnonces] = useState<AnnonceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // load n'a pas de dépendance user car les annonces sont publiques
  const load = useCallback(async (staleCheck?: () => boolean) => {
    setError(null);
    setLoading(true);
    const deadline = makeDeadline(5000);
    try {
      const { data, error } = await Promise.race([
        supabase
          .from("paps_annonces")
          .select("*")
          .eq("active", true)
          .order("urgent", { ascending: false })
          .order("created_at", { ascending: false }),
        deadline,
      ]);
      if (error) throw error;
      if (!staleCheck?.()) setAnnonces(data ?? []);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erreur chargement annonces";
      console.error("[usePaps]", msg, err);
      if (!staleCheck?.()) setError(msg);
    } finally {
      if (!staleCheck?.()) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;
    let stale = false;
    load(() => stale);
    return () => { stale = true; };
  }, [authLoading, load]);

  const createAnnonce = async (data: {
    matiere: string; niveau_eleve: string; prix: number; horaires: string;
    frequence: string; localisation: string; description_eleve: string;
    tags: string[]; urgent: boolean; prof_nom: string;
  }) => {
    if (!user) throw new Error("Non connecté");
    const { data: row, error } = await supabase
      .from("paps_annonces")
      .insert({ ...data, prof_id: user.id, active: true })
      .select()
      .single();
    if (error) throw error;
    setAnnonces((prev) => [row, ...prev]);
  };

  const closeAnnonce = async (id: string) => {
    const { error } = await supabase.from("paps_annonces").update({ active: false }).eq("id", id);
    if (error) throw error;
    setAnnonces((prev) => prev.filter((a) => a.id !== id));
  };

  const isOwn = (annonceId: string) =>
    annonces.find((a) => a.id === annonceId)?.prof_id === user?.id;

  return { annonces, loading, error, reload: load, createAnnonce, closeAnnonce, isOwn };
}
