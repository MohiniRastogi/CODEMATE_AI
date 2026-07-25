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
  Cog,
  GraduationCap,
  Lock,
  Globe2,
} from "lucide-react";
import { useEffect, useMemo, useState, type ComponentType } from "react";
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
  eta: string;
  languages: string;
  popular?: boolean;
  related: Array<{ label: string; to: FeatureRoute }>;
};

const TOOLS: ToolCard[] = [
  {
    to: "/app/program",
    title: "AI Code Generator",
    desc: "Generate clean, efficient and production-ready code in multiple programming languages with AI assistance.",
    cta: "Generate Code",
    icon: Code2,
    gradient: "gradient-blue",
    eta: "~10s",
    languages: "14+ languages",
    popular: true,
    related: [
      { label: "Code Reviewer", to: "/app/review" },
      { label: "Code Converter", to: "/app/convert" },
      { label: "Mini Project Generator", to: "/app/project" },
      { label: "Notes Generator", to: "/app/notes" },
    ],
  },
  {
    to: "/app/review",
    title: "AI Code Reviewer",
    desc: "Analyze your code, detect bugs, optimize performance and receive an improved version with detailed explanations.",
    cta: "Review Code",
    icon: ScanSearch,
    gradient: "gradient-green",
    eta: "~12s",
    languages: "Any language",
    popular: true,
    related: [
      { label: "AI Code Generator", to: "/app/program" },
      { label: "Code Converter", to: "/app/convert" },
      { label: "Notes Generator", to: "/app/notes" },
    ],
  },
  {
    to: "/app/project",
    title: "Mini Project Generator",
    desc: "Generate complete software projects including folder structure, source code, README and setup instructions.",
    cta: "Create Project",
    icon: Rocket,
    gradient: "gradient-purple",
    eta: "~30s",
    languages: "Multi-stack",
    popular: true,
    related: [
      { label: "AI Code Generator", to: "/app/program" },
      { label: "AI Code Reviewer", to: "/app/review" },
      { label: "Notes Generator", to: "/app/notes" },
    ],
  },
  {
    to: "/app/convert",
    title: "Code Converter",
    desc: "Convert code between programming languages while preserving logic and explaining syntax differences.",
    cta: "Convert Code",
    icon: ArrowLeftRight,
    gradient: "gradient-sky",
    eta: "~10s",
    languages: "14+ languages",
    related: [
      { label: "AI Code Generator", to: "/app/program" },
      { label: "AI Code Reviewer", to: "/app/review" },
      { label: "Mini Project Generator", to: "/app/project" },
    ],
  },
  {
    to: "/app/notes",
    title: "Notes Generator",
    desc: "Generate interview-ready programming notes, examples and explanations in seconds.",
    cta: "Generate Notes",
    icon: BookOpen,
    gradient: "gradient-orange",
    eta: "~8s",
    languages: "Any topic",
    related: [
      { label: "Interview Prep", to: "/app/interview" },
      { label: "AI Code Generator", to: "/app/program" },
      { label: "AI Code Reviewer", to: "/app/review" },
    ],
  },
  {
    to: "/app/interview",
    title: "Interview Prep",
    desc: "Practice role-based programming questions with structured answers, examples and follow-ups.",
    cta: "Start Practicing",
    icon: Mic,
    gradient: "gradient-sunset",
    eta: "~10s",
    languages: "Role-based",
    related: [
      { label: "Notes Generator", to: "/app/notes" },
      { label: "AI Code Generator", to: "/app/program" },
    ],
  },
];

