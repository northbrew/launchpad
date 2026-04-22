import { NewDropModal } from "@/components/drop/new-drop-modal";
import { LibraryDetailPanel } from "@/components/library/library-detail-panel";
import { LibraryItemCard } from "@/components/library/library-item-card";
import { PageHeader } from "@/components/ui/page-header";
import { getLibraryItemById, getLibraryItems, getTags, getTeammate, requireCurrentUser } from "@/lib/data/queries";
import { typePillLabel } from "@/lib/utils/format";

const typeFilters = ["all", "loom", "screenshot", "doc", "figma", "link"] as const;

export default async function LibraryPage({
  searchParams
}: {
  searchParams?: { q?: string; type?: string; tag?: string; item?: string };
}) {
  const currentUser = await requireCurrentUser();
  const [teammate, tags, allItems, filteredItems, selectedItem] = await Promise.all([
    getTeammate(currentUser.id),
    getTags(),
    getLibraryItems(),
    getLibraryItems({ query: searchParams?.q, type: searchParams?.type, tag: searchParams?.tag }),
    searchParams?.item ? getLibraryItemById(searchParams.item) : Promise.resolve(null)
  ]);

  const typeCounts = typeFilters.reduce<Record<string, number>>((acc, type) => {
    acc[type] = type === "all" ? allItems.length : allItems.filter((item) => item.type === type).length;
    return acc;
  }, {});

  const isFiltered = Boolean(searchParams?.q || (searchParams?.type && searchParams.type !== "all") || (searchParams?.tag && searchParams.tag !== "all"));

  return (
    <>
      <PageHeader
        actions={<NewDropModal currentUser={currentUser} tags={tags} teammate={teammate} />}
        subtitle={`Everything you and ${teammate.fullName} have saved for each other.`}
        title="Library"
      />

      <div className="grid gap-4 xl:grid-cols-[1fr_320px]">
        <div className="surface-card p-[18px] pb-2">
          {/* Search */}
          <form className="mb-4" method="get">
            <input
              className="input-shell"
              defaultValue={searchParams?.q ?? ""}
              name="q"
              placeholder="Search titles, notes, tags, or who sent it"
            />
            <input name="type" type="hidden" value={searchParams?.type ?? "all"} />
            <input name="tag" type="hidden" value={searchParams?.tag ?? "all"} />
          </form>

          {/* Type filters */}
          <div className="mb-3 flex flex-wrap gap-1.5">
            {typeFilters.map((type) => {
              const next = new URLSearchParams();
              if (searchParams?.q) next.set("q", searchParams.q);
              if (searchParams?.tag && searchParams.tag !== "all") next.set("tag", searchParams.tag);
              if (type !== "all") next.set("type", type);
              const isActive = searchParams?.type === type || (!searchParams?.type && type === "all");
              return (
                <a
                  className={`pill ${isActive ? "pill-active" : ""}`}
                  href={`/library?${next.toString()}`}
                  key={type}
                >
                  {typePillLabel(type)}
                  <span className="rounded bg-[rgba(0,0,0,0.06)] px-1.5 py-0.5 text-[10.5px] font-semibold">
                    {typeCounts[type]}
                  </span>
                </a>
              );
            })}
          </div>

          {/* Tag filters — only show if tags exist */}
          {tags.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-1.5">
              <a
                className={`pill ${!searchParams?.tag || searchParams.tag === "all" ? "pill-active" : ""}`}
                href={`/library?q=${searchParams?.q ?? ""}&type=${searchParams?.type ?? "all"}`}
              >
                All tags
              </a>
              {tags.map((tag) => {
                const params = new URLSearchParams();
                if (searchParams?.q) params.set("q", searchParams.q);
                if (searchParams?.type && searchParams.type !== "all") params.set("type", searchParams.type);
                params.set("tag", tag.slug);
                return (
                  <a
                    className={`pill ${searchParams?.tag === tag.slug ? "pill-active" : ""}`}
                    href={`/library?${params.toString()}`}
                    key={tag.id}
                  >
                    {tag.name}
                  </a>
                );
              })}
            </div>
          )}

          {/* Results */}
          <div className="space-y-0.5">
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => {
                const params = new URLSearchParams();
                if (searchParams?.q) params.set("q", searchParams.q);
                if (searchParams?.type) params.set("type", searchParams.type);
                if (searchParams?.tag) params.set("tag", searchParams.tag);
                params.set("item", item.id);
                return <LibraryItemCard href={`/library?${params.toString()}`} item={item} key={item.id} />;
              })
            ) : allItems.length === 0 ? (
              <div className="flex flex-col items-center py-14 text-center">
                <div className="mb-1.5 text-[13px] font-medium text-secondary">Nothing saved yet.</div>
                <div className="text-[12px] text-tertiary">
                  Hit <strong className="font-semibold text-secondary">New drop</strong> and this fills up fast.
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center py-14 text-center">
                <div className="mb-1.5 text-[13px] font-medium text-secondary">
                  {isFiltered ? "Nothing matches those filters." : "Nothing to show."}
                </div>
                {isFiltered && (
                  <a className="mt-2 text-[12px] text-accent hover:underline" href="/library">
                    Clear filters
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        <LibraryDetailPanel item={selectedItem} />
      </div>
    </>
  );
}
