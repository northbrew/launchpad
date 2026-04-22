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
  const users = [
    { email: "james@proofbridge.io", label: "James" },
    { email: "cory@proofbridge.io", label: "Cory" }
  ];

  return (
    <div className="mt-3 border-t border-border pt-2.5">
      <div className="flex items-center gap-1">
        {users.map((user) => (
          <form action={switchDemoUser} className="flex-1" key={user.email}>
            <input name="email" type="hidden" value={user.email} />
            <button
              className={`w-full rounded-md px-2 py-1.5 text-[11.5px] font-medium transition ${
                currentEmail === user.email
                  ? "bg-subtle text-primary"
                  : "text-tertiary hover:bg-subtle hover:text-secondary"
              }`}
              type="submit"
            >
              {user.label}
            </button>
          </form>
        ))}
      </div>
      <form action={signOut} className="mt-1">
        <button
          className="w-full rounded-md px-2 py-1.5 text-[11px] text-tertiary transition hover:text-secondary"
          type="submit"
        >
          Sign out
        </button>
      </form>
    </div>
  );
}
