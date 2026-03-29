import { useState, useEffect, useCallback } from "react";
import { supabase } from "../supabase";
import { useAuth } from "../auth";
import type { CoursRow } from "./useCours";
import type { FactureRow } from "./useFactures";

export interface ChildInfo {
  id: string;
  nom: string;
  niveau: string;
  matiere: string;
  prof_nom: string;
}

export function useParentData() {
  const { user, profile, loading: authLoading } = useAuth();
  const [child, setChild] = useState<ChildInfo | null>(null);
  const [cours, setCours] = useState<CoursRow[]>([]);
  const [factures, setFactures] = useState<FactureRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      // Get linked eleve
      const { data: links } = await supabase
        .from("parent_eleve")
        .select("eleve_id")
        .eq("parent_id", user.id);

      const eleveId = links?.[0]?.eleve_id;
      if (!eleveId) {
        setLoading(false);
        return;
      }

      // Get eleve details + cours in parallel
      const [{ data: eleveData }, { data: coursData }] = await Promise.all([
        supabase
          .from("eleves")
          .select("*, profiles!inner(prenom, nom)")
          .eq("id", eleveId)
          .maybeSingle(),
        supabase
          .from("cours")
          .select("*")
          .eq("eleve_id", eleveId)
          .order("date", { ascending: false }),
      ]);

      setCours(coursData ?? []);

      if (eleveData) {
        const profProfile = eleveData.profiles as { prenom: string; nom: string };
        setChild({
          id: eleveData.id,
          nom: eleveData.nom,
          niveau: eleveData.niveau,
          matiere: eleveData.matiere,
          prof_nom: profProfile ? `${profProfile.prenom} ${profProfile.nom}` : "Professeur",
        });

        // Get factures for this eleve's prof
        const { data: facturesData } = await supabase
          .from("factures")
          .select("*, lignes_facture(*)")
          .eq("prof_id", eleveData.prof_id)
          .order("date_emission", { ascending: false });
        setFactures(
          (facturesData ?? []).map((f) => ({ ...f, lignes: f.lignes_facture }))
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur chargement données");
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

  const payFacture = async (id: string) => {
    await supabase.from("factures").update({ statut: "payée" }).eq("id", id);
    setFactures((prev) => prev.map((f) => f.id === id ? { ...f, statut: "payée" } : f));
  };

  return { child, cours, factures, loading, error, reload: load, payFacture, profile };
}
