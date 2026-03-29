import { supabase } from "../supabase";
import type { Cours } from "../database.types";

export async function getCours(profId: string): Promise<Cours[]> {
  const { data, error } = await supabase
    .from("cours")
    .select("*")
    .eq("prof_id", profId)
    .order("date", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function createCours(
  profId: string,
  data: Omit<Cours, "id" | "created_at" | "prof_id">,
): Promise<Cours> {
  const { data: cours, error } = await supabase
    .from("cours")
    .insert({ ...data, prof_id: profId })
    .select()
    .single();
  if (error) throw error;
  return cours;
}

export async function updateCours(
  id: string,
  data: Partial<Omit<Cours, "id" | "created_at" | "prof_id">>,
): Promise<void> {
  const { error } = await supabase.from("cours").update(data).eq("id", id);
  if (error) throw error;
}

export async function deleteCours(id: string): Promise<void> {
  const { error } = await supabase.from("cours").delete().eq("id", id);
  if (error) throw error;
}

/** Returns cours in a date range (YYYY-MM-DD) */
export async function getCoursForMonth(
  profId: string,
  year: number,
  month: number, // 1-based
): Promise<Cours[]> {
  const from = `${year}-${String(month).padStart(2, "0")}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const to = `${year}-${String(month).padStart(2, "0")}-${lastDay}`;

  const { data, error } = await supabase
    .from("cours")
    .select("*")
    .eq("prof_id", profId)
    .gte("date", from)
    .lte("date", to)
    .order("date");
  if (error) throw error;
  return data ?? [];
}

/** For parent: get cours for a specific eleve */
export async function getCoursForEleve(eleveId: string): Promise<Cours[]> {
  const { data, error } = await supabase
    .from("cours")
    .select("*")
    .eq("eleve_id", eleveId)
    .order("date", { ascending: false });
  if (error) throw error;
  return data ?? [];
}
