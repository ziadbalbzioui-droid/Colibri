import { supabase } from "../supabase";
import type { Facture, LigneFacture } from "../database.types";

export type FactureWithLignes = Facture & { lignes: LigneFacture[] };

export async function getFactures(profId: string): Promise<FactureWithLignes[]> {
  const { data, error } = await supabase
    .from("factures")
    .select("*, lignes_facture(*)")
    .eq("prof_id", profId)
    .order("date_emission", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((f) => ({
    ...f,
    lignes: f.lignes_facture as LigneFacture[],
  }));
}

export async function createFacture(
  profId: string,
  data: Omit<Facture, "id" | "created_at" | "prof_id">,
  lignes: Omit<LigneFacture, "id" | "facture_id">[],
): Promise<FactureWithLignes> {
  const { data: facture, error } = await supabase
    .from("factures")
    .insert({ ...data, prof_id: profId })
    .select()
    .single();
  if (error) throw error;

  let insertedLignes: LigneFacture[] = [];
  if (lignes.length > 0) {
    const { data: rows, error: le } = await supabase
      .from("lignes_facture")
      .insert(lignes.map((l) => ({ ...l, facture_id: facture.id })))
      .select();
    if (le) throw le;
    insertedLignes = rows as LigneFacture[];
  }

  return { ...facture, lignes: insertedLignes };
}

export async function updateFactureStatut(
  id: string,
  statut: Facture["statut"],
): Promise<void> {
  const { error } = await supabase
    .from("factures")
    .update({ statut })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteFacture(id: string): Promise<void> {
  const { error } = await supabase.from("factures").delete().eq("id", id);
  if (error) throw error;
}

/** For parent: get factures from their child's prof */
export async function getFacturesForParent(
  profId: string,
): Promise<FactureWithLignes[]> {
  return getFactures(profId);
}

export async function payFacture(id: string): Promise<void> {
  return updateFactureStatut(id, "payée");
}
