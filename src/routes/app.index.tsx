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
  ArrowUpRight,
  Lightbulb,
  Clock,
  Bookmark,
  Zap,
  ShieldCheck,
  Layers,
  Wand2,
  Cpu,
  Gauge,
  FolderGit2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { storage, type HistoryItem } from "@/lib/storage";

export const Route = createFileRoute("/app/")({
  head: () => ({
    meta: [
      { title: "AI Code Generator & Developer Toolkit — CodeMateAI" },
      {
        name: "description",
        content:
          "Generate clean code, review code, build complete projects, convert code, and improve your programming productivity with AI.",
      },
      { property: "og:title", content: "AI Code Generator & Developer Toolkit — CodeMateAI" },
      {
        property: "og:description",
        content:
          "AI-powered coding companion — Program Generator, Code Reviewer, Mini Project Generator, Code Converter and more.",
      },
    ],
  }),
  component: Home,
});

type FeatureRoute =
  | "/app/program"
  | "/app/project"
  | "/app/review"
  | "/app/notes"
  | "/app/convert"
  | "/app/interview";

const features: Array<{
  to: FeatureRoute;
  title: string;
  desc: string;
  icon: typeof Code2;
  gradient: string;
}> = [
  { to: "/app/program", title: "AI Code Generator", desc: "Clean code in 14+ languages", icon: Code2, gradient: "gradient-blue" },
  { to: "/app/project", title: "Mini Project", desc: "Real, multi-file projects", icon: Rocket, gradient: "gradient-purple" },
  { to: "/app/review", title: "Code Reviewer", desc: "Scores, bugs & fixes", icon: ScanSearch, gradient: "gradient-green" },
  { to: "/app/notes", title: "Notes Generator", desc: "Study notes on any topic", icon: BookOpen, gradient: "gradient-orange" },
  { to: "/app/convert", title: "Code Converter", desc: "Translate between languages", icon: ArrowLeftRight, gradient: "gradient-sky" },
  { to: "/app/interview", title: "Interview Prep", desc: "Practice Qs with answers", icon: Mic, gradient: "gradient-sunset" },
];

const KEYWORDS = [
  "AI Code Generator",
  "Program Generator",
  "Python Code Generator",
  "Java Code Generator",
  "C Program Generator",
  "C++ Code Generator",
  "JavaScript Generator",
  "HTML Generator",
  "Code Reviewer",
  "Mini Project Generator",
  "Code Converter",
  "Algorithm Generator",
  "Flowchart Generator",
];

const LANGUAGES = [
  { name: "Python", emoji: "🐍" },
  { name: "JavaScript", emoji: "🟨" },
  { name: "TypeScript", emoji: "🔷" },
  { name: "Java", emoji: "☕" },
  { name: "C++", emoji: "🧠" },
  { name: "C", emoji: "🔧" },
  { name: "Go", emoji: "🐹" },
  { name: "Rust", emoji: "🦀" },
  { name: "PHP", emoji: "🐘" },
  { name: "Kotlin", emoji: "🎯" },
  { name: "Swift", emoji: "🕊️" },
  { name: "SQL", emoji: "🗄️" },
];

const WHY = [
  { icon: Zap, title: "Instant results", body: "Generate production code in seconds, not hours." },
  { icon: ShieldCheck, title: "Explains every line", body: "Understand what runs and why — no black boxes." },
  { icon: Gauge, title: "Optimized output", body: "Beginner, production and optimized variants side by side." },
  { icon: Layers, title: "End to end", body: "From single functions to full multi-file projects." },
];

const STEPS = [
  { n: 1, title: "Describe your idea", body: "Pick a language and tell the AI what to build." },
  { n: 2, title: "AI writes the code", body: "Clean, commented and explained — with complexity analysis." },
  { n: 3, title: "Copy, save or share", body: "Ship it, keep it in your bookmarks or iterate further." },
];

const tips = [
  "Small commits beat giant ones — bisect will thank you.",
  "Name variables for what they mean, not for how they're computed.",
  "Read the error message twice before opening Stack Overflow.",
  "Cache invalidation is hard; TTLs are usually your friend.",
  "Write the test first when the bug is hard to reproduce.",
];

