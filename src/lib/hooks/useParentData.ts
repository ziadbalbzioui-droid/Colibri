import { useState, useEffect, useCallback } from "react";
import { supabase } from "../supabase";
import { useAuth } from "../auth";
import { makeDeadline } from "./utils";
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

  const load = useCallback(async (staleCheck?: () => boolean) => {
    if (!user) { setLoading(false); return; }
    setError(null);
    setLoading(true);
    const deadline = makeDeadline(5000);
    try {
      // Récupère tous les élèves liés via la table de liaison (join interne)
      const { data: elevesData, error: ee } = await Promise.race([
        supabase
          .from("eleves")
          .select("*, parent_eleve!inner(parent_id), profiles!inner(prenom, nom)")
          .eq("parent_eleve.parent_id", user.id),
        deadline,
      ]);
      if (ee) throw ee;

      if (!elevesData || elevesData.length === 0) {
        if (!staleCheck?.()) { setChild(null); setCours([]); setFactures([]); setLoading(false); }
        return;
      }

      // On prend le premier élève lié
      const eleveData = elevesData[0];
      const eleveIds = elevesData.map((e) => e.id);
      const profProfile = eleveData.profiles as { prenom: string; nom: string };

      if (!staleCheck?.()) setChild({
        id: eleveData.id,
        nom: eleveData.nom,
        niveau: eleveData.niveau,
        matiere: eleveData.matiere,
        prof_nom: profProfile ? `${profProfile.prenom} ${profProfile.nom}` : "Professeur",
      });

      // Récupère les cours de tous les élèves liés
      const [{ data: coursData, error: ce }, { data: facturesData, error: fe }] = await Promise.race([
        Promise.all([
          supabase
            .from("cours")
            .select("*")
            .in("eleve_id", eleveIds)
            .order("date", { ascending: false }),
          supabase
            .from("factures")
            .select("*, lignes_facture(*)")
            .eq("prof_id", eleveData.prof_id)
            .order("date_emission", { ascending: false }),
        ]),
        deadline,
      ]);
      if (ce) throw ce;
      if (fe) throw fe;

      if (!staleCheck?.()) {
        setCours(coursData ?? []);
        setFactures((facturesData ?? []).map((f) => ({ ...f, lignes: f.lignes_facture })));
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erreur chargement données";
      console.error("[useParentData]", msg, err);
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

  const payFacture = async (id: string) => {
    const { error } = await supabase.from("factures").update({ statut: "payée" }).eq("id", id);
    if (error) throw error;
    setFactures((prev) => prev.map((f) => f.id === id ? { ...f, statut: "payée" } : f));
  };

  return { child, cours, factures, loading, error, reload: load, payFacture, profile };
}
