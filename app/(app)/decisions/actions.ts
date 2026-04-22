"use server";

import { revalidatePath } from "next/cache";
import { requireCurrentUser } from "@/lib/data/queries";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function saveDecisionTake(formData: FormData) {
  const currentUser = await requireCurrentUser();
  const supabase = createSupabaseServerClient();

  const decisionId = String(formData.get("decisionId"));
  const vote = String(formData.get("vote"));
  const take = String(formData.get("take"));
  const status = String(formData.get("status"));
  const waitingOn = String(formData.get("waitingOn"));
  const resolution = String(formData.get("resolution") || "");

  await supabase.from("decision_positions").upsert(
    {
      decision_id: decisionId,
      user_id: currentUser.id,
      vote,
      take
    },
    { onConflict: "decision_id,user_id" }
  );

  await supabase
    .from("decisions")
    .update({
      status,
      waiting_on_both: waitingOn === "both",
      waiting_on_user_id: waitingOn === "me" ? currentUser.id : waitingOn === "none" || waitingOn === "both" ? null : waitingOn,
      resolution: resolution || null
    })
    .eq("id", decisionId);

  revalidatePath("/decisions");
  revalidatePath(`/decisions/${decisionId}`);
  revalidatePath("/launchpad");
}
