import Link from "next/link";
import { DecisionCard } from "@/components/decisions/decision-card";
import { PageHeader } from "@/components/ui/page-header";
import { getDecisionCounts, getDecisions, getTeammate, requireCurrentUser } from "@/lib/data/queries";

const tabs = [
  { key: "open", label: "Active" },
  { key: "resolved", label: "Resolved" },
  { key: "all", label: "All" }
] as const;

export default async function DecisionsPage({
  searchParams
}: {
  searchParams?: { status?: "open" | "resolved" | "all" };
}) {
  const status = searchParams?.status ?? "open";
  const currentUser = await requireCurrentUser();
  const [teammate, decisions, counts] = await Promise.all([
    getTeammate(currentUser.id),
    getDecisions(status),
    getDecisionCounts()
  ]);

  return (
    <>
      <PageHeader
        subtitle="Track what's been decided and what still needs a call."
        title="Decisions"
      />

      <div className="mb-5 flex w-fit gap-1 rounded-lg bg-elevated p-1">
        {tabs.map((tab) => {
          const count = tab.key === "open" ? counts.open : tab.key === "resolved" ? counts.resolved : counts.all;
          return (
            <Link
              className={`rounded-md px-3.5 py-2 text-[13px] font-medium transition ${
                status === tab.key
                  ? "bg-card text-primary shadow-card"
                  : "text-secondary hover:text-primary"
              }`}
              href={`/decisions?status=${tab.key}`}
              key={tab.key}
            >
              {tab.label}{" "}
              <span className="ml-1 font-[var(--font-mono)] text-[11px] text-tertiary">{count}</span>
            </Link>
          );
        })}
      </div>

      {decisions.length > 0 ? (
        <div>
          {decisions.map((decision) => (
            <DecisionCard
              currentUser={currentUser}
              decision={decision}
              key={decision.id}
              teammate={teammate}
            />
          ))}
        </div>
      ) : (
        <div className="surface-card flex flex-col items-center py-16 text-center">
          <div className="mb-1.5 text-[13px] font-medium text-secondary">
            {status === "resolved" ? "No resolved decisions yet." : "No active decisions."}
          </div>
          <div className="text-[12px] text-tertiary">
            {status === "resolved"
              ? "When you close out a decision, it shows up here."
              : "When something needs a call, it goes here."}
          </div>
        </div>
      )}
    </>
  );
}
