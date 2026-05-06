import { useState, useEffect } from "react";
import { supabase } from "../supabase";

export interface GrilleRow {
  tarif_palier: number;
  taux_plusvalue: number;
  multiplicateur_brut: number;
}

let _cache: GrilleRow[] | null = null;

export function getTauxPlusvalue(grille: GrilleRow[], tarif_heure: number): number {
  const sorted = [...grille].sort((a, b) => b.tarif_palier - a.tarif_palier);
  const match = sorted.find((g) => g.tarif_palier <= tarif_heure);
  return match?.taux_plusvalue ?? 0;
}

export function getMultiplicateurBrut(grille: GrilleRow[], tarif_heure: number): number {
  const sorted = [...grille].sort((a, b) => b.tarif_palier - a.tarif_palier);
  const match = sorted.find((g) => g.tarif_palier <= tarif_heure);
  return match?.multiplicateur_brut ?? 1.5272;
}

export function useGrilleCommission() {
  const [grille, setGrille] = useState<GrilleRow[]>(_cache ?? []);
  const [loading, setLoading] = useState(_cache === null);

  useEffect(() => {
    if (_cache !== null) return;
    supabase
      .from("grille_commission")
      .select("tarif_palier, taux_plusvalue, multiplicateur_brut")
      .order("tarif_palier")
      .then(({ data }) => {
        _cache = data ?? [];
        setGrille(_cache);
        setLoading(false);
      });
  }, []);

  return { grille, loading };
}
