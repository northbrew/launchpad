"use client";

import { useState, useTransition, useEffect } from "react";
import type { Task } from "@/types";
import { createTask, toggleTask, deleteTask, clearCompletedTasks } from "@/app/(app)/tasks-actions";
import { cn } from "@/lib/utils/cn";

export function SidebarTasks({ tasks }: { tasks: Task[] }) {
  const [optimistic, setOptimistic] = useState<Task[]>(tasks);
  const [draft, setDraft] = useState("");
  const [showDone, setShowDone] = useState(false);
  const [, startTransition] = useTransition();

  useEffect(() => {
    setOptimistic(tasks);
  }, [tasks]);

  const open = optimistic.filter((t) => !t.done);
  const done = optimistic.filter((t) => t.done);
  const visibleDone = showDone ? done : [];

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const title = draft.trim();
    if (!title) return;
    const tempId = `temp-${Date.now()}`;
    const newTask: Task = {
      id: tempId,
      ownerId: "",
      title,
      done: false,
      createdAt: new Date().toISOString(),
      completedAt: null
    };
    setOptimistic((prev) => [newTask, ...prev]);
    setDraft("");
    startTransition(() => {
      createTask(title).catch(() => {
        setOptimistic((prev) => prev.filter((t) => t.id !== tempId));
      });
    });
  }

  function handleToggle(task: Task) {
    const next = !task.done;
    setOptimistic((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, done: next } : t))
    );
    startTransition(() => {
      toggleTask(task.id, next).catch(() => {
        setOptimistic((prev) =>
          prev.map((t) => (t.id === task.id ? { ...t, done: !next } : t))
        );
      });
    });
  }

  function handleDelete(id: string) {
    const prev = optimistic;
    setOptimistic((p) => p.filter((t) => t.id !== id));
    startTransition(() => {
      deleteTask(id).catch(() => setOptimistic(prev));
    });
  }

  function handleClear() {
    const prev = optimistic;
    setOptimistic((p) => p.filter((t) => !t.done));
    startTransition(() => {
      clearCompletedTasks().catch(() => setOptimistic(prev));
    });
  }

  return (
    <div className="mt-5">
      <div className="mb-1.5 flex items-center justify-between px-2.5">
        <div className="text-[10.5px] font-semibold uppercase tracking-[0.07em] text-tertiary">
          My list
        </div>
        {open.length > 0 ? (
          <span className="text-[10.5px] font-semibold text-tertiary">
            {open.length}
          </span>
        ) : null}
      </div>

      <form onSubmit={handleAdd} className="mb-1 px-1">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setDraft("");
              (e.target as HTMLInputElement).blur();
            }
          }}
          placeholder="Jot something down…"
          className="w-full rounded-md border border-transparent bg-transparent px-2 py-1.5 text-[12.5px] text-primary placeholder:text-tertiary outline-none transition hover:bg-card-hover focus:border-border focus:bg-card"
          maxLength={140}
        />
      </form>

      <div className="thin-scrollbar max-h-[260px] space-y-0.5 overflow-y-auto pr-1">
        {open.length === 0 && done.length === 0 ? (
          <div className="px-2.5 py-1.5 text-[11.5px] italic text-tertiary">
            Clear. Nice.
          </div>
        ) : null}

        {open.map((task) => (
          <TaskRow
            key={task.id}
            task={task}
            onToggle={() => handleToggle(task)}
            onDelete={() => handleDelete(task.id)}
          />
        ))}

        {visibleDone.map((task) => (
          <TaskRow
            key={task.id}
            task={task}
            onToggle={() => handleToggle(task)}
            onDelete={() => handleDelete(task.id)}
          />
        ))}
      </div>

      {done.length > 0 ? (
        <div className="mt-1 flex items-center justify-between px-2.5">
          <button
            type="button"
            onClick={() => setShowDone((v) => !v)}
            className="text-[10.5px] font-medium text-tertiary transition hover:text-secondary"
          >
            {showDone ? "Hide" : "Show"} done · {done.length}
          </button>
          {showDone ? (
            <button
              type="button"
              onClick={handleClear}
              className="text-[10.5px] font-medium text-tertiary transition hover:text-red"
            >
              Clear
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function TaskRow({
  task,
  onToggle,
  onDelete
}: {
  task: Task;
  onToggle: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="group flex items-start gap-2 rounded-md px-2 py-1.5 transition hover:bg-card-hover">
      <button
        type="button"
        onClick={onToggle}
        aria-label={task.done ? "Mark as open" : "Mark as done"}
        className={cn(
          "mt-[2px] h-[14px] w-[14px] shrink-0 rounded-[4px] border-[1.5px] transition",
          task.done ? "border-accent bg-accent" : "border-border-strong bg-card hover:border-accent"
        )}
      >
        {task.done ? (
          <svg viewBox="0 0 12 12" className="h-[10px] w-[10px] text-white" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M2.5 6.5 L5 9 L9.5 3.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : null}
      </button>
      <span
        className={cn(
          "flex-1 text-[12.5px] leading-[1.35] break-words",
          task.done ? "text-tertiary line-through" : "text-primary"
        )}
      >
        {task.title}
      </span>
      <button
        type="button"
        onClick={onDelete}
        aria-label="Delete task"
        className="invisible mt-[1px] shrink-0 text-tertiary transition hover:text-red group-hover:visible"
      >
        <svg viewBox="0 0 24 24" className="h-[14px] w-[14px]" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 6 L18 18 M18 6 L6 18" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}
