import Link from "next/link";
import { IconDashboard, IconDecision, IconLibrary, BrandMark } from "@/components/ui/icons";
import { cn } from "@/lib/utils/cn";
import type { AppUser, Task } from "@/types";
import { UserMenu } from "@/components/layout/user-actions";
import { SidebarTasks } from "@/components/layout/sidebar-tasks";

const nav = [
  { href: "/launchpad", label: "Launchpad", icon: IconDashboard },
  { href: "/library", label: "Library", icon: IconLibrary },
  { href: "/decisions", label: "Decisions", icon: IconDecision }
];

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-1.5 px-2.5 text-[10.5px] font-semibold uppercase tracking-[0.07em] text-tertiary">
      {children}
    </div>
  );
}

export function Sidebar({
  pathname,
  currentUser,
  libraryCount,
  openDecisionCount,
  tasks
}: {
  pathname: string;
  currentUser: AppUser;
  libraryCount: number;
  openDecisionCount: number;
  tasks: Task[];
}) {
  return (
    <aside className="thin-scrollbar sticky top-0 hidden h-screen flex-col overflow-y-auto border-r border-border bg-sidebar px-3 py-5 lg:flex lg:w-[240px]">
      <div className="mb-5 flex items-center gap-2.5 px-2.5">
        <BrandMark className="h-6 w-6 shrink-0" />
        <div className="text-[14px] font-semibold tracking-[-0.01em]">Proofbridge</div>
      </div>

      <SectionLabel>Workspace</SectionLabel>
      <div className="space-y-0.5">
        {nav.map((item) => {
          const Icon = item.icon;
          const active = pathname.startsWith(item.href);
          return (
            <Link
              className={cn(
                "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[13.5px] font-medium text-secondary transition hover:bg-card-hover hover:text-primary",
                active && "bg-card text-primary shadow-card"
              )}
              href={item.href}
              key={item.href}
            >
              <Icon className={cn("h-4 w-4", active && "text-accent")} />
              {item.label}
              {item.label === "Library" ? (
                <span className="ml-auto rounded-full bg-elevated px-1.5 py-0.5 text-[10.5px] font-semibold text-tertiary">
                  {libraryCount}
                </span>
              ) : null}
              {item.label === "Decisions" ? (
                <span
                  className={cn(
                    "ml-auto rounded-full px-1.5 py-0.5 text-[10.5px] font-semibold",
                    openDecisionCount > 0 ? "bg-amber-soft text-amber" : "bg-elevated text-tertiary"
                  )}
                >
                  {openDecisionCount}
                </span>
              ) : null}
            </Link>
          );
        })}
      </div>

      <SidebarTasks tasks={tasks} />

      <div className="mt-auto pt-4">
        <div className="rounded-lg border border-border bg-card px-3 py-3">
          <div className="flex items-center gap-2.5">
            <div className="grid h-[30px] w-[30px] place-items-center rounded-full text-xs font-bold text-white" style={{ background: `var(--${currentUser.colorToken})` }}>
              {currentUser.initials}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[13px] font-semibold leading-tight">{currentUser.fullName}</div>
              <div className="mt-0.5 text-[10.5px] text-tertiary">{currentUser.timezone} · signed in</div>
            </div>
          </div>
          <UserMenu currentEmail={currentUser.email} />
        </div>
      </div>
    </aside>
  );
}
