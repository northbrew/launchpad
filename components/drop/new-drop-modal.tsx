"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { IconPlus, IconUpload } from "@/components/ui/icons";
import type { AppUser, Tag } from "@/types";
import { cn } from "@/lib/utils/cn";

const dropTypes = [
  { key: "doc", label: "File" },
  { key: "link", label: "Link" },
  { key: "screenshot", label: "Image" },
  { key: "loom", label: "Loom" },
  { key: "figma", label: "Figma" }
] as const;

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-1.5 block text-[11.5px] font-medium text-tertiary">{children}</label>
  );
}

export function NewDropModal({
  currentUser,
  teammate,
  tags
}: {
  currentUser: AppUser;
  teammate: AppUser;
  tags: Tag[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<(typeof dropTypes)[number]["key"]>("doc");
  const [selectedTag, setSelectedTag] = useState<string>("");
  const [toast, setToast] = useState("");
  const [isPending, setIsPending] = useState(false);

  const isUrlType = useMemo(() => ["link", "loom", "figma"].includes(type), [type]);

  async function submit(formData: FormData) {
    setIsPending(true);
    try {
      formData.set("type", type);
      formData.set("tag", selectedTag);
      const response = await fetch("/api/drops", { method: "POST", body: formData });
      const payload = (await response.json()) as { error?: string; ok?: boolean };
      if (!response.ok) {
        setToast(payload.error ?? "Unable to save drop.");
        return;
      }
      setOpen(false);
      setToast(`Sent to ${teammate.fullName}.`);
      router.refresh();
      setTimeout(() => setToast(""), 4000);
    } finally {
      setIsPending(false);
    }
  }

  return (
    <>
      <button className="action-btn action-btn-primary" onClick={() => { setOpen(true); setToast(""); }} type="button">
        <IconPlus className="h-3.5 w-3.5" />
        New drop
      </button>

      {toast ? (
        <div className="fixed bottom-7 right-7 z-[2000] flex items-center gap-2 rounded-lg bg-primary px-4 py-3 text-[13px] font-medium text-white shadow-[0_8px_24px_rgba(0,0,0,0.15)]">
          <span className="text-green">●</span>
          {toast}
        </div>
      ) : null}

      {open ? (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-[rgba(20,20,20,0.4)] p-5 backdrop-blur-[4px]" onClick={() => setOpen(false)}>
          <div className="max-h-[90vh] w-full max-w-[540px] overflow-y-auto rounded-[14px] bg-card shadow-[0_20px_60px_rgba(0,0,0,0.2)]" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-start justify-between gap-4 px-6 pb-2 pt-5">
              <div>
                <div className="text-[17px] font-semibold tracking-[-0.01em]">Drop something for {teammate.fullName}</div>
                <div className="mt-0.5 text-[12.5px] text-tertiary">Links, files, screenshots — anything worth saving.</div>
              </div>
              <button className="grid h-7 w-7 shrink-0 place-items-center rounded-md text-tertiary transition hover:bg-elevated hover:text-primary" onClick={() => setOpen(false)} type="button" aria-label="Close">
                ×
              </button>
            </div>
            <form action={submit}>
              <div className="px-6 pb-5 pt-3">
                <FieldLabel>What kind?</FieldLabel>
                <div className="mb-5 grid grid-cols-3 gap-1.5 sm:grid-cols-5">
                  {dropTypes.map((dropType) => (
                    <button
                      className={cn("rounded-lg border-[1.5px] border-transparent bg-subtle px-2 py-3 text-center text-[12px] font-medium text-secondary transition hover:border-border-strong hover:text-primary", type === dropType.key && "border-accent bg-accent-soft text-accent")}
                      key={dropType.key}
                      onClick={(event) => {
                        event.preventDefault();
                        setType(dropType.key);
                      }}
                      type="button"
                    >
                      {dropType.label}
                    </button>
                  ))}
                </div>

                <FieldLabel>Title</FieldLabel>
                <input className="input-shell mb-4" name="title" placeholder="Short name — what is it?" required />

                {isUrlType ? (
                  <>
                    <FieldLabel>URL</FieldLabel>
                    <input className="input-shell mb-4" name="sourceUrl" placeholder="https://…" required />
                  </>
                ) : (
                  <>
                    <FieldLabel>File</FieldLabel>
                    <label className="mb-4 block cursor-pointer rounded-[10px] border-[1.5px] border-dashed border-border-strong bg-subtle px-5 py-7 text-center transition hover:border-accent hover:bg-accent-soft">
                      <IconUpload className="mx-auto mb-2 h-7 w-7 text-accent" />
                      <div className="text-[13px] text-secondary">Drop a file, or <strong className="font-semibold text-accent">browse</strong></div>
                      <div className="mt-0.5 text-[11.5px] text-tertiary">Up to 25MB · PNG, PDF, DOC, MP4</div>
                      <input accept="image/*,.pdf,.doc,.docx,.txt,.mp4" className="hidden" name="file" required={["doc", "screenshot"].includes(type)} type="file" />
                    </label>
                  </>
                )}

                <FieldLabel>Why you&apos;re sending it</FieldLabel>
                <textarea className="mb-4 min-h-[72px] w-full rounded-lg border border-border bg-card px-3 py-2.5 text-[13.5px] text-primary outline-none transition placeholder:text-tertiary focus:border-accent" name="note" placeholder={`A quick note for ${teammate.fullName}…`} required />

                <FieldLabel>Tag (optional)</FieldLabel>
                <div className="flex flex-wrap gap-1.5">
                  {tags.map((tag) => (
                    <button
                      className={cn("rounded-[5px] border px-2.5 py-1.5 text-[11.5px] font-medium transition", selectedTag === tag.id ? "border-accent bg-accent-soft text-accent" : "border-transparent bg-subtle text-secondary hover:border-border-strong")}
                      key={tag.id}
                      onClick={(event) => {
                        event.preventDefault();
                        setSelectedTag(selectedTag === tag.id ? "" : tag.id);
                      }}
                      type="button"
                    >
                      {tag.name}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-6 py-3.5">
                <div className="flex items-center gap-2 text-[12px] text-tertiary">
                  From
                  <span className="grid h-5 w-5 place-items-center rounded-full text-[10px] font-bold text-white" style={{ background: `var(--${currentUser.colorToken})` }}>
                    {currentUser.initials}
                  </span>
                  <span className="font-medium text-secondary">{currentUser.fullName}</span>
                </div>
                <div className="flex gap-2">
                  <button className="action-btn" onClick={() => setOpen(false)} type="button">
                    Cancel
                  </button>
                  <button className="action-btn action-btn-primary" disabled={isPending} type="submit">
                    {isPending ? "Sending…" : `Send to ${teammate.fullName}`}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
