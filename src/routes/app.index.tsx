import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Bell,
  Search,
  Sparkles,
  Code2,
  Rocket,
  ScanSearch,
  BookOpen,
  ArrowLeftRight,
  Mic,
  Target,
  ArrowUpRight,
  Lightbulb,
  Trophy,
  Clock,
} from "lucide-react";
import { useEffect, useState } from "react";
import { storage, type HistoryItem } from "@/lib/storage";

export const Route = createFileRoute("/app/")({
  head: () => ({
    meta: [
      { title: "CodeMateAI — Home" },
      {
        name: "description",
        content: "Your AI coding companion dashboard. Generate code, review, notes, projects and more.",
      },
      { property: "og:title", content: "CodeMateAI — Home" },
      {
        property: "og:description",
        content: "AI-powered coding companion for students, developers and interview aspirants.",
      },
    ],
  }),
  component: Home,
});

const features: Array<{
  to:
    | "/app/program"
    | "/app/project"
    | "/app/review"
    | "/app/notes"
    | "/app/convert"
    | "/app/interview"
    | "/app/challenge";
  title: string;
  desc: string;
  icon: typeof Code2;
  gradient: string;
  emoji: string;
}> = [
  { to: "/app/program", title: "Program Generator", desc: "Generate code in any language", icon: Code2, gradient: "gradient-blue", emoji: "📝" },
  { to: "/app/project", title: "Mini Project", desc: "Full projects with docs", icon: Rocket, gradient: "gradient-purple", emoji: "🚀" },
  { to: "/app/review", title: "Code Reviewer", desc: "Score, bugs & suggestions", icon: ScanSearch, gradient: "gradient-green", emoji: "🔍" },
  { to: "/app/notes", title: "Notes Generator", desc: "Study notes on any topic", icon: BookOpen, gradient: "gradient-orange", emoji: "📚" },
  { to: "/app/convert", title: "Code Converter", desc: "Translate between languages", icon: ArrowLeftRight, gradient: "gradient-sky", emoji: "🔄" },
  { to: "/app/interview", title: "Interview Prep", desc: "Practice Qs with answers", icon: Mic, gradient: "gradient-sunset", emoji: "🎤" },
  { to: "/app/challenge", title: "Daily Challenge", desc: "One challenge every day", icon: Target, gradient: "gradient-hero", emoji: "🎯" },
];

const tips = [
  "Small commits beat giant ones — bisect will thank you.",
  "Name variables for what they mean, not for how they're computed.",
  "Read the error message twice before opening Stack Overflow.",
  "Cache invalidation is hard; TTLs are usually your friend.",
  "Write the test first when the bug is hard to reproduce.",
];

function Home() {
  const [recent, setRecent] = useState<HistoryItem[]>([]);
  const [tip, setTip] = useState(tips[0]);

  useEffect(() => {
    setRecent(storage.getHistory().slice(0, 3));
    setTip(tips[Math.floor(Math.random() * tips.length)]);
  }, []);

  return (
    <main className="pb-8 pt-[calc(env(safe-area-inset-top)+16px)]">
      <div className="mx-auto max-w-2xl px-5">
        <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
          <div className="min-w-0">
            <p className="text-sm text-subtitle">👋 Welcome to CodeMateAI</p>
            <h1 className="mt-0.5 truncate text-xl font-bold text-foreground">
              Let&apos;s build something amazing today.
            </h1>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button className="grid h-10 w-10 place-items-center rounded-full bg-surface text-foreground shadow-soft">
              <Search className="h-4.5 w-4.5" />
            </button>
            <button className="relative grid h-10 w-10 place-items-center rounded-full bg-surface text-foreground shadow-soft">
              <Bell className="h-4.5 w-4.5" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-danger" />
            </button>
          </div>
        </header>

        {/* Hero */}
        <section className="relative mt-5 overflow-hidden rounded-3xl gradient-hero p-5 shadow-lift">
          <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/15 blur-2xl" />
          <div className="absolute -bottom-10 -left-6 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
          <div className="relative">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/25 px-3 py-1 text-xs font-medium text-white backdrop-blur">
              <Sparkles className="h-3 w-3" /> AI Powered
            </div>
            <h2 className="mt-3 text-2xl font-bold leading-tight text-white">
              AI Powered Coding Assistant
            </h2>
            <p className="mt-1.5 text-sm text-white/85">
              Generate code, review code, prepare for interviews and build projects effortlessly.
            </p>
            <Link
              to="/app/program"
              className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-semibold text-primary shadow-lg"
            >
              Explore AI <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        {/* Features grid */}
        <section className="mt-6">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-subtitle">
            Features
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <Link
                  key={f.to}
                  to={f.to}
                  className={`group relative overflow-hidden rounded-3xl ${f.gradient} p-4 text-white shadow-soft transition active:scale-[0.97]`}
                >
                  <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-white/15 blur-xl transition group-hover:bg-white/25" />
                  <div className="relative">
                    <div className="flex items-start justify-between">
                      <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white/25 backdrop-blur">
                        <Icon className="h-5 w-5" />
                      </div>
                      <ArrowUpRight className="h-4 w-4 opacity-80" />
                    </div>
                    <h4 className="mt-3 text-sm font-semibold leading-tight">{f.title}</h4>
                    <p className="mt-0.5 text-[11px] leading-snug text-white/85">{f.desc}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Recent activity */}
        <section className="mt-6">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-subtitle">
            Recent activity
          </h3>
          {recent.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border bg-surface p-5 text-center">
              <p className="text-sm text-subtitle">
                No activity yet. Generate your first program to see it here.
              </p>
            </div>
          ) : (
            <ul className="space-y-2">
              {recent.map((r) => (
                <li
                  key={r.id}
                  className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-3 shadow-soft"
                >
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl gradient-blue text-white">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{r.title}</p>
                    <p className="text-xs text-subtitle capitalize">{r.kind}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Today's challenge + tip */}
        <div className="mt-6 grid gap-3">
          <Link
            to="/app/challenge"
            className="flex items-center gap-3 rounded-3xl border border-border bg-surface p-4 shadow-soft"
          >
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl gradient-orange text-white">
              <Trophy className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-foreground">Today&apos;s coding challenge</p>
              <p className="truncate text-xs text-subtitle">Tap to reveal, solve and celebrate.</p>
            </div>
            <ArrowUpRight className="h-4 w-4 text-subtitle" />
          </Link>

          <div className="rounded-3xl border border-border bg-surface p-4 shadow-soft">
            <div className="flex items-start gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl gradient-green text-white">
                <Lightbulb className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">Coding tip</p>
                <p className="mt-0.5 text-sm text-subtitle">{tip}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
