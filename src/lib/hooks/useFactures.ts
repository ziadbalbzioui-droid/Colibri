import { useState, useEffect, useCallback } from "react";
import { supabase } from "../supabase";
import { useAuth } from "../auth";
import { makeDeadline } from "./utils";

export interface LigneRow {
  id?: string;
  eleve_nom: string;
  matiere: string;
  heures: number;
  tarif_heure: number;
}

export interface FactureRow {
  id: string;
  mois: string;
  date_emission: string;
  statut: "payée" | "en attente";
  montant_brut: number;
  montant_net: number;
  lignes: LigneRow[];
}

const URSSAF = 0.211;

export function useFactures() {
  const { user, loading: authLoading } = useAuth();
  const [factures, setFactures] = useState<FactureRow[]>([]);
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
          .from("factures")
          .select("*, lignes_facture(*)")
          .eq("prof_id", user.id)
          .order("date_emission", { ascending: false }),
        deadline,
      ]);
      if (error) throw error;
      const rows = (data ?? []).map((f) => ({ ...f, lignes: f.lignes_facture as LigneRow[] }));
      if (!staleCheck?.()) setFactures(rows);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erreur chargement factures";
      console.error("[useFactures]", msg, err);
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

  const createFacture = async (mois: string, lignes: LigneRow[]) => {
    if (!user) throw new Error("Non connecté");
    const validLignes = lignes.filter((l) => l.eleve_nom && l.matiere);
    const brut = validLignes.reduce((s, l) => s + l.heures * l.tarif_heure, 0);
    const net = Math.round(brut * (1 - URSSAF));

    const { data: facture, error: fe } = await supabase
      .from("factures")
      .insert({
        prof_id: user.id, mois,
        date_emission: new Date().toISOString().split("T")[0],
        statut: "en attente", montant_brut: brut, montant_net: net,
      })
      .select()
      .single();
    if (fe) throw fe;

    const { data: insertedLignes, error: le } = await supabase
      .from("lignes_facture")
      .insert(validLignes.map((l) => ({ ...l, facture_id: facture.id })))
      .select();
    if (le) throw le;

    const newRow: FactureRow = { ...facture, lignes: insertedLignes as LigneRow[] };
    setFactures((prev) => [newRow, ...prev]);
    return newRow;
  };

  const markPaid = async (id: string) => {
    const { error } = await supabase.from("factures").update({ statut: "payée" }).eq("id", id);
    if (error) throw error;
    setFactures((prev) => prev.map((f) => f.id === id ? { ...f, statut: "payée" } : f));
  };

  const deleteFacture = async (id: string) => {
    const { error } = await supabase.from("factures").delete().eq("id", id);
    if (error) throw error;
    setFactures((prev) => prev.filter((f) => f.id !== id));
  };

  return { factures, loading, error, reload: load, createFacture, markPaid, deleteFacture };
}
