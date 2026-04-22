"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireCurrentUser } from "@/lib/data/queries";

export async function createTask(title: string) {
  const trimmed = title.trim();
  if (!trimmed) return;
  const currentUser = await requireCurrentUser();
  const supabase = createSupabaseServerClient();
  const { error } = await supabase.from("tasks").insert({
    owner_id: currentUser.id,
    title: trimmed,
    done: false
  });
  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
}

export async function toggleTask(id: string, done: boolean) {
  const supabase = createSupabaseServerClient();
  const { error } = await supabase
    .from("tasks")
    .update({ done, completed_at: done ? new Date().toISOString() : null })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
}

export async function deleteTask(id: string) {
  const supabase = createSupabaseServerClient();
  const { error } = await supabase.from("tasks").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
}

export async function clearCompletedTasks() {
  const currentUser = await requireCurrentUser();
  const supabase = createSupabaseServerClient();
  const { error } = await supabase
    .from("tasks")
    .delete()
    .eq("owner_id", currentUser.id)
    .eq("done", true);
  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
}
