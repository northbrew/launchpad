"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function toggleFocusItem(id: string, done: boolean) {
  const supabase = createSupabaseServerClient();
  const { error } = await supabase
    .from("focus_items")
    .update({ done })
    .eq("id", id);
  if (error) throw new Error(error.message);
}
