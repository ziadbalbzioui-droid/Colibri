import { useState, useEffect, useCallback } from "react";
import { supabase } from "../supabase";
import { useAuth } from "../auth";

export interface FilleulRow {
  id: string;
  prenom: string;
  nom: string;
  email: string;
  heures: number;
  prime_versee: boolean;
  created_at: string;
}

export interface ParrainRow {
  id: string;
  prenom: string;
  nom: string;
  code_parrainage: string;
}

export function useParrainage() {
  const { user, profile } = useAuth();
  const [filleuls, setFilleuls] = useState<FilleulRow[]>([]);
  const [parrain, setParrain] = useState<ParrainRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user || !profile) return;
    setLoading(true);
    setError(null);
    try {
      // Load filleuls
      const { data: parrainageRows, error: e1 } = await supabase
        .from("parrainages")
        .select("filleul_id, prime_versee, created_at, filleul:profiles!filleul_id(id, prenom, nom, email)")
        .eq("parrain_id", user.id);
      if (e1) throw e1;

      if (parrainageRows && parrainageRows.length > 0) {
        // Get hours via RPC (bypasses RLS on cours table)
        const { data: heuresData } = await supabase
          .rpc("get_filleul_heures", { p_parrain_id: user.id });

        const heuresMap: Record<string, number> = {};
        (heuresData ?? []).forEach((r: { filleul_id: string; heures: number }) => {
          heuresMap[r.filleul_id] = r.heures;
        });

        const rows: FilleulRow[] = parrainageRows.map((r) => {
          const f = r.filleul as { prenom?: string; nom?: string; email?: string } | null;
          return {
            id: r.filleul_id,
            prenom: f?.prenom ?? "",
            nom: f?.nom ?? "",
            email: f?.email ?? "",
            heures: heuresMap[r.filleul_id] ?? 0,
            prime_versee: r.prime_versee,
            created_at: r.created_at,
          };
        });
        setFilleuls(rows);
      }

      // Load parrain depuis parrainages (plus fiable que profile.parrain_id qui peut être périmé)
      const { data: myParrainage } = await supabase
        .from("parrainages")
        .select("parrain_id, parrain:profiles!parrain_id(id, prenom, nom, code_parrainage)")
        .eq("filleul_id", user.id)
        .maybeSingle();

      if (myParrainage?.parrain_id) {
        const p = myParrainage.parrain as { id: string; prenom: string; nom: string; code_parrainage: string } | null;
        setParrain(p ?? { id: myParrainage.parrain_id, prenom: "Parrain", nom: "enregistré", code_parrainage: "" });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur chargement parrainage");
    } finally {
      setLoading(false);
    }
  }, [user, profile]);

  useEffect(() => {
    load();
  }, [load]);

  const applyCode = async (code: string): Promise<{ error?: string }> => {
    if (!user || !profile) return { error: "Non connecté" };

    const cleanCode = code.trim().toUpperCase();
    if (profile.code_parrainage === cleanCode) return { error: "Vous ne pouvez pas utiliser votre propre code" };

    // Vérifie si un parrainage existe déjà en DB (évite le duplicate key)
    const { data: existing } = await supabase
      .from("parrainages")
      .select("parrain_id")
      .eq("filleul_id", user.id)
      .maybeSingle();
    if (existing) return { error: "Vous avez déjà un parrain enregistré" };

    // Find parrain via RPC
    const { data: parrainId, error: e1 } = await supabase
      .rpc("find_parrain_by_code", { p_code: cleanCode });
    if (e1 || !parrainId) return { error: "Code de parrainage invalide ou introuvable" };

    // Set parrain_id on profile
    const { error: e2 } = await supabase
      .from("profiles")
      .update({ parrain_id: parrainId })
      .eq("id", user.id);
    if (e2) return { error: e2.message };

    // Create parrainage row
    const { error: e3 } = await supabase
      .from("parrainages")
      .insert({ parrain_id: parrainId, filleul_id: user.id });
    if (e3) return { error: e3.message };

    await load();
    return {};
  };

  const primesGagnees = filleuls.filter((f) => f.heures >= 10).length * 50;
  const eligibles = filleuls.filter((f) => f.heures >= 10 && !f.prime_versee).length;

  return {
    filleuls,
    parrain,
    monCode: profile?.code_parrainage ?? null,
    primesGagnees,
    eligibles,
    loading,
    error,
    reload: load,
    applyCode,
  };
}
