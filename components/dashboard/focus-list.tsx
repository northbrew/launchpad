"use client";

import { useState } from "react";
import { toggleFocusItem } from "@/app/(app)/launchpad/actions";
import type { FocusItem } from "@/types";

export function FocusList({ items }: { items: FocusItem[] }) {
  const [state, setState] = useState<Record<string, boolean>>(
    Object.fromEntries(items.map((item) => [item.id, item.done]))
  );

  if (items.length === 0) {
    return (
      <section className="surface-card p-5">
        <div className="mb-1 text-[15px] font-semibold tracking-[-0.01em]">This week</div>
        <p className="py-6 text-center text-[12.5px] text-tertiary">Nothing set for this week yet.</p>
      </section>
    );
  }

  const doneCount = Object.values(state).filter(Boolean).length;
  const total = items.length;

  async function toggle(id: string) {
    const next = !state[id];
    setState((prev) => ({ ...prev, [id]: next }));
    try {
      await toggleFocusItem(id, next);
    } catch {
      setState((prev) => ({ ...prev, [id]: !next }));
    }
  }

  return (
    <section className="surface-card p-5">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-[15px] font-semibold tracking-[-0.01em]">This week</div>
        <span className="text-[11.5px] text-tertiary">
          {doneCount} / {total}
        </span>
      </div>
      <div className="space-y-1">
        {items.map((item) => {
          const done = state[item.id] ?? item.done;
          return (
            <button
              className="flex w-full items-center gap-3 rounded-[7px] px-3 py-2.5 text-left transition hover:bg-subtle"
              key={item.id}
              onClick={() => toggle(item.id)}
              type="button"
            >
              <div
                className={`mt-px h-[17px] w-[17px] shrink-0 rounded-[5px] border-[1.5px] transition ${
                  done ? "border-accent bg-accent" : "border-border-strong bg-card"
                }`}
              />
              <span
                className={`flex-1 text-[13px] font-medium transition ${
                  done ? "text-tertiary line-through" : "text-primary"
                }`}
              >
                {item.text}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
