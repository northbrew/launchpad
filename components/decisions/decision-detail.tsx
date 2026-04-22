import Link from "next/link";
import { saveDecisionTake } from "@/app/(app)/decisions/actions";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils/cn";
import { waitingOnLabel } from "@/lib/utils/format";
import type { AppUser, Decision } from "@/types";

export function DecisionDetail({
  decision,
  currentUser,
  teammate
}: {
  decision: Decision;
  currentUser: AppUser;
  teammate: AppUser;
}) {
  const myPosition = decision.positions.find((p) => p.user.id === currentUser.id);

  const statusStyles: Record<Decision["status"], string> = {
    blocking: "bg-amber-soft text-amber",
    open: "bg-accent-soft text-accent",
    resolved: "bg-green-soft text-green"
  };

  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_320px]">
      {/* Main card */}
      <div className="surface-card p-6">
        <Link className="mb-5 inline-flex text-[13px] text-tertiary transition hover:text-primary" href="/decisions">
          ← All decisions
        </Link>

        <div className="mb-3 flex items-center gap-2.5">
          <span
            className={cn(
              "rounded px-2 py-0.5 font-[var(--font-mono)] text-[10px] font-bold uppercase tracking-[0.08em]",
              statusStyles[decision.status]
            )}
          >
            {decision.status}
          </span>
          <span className="text-[12.5px] text-tertiary">
            {waitingOnLabel(decision.waitingOnBoth, decision.waitingOnUserId, currentUser, teammate)}
          </span>
        </div>

        <h1 className="mb-3 text-[24px] font-semibold leading-[1.3] tracking-[-0.02em]">
          {decision.question}
        </h1>
        <p className="mb-6 text-[13.5px] leading-[1.65] text-secondary">{decision.context}</p>

        {decision.status === "resolved" && decision.resolution && (
          <div className="mb-6 rounded-[8px] border border-[rgba(22,163,74,0.2)] bg-green-soft px-4 py-3 text-[13px] text-green">
            <strong className="font-semibold">Resolved:</strong> {decision.resolution}
          </div>
        )}

        <div className="grid gap-3 md:grid-cols-2">
          {[currentUser, teammate].map((user) => {
            const position = decision.positions.find((entry) => entry.user.id === user.id);
            const isMe = user.id === currentUser.id;
            return (
              <div
                className={cn(
                  "rounded-[8px] border p-4",
                  isMe ? "border-accent bg-accent-soft" : "border-border bg-subtle"
                )}
                key={user.id}
              >
                <div className="mb-2.5 flex items-center gap-2">
                  <Avatar color={`var(--${user.colorToken})`} initials={user.initials} size="sm" />
                  <span
                    className={cn(
                      "text-[13px] font-semibold",
                      user.slug === "james" ? "text-james" : "text-cory"
                    )}
                  >
                    {user.fullName}
                  </span>
                  {position && (
                    <span className="ml-auto font-[var(--font-mono)] text-[10.5px] text-tertiary">
                      {position.vote}
                    </span>
                  )}
                </div>
                {position ? (
                  <div className="text-[13px] leading-[1.6] text-primary">{position.take}</div>
                ) : (
                  <div className="text-[13px] italic text-tertiary">No take logged yet.</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Log take */}
      <aside className="surface-card self-start p-5">
        <div className="mb-4 text-[15px] font-semibold">Log your take</div>
        <form action={saveDecisionTake} className="grid gap-4">
          <input name="decisionId" type="hidden" value={decision.id} />

          <Field label="Your vote">
            <input
              className="input-shell"
              defaultValue={myPosition?.vote ?? ""}
              name="vote"
              placeholder="Yes, no, mid-June…"
              required
            />
          </Field>

          <Field label="Your take">
            <textarea
              className="input-shell min-h-[130px]"
              defaultValue={myPosition?.take ?? ""}
              name="take"
              placeholder="Why is this the right call?"
              required
            />
          </Field>

          <Field label="Status">
            <select className="input-shell" defaultValue={decision.status} name="status">
              <option value="open">Open</option>
              <option value="blocking">Blocking</option>
              <option value="resolved">Resolved</option>
            </select>
          </Field>

          <Field label="Waiting on">
            <select
              className="input-shell"
              defaultValue={
                decision.waitingOnBoth
                  ? "both"
                  : decision.waitingOnUserId === currentUser.id
                  ? "me"
                  : decision.waitingOnUserId === teammate.id
                  ? teammate.id
                  : "none"
              }
              name="waitingOn"
            >
              <option value="me">Me</option>
              <option value={teammate.id}>{teammate.fullName}</option>
              <option value="both">Both of us</option>
              <option value="none">Nobody</option>
            </select>
          </Field>

          <Field label="Resolution note">
            <textarea
              className="input-shell min-h-[80px]"
              defaultValue={decision.resolution ?? ""}
              name="resolution"
              placeholder="Only needed when resolved."
            />
          </Field>

          <button className="action-btn action-btn-primary w-full justify-center" type="submit">
            Save take
          </button>
        </form>
      </aside>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-[11.5px] font-semibold text-tertiary">{label}</label>
      {children}
    </div>
  );
}
