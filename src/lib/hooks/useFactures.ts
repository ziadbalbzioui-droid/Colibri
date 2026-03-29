import { useState, useEffect, useCallback } from "react";
import { supabase } from "../supabase";
import { useAuth } from "../auth";

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

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from("factures")
        .select("*, lignes_facture(*)")
        .eq("prof_id", user.id)
        .order("date_emission", { ascending: false });
      if (error) throw error;
      const rows = (data ?? []).map((f) => ({
        ...f,
        lignes: f.lignes_facture as LigneRow[],
      }));
      setFactures(rows);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur chargement factures");
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

  const createFacture = async (mois: string, lignes: LigneRow[]) => {
    if (!user) return;
    const validLignes = lignes.filter((l) => l.eleve_nom && l.matiere);
    const brut = validLignes.reduce((s, l) => s + l.heures * l.tarif_heure, 0);
    const net = Math.round(brut * (1 - URSSAF));

    const { data: facture, error: fe } = await supabase
      .from("factures")
      .insert({
        prof_id: user.id,
        mois,
        date_emission: new Date().toISOString().split("T")[0],
        statut: "en attente",
        montant_brut: brut,
        montant_net: net,
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
    await supabase.from("factures").update({ statut: "payée" }).eq("id", id);
    setFactures((prev) => prev.map((f) => f.id === id ? { ...f, statut: "payée" } : f));
  };

  const deleteFacture = async (id: string) => {
    await supabase.from("factures").delete().eq("id", id);
    setFactures((prev) => prev.filter((f) => f.id !== id));
  };

  return { factures, loading, error, reload: load, createFacture, markPaid, deleteFacture };
}
