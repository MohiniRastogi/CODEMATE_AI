import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Search, Trash2, History as HistoryIcon } from "lucide-react";
import { storage, type HistoryItem, type HistoryKind } from "@/lib/storage";
import { EmptyState } from "@/components/FeatureShell";
import { toast } from "sonner";

export const Route = createFileRoute("/app/history")({
  head: () => ({
    meta: [
      { title: "History — CodeMateAI" },
      { name: "description", content: "Everything you've generated with CodeMateAI, all in one place." },
    ],
  }),
  component: HistoryPage,
});

const TABS: { key: HistoryKind | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "program", label: "Programs" },
  { key: "notes", label: "Notes" },
  { key: "review", label: "Reviews" },
  { key: "project", label: "Projects" },
  { key: "challenge", label: "Challenges" },
];

function HistoryPage() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [tab, setTab] = useState<HistoryKind | "all">("all");
  const [q, setQ] = useState("");

  const load = () => setItems(storage.getHistory());
  useEffect(load, []);

  const filtered = items.filter(
    (i) =>
      (tab === "all" || i.kind === tab) &&
      i.title.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <main className="mx-auto max-w-2xl px-5 pb-28 pt-[calc(env(safe-area-inset-top)+16px)]">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-bold text-foreground">History</h1>
          <p className="text-sm text-subtitle">Everything you&apos;ve generated</p>
        </div>
        <button
          onClick={() => {
            storage.clearHistory();
            load();
            toast.success("History cleared");
          }}
          className="shrink-0 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium text-danger"
        >
          Clear all
        </button>
      </header>

      <div className="mt-4 flex items-center gap-2 rounded-2xl border border-border bg-surface px-3 py-2 shadow-soft">
        <Search className="h-4 w-4 text-subtitle" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search history..."
          className="w-full bg-transparent text-sm text-foreground outline-none"
        />
      </div>

      <div className="mt-3 -mx-1 flex gap-2 overflow-x-auto px-1 py-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition ${
              tab === t.key
                ? "gradient-blue text-white shadow-glow"
                : "border border-border bg-surface text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-4">
        {filtered.length === 0 ? (
          <EmptyState
            title="No history yet"
            description="Generate your first program to see it here."
            emoji="🕰️"
          />
        ) : (
          <ul className="space-y-2">
            {filtered.map((i) => (
              <li
                key={i.id}
                className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-3 shadow-soft"
              >
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl gradient-blue text-white">
                  <HistoryIcon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{i.title || "(untitled)"}</p>
                  <p className="text-xs text-subtitle capitalize">
                    {i.kind} · {new Date(i.createdAt).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => {
                    storage.deleteHistory(i.id);
                    load();
                  }}
                  aria-label="Delete"
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-danger hover:bg-danger/10"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
