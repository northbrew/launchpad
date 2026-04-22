"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const DEMO_PASSWORD = process.env.DEMO_USER_PASSWORD ?? "launchpad-demo";

export async function signInAs(slug: "james" | "cory") {
  const email = slug === "james" ? "james@proofbridge.io" : "cory@proofbridge.io";
  const supabase = createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password: DEMO_PASSWORD });
  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }
  redirect("/launchpad");
}
