import Link from "next/link";
import { NewDropModal } from "@/components/drop/new-drop-modal";
import { LibraryItemCard } from "@/components/library/library-item-card";
import { PageHeader } from "@/components/ui/page-header";
import { Countdown } from "@/components/ui/countdown";
import { FocusList } from "@/components/dashboard/focus-list";
import {
  getDashboardData,
  getFocusItems,
  getLibraryCount,
  getMetrics,
  getTags
} from "@/lib/data/queries";
import { roadmapPhases } from "@/lib/data/constants";
import { getGreeting } from "@/lib/utils/format";
import type { Metric } from "@/types";

const CURRENT_WEEK = "W16";
const METRIC_KEYS = ["waitlist_signups", "active_customers"];

export default async function LaunchpadPage() {
  const [data, tags, focusItems, metrics, libraryCount] = await Promise.all([
    getDashboardData(),
    getTags(),
    getFocusItems(CURRENT_WEEK),
    getMetrics(METRIC_KEYS),
    getLibraryCount()
  ]);

  const waitlist = metrics.find((m) => m.key === "waitlist_signups");
  const customers = metrics.find((m) => m.key === "active_customers");
  const hasRecentItems = data.recentLibraryItems.length > 0;
  const hasPending = data.pendingForCurrentUser.length > 0;

  const teammateColor = data.teammate.slug === "james" ? "text-james" : "text-cory";

  const subtitle = hasRecentItems ? (
    <>
      <strong className={teammateColor}>{data.teammate.fullName}</strong> added{" "}
      {data.recentUpdates.length} thing{data.recentUpdates.length !== 1 ? "s" : ""} recently.
      {hasPending && (
        <>
          {" "}
          {data.pendingForCurrentUser.length} decision{data.pendingForCurrentUser.length !== 1 ? "s" : ""} waiting on you.
        </>
      )}
    </>
  ) : (
    <>Start the week by dropping something for <strong className={teammateColor}>{data.teammate.fullName}</strong>.</>
  );

  return (
    <>
      <PageHeader
        actions={<NewDropModal currentUser={data.currentUser} tags={tags} teammate={data.teammate} />}
        subtitle={subtitle}
        title={`Good ${getGreeting()}, ${data.currentUser.fullName}.`}
      />

      {/* Key metrics */}
      <section className="mb-4 grid gap-3 md:grid-cols-3">
        <div className="surface-card p-5">
          <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-tertiary">
            Launch target · Jul 1, 2026
          </div>
          <Countdown />
        </div>
        <MetricTile label="Waitlist" meta="signups" value={metricValue(waitlist)} />
        <MetricTile label="Customers" meta="active" value={metricValue(customers)} />
      </section>

      {/* Main content */}
      <section className="mb-4 grid gap-4 xl:grid-cols-[1fr_288px]">
        {/* Latest drops */}
        <div className="surface-card p-[18px] pb-2">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <div className="text-[15px] font-semibold tracking-[-0.01em]">Latest drops</div>
              <div className="mt-0.5 text-xs text-tertiary">
                {libraryCount > 0
                  ? `${libraryCount} item${libraryCount !== 1 ? "s" : ""} saved in the library`
                  : "Nothing saved yet"}
              </div>
            </div>
            <Link className="text-xs font-medium text-accent transition hover:text-accent-hover" href="/library">
              View all →
            </Link>
          </div>

          {hasRecentItems ? (
            <div className="space-y-0.5">
              {data.recentLibraryItems.map((item) => (
                <LibraryItemCard href={`/library?item=${item.id}`} item={item} key={item.id} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center py-12 text-center">
              <div className="mb-1.5 text-[13px] font-medium text-secondary">Nothing in the library yet.</div>
              <div className="text-[12px] text-tertiary">
                Drop a link, file, or screenshot and it shows up here.
              </div>
            </div>
          )}
        </div>

        {/* Your queue */}
        <div className="surface-card p-5">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-[15px] font-semibold">Your queue</div>
            <Link className="text-xs font-medium text-accent transition hover:text-accent-hover" href="/decisions">
              All →
            </Link>
          </div>

          {hasPending ? (
            <div className="space-y-2.5">
              {data.pendingForCurrentUser.map((decision) => (
                <Link
                  className="block rounded-[8px] border-l-[3px] border-accent bg-subtle px-3.5 py-3 transition hover:bg-elevated"
                  href={`/decisions/${decision.id}`}
                  key={decision.id}
                >
                  <div className={`mb-1 text-[10.5px] font-semibold uppercase tracking-[0.07em] ${teammateColor}`}>
                    {data.teammate.fullName}
                  </div>
                  <div className="text-[13px] leading-[1.45] text-primary">{decision.question}</div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center py-10 text-[12.5px] text-tertiary">
              Nothing waiting on you.
            </div>
          )}
        </div>
      </section>

      {/* Interactive focus list */}
      <FocusList items={focusItems} />

      {/* Roadmap */}
      <section className="surface-card px-6 py-5">
        <div className="mb-4 flex items-center justify-between">
          <div className="text-[15px] font-semibold">Roadmap</div>
          <div className="text-[11.5px] text-tertiary">
            Phase <strong className="font-[var(--font-mono)] text-primary">01</strong> of{" "}
            <strong className="font-[var(--font-mono)] text-primary">06</strong> · Foundation
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
          {roadmapPhases.map((phase) => {
            const isCurrent = "current" in phase && phase.current;
            return (
              <div className="text-center" key={phase.id}>
                <div
                  className={`mx-auto mb-2.5 grid h-[30px] w-[30px] place-items-center rounded-full border font-[var(--font-mono)] text-[10.5px] font-bold ${
                    isCurrent
                      ? "border-[2px] border-accent text-accent shadow-[0_0_0_3px_var(--accent-soft)]"
                      : "border-border-strong text-tertiary"
                  }`}
                >
                  {phase.id}
                </div>
                <div className={`text-[12px] font-semibold ${isCurrent ? "text-primary" : "text-tertiary"}`}>
                  {phase.name}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}

function metricValue(metric: Metric | undefined): string {
  if (!metric) return "—";
  return String(metric.value);
}

function MetricTile({ label, value, meta }: { label: string; value: string; meta: string }) {
  return (
    <div className="surface-card p-5">
      <div className="mb-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-tertiary">{label}</div>
      <div className="flex items-baseline gap-1.5">
        <span className="text-[28px] font-bold tracking-[-0.03em]">{value}</span>
        <span className="text-[11.5px] text-tertiary">{meta}</span>
      </div>
    </div>
  );
}
