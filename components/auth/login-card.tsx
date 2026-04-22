import { signInAs } from "@/app/(auth)/login/actions";
import { BrandMark } from "@/components/ui/icons";

function LoginButton({ slug, name, meta, color }: { slug: "james" | "cory"; name: string; meta: string; color: string }) {
  return (
    <form action={signInAs.bind(null, slug)}>
      <button className="group flex w-full items-center gap-3.5 rounded-[10px] border-[1.5px] border-border bg-card px-4 py-3.5 text-left transition hover:border-accent hover:bg-[var(--accent-soft)]" type="submit">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-[15px] font-bold text-white" style={{ background: color }}>
          {name[0]}
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-0.5 text-[14.5px] font-semibold">{name}</div>
          <div className="font-[var(--font-mono)] text-xs text-tertiary">{meta}</div>
        </div>
        <svg className="h-[18px] w-[18px] text-tertiary transition group-hover:translate-x-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M5 12h14M13 5l7 7-7 7" />
        </svg>
      </button>
    </form>
  );
}

export function LoginCard({ error }: { error?: string }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-app px-5 py-10" style={{ backgroundImage: "radial-gradient(ellipse 60% 40% at 30% 0%, rgba(30, 63, 197, 0.05), transparent), radial-gradient(ellipse 50% 30% at 70% 100%, rgba(10, 27, 94, 0.04), transparent)" }}>
      <div className="mb-14 flex items-center gap-2.5">
        <BrandMark className="h-8 w-8" />
        <div className="text-[17px] font-semibold tracking-[-0.01em]">Proofbridge</div>
      </div>
      <div className="w-full max-w-[440px] rounded-[16px] border border-border bg-card px-9 py-10 shadow-[0_4px_16px_rgba(0,0,0,0.04)]">
        <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-accent">Launchpad</div>
        <h1 className="mb-2 text-2xl font-semibold tracking-[-0.02em]">Welcome back.</h1>
        <p className="mb-7 text-[13.5px] leading-[1.55] text-secondary">Pick your account. Your view is tuned to what&apos;s waiting on you.</p>
        {error ? <div className="mb-4 rounded-lg border border-red bg-red-soft px-3 py-2 text-sm text-red">{error}</div> : null}
        <div className="space-y-2.5">
          <LoginButton slug="james" name="James" meta="james@proofbridge.io · EST" color="var(--james)" />
          <LoginButton slug="cory" name="Cory" meta="cory@proofbridge.io · CET" color="var(--cory)" />
        </div>
        <div className="mt-8 text-center text-[11.5px] text-tertiary">Not on the list? Ping James or Cory.</div>
      </div>
    </div>
  );
}
