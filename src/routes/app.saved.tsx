import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Bookmark, Trash2 } from "lucide-react";
import { storage, type BookmarkItem, type HistoryKind } from "@/lib/storage";
import { EmptyState } from "@/components/FeatureShell";
import { toast } from "sonner";
import { canonicalUrl } from "@/lib/seo";

export const Route = createFileRoute("/app/saved")({
  head: () => ({
    meta: [
      { title: "Saved — CodeMate AI" },
      { name: "description", content: "Your bookmarked programs, notes, projects and interview questions." },
    ],
  }),
  component: SavedPage,
});

const FILTERS: { key: HistoryKind | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "program", label: "Programs" },
  { key: "project", label: "Projects" },
  { key: "review", label: "Reviews" },
  { key: "notes", label: "Notes" },
  { key: "interview", label: "Interview" },
];

function SavedPage() {
  const [items, setItems] = useState<BookmarkItem[]>([]);
  const [sort, setSort] = useState<"new" | "old">("new");
  const [filter, setFilter] = useState<HistoryKind | "all">("all");

  const load = () => setItems(storage.getBookmarks());
  useEffect(load, []);

  const filtered = items
    .filter((i) => filter === "all" || i.kind === filter)
    .sort((a, b) => (sort === "new" ? b.createdAt - a.createdAt : a.createdAt - b.createdAt));

  return (
    <main className="mx-auto max-w-2xl px-5 pb-28 pt-[calc(env(safe-area-inset-top)+16px)]">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-bold text-foreground">Saved</h1>
          <p className="text-sm text-subtitle">Your bookmarks</p>
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as "new" | "old")}
          className="shrink-0 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium text-foreground"
        >
          <option value="new">Newest</option>
          <option value="old">Oldest</option>
        </select>
      </header>

      <div className="mt-3 -mx-1 flex gap-2 overflow-x-auto px-1 py-1">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition ${
              filter === f.key
                ? "gradient-purple text-white shadow-glow"
                : "border border-border bg-surface text-foreground"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="mt-4">
        {filtered.length === 0 ? (
          <EmptyState
            title="Nothing saved yet"
            description="Bookmark items from any feature to find them here."
            emoji="🔖"
          />
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {filtered.map((i) => (
              <li
                key={i.id}
                className="relative flex flex-col gap-2 rounded-3xl border border-border bg-surface p-4 shadow-soft"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl gradient-purple text-white">
                    <Bookmark className="h-4 w-4" />
                  </div>
                  <button
                    onClick={() => {
                      storage.deleteBookmark(i.id);
                      load();
                      toast.success("Removed");
                    }}
                    aria-label="Remove"
                    className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-danger hover:bg-danger/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <p className="line-clamp-2 text-sm font-medium text-foreground">{i.title || "(untitled)"}</p>
                <p className="text-xs text-subtitle capitalize">
                  {i.kind} · {new Date(i.createdAt).toLocaleDateString()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
