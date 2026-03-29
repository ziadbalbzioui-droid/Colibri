import { supabase } from "../supabase";
import type { PapsAnnonce } from "../database.types";

export interface PapsFilters {
  matiere?: string;
  niveau?: string;
  prixMax?: number;
}

export async function getAnnonces(filters?: PapsFilters): Promise<PapsAnnonce[]> {
  let query = supabase
    .from("paps_annonces")
    .select("*")
    .eq("active", true)
    .order("urgent", { ascending: false })
    .order("created_at", { ascending: false });

  if (filters?.matiere && filters.matiere !== "Toutes") {
    query = query.eq("matiere", filters.matiere);
  }
  if (filters?.niveau && filters.niveau !== "Tous") {
    query = query.eq("niveau_eleve", filters.niveau);
  }
  if (filters?.prixMax) {
    query = query.lte("prix", filters.prixMax);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function createAnnonce(
  profId: string,
  data: Omit<PapsAnnonce, "id" | "created_at" | "prof_id" | "active">,
): Promise<PapsAnnonce> {
  const { data: annonce, error } = await supabase
    .from("paps_annonces")
    .insert({ ...data, prof_id: profId, active: true })
    .select()
    .single();
  if (error) throw error;
  return annonce;
}

export async function closeAnnonce(id: string): Promise<void> {
  const { error } = await supabase
    .from("paps_annonces")
    .update({ active: false })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteAnnonce(id: string): Promise<void> {
  const { error } = await supabase.from("paps_annonces").delete().eq("id", id);
  if (error) throw error;
}
