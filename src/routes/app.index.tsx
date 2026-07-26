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
  ShieldCheck,
  Layers,
  Wand2,
  Gauge,
  GraduationCap,
  Lock,
} from "lucide-react";
import { memo, useEffect, useState } from "react";
import { storage, type HistoryItem } from "@/lib/storage";

export const Route = createFileRoute("/app/")({
  head: () => ({
    meta: [
      { title: "AI Code Generator & Developer Toolkit — CodeMateAI" },
      {
        name: "description",
        content:
          "Use the AI Code Generator, Program Generator, AI Code Reviewer, Mini Project Generator and Code Converter to write, review and ship production-ready code faster.",
      },
      { property: "og:title", content: "AI Code Generator & Developer Toolkit — CodeMateAI" },
      {
        property: "og:description",
        content:
          "AI-powered coding companion — Program Generator, AI Code Reviewer, Mini Project Generator, Code Converter and Notes Generator in one place.",
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

type ToolCard = {
  to: FeatureRoute;
  title: string;
  desc: string;
  cta: string;
  icon: typeof Code2;
  gradient: string;
  languages: string;
  popular?: boolean;
};

const TOOLS: ToolCard[] = [
  {
    to: "/app/program",
    title: "AI Code Generator",
    desc: "A Program Generator that turns a plain-English prompt into clean, production-ready code with explanations and complexity analysis.",
    cta: "Generate Code",
    icon: Code2,
    gradient: "gradient-blue",
    languages: "Python, Java, C, C++, JavaScript, TypeScript, Go +7",
    popular: true,
  },
  {
    to: "/app/project",
    title: "Mini Project Generator",
    desc: "Build a complete mini project — folder structure, every source file, README, database schema and setup steps.",
    cta: "Create Project",
    icon: Rocket,
    gradient: "gradient-purple",
    languages: "Python, Java, JavaScript, TypeScript, Go, Rust, PHP",
    popular: true,
  },
  {
    to: "/app/review",
    title: "AI Code Reviewer",
    desc: "Paste any code to get scores for readability, performance, security and maintainability, plus fixed and optimized versions.",
    cta: "Review Code",
    icon: ScanSearch,
    gradient: "gradient-green",
    languages: "Any programming language",
    popular: true,
  },
  {
    to: "/app/convert",
    title: "Code Converter",
    desc: "Translate code between languages while preserving logic, with a clear explanation of the syntax differences.",
    cta: "Convert Code",
    icon: ArrowLeftRight,
    gradient: "gradient-sky",
    languages: "14+ languages, both directions",
  },
  {
    to: "/app/notes",
    title: "Notes Generator",
    desc: "Turn any topic into structured programming notes with definitions, examples, MCQs and a quick summary.",
    cta: "Generate Notes",
    icon: BookOpen,
    gradient: "gradient-orange",
    languages: "DSA, DBMS, OS, Networks, OOPS and more",
  },
  {
    to: "/app/interview",
    title: "Interview Preparation",
    desc: "Practice role-based questions with model answers, worked examples, tips and realistic follow-ups.",
    cta: "Start Practicing",
    icon: Mic,
    gradient: "gradient-sunset",
    languages: "Python, Java, JavaScript, DBMS, OS, HR",
  },
];

const LANGUAGES: Array<{ name: string; emoji: string; desc: string }> = [
  { name: "Python", emoji: "🐍", desc: "Use the Python Code Generator for scripts, automation, APIs and data structures." },
  { name: "Java", emoji: "☕", desc: "The Java Code Generator writes OOP examples, algorithms and Spring snippets." },
  { name: "C", emoji: "🔧", desc: "A C Program Generator for pointers, arrays and classic exercises." },
  { name: "C++", emoji: "🧠", desc: "STL usage, competitive programming solutions and OOP designs." },
  { name: "JavaScript", emoji: "🟨", desc: "Browser logic, Node scripts and API clients in seconds." },
  { name: "TypeScript", emoji: "🔷", desc: "Typed utilities, components and backend services." },
  { name: "Go", emoji: "🐹", desc: "CLI tools, concurrent workers and HTTP services." },
  { name: "SQL", emoji: "🗄️", desc: "Queries, joins, schemas and reporting statements." },
];

const WHY = [
  { icon: Sparkles, title: "AI-Powered Generation", body: "Context-aware output from a modern language model." },
  { icon: Gauge, title: "Optimized Code", body: "Beginner, production and optimized variants side by side." },
  { icon: ShieldCheck, title: "Production Ready", body: "Structured results with best practices and edge cases." },
  { icon: GraduationCap, title: "Beginner Friendly", body: "Line-by-line explanations and complexity analysis." },
  { icon: Layers, title: "Multiple Languages", body: "14+ languages across web, backend and systems." },
  { icon: Lock, title: "Private by Default", body: "History stays on-device — nothing stored server-side." },
];

const STEPS = [
  { n: 1, title: "Describe your idea", body: "Pick a language and tell the AI what you need to build." },
  { n: 2, title: "AI writes the code", body: "Clean, commented output with complexity and edge cases." },
  { n: 3, title: "Copy, save or share", body: "Ship it, bookmark it, or refine it with another tool." },
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

  const recent = history.slice(0, 5);
  const programsGenerated = history.filter((h) => h.kind === "program").length;
  const projectsGenerated = history.filter((h) => h.kind === "project").length;

  return (
    <main className="pb-8 pt-[calc(env(safe-area-inset-top)+16px)]">
      <div className="mx-auto max-w-2xl px-5">
        <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
          <div className="min-w-0">
            <p className="text-sm text-subtitle">👋 Welcome to CodeMateAI</p>
            <p className="mt-0.5 truncate text-xl font-bold text-foreground">
              Let&apos;s build something amazing today.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button aria-label="Search" className="grid h-10 w-10 place-items-center rounded-full bg-surface text-foreground shadow-soft">
              <Search className="h-4.5 w-4.5" />
            </button>
            <button aria-label="Notifications" className="relative grid h-10 w-10 place-items-center rounded-full bg-surface text-foreground shadow-soft">
              <Bell className="h-4.5 w-4.5" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-danger" />
            </button>
          </div>
        </header>

        {/* Hero */}
        <section className="relative mt-5 overflow-hidden rounded-3xl shadow-lift" aria-labelledby="hero-title">
          <div className="animated-gradient absolute inset-0" />
          <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/15 blur-2xl" />
          <div className="absolute -bottom-10 -left-6 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
          <div className="relative p-6 text-white">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/25 px-3 py-1 text-xs font-medium backdrop-blur">
              <Sparkles className="h-3 w-3" /> AI Powered
            </div>
            <h1 id="hero-title" className="mt-3 text-[26px] font-bold leading-tight">
              AI Code Generator & Developer Toolkit
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-white/90">
              Generate clean code, review projects, build complete applications and convert code between
              languages — all from one AI-powered workspace.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                to="/app/program"
                className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-semibold text-primary shadow-lg"
              >
                Generate Code <ArrowUpRight className="h-4 w-4" />
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

        {/* Dashboard stats */}
        <section className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4" aria-label="Your activity summary">
          <StatCard label="Programs" value={programsGenerated} icon={Code2} gradient="gradient-blue" />
          <StatCard label="Projects" value={projectsGenerated} icon={Rocket} gradient="gradient-purple" />
          <StatCard label="Saved" value={bookmarkCount} icon={Bookmark} gradient="gradient-orange" />
          <StatCard label="Activity" value={history.length} icon={Clock} gradient="gradient-green" />
        </section>

        {/* Quick Actions */}
        <section className="mt-6" aria-labelledby="quick-actions-title">
          <SectionHeading id="quick-actions-title">Quick Actions</SectionHeading>
          <div className="grid grid-cols-3 gap-2">
            <QuickAction to="/app/program" label="Generate" icon={Wand2} />
            <QuickAction to="/app/review" label="Review" icon={ScanSearch} />
            <QuickAction to="/app/convert" label="Convert" icon={ArrowLeftRight} />
          </div>
        </section>

        {/* Featured Developer Tools */}
        <section className="mt-8" aria-labelledby="featured-tools-title">
          <SectionHeading id="featured-tools-title">Featured Developer Tools</SectionHeading>
          <p className="mb-3 text-sm leading-relaxed text-subtitle">
            Six focused programming tools in one developer toolkit — from an online code generator to a
            complete project builder.
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {TOOLS.map((t) => (
              <ToolCardView key={t.title} tool={t} />
            ))}
          </div>
        </section>

        {/* Popular Programming Languages */}
        <section className="mt-8" aria-labelledby="languages-title">
          <SectionHeading id="languages-title">Popular Programming Languages</SectionHeading>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {LANGUAGES.map((l) => (
              <Link
                key={l.name}
                to="/app/program"
                className="flex items-start gap-3 rounded-2xl border border-border bg-surface p-3 shadow-soft transition active:scale-[0.99]"
                aria-label={`Generate ${l.name} code`}
              >
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl gradient-blue text-lg text-white">
                  <span aria-hidden="true">{l.emoji}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-semibold text-foreground">{l.name}</h3>
                  <p className="text-xs leading-snug text-subtitle">{l.desc}</p>
                  <span className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-primary">
                    Generate {l.name} code <ArrowUpRight className="h-3 w-3" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Why CodeMateAI */}
        <section className="mt-8" aria-labelledby="why-title">
          <SectionHeading id="why-title">Why CodeMateAI</SectionHeading>
          <p className="mb-3 text-sm leading-relaxed text-subtitle">
            One workspace replaces a dozen tabs: write a function, review what you already shipped, scaffold a
            mini project, translate it into another language and revise your programming notes before an
            interview.
          </p>
          <div className="grid grid-cols-2 gap-3">
            {WHY.map((w) => {
              const Icon = w.icon;
              return (
                <div key={w.title} className="rounded-3xl border border-border bg-surface p-4 shadow-soft">
                  <div className="grid h-9 w-9 place-items-center rounded-xl gradient-blue text-white">
                    <Icon className="h-4 w-4" />
                  </div>
                  <h3 className="mt-3 text-sm font-semibold text-foreground">{w.title}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-subtitle">{w.body}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* How CodeMateAI Works */}
        <section className="mt-8" aria-labelledby="how-title">
          <SectionHeading id="how-title">How CodeMateAI Works</SectionHeading>
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
                  <h3 className="text-sm font-semibold text-foreground">{s.title}</h3>
                  <p className="mt-0.5 text-xs text-subtitle">{s.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* Recent Activity */}
        <section className="mt-8" aria-labelledby="recent-activity-title">
          <SectionHeading id="recent-activity-title">Recent Activity</SectionHeading>
          {recent.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border bg-surface p-5 text-center">
              <p className="text-sm text-subtitle">
                No activity yet. Generate your first program to see it here.
              </p>
              <Link
                to="/app/program"
                className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-primary"
              >
                Open the AI Code Generator <ArrowUpRight className="h-4 w-4" />
              </Link>
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
                    <p className="text-xs capitalize text-subtitle">{r.kind}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Tip */}
        <div className="mt-8 rounded-3xl border border-border bg-surface p-4 shadow-soft">
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

        {/* Footer */}
        <footer className="mt-8 border-t border-border pt-6" aria-labelledby="footer-title">
          <h2 id="footer-title" className="text-sm font-semibold text-foreground">
            CodeMateAI — your personal AI coding companion
          </h2>
          <p className="mt-1 text-xs leading-relaxed text-subtitle">
            An online code generator and developer toolkit for students and engineers.
          </p>
          <nav aria-label="Footer" className="mt-4 grid grid-cols-2 gap-y-2">
            {TOOLS.map((t) => (
              <Link key={t.to} to={t.to} className="text-xs font-medium text-primary">
                {t.title}
              </Link>
            ))}
            <Link to="/app/history" className="text-xs font-medium text-subtitle">
              History
            </Link>
            <Link to="/app/saved" className="text-xs font-medium text-subtitle">
              Saved
            </Link>
            <Link to="/app/settings" className="text-xs font-medium text-subtitle">
              Settings
            </Link>
          </nav>
          <p className="mt-5 text-[11px] text-subtitle">
            © {new Date().getFullYear()} CodeMateAI. Always review AI-generated code before shipping.
          </p>
        </footer>
      </div>
    </main>
  );
}

function SectionHeading({ id, children }: { id?: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="mb-3 text-sm font-semibold uppercase tracking-wide text-subtitle">
      {children}
    </h2>
  );
}

const ToolCardView = memo(function ToolCardView({ tool }: { tool: ToolCard }) {
  const Icon = tool.icon;
  return (
    <article className="flex flex-col overflow-hidden rounded-3xl border border-border bg-surface shadow-soft">
      <div className={`relative ${tool.gradient} p-4 text-white`}>
        <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-white/15 blur-xl" />
        <div className="relative flex items-start justify-between gap-2">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white/25 backdrop-blur">
            <Icon className="h-5 w-5" />
          </div>
          {tool.popular && (
            <span className="rounded-full bg-white/25 px-2.5 py-1 text-[11px] font-semibold backdrop-blur">
              Popular
            </span>
          )}
        </div>
        <h3 className="relative mt-3 text-base font-semibold leading-tight">{tool.title}</h3>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <p className="text-sm leading-relaxed text-foreground">{tool.desc}</p>
        <p className="inline-flex items-start gap-1.5 text-[11px] font-medium text-subtitle">
          <Layers className="mt-0.5 h-3 w-3 shrink-0" /> {tool.languages}
        </p>
        <Link
          to={tool.to}
          className={`${tool.gradient} mt-auto inline-flex items-center justify-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold text-white shadow-glow`}
          aria-label={`${tool.cta} with ${tool.title}`}
        >
          {tool.cta} <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
});

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
  icon: typeof Code2;
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