const POPULAR: Array<{ to: FeatureRoute; title: string; desc: string; icon: typeof Code2; gradient: string; query?: string }> = [
  { to: "/app/program", title: "AI Code Generator", desc: "All-purpose code generation in 14+ languages.", icon: Code2, gradient: "gradient-blue" },
  { to: "/app/program", title: "Program Generator", desc: "Turn ideas into working programs.", icon: Wand2, gradient: "gradient-purple" },
  { to: "/app/program", title: "Python Program Generator", desc: "Scripts, automation and data logic in Python.", icon: Code2, gradient: "gradient-green" },
  { to: "/app/program", title: "Java Program Generator", desc: "OOP examples, algorithms and utilities in Java.", icon: Code2, gradient: "gradient-orange" },
  { to: "/app/program", title: "C Program Generator", desc: "Classic C programs with clear explanations.", icon: Code2, gradient: "gradient-sky" },
  { to: "/app/program", title: "HTML Generator", desc: "Landing pages, components and layouts.", icon: Globe2, gradient: "gradient-sunset" },
  { to: "/app/review", title: "AI Code Reviewer", desc: "Score, bugs and an improved version.", icon: ScanSearch, gradient: "gradient-green" },
  { to: "/app/project", title: "Mini Project Generator", desc: "Full multi-file repositories on demand.", icon: Rocket, gradient: "gradient-purple" },
  { to: "/app/convert", title: "Code Converter", desc: "Translate between languages safely.", icon: ArrowLeftRight, gradient: "gradient-sky" },
];

const LANGUAGES: Array<{ name: string; emoji: string; desc: string }> = [
  { name: "Python", emoji: "🐍", desc: "Generate scripts, automation, APIs, OOP examples and data structures." },
  { name: "Java", emoji: "☕", desc: "Build OOP examples, algorithms, Spring snippets and utilities." },
  { name: "C", emoji: "🔧", desc: "Write classic C programs, pointers and data-structure examples." },
  { name: "C++", emoji: "🧠", desc: "Generate STL usage, competitive programming and OOP designs." },
  { name: "JavaScript", emoji: "🟨", desc: "Create browser logic, Node scripts and API clients." },
  { name: "TypeScript", emoji: "🔷", desc: "Typed components, utilities and backend services." },
  { name: "PHP", emoji: "🐘", desc: "Server scripts, forms and small web backends." },
  { name: "Go", emoji: "🐹", desc: "CLI tools, concurrent services and HTTP APIs." },
  { name: "Rust", emoji: "🦀", desc: "Safe systems code, CLIs and performance-critical logic." },
  { name: "Kotlin", emoji: "🎯", desc: "Android snippets, coroutines and idiomatic Kotlin." },
  { name: "Swift", emoji: "🕊️", desc: "iOS-flavored examples, structs and protocols." },
  { name: "HTML", emoji: "🌐", desc: "Semantic markup, landing sections and forms." },
  { name: "CSS", emoji: "🎨", desc: "Layouts, animations and responsive utilities." },
  { name: "SQL", emoji: "🗄️", desc: "Queries, joins, schemas and reporting statements." },
];

