import Link from "next/link";
import { redirect } from "next/navigation";
import { signOut } from "@/lib/data/queries";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const DEMO_PASSWORD = process.env.DEMO_USER_PASSWORD ?? "launchpad-demo";

async function switchDemoUser(formData: FormData) {
  "use server";
  const email = String(formData.get("email"));
  const supabase = createSupabaseServerClient();
  await supabase.auth.signInWithPassword({ email, password: DEMO_PASSWORD });
  redirect("/launchpad");
}

export function UserMenu({ currentEmail }: { currentEmail: string }) {
  return (
    <div className="mt-auto space-y-2 pt-4">
      <div className="rounded-lg border border-border bg-card p-3">
        <div className="mb-2 text-[10.5px] font-semibold uppercase tracking-[0.08em] text-tertiary">Switch view</div>
        <div className="space-y-2">
          {[
            { email: "james@proofbridge.io", label: "James" },
            { email: "cory@proofbridge.io", label: "Cory" }
          ].map((user) => (
            <form action={switchDemoUser} key={user.email}>
              <input name="email" type="hidden" value={user.email} />
              <button className="flex w-full items-center justify-between rounded-md px-2 py-2 text-left text-[13px] font-medium transition hover:bg-subtle" type="submit">
                <span>{user.label}</span>
                {currentEmail === user.email ? <span className="text-xs text-accent">Active</span> : null}
              </button>
            </form>
          ))}
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
          <Link className="text-xs text-tertiary" href="/login">
            Back to login
          </Link>
          <form action={signOut}>
            <button className="text-xs font-medium text-secondary transition hover:text-primary" type="submit">
              Sign out
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
