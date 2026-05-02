import { useState, useEffect, useCallback } from "react";
import { supabase } from "../supabase";
import { useAuth } from "../auth";
import { makeDeadline } from "./utils";
import type { PapsCandidatureWithProfile } from "../database.types";

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

export type { PapsCandidatureWithProfile };

export function usePaps() {
  const { user, loading: authLoading } = useAuth();
  const [annonces, setAnnonces] = useState<AnnonceRow[]>([]);
  const [candidatures, setCandidatures] = useState<Record<string, PapsCandidatureWithProfile[]>>({});
  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (staleCheck?: () => boolean) => {
    setError(null);
    setLoading(true);
    const deadline = makeDeadline(5000);
    try {
      const { data, error } = await Promise.race([
        supabase
          .from("paps_annonces")
          .select("*")
          .neq("active", false)
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

  // Charge les candidatures pour les annonces du prof connecté
  useEffect(() => {
    if (!user || annonces.length === 0) return;

    const myIds = annonces.filter((a) => a.prof_id === user.id).map((a) => a.id);
    if (myIds.length === 0) return;

    (async () => {
      const { data: cands } = await supabase
        .from("paps_candidatures")
        .select("*")
        .in("annonce_id", myIds)
        .order("created_at", { ascending: false });

      if (!cands || cands.length === 0) return;

      const candidatIds = [...new Set(cands.map((c) => c.candidat_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, prenom, nom, email, telephone")
        .in("id", candidatIds);

      const profMap = Object.fromEntries((profiles ?? []).map((p) => [p.id, p]));

      const grouped: Record<string, PapsCandidatureWithProfile[]> = {};
      cands.forEach((c) => {
        const p = profMap[c.candidat_id] ?? {};
        if (!grouped[c.annonce_id]) grouped[c.annonce_id] = [];
        grouped[c.annonce_id].push({
          ...c,
          prenom: p.prenom ?? "",
          nom: p.nom ?? "",
          email: p.email ?? "",
          telephone: p.telephone ?? undefined,
        });
      });

      setCandidatures(grouped);
    })();
  }, [user, annonces]);

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

  // Charge les annonces auxquelles l'utilisateur a déjà postulé
  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("paps_candidatures")
        .select("annonce_id")
        .eq("candidat_id", user.id);
      if (data) setAppliedIds(new Set(data.map((c) => c.annonce_id)));
    })();
  }, [user]);

  const candidater = async (annonceId: string, message: string) => {
    if (!user) throw new Error("Non connecté");
    const { error } = await supabase
      .from("paps_candidatures")
      .insert({ annonce_id: annonceId, candidat_id: user.id, message });
    if (error) throw error;
    setAppliedIds((prev) => new Set([...prev, annonceId]));
  };

  const isOwn = (annonceId: string) =>
    annonces.find((a) => a.id === annonceId)?.prof_id === user?.id;

  return { annonces, candidatures, appliedIds, loading, error, reload: load, createAnnonce, closeAnnonce, candidater, isOwn };
}
