import type { ReactNode } from "react";
import Link from "next/link";
import { displayType } from "@/lib/utils/format";
import type { LibraryItem } from "@/types";

function itemUrl(item: LibraryItem) {
  if (item.sourceUrl) return item.sourceUrl;
  if (!item.storagePath) return "#";
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return `${base}/storage/v1/object/public/library-files/${item.storagePath}`;
}

export function LibraryDetailPanel({ item }: { item: LibraryItem | null }) {
  if (!item) {
    return (
      <aside className="surface-card sticky top-7 self-start p-5">
        <div className="px-4 py-10 text-center text-tertiary">
          <svg className="mx-auto mb-4 h-9 w-9 opacity-40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <path d="M14 2v6h6" />
          </svg>
          <p className="text-[13px] leading-[1.5]">Pick an item to see the note, who dropped it, and open the original.</p>
        </div>
      </aside>
    );
  }

  return (
    <aside className="surface-card sticky top-7 self-start p-5">
      <div className="mb-4 grid aspect-video place-items-center rounded-lg bg-elevated font-[var(--font-mono)] text-2xl font-bold text-tertiary">
        {displayType(item.type, item.fileExt)}
      </div>
      <div className="mb-2 text-base font-semibold leading-[1.35]">{item.title}</div>
      <div className="mb-4 rounded-md border-l-2 border-accent bg-subtle px-3 py-2.5 text-[13px] leading-[1.55] text-secondary">{item.note}</div>
      <DetailRow label="Posted by" value={<span className={item.poster.slug === "james" ? "text-james" : "text-cory"}>{item.poster.fullName}</span>} />
      <DetailRow label="Type" value={displayType(item.type, item.fileExt)} />
      <DetailRow label="Added" value={new Date(item.createdAt).toLocaleString()} />
      {item.tags[0] ? <DetailRow label="Tag" value={item.tags.map((tag) => tag.name).join(", ")} /> : null}
      <div className="mt-4 flex gap-2">
        <Link className="action-btn action-btn-primary flex-1 justify-center" href={itemUrl(item)} rel="noopener noreferrer" target="_blank">
          Open
        </Link>
      </div>
    </aside>
  );
}

function DetailRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex justify-between border-t border-border py-2.5 text-[12.5px]">
      <span className="text-tertiary">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}
