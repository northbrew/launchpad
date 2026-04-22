import { headers } from "next/headers";
import { Sidebar } from "@/components/layout/sidebar";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireCurrentUser, getTasksForUser } from "@/lib/data/queries";

async function getCounts() {
  const supabase = createSupabaseServerClient();
  const [library, decisions] = await Promise.all([
    supabase.from("library_items").select("*", { count: "exact", head: true }),
    supabase.from("decisions").select("*", { count: "exact", head: true }).neq("status", "resolved")
  ]);

  return { library: library.count ?? 0, decisions: decisions.count ?? 0 };
}

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const currentUser = await requireCurrentUser();
  const [counts, tasks] = await Promise.all([getCounts(), getTasksForUser(currentUser.id)]);
  const pathname = headers().get("x-current-path") ?? "";

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[232px_1fr]">
      <Sidebar
        currentUser={currentUser}
        libraryCount={counts.library}
        openDecisionCount={counts.decisions}
        pathname={pathname}
        tasks={tasks}
      />
      <main className="mx-auto w-full max-w-[1500px] px-5 py-7 pb-12 sm:px-9">{children}</main>
    </div>
  );
}
