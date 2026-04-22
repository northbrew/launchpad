import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { ageLabel } from "@/lib/data/queries";
import { cn } from "@/lib/utils/cn";
import type { AppUser, Decision } from "@/types";

const statusStyles: Record<Decision["status"], string> = {
  blocking: "bg-amber-soft text-amber",
  open: "bg-accent-soft text-accent",
  resolved: "bg-green-soft text-green"
};

const statusLabels: Record<Decision["status"], string> = {
  blocking: "Blocking",
  open: "Open",
  resolved: "Resolved"
};

export function DecisionCard({
  decision,
  currentUser,
  teammate
}: {
  decision: Decision;
  currentUser: AppUser;
  teammate: AppUser;
}) {
  const myPosition = decision.positions.find((p) => p.user.id === currentUser.id);
  const teammatePosition = decision.positions.find((p) => p.user.id === teammate.id);

  return (
    <Link
      className="mb-2.5 flex items-start gap-4 rounded-[10px] border border-border bg-card px-5 py-4 shadow-card transition hover:border-border-strong hover:bg-card-hover"
      href={`/decisions/${decision.id}`}
    >
      <div className="min-w-0 flex-1">
        <div className="mb-2 flex items-center gap-2">
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[11px] font-semibold",
              statusStyles[decision.status]
            )}
          >
            {statusLabels[decision.status]}
          </span>
          <span className="text-[11.5px] text-tertiary">{ageLabel(decision.createdAt)}</span>
        </div>

        <div className="mb-3 text-[15px] font-semibold leading-[1.4] tracking-[-0.01em]">
          {decision.question}
        </div>

        <div className="flex flex-wrap gap-2">
          <VoteChip position={myPosition} user={currentUser} />
          <VoteChip position={teammatePosition} user={teammate} />
        </div>

        {decision.status === "resolved" && decision.resolution && (
          <div className="mt-3 rounded-md bg-green-soft px-3 py-2 text-[12.5px] text-green">
            ✓ {decision.resolution}
          </div>
        )}
      </div>

      <span className="mt-0.5 shrink-0 text-[13px] text-tertiary">→</span>
    </Link>
  );
}

function VoteChip({
  user,
  position
}: {
  user: AppUser;
  position?: Decision["positions"][number];
}) {
  const hasVoted = Boolean(position);
  return (
    <div className="flex items-center gap-1.5 rounded-md bg-subtle px-2.5 py-1.5">
      <Avatar color={`var(--${user.colorToken})`} initials={user.initials} size="sm" />
      <span className={cn("text-[12px] font-medium", user.slug === "james" ? "text-james" : "text-cory")}>
        {user.fullName}
      </span>
      {hasVoted ? (
        <span className="text-[11px] text-tertiary">· {position!.vote}</span>
      ) : (
        <span className="text-[11px] italic text-tertiary">· pending</span>
      )}
    </div>
  );
}
