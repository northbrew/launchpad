import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formatRelativeTime } from "@/lib/utils/format";
import type {
  AppUser,
  DashboardData,
  Decision,
  DecisionPosition,
  FocusItem,
  LibraryFilters,
  LibraryItem,
  Metric,
  Tag
} from "@/types";

type UserRow = {
  id: string;
  slug: AppUser["slug"];
  full_name: string;
  email: string;
  timezone: string;
  initials: string;
  color_token: AppUser["colorToken"];
};

type TagRow = {
  id: string;
  name: string;
  slug: string;
};

type LibraryRow = {
  id: string;
  title: string;
  note: string;
  type: LibraryItem["type"];
  source_url: string | null;
  storage_path: string | null;
  mime_type: string | null;
  file_ext: string | null;
  created_at: string;
  poster: UserRow | UserRow[];
  library_item_tags: Array<{ tags: TagRow | TagRow[] }>;
};

type DecisionPositionRow = {
  id: string;
  vote: string;
  take: string;
  created_at: string;
  users: UserRow | UserRow[];
};

type DecisionRow = {
  id: string;
  question: string;
  context: string;
  status: Decision["status"];
  waiting_on_user_id: string | null;
  waiting_on_both: boolean;
  resolution: string | null;
  created_at: string;
  decision_positions: DecisionPositionRow[];
};

export async function requireCurrentUser() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile, error } = await supabase
    .from("users")
    .select("id, slug, full_name, email, timezone, initials, color_token")
    .eq("id", user.id)
    .single<UserRow>();

  if (error || !profile) {
    redirect("/login");
  }

  return mapUser(profile);
}

export async function getTeammate(currentUserId: string) {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("users")
    .select("id, slug, full_name, email, timezone, initials, color_token")
    .neq("id", currentUserId)
    .limit(1)
    .single<UserRow>();

  if (error || !data) {
    throw new Error("Unable to load teammate.");
  }

  return mapUser(data);
}

export async function getTags() {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.from("tags").select("id, name, slug").order("name");
  if (error) throw error;
  return (data ?? []).map(mapTag);
}

export async function getDashboardData(): Promise<DashboardData> {
  const currentUser = await requireCurrentUser();
  const teammate = await getTeammate(currentUser.id);
  const supabase = createSupabaseServerClient();

  const [
    recentLibraryResult,
    openCountResult,
    blockingCountResult,
    pendingResult,
    recentUpdatesResult
  ] = await Promise.all([
    supabase
      .from("library_items")
      .select(`
        id, title, note, type, source_url, storage_path, mime_type, file_ext, created_at,
        poster:users!library_items_poster_id_fkey(id, slug, full_name, email, timezone, initials, color_token),
        library_item_tags(tags(id, name, slug))
      `)
      .order("created_at", { ascending: false })
      .limit(7),
    supabase.from("decisions").select("*", { count: "exact", head: true }).neq("status", "resolved"),
    supabase.from("decisions").select("*", { count: "exact", head: true }).eq("status", "blocking"),
    supabase
      .from("decisions")
      .select(`
        id, question, context, status, waiting_on_user_id, waiting_on_both, resolution, created_at,
        decision_positions(id, vote, take, created_at, users(id, slug, full_name, email, timezone, initials, color_token))
      `)
      .or(`waiting_on_user_id.eq.${currentUser.id},waiting_on_both.eq.true`)
      .neq("status", "resolved")
      .order("created_at", { ascending: false })
      .limit(3),
    supabase
      .from("library_items")
      .select(`
        id, title, note, type, source_url, storage_path, mime_type, file_ext, created_at,
        poster:users!library_items_poster_id_fkey(id, slug, full_name, email, timezone, initials, color_token),
        library_item_tags(tags(id, name, slug))
      `)
      .eq("poster_id", teammate.id)
      .order("created_at", { ascending: false })
      .limit(4)
  ]);

  if (recentLibraryResult.error) throw recentLibraryResult.error;
  if (pendingResult.error) throw pendingResult.error;
  if (recentUpdatesResult.error) throw recentUpdatesResult.error;

  return {
    currentUser,
    teammate,
    recentLibraryItems: (recentLibraryResult.data ?? []).map(mapLibraryItem),
    openDecisionCount: openCountResult.count ?? 0,
    blockingDecisionCount: blockingCountResult.count ?? 0,
    pendingForCurrentUser: (pendingResult.data ?? []).map(mapDecision),
    recentUpdates: (recentUpdatesResult.data ?? []).map(mapLibraryItem)
  };
}

export async function getLibraryItems(filters: LibraryFilters = {}) {
  const supabase = createSupabaseServerClient();
  let query = supabase
    .from("library_items")
    .select(`
      id, title, note, type, source_url, storage_path, mime_type, file_ext, created_at,
      poster:users!library_items_poster_id_fkey(id, slug, full_name, email, timezone, initials, color_token),
      library_item_tags(tags(id, name, slug))
    `)
    .order("created_at", { ascending: false });

  if (filters.type && filters.type !== "all") {
    query = query.eq("type", filters.type);
  }

  if (filters.query) {
    const q = filters.query.trim();
    if (q) {
      query = query.or(`title.ilike.%${q}%,note.ilike.%${q}%`);
    }
  }

  const { data, error } = await query;
  if (error) throw error;

  let items = (data ?? []).map(mapLibraryItem);

  if (filters.query) {
    const q = filters.query.toLowerCase();
    items = items.filter((item) => item.poster.fullName.toLowerCase().includes(q) || item.tags.some((tag) => tag.name.toLowerCase().includes(q)) || item.title.toLowerCase().includes(q) || item.note.toLowerCase().includes(q));
  }

  if (filters.tag && filters.tag !== "all") {
    items = items.filter((item) => item.tags.some((tag) => tag.slug === filters.tag));
  }

  return items;
}

