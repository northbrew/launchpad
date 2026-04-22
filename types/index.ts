export type UserSlug = "james" | "cory";
export type LibraryItemType = "loom" | "screenshot" | "doc" | "figma" | "link";
export type DecisionStatus = "open" | "blocking" | "resolved";

export interface AppUser {
  id: string;
  slug: UserSlug;
  fullName: string;
  email: string;
  timezone: string;
  initials: string;
  colorToken: UserSlug;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
}

export interface LibraryItem {
  id: string;
  title: string;
  note: string;
  type: LibraryItemType;
  sourceUrl: string | null;
  storagePath: string | null;
  mimeType: string | null;
  fileExt: string | null;
  createdAt: string;
  poster: AppUser;
  tags: Tag[];
}

export interface DecisionPosition {
  id: string;
  vote: string;
  take: string;
  createdAt: string;
  user: AppUser;
}

export interface Decision {
  id: string;
  question: string;
  context: string;
  status: DecisionStatus;
  waitingOnUserId: string | null;
  waitingOnBoth: boolean;
  resolution: string | null;
  createdAt: string;
  positions: DecisionPosition[];
}

export interface DashboardData {
  currentUser: AppUser;
  teammate: AppUser;
  recentLibraryItems: LibraryItem[];
  openDecisionCount: number;
  blockingDecisionCount: number;
  pendingForCurrentUser: Decision[];
  recentUpdates: LibraryItem[];
}

export interface LibraryFilters {
  query?: string;
  type?: string;
  tag?: string;
}

export interface FocusItem {
  id: string;
  week: string;
  sortOrder: number;
  text: string;
  owner: string;
  done: boolean;
}

export interface Metric {
  key: string;
  label: string;
  value: number;
}
