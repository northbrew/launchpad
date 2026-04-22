import { formatDistanceToNowStrict } from "@/lib/utils/format-distance";
import type { AppUser, LibraryItemType } from "@/types";

export function formatRelativeTime(value: string) {
  return formatDistanceToNowStrict(new Date(value));
}

export function displayType(type: LibraryItemType, ext?: string | null) {
  if (type === "doc" && ext) return ext.toUpperCase();
  if (type === "screenshot" && ext) return ext.toUpperCase();
  if (type === "loom") return "LOOM";
  if (type === "figma") return "FIGMA";
  if (type === "link") return "URL";
  return type.toUpperCase();
}

export function typePillLabel(type: string) {
  const map: Record<string, string> = {
    all: "All",
    loom: "Looms",
    screenshot: "Screenshots",
    doc: "Docs",
    figma: "Figma",
    link: "Links"
  };

  return map[type] ?? type;
}

export function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 18) return "afternoon";
  return "evening";
}

export function waitingOnLabel(
  waitingOnBoth: boolean,
  waitingOnUserId: string | null,
  currentUser: AppUser,
  teammate: AppUser
) {
  if (waitingOnBoth) return "Both need to weigh in";
  if (!waitingOnUserId) return "Aligned";
  if (waitingOnUserId === currentUser.id) return "Waiting on you";
  if (waitingOnUserId === teammate.id) return `Waiting on ${teammate.fullName}`;
  return "Waiting";
}
