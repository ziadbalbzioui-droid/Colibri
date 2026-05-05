import { supabase } from "../supabase";
import type { Eleve } from "../database.types";

export async function getEleves(profId: string): Promise<Eleve[]> {
  const { data: eleves, error } = await supabase
    .from("eleves")
    .select("*")
    .eq("prof_id", profId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return eleves ?? [];
}

export async function createEleve(
  profId: string,
  data: Omit<Eleve, "id" | "created_at" | "prof_id">,
): Promise<Eleve> {
  const { data: eleve, error } = await supabase
    .from("eleves")
    .insert({ ...data, prof_id: profId })
    .select()
    .single();
  if (error) throw error;
  return eleve;
}

export async function updateEleve(
  id: string,
  data: Partial<Omit<Eleve, "id" | "created_at" | "prof_id">>,
): Promise<void> {
  const { error } = await supabase.from("eleves").update(data).eq("id", id);
  if (error) throw error;
}

export async function deleteEleve(id: string): Promise<void> {
  const { error } = await supabase.from("eleves").delete().eq("id", id);
  if (error) throw error;
}

