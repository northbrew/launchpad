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
  const hasFromTeammate = data.recentUpdates.length > 0;

  const teammateColor = data.teammate.slug === "james" ? "text-james" : "text-cory";

  const subtitle = hasPending ? (
    <>
      {data.pendingForCurrentUser.length} thing{data.pendingForCurrentUser.length !== 1 ? "s" : ""} waiting on you, and{" "}
      <strong className={teammateColor}>{data.teammate.fullName}</strong> dropped{" "}
      {data.recentUpdates.length} update{data.recentUpdates.length !== 1 ? "s" : ""} since we last talked.
    </>
  ) : hasFromTeammate ? (
    <>
      No calls queued up. <strong className={teammateColor}>{data.teammate.fullName}</strong> sent{" "}
      {data.recentUpdates.length} thing{data.recentUpdates.length !== 1 ? "s" : ""} over — worth a look.
    </>
  ) : (
    <>
      Quiet morning. Drop something for <strong className={teammateColor}>{data.teammate.fullName}</strong> or jot down what&apos;s on your mind.
    </>
  );

  return (
    <>
      <PageHeader
        actions={<NewDropModal currentUser={data.currentUser} tags={tags} teammate={data.teammate} />}
        subtitle={subtitle}
        title={`Good ${getGreeting()}, ${data.currentUser.fullName}.`}
      />

      {/* Signal strip — calmer, calm, one row */}
      <section className="surface-card mb-4 flex flex-wrap items-center gap-x-8 gap-y-3 px-5 py-4">
        <SignalItem label="Launch" sub="Jul 1, 2026">
          <Countdown />
        </SignalItem>
        <div className="hidden h-8 w-px bg-border sm:block" />
        <SignalItem label="Waitlist">
          <MetricNumber value={metricValue(waitlist)} unit="signups" />
        </SignalItem>
        <div className="hidden h-8 w-px bg-border sm:block" />
        <SignalItem label="Customers">
          <MetricNumber value={metricValue(customers)} unit="active" />
        </SignalItem>
        <div className="hidden h-8 w-px bg-border sm:block" />
        <SignalItem label={`${data.teammate.fullName}'s time`}>
          <TeammateTime timezone={data.teammate.timezone} colorClass={teammateColor} />
        </SignalItem>
      </section>

      {/* Needs a call + This week */}
      <section className="mb-4 grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="surface-card p-5">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <div className="text-[15px] font-semibold tracking-[-0.01em]">Needs a call from you</div>
              <div className="mt-0.5 text-[12px] text-tertiary">
                {hasPending
                  ? `${data.pendingForCurrentUser.length} open · ${data.blockingDecisionCount > 0 ? `${data.blockingDecisionCount} blocking` : "nothing blocking"}`
                  : "All aligned for now"}
              </div>
            </div>
            <Link className="text-xs font-medium text-accent transition hover:text-accent-hover" href="/decisions">
              All decisions →
            </Link>
          </div>

          {hasPending ? (
            <div className="space-y-2">
              {data.pendingForCurrentUser.map((decision) => (
                <Link
                  className="block rounded-[8px] border border-border bg-subtle px-3.5 py-3 transition hover:border-border-strong hover:bg-card"
                  href={`/decisions/${decision.id}`}
                  key={decision.id}
                >
                  <div className="mb-1 flex items-center gap-2 text-[10.5px] font-semibold uppercase tracking-[0.07em]">
                    <span className={teammateColor}>{data.teammate.fullName}</span>
                    <span className="text-tertiary">· asked {ageWord(decision.createdAt)}</span>
                  </div>
                  <div className="text-[13.5px] leading-[1.45] text-primary">{decision.question}</div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1 rounded-[8px] bg-subtle py-10 text-center">
              <div className="text-[13px] font-medium text-secondary">Nothing waiting on you.</div>
              <div className="text-[12px] text-tertiary">When {data.teammate.fullName} flags something, it&apos;ll land here.</div>
            </div>
          )}
        </div>

        <FocusList items={focusItems} />
      </section>

      {/* From teammate + Latest drops */}
      <section className="mb-4 grid gap-4 xl:grid-cols-[1fr_320px]">
        <div className="surface-card p-[18px] pb-2">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <div className="text-[15px] font-semibold tracking-[-0.01em]">Latest drops</div>
              <div className="mt-0.5 text-[12px] text-tertiary">
                {libraryCount > 0
                  ? `${libraryCount} in the library`
                  : "Nothing saved yet"}
              </div>
            </div>
            <Link className="text-xs font-medium text-accent transition hover:text-accent-hover" href="/library">
              Open library →
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
              <div className="mb-1.5 text-[13px] font-medium text-secondary">Library&apos;s empty.</div>
              <div className="text-[12px] text-tertiary">
                Drop a link, file, or screenshot and it&apos;ll show up here.
              </div>
            </div>
          )}
        </div>

        <div className="surface-card p-5">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-[15px] font-semibold">From {data.teammate.fullName}</div>
            <span className="text-[11px] text-tertiary">last {data.recentUpdates.length || 0}</span>
          </div>
          {hasFromTeammate ? (
            <div className="space-y-2">
              {data.recentUpdates.map((item) => (
                <Link
                  className="block rounded-[8px] px-3 py-2.5 transition hover:bg-subtle"
                  href={`/library?item=${item.id}`}
                  key={item.id}
                >
                  <div className="mb-0.5 flex items-center gap-2">
                    <span className={`text-[10.5px] font-semibold uppercase tracking-[0.07em] ${teammateColor}`}>
                      {item.type}
                    </span>
                    <span className="text-[11px] text-tertiary">{ageWord(item.createdAt)}</span>
                  </div>
                  <div className="line-clamp-1 text-[13px] font-medium text-primary">{item.title}</div>
                  <div className="line-clamp-1 text-[12px] text-secondary">{item.note}</div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-[12.5px] text-tertiary">
              Nothing new from {data.teammate.fullName} yet.
            </div>
          )}
        </div>
      </section>

      {/* Roadmap — calmer */}
      <section className="surface-card px-6 py-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <div className="text-[15px] font-semibold">Where we are</div>
            <div className="mt-0.5 text-[12px] text-tertiary">Phase 1 of 6 · Foundation</div>
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
          {roadmapPhases.map((phase) => {
            const isCurrent = "current" in phase && phase.current;
            return (
              <div
                className={`rounded-lg border px-3 py-2.5 transition ${
                  isCurrent ? "border-accent bg-accent-soft" : "border-border bg-subtle"
                }`}
                key={phase.id}
              >
                <div className={`text-[10.5px] font-semibold ${isCurrent ? "text-accent" : "text-tertiary"}`}>
                  Phase {phase.id}
                </div>
                <div className={`mt-0.5 text-[12.5px] font-semibold ${isCurrent ? "text-primary" : "text-secondary"}`}>
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

function SignalItem({
  label,
  sub,
  children
}: {
  label: string;
  sub?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-w-[120px] flex-col gap-0.5">
      <div className="flex items-baseline gap-1.5 text-[11.5px] text-tertiary">
        <span className="font-medium">{label}</span>
        {sub ? <span className="text-[10.5px]">· {sub}</span> : null}
      </div>
      <div className="text-[15px] font-semibold text-primary">{children}</div>
    </div>
  );
}

function MetricNumber({ value, unit }: { value: string; unit: string }) {
  return (
    <span className="flex items-baseline gap-1.5">
      <span className="text-[20px] font-bold tracking-[-0.02em]">{value}</span>
      <span className="text-[11px] font-normal text-tertiary">{unit}</span>
    </span>
  );
}

function TeammateTime({ timezone, colorClass }: { timezone: string; colorClass: string }) {
  return (
    <span className={`text-[15px] font-semibold ${colorClass}`}>
      {timezone}
    </span>
  );
}

function ageWord(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 60) return `${Math.max(1, mins)}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}
