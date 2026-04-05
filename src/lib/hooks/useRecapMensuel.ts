import { useState, useEffect, useCallback } from "react";
import { supabase } from "../supabase";
import { useAuth } from "../auth";
import { makeDeadline } from "./utils";
import type { RecapStatut } from "../database.types";

export interface RecapEleveValidationRow {
  id: string;
  recap_id: string;
  eleve_id: string;
  statut: "en_attente_parent" | "valide";
}

export interface RecapMensuelRow {
  id: string;
  prof_id: string;
  mois: number;
  annee: number;
  statut: RecapStatut;
  validations: RecapEleveValidationRow[];
}

export function useRecapMensuel() {
  const { user, loading: authLoading } = useAuth();
  const [recaps, setRecaps] = useState<RecapMensuelRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    setLoading(true);
    const deadline = makeDeadline(5000);
    try {
      const { data, error } = await Promise.race([
        supabase
          .from("recap_mensuel")
          .select("*, recap_eleve_validation(*)")
          .eq("prof_id", user.id),
        deadline,
      ]);
      if (error) throw error;
      setRecaps(
        (data ?? []).map((r) => ({ ...r, validations: r.recap_eleve_validation ?? [] }))
      );
    } catch (err) {
      console.error("[useRecapMensuel Load Error]", err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (authLoading) return;
    load();
  }, [authLoading, user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * Crée/met à jour un recap mensuel pour tous les élèves du mois.
   * coursParEleve : { [eleveId]: [coursId, ...] }
   */
  const validerMois = async (
    mois: number,
    annee: number,
    coursParEleve: Record<string, string[]>,
  ): Promise<void> => {
    if (!user) throw new Error("Non connecté");

    try {
      // 1. Solution "Crash-Proof" : On cherche d'abord, on insère ensuite (évite l'upsert composite)
      let { data: recap, error: searchErr } = await supabase
        .from("recap_mensuel")
        .select("*")
        .eq("prof_id", user.id)
        .eq("mois", mois)
        .eq("annee", annee)
        .maybeSingle();

      if (searchErr) throw searchErr;

      // Si le récapitulatif n'existe pas, on le crée proprement
      if (!recap) {
        const { data: newRecap, error: insertErr } = await supabase
          .from("recap_mensuel")
          .insert({ prof_id: user.id, mois, annee, statut: "en_attente_parent" })
          .select()
          .single();
        if (insertErr) throw insertErr;
        recap = newRecap;
      }

      // 2. Création des validations élèves
      const eleveIds = Object.keys(coursParEleve);
      if (eleveIds.length > 0) {
        const { error: valErr } = await supabase
          .from("recap_eleve_validation")
          .upsert(
            eleveIds.map((eleveId) => ({
              recap_id: recap.id,
              eleve_id: eleveId,
              statut: "en_attente_parent",
            })),
            { onConflict: "recap_id,eleve_id" },
          );
        if (valErr) throw valErr;
      }

      // 3. Liaison des cours au recap (Sécurisé contre les tableaux vides)
      for (const coursIds of Object.values(coursParEleve)) {
        // 🚨 La correction vitale est ici : on bloque l'exécution si le tableau est vide
        if (!coursIds || coursIds.length === 0) continue; 

        const { error: coursErr } = await supabase
          .from("cours")
          .update({ recap_id: recap.id })
          .in("id", coursIds);
        
        if (coursErr) throw coursErr;
      }

      // TODO: Notifier parent

      // 4. Mise à jour du state local
      const validations: RecapEleveValidationRow[] = eleveIds.map((eleveId) => ({
        id: "",
        recap_id: recap.id,
        eleve_id: eleveId,
        statut: "en_attente_parent",
      }));
      
      setRecaps((prev) => {
        const idx = prev.findIndex((r) => r.mois === mois && r.annee === annee);
        const updated = { ...recap, validations };
        return idx >= 0 ? prev.map((r, i) => (i === idx ? updated : r)) : [...prev, updated];
      });

    } catch (err) {
      // Un vrai ingénieur logge ses erreurs de manière détaillée
      console.error("[validerMois] Erreur détaillée:", err);
      throw err;
    }
  };

  return { recaps, loading, reload: load, validerMois };
}