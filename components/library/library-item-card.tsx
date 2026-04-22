import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { ageLabel } from "@/lib/data/queries";
import { cn } from "@/lib/utils/cn";
import { displayType } from "@/lib/utils/format";
import type { LibraryItem } from "@/types";

const thumbStyles: Record<LibraryItem["type"], string> = {
  loom: "bg-[rgba(220,38,38,0.08)] text-[#C2410C]",
  figma: "bg-[rgba(147,51,234,0.08)] text-[#7E22CE]",
  doc: "bg-[rgba(37,99,235,0.08)] text-[#1D4ED8]",
  screenshot: "bg-[rgba(217,119,6,0.08)] text-[#B45309]",
  link: "bg-elevated text-secondary"
};

export function LibraryItemCard({
  item,
  href
}: {
  item: LibraryItem;
  href: string;
}) {
  return (
    <Link className="flex items-center gap-3 rounded-md border-b border-border px-1.5 py-3 transition hover:bg-card-hover" href={href}>
      <div className={cn("grid h-[38px] w-[38px] shrink-0 place-items-center rounded-[7px] font-[var(--font-mono)] text-[9.5px] font-bold tracking-[0.04em]", thumbStyles[item.type])}>
        {displayType(item.type, item.fileExt)}
      </div>
      <div className="min-w-0 flex-1">
        <div className="mb-1 text-[13.5px] font-semibold leading-[1.35]">{item.title}</div>
        <div className="line-clamp-1 text-[12.5px] text-secondary">{item.note}</div>
      </div>
      <div className="hidden shrink-0 items-center gap-3 text-[11.5px] text-tertiary sm:flex">
        <div className={cn("inline-flex items-center gap-1.5 font-medium", item.poster.slug === "james" ? "text-james" : "text-cory")}>
          <Avatar color={`var(--${item.poster.colorToken})`} initials={item.poster.initials} size="sm" />
          {item.poster.fullName}
        </div>
        <div className="font-[var(--font-mono)] text-[11px]">{ageLabel(item.createdAt)}</div>
      </div>
    </Link>
  );
}