const WHY = [
  { icon: Sparkles, title: "AI-Powered Generation", body: "Backed by modern LLMs for accurate, context-aware code." },
  { icon: Gauge, title: "Optimized Code", body: "Beginner, production and optimized variants side by side." },
  { icon: ShieldCheck, title: "Production Ready", body: "Structured output with tests, docs and best practices." },
  { icon: GraduationCap, title: "Beginner Friendly", body: "Line-by-line explanations and complexity analysis." },
  { icon: Layers, title: "Multiple Languages", body: "14+ languages across web, backend and systems." },
  { icon: Lock, title: "Secure Processing", body: "History stays on-device — nothing stored server-side." },
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
              Generate clean code, review projects, build complete applications and convert code between languages — all from one AI-powered workspace.
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
        <section className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4" aria-label="Your activity">
          <StatCard label="Programs" value={programsGenerated} icon={Code2} gradient="gradient-blue" />
          <StatCard label="Projects" value={projectsGenerated} icon={Rocket} gradient="gradient-purple" />
          <StatCard label="Saved" value={bookmarkCount} icon={Bookmark} gradient="gradient-orange" />
          <StatCard label="Activity" value={history.length} icon={Clock} gradient="gradient-green" />
        </section>

        {/* Quick actions */}
        <section className="mt-6" aria-labelledby="quick-actions-title">
          <SectionHeading id="quick-actions-title">Quick Actions</SectionHeading>
          <div className="grid grid-cols-3 gap-2">
            <QuickAction to="/app/program" label="Generate" icon={Wand2} />
            <QuickAction to="/app/review" label="Review" icon={ScanSearch} />
            <QuickAction to="/app/convert" label="Convert" icon={ArrowLeftRight} />
          </div>
        </section>

        {/* Featured Tools grid */}
        <section className="mt-6" aria-labelledby="featured-tools-title">
          <SectionHeading id="featured-tools-title">Featured Developer Tools</SectionHeading>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {TOOLS.map((t) => (
              <ToolCardView key={t.title} tool={t} />
            ))}
          </div>
        </section>

        {/* Why developers choose */}
        <section className="mt-8" aria-labelledby="why-devs-title">
          <SectionHeading id="why-devs-title">Why Developers Choose CodeMateAI</SectionHeading>
          <div className="space-y-3 rounded-3xl border border-border bg-surface p-5 shadow-soft">
            <p className="text-sm leading-relaxed text-foreground">
              Developers reach for the{" "}
              <Link to="/app/program" className="font-semibold text-primary underline-offset-2 hover:underline">
                AI Code Generator
              </Link>{" "}
              when they need a clean starting point — a working function, a REST endpoint, or a snippet in an
              unfamiliar language. It doubles as a{" "}
              <Link to="/app/program" className="font-semibold text-primary underline-offset-2 hover:underline">
                Program Generator
              </Link>{" "}
              for longer scripts, with complexity analysis and beginner-friendly commentary.
            </p>
            <p className="text-sm leading-relaxed text-foreground">
              Shipping something already? The{" "}
              <Link to="/app/review" className="font-semibold text-primary underline-offset-2 hover:underline">
                AI Code Reviewer
              </Link>{" "}
              catches bugs, flags performance issues and returns an improved version with a before-and-after diff.
              When you need scaffolding rather than a snippet, the{" "}
              <Link to="/app/project" className="font-semibold text-primary underline-offset-2 hover:underline">
                Mini Project Generator
              </Link>{" "}
              produces a full multi-file repository with README and setup steps.
            </p>
            <p className="text-sm leading-relaxed text-foreground">
              Moving code across stacks is one prompt with the{" "}
              <Link to="/app/convert" className="font-semibold text-primary underline-offset-2 hover:underline">
                Code Converter
              </Link>
              , and the{" "}
              <Link to="/app/notes" className="font-semibold text-primary underline-offset-2 hover:underline">
                Notes Generator
              </Link>{" "}
              turns any topic into interview-ready notes with examples and MCQs.
            </p>
          </div>
        </section>

        {/* Popular AI Tools */}
        <section className="mt-8" aria-labelledby="popular-tools-title">
          <SectionHeading id="popular-tools-title">Popular AI Developer Tools</SectionHeading>
          <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {POPULAR.map((f) => {
              const Icon = f.icon;
              return (
                <li key={f.title}>
                  <Link
                    to={f.to}
                    className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-3 shadow-soft transition active:scale-[0.99]"
                    aria-label={`Open ${f.title}`}
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

        {/* Supported languages */}
        <section className="mt-8" aria-labelledby="languages-title">
          <SectionHeading id="languages-title">Supported Programming Languages</SectionHeading>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {LANGUAGES.map((l) => (
              <Link
                key={l.name}
                to="/app/program"
                className="flex items-start gap-3 rounded-2xl border border-border bg-surface p-3 shadow-soft transition active:scale-[0.99]"
                aria-label={`Generate ${l.name} code`}
              >
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl gradient-blue text-lg text-white">
                  <span>{l.emoji}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground">{l.name}</p>
                  <p className="text-xs leading-snug text-subtitle">{l.desc}</p>
                  <span className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-primary">
                    Generate {l.name} Code <ArrowUpRight className="h-3 w-3" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="mt-8" aria-labelledby="how-title">
          <SectionHeading id="how-title">How It Works</SectionHeading>
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

        {/* Contextual internal links */}
        <section className="mt-8" aria-labelledby="explore-title">
          <SectionHeading id="explore-title">Where To Go Next</SectionHeading>
          <ul className="space-y-2">
            <ContextLink prompt="Need to improve existing code?" cta="Try the AI Code Reviewer" to="/app/review" icon={ScanSearch} />
            <ContextLink prompt="Want a complete application?" cta="Open Mini Project Generator" to="/app/project" icon={Rocket} />
            <ContextLink prompt="Need another programming language?" cta="Use the Code Converter" to="/app/convert" icon={ArrowLeftRight} />
            <ContextLink prompt="Preparing for interviews?" cta="Generate Programming Notes" to="/app/notes" icon={BookOpen} />
            <ContextLink prompt="Building in Python?" cta="Open the Python Program Generator" to="/app/program" icon={Code2} />
          </ul>
        </section>

        {/* Why CodeMateAI trust section */}
        <section className="mt-8" aria-labelledby="trust-title">
          <SectionHeading id="trust-title">Why CodeMateAI</SectionHeading>
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

        {/* Recent Projects */}
        <section className="mt-8" aria-labelledby="recent-projects-title">
          <SectionHeading id="recent-projects-title">Recent Projects</SectionHeading>
          {recentProjects.length === 0 ? (
            <Link
              to="/app/project"
              className="flex items-center gap-3 rounded-3xl border border-dashed border-border bg-surface p-5"
            >
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl gradient-purple text-white">
                <FolderGit2 className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground">No projects yet</p>
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
        <section className="mt-8" aria-labelledby="recent-activity-title">
          <SectionHeading id="recent-activity-title">Recent Activity</SectionHeading>
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

        {/* Premium CTA */}
        <section className="relative mt-8 overflow-hidden rounded-3xl shadow-lift" aria-labelledby="cta-title">
          <div className="animated-gradient absolute inset-0" />
          <div className="absolute -right-10 -bottom-10 h-40 w-40 rounded-full bg-white/15 blur-2xl" />
          <div className="relative p-6 text-white">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/25 px-3 py-1 text-xs font-medium backdrop-blur">
              <Cog className="h-3 w-3" /> Built for developers
            </div>
            <h2 id="cta-title" className="mt-3 text-[22px] font-bold leading-tight">
              Start Building Smarter with AI
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-white/90">
              Generate production-ready code, review projects, build applications and improve your development workflow.
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
                Explore Developer Tools
              </Link>
            </div>
          </div>
        </section>
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

function ToolCardView({ tool }: { tool: ToolCard }) {
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
        <div className="flex flex-wrap gap-2 text-[11px] font-medium text-subtitle">
          <span className="inline-flex items-center gap-1 rounded-full bg-background px-2.5 py-1">
            <Clock className="h-3 w-3" /> {tool.eta}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-background px-2.5 py-1">
            <Layers className="h-3 w-3" /> {tool.languages}
          </span>
        </div>
        <Link
          to={tool.to}
          className={`${tool.gradient} inline-flex items-center justify-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold text-white shadow-glow`}
          aria-label={`${tool.cta} with ${tool.title}`}
        >
          {tool.cta} <ArrowUpRight className="h-4 w-4" />
        </Link>
        <div className="border-t border-border pt-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-subtitle">Related tools</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {tool.related.map((r) => (
              <Link
                key={r.label}
                to={r.to}
                className="rounded-full border border-border bg-background px-2.5 py-1 text-[11px] font-medium text-foreground transition hover:text-primary"
              >
                {r.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}

function ContextLink({
  prompt,
  cta,
  to,
  icon: Icon,
}: {
  prompt: string;
  cta: string;
  to: FeatureRoute;
  icon: ComponentType<{ className?: string }>;
}) {
  return (
    <li>
      <Link
        to={to}
        className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-3 shadow-soft transition active:scale-[0.99]"
      >
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl gradient-blue text-white">
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs text-subtitle">{prompt}</p>
          <p className="truncate text-sm font-semibold text-primary">{cta} →</p>
        </div>
        <ArrowUpRight className="h-4 w-4 text-subtitle" />
      </Link>
    </li>
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
