import { useState, useEffect, useCallback } from "react";
import { supabase } from "../supabase";
import { useAuth } from "../auth";
import { makeDeadline } from "./utils";
import type { RecapStatut } from "../database.types";

export interface RecapMensuelRow {
  id: string;
  prof_id: string;
  eleve_id: string;
  mois: number;
  annee: number;
  statut: RecapStatut;
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
          .select("*")
          .eq("prof_id", user.id),
        deadline,
      ]);
      if (error) throw error;
      setRecaps(data ?? []);
    } catch (err) {
      console.error("[useRecapMensuel]", err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (authLoading) return;
    load();
  }, [authLoading, user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  /** Crée/met à jour un recap à 'en_attente_parent' et lie les cours concernés */
  const validerMois = async (
    eleveId: string,
    mois: number,
    annee: number,
    coursIds: string[],
  ): Promise<void> => {
    if (!user) throw new Error("Non connecté");

    // Upsert du recap
    const { data: recap, error: recapErr } = await supabase
      .from("recap_mensuel")
      .upsert(
        { prof_id: user.id, eleve_id: eleveId, mois, annee, statut: "en_attente_parent" },
        { onConflict: "prof_id,eleve_id,mois,annee" },
      )
      .select()
      .single();
    if (recapErr) throw recapErr;

    // Liaison des cours
    const { error: coursErr } = await supabase
      .from("cours")
      .update({ recap_id: recap.id })
      .in("id", coursIds);
    if (coursErr) throw coursErr;

    // TODO: Notifier parent

    setRecaps((prev) => {
      const idx = prev.findIndex(
        (r) => r.eleve_id === eleveId && r.mois === mois && r.annee === annee,
      );
      return idx >= 0
        ? prev.map((r, i) => (i === idx ? recap : r))
        : [...prev, recap];
    });
  };

  return { recaps, loading, reload: load, validerMois };
}