function Home() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [bookmarkCount, setBookmarkCount] = useState(0);
  const [tip, setTip] = useState(tips[0]);

  useEffect(() => {
    setHistory(storage.getHistory());
    setBookmarkCount(storage.getBookmarks().length);
    setTip(tips[Math.floor(Math.random() * tips.length)]);
  }, []);

  const recent = history.slice(0, 3);
  const recentProjects = useMemo(
    () => history.filter((h) => h.kind === "project").slice(0, 4),
    [history],
  );
  const programsGenerated = history.filter((h) => h.kind === "program").length;
  const projectsGenerated = history.filter((h) => h.kind === "project").length;

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
        <section className="relative mt-5 overflow-hidden rounded-3xl shadow-lift">
          <div className="animated-gradient absolute inset-0" />
          <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/15 blur-2xl" />
          <div className="absolute -bottom-10 -left-6 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
          <div className="relative p-6 text-white">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/25 px-3 py-1 text-xs font-medium backdrop-blur">
              <Sparkles className="h-3 w-3" /> AI Powered
            </div>
            <h2 className="mt-3 text-[26px] font-bold leading-tight">
              AI Code Generator & Developer Toolkit
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-white/90">
              Generate clean code, review code, build complete projects, convert code, and improve
              your programming productivity with AI.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                to="/app/program"
                className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-semibold text-primary shadow-lg"
              >
                Try AI Generator <ArrowUpRight className="h-4 w-4" />
              </Link>
              <Link
                to="/app/project"
                className="inline-flex items-center gap-1.5 rounded-full border border-white/40 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur"
              >
                Build a Project
              </Link>
            </div>
          </div>
        </section>

        {/* Keyword chips */}
        <section className="mt-6">
          <div className="flex flex-wrap gap-2">
            {KEYWORDS.map((k, i) => (
              <span
                key={k}
                className="chip-float inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium text-foreground shadow-soft"
                style={{ animationDelay: `${(i % 6) * 0.2}s` }}
              >
                <span className="text-success">✓</span>
                {k}
              </span>
            ))}
          </div>
        </section>

        {/* Dashboard stats */}
        <section className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard label="Programs" value={programsGenerated} icon={Code2} gradient="gradient-blue" />
          <StatCard label="Projects" value={projectsGenerated} icon={Rocket} gradient="gradient-purple" />
          <StatCard label="Saved" value={bookmarkCount} icon={Bookmark} gradient="gradient-orange" />
          <StatCard label="Activity" value={history.length} icon={Clock} gradient="gradient-green" />
        </section>

        {/* Quick actions */}
        <section className="mt-6">
          <SectionHeading>Quick Actions</SectionHeading>
          <div className="grid grid-cols-3 gap-2">
            <QuickAction to="/app/program" label="Generate" icon={Wand2} />
            <QuickAction to="/app/review" label="Review" icon={ScanSearch} />
            <QuickAction to="/app/convert" label="Convert" icon={ArrowLeftRight} />
          </div>
        </section>

        {/* Featured tools */}
        <section className="mt-6">
          <SectionHeading>Featured Developer Tools</SectionHeading>
          <div className="grid grid-cols-2 gap-3">
            {features.slice(0, 4).map((f) => {
              const Icon = f.icon;
              return (
                <Link
                  key={f.to}
                  to={f.to}
                  className={`group relative overflow-hidden rounded-3xl ${f.gradient} p-4 text-white shadow-soft transition active:scale-[0.97]`}
                >
                  <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-white/15 blur-xl" />
                  <div className="relative">
                    <div className="flex items-start justify-between">
                      <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white/25 backdrop-blur">
                        <Icon className="h-5 w-5" />
                      </div>
                      <ArrowUpRight className="h-4 w-4 opacity-80" />
                    </div>
                    <h4 className="mt-3 text-sm font-semibold leading-tight">{f.title}</h4>
                    <p className="mt-0.5 text-[11px] leading-snug text-white/85">{f.desc}</p>
                    <span className="mt-3 inline-flex items-center gap-1 rounded-full bg-white/25 px-2.5 py-1 text-[11px] font-semibold backdrop-blur">
                      Launch <ArrowUpRight className="h-3 w-3" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Popular AI Tools */}
        <section className="mt-6">
          <SectionHeading>Popular AI Tools</SectionHeading>
          <ul className="space-y-2">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <li key={f.to}>
                  <Link
                    to={f.to}
                    className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-3 shadow-soft transition active:scale-[0.99]"
                  >
                    <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${f.gradient} text-white`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-foreground">{f.title}</p>
                      <p className="truncate text-xs text-subtitle">{f.desc}</p>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-subtitle" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>

        {/* Why choose */}
        <section className="mt-6">
          <SectionHeading>Why Choose CodeMateAI</SectionHeading>
          <div className="grid grid-cols-2 gap-3">
            {WHY.map((w) => {
              const Icon = w.icon;
              return (
                <div
                  key={w.title}
                  className="rounded-3xl border border-border bg-surface p-4 shadow-soft"
                >
                  <div className="grid h-9 w-9 place-items-center rounded-xl gradient-blue text-white">
                    <Icon className="h-4 w-4" />
                  </div>
                  <p className="mt-3 text-sm font-semibold text-foreground">{w.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-subtitle">{w.body}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Supported languages */}
        <section className="mt-6">
          <SectionHeading>Supported Languages</SectionHeading>
          <div className="flex flex-wrap gap-2">
            {LANGUAGES.map((l) => (
              <span
                key={l.name}
                className="inline-flex items-center gap-1.5 rounded-2xl border border-border bg-surface px-3 py-1.5 text-xs font-medium text-foreground shadow-soft"
              >
                <span>{l.emoji}</span>
                {l.name}
              </span>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="mt-6">
          <SectionHeading>How It Works</SectionHeading>
          <ol className="space-y-3">
            {STEPS.map((s) => (
              <li
                key={s.n}
                className="flex items-start gap-3 rounded-2xl border border-border bg-surface p-4 shadow-soft"
              >
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full gradient-hero text-sm font-bold text-white">
                  {s.n}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{s.title}</p>
                  <p className="mt-0.5 text-xs text-subtitle">{s.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* Recent Projects (replaces Daily Challenge) */}
        <section className="mt-6">
          <SectionHeading>Recent Projects</SectionHeading>
          {recentProjects.length === 0 ? (
            <Link
              to="/app/project"
              className="flex items-center gap-3 rounded-3xl border border-dashed border-border bg-surface p-5"
            >
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl gradient-purple text-white">
                <FolderGit2 className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground">
                  No projects yet
                </p>
                <p className="truncate text-xs text-subtitle">
                  Generate your first mini project to see it here.
                </p>
              </div>
              <ArrowUpRight className="h-4 w-4 text-subtitle" />
            </Link>
          ) : (
            <ul className="grid gap-2 sm:grid-cols-2">
              {recentProjects.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-3 shadow-soft"
                >
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl gradient-purple text-white">
                    <FolderGit2 className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{p.title}</p>
                    <p className="text-xs text-subtitle">
                      {new Date(p.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Recent activity */}
        <section className="mt-6">
          <SectionHeading>Recent Activity</SectionHeading>
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

        {/* Tip */}
        <div className="mt-6 rounded-3xl border border-border bg-surface p-4 shadow-soft">
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
    </main>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-subtitle">{children}</h3>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  gradient,
}: {
  label: string;
  value: number;
  icon: typeof Code2;
  gradient: string;
}) {
  return (
    <div className={`relative overflow-hidden rounded-2xl ${gradient} p-4 text-white shadow-soft`}>
      <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-white/15 blur-xl" />
      <div className="relative">
        <Icon className="h-4 w-4 opacity-90" />
        <p className="mt-2 text-2xl font-bold leading-none">{value}</p>
        <p className="mt-1 text-[11px] font-medium uppercase tracking-wide text-white/85">{label}</p>
      </div>
    </div>
  );
}

function QuickAction({
  to,
  label,
  icon: Icon,
}: {
  to: FeatureRoute;
  label: string;
  icon: typeof Cpu;
}) {
  return (
    <Link
      to={to}
      className="flex flex-col items-center justify-center gap-1 rounded-2xl border border-border bg-surface py-3 text-xs font-medium text-foreground shadow-soft transition active:scale-95"
    >
      <Icon className="h-4 w-4 text-primary" />
      {label}
    </Link>
  );
}