export async function getLibraryItemById(itemId: string) {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("library_items")
    .select(`
      id, title, note, type, source_url, storage_path, mime_type, file_ext, created_at,
      poster:users!library_items_poster_id_fkey(id, slug, full_name, email, timezone, initials, color_token),
      library_item_tags(tags(id, name, slug))
    `)
    .eq("id", itemId)
    .single<LibraryRow>();

  if (error) return null;
  return mapLibraryItem(data);
}

export async function getDecisions(status: "open" | "resolved" | "all" = "open") {
  const supabase = createSupabaseServerClient();
  let query = supabase
    .from("decisions")
    .select(`
      id, question, context, status, waiting_on_user_id, waiting_on_both, resolution, created_at,
      decision_positions(id, vote, take, created_at, users(id, slug, full_name, email, timezone, initials, color_token))
    `)
    .order("created_at", { ascending: false });

  if (status === "open") {
    query = query.neq("status", "resolved");
  }
  if (status === "resolved") {
    query = query.eq("status", "resolved");
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map(mapDecision);
}

export async function getDecisionCounts() {
  const supabase = createSupabaseServerClient();
  const [open, resolved, all] = await Promise.all([
    supabase.from("decisions").select("*", { count: "exact", head: true }).neq("status", "resolved"),
    supabase.from("decisions").select("*", { count: "exact", head: true }).eq("status", "resolved"),
    supabase.from("decisions").select("*", { count: "exact", head: true })
  ]);

  return {
    open: open.count ?? 0,
    resolved: resolved.count ?? 0,
    all: all.count ?? 0
  };
}

export async function getDecisionById(decisionId: string) {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("decisions")
    .select(`
      id, question, context, status, waiting_on_user_id, waiting_on_both, resolution, created_at,
      decision_positions(id, vote, take, created_at, users(id, slug, full_name, email, timezone, initials, color_token))
    `)
    .eq("id", decisionId)
    .single<DecisionRow>();

  if (error) return null;
  return mapDecision(data);
}

export async function getLibraryCount(): Promise<number> {
  const supabase = createSupabaseServerClient();
  const { count } = await supabase
    .from("library_items")
    .select("*", { count: "exact", head: true });
  return count ?? 0;
}

export async function getFocusItems(week: string): Promise<FocusItem[]> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("focus_items")
    .select("id, week, sort_order, text, owner, done")
    .eq("week", week)
    .order("sort_order");
  if (error) return [];
  return (data ?? []).map((row) => ({
    id: row.id,
    week: row.week,
    sortOrder: row.sort_order,
    text: row.text,
    owner: row.owner,
    done: row.done
  }));
}

export async function getMetrics(keys: string[]): Promise<Metric[]> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("metrics")
    .select("key, label, value")
    .in("key", keys);
  if (error) return [];
  return (data ?? []) as Metric[];
}

export async function signOut() {
  "use server";
  const supabase = createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/login");
}

function mapUser(row: UserRow): AppUser {
  return {
    id: row.id,
    slug: row.slug,
    fullName: row.full_name,
    email: row.email,
    timezone: row.timezone,
    initials: row.initials,
    colorToken: row.color_token
  };
}

function mapTag(row: TagRow): Tag {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug
  };
}

function mapLibraryItem(row: LibraryRow): LibraryItem {
  const poster = Array.isArray(row.poster) ? row.poster[0] : row.poster;
  const tags = (row.library_item_tags ?? [])
    .map((entry) => (Array.isArray(entry.tags) ? entry.tags[0] : entry.tags))
    .filter(Boolean) as TagRow[];

  return {
    id: row.id,
    title: row.title,
    note: row.note,
    type: row.type,
    sourceUrl: row.source_url,
    storagePath: row.storage_path,
    mimeType: row.mime_type,
    fileExt: row.file_ext,
    createdAt: row.created_at,
    poster: mapUser(poster),
    tags: tags.map(mapTag)
  };
}

function mapDecisionPosition(row: DecisionPositionRow): DecisionPosition {
  const user = Array.isArray(row.users) ? row.users[0] : row.users;
  return {
    id: row.id,
    vote: row.vote,
    take: row.take,
    createdAt: row.created_at,
    user: mapUser(user)
  };
}

function mapDecision(row: DecisionRow): Decision {
  return {
    id: row.id,
    question: row.question,
    context: row.context,
    status: row.status,
    waitingOnUserId: row.waiting_on_user_id,
    waitingOnBoth: row.waiting_on_both,
    resolution: row.resolution,
    createdAt: row.created_at,
    positions: (row.decision_positions ?? [])
      .map(mapDecisionPosition)
      .sort((a, b) => a.user.fullName.localeCompare(b.user.fullName))
  };
}

export function ageLabel(isoDate: string) {
  return formatRelativeTime(isoDate);
}
