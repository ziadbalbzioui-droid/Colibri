import { supabase } from "../supabase";
import type { Eleve, EleveTag } from "../database.types";

export type EleveWithTags = Eleve & { tags: string[] };

export async function getEleves(profId: string): Promise<EleveWithTags[]> {
  const { data: eleves, error } = await supabase
    .from("eleves")
    .select("*, eleve_tags(tag)")
    .eq("prof_id", profId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (eleves ?? []).map((e) => ({
    ...e,
    tags: (e.eleve_tags as { tag: string }[]).map((t) => t.tag),
  }));
}

export async function createEleve(
  profId: string,
  data: Omit<Eleve, "id" | "created_at" | "prof_id">,
  tags: string[],
): Promise<EleveWithTags> {
  const { data: eleve, error } = await supabase
    .from("eleves")
    .insert({ ...data, prof_id: profId })
    .select()
    .single();
  if (error) throw error;

  if (tags.length > 0) {
    await supabase.from("eleve_tags").insert(
      tags.map((tag) => ({ eleve_id: eleve.id, tag })),
    );
  }

  return { ...eleve, tags };
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

export async function setEleveTags(eleveId: string, tags: string[]): Promise<void> {
  await supabase.from("eleve_tags").delete().eq("eleve_id", eleveId);
  if (tags.length > 0) {
    const { error } = await supabase
      .from("eleve_tags")
      .insert(tags.map((tag) => ({ eleve_id: eleveId, tag })));
    if (error) throw error;
  }
}

export async function getEleveTags(eleveId: string): Promise<string[]> {
  const { data } = await supabase
    .from("eleve_tags")
    .select("tag")
    .eq("eleve_id", eleveId);
  return (data ?? []).map((t: EleveTag) => t.tag);
}
