import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
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
import { memo, useEffect, useMemo, useRef, useState } from "react";
import { storage, type HistoryItem } from "@/lib/storage";
import { FEATURED_LANGUAGES, LANGUAGE_CONFIGS } from "@/lib/languages";

import { SiteFooter } from "@/components/SiteFooter";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SampleOutput } from "@/components/SampleOutput";
import { canonicalUrl, SITE_URL } from "@/lib/seo";

export const Route = createFileRoute("/app/")({
  head: () => ({
    meta: [
      { title: "AI Code Generator & Developer Toolkit — CodeMate AI" },
      {
        name: "description",
        content:
          "Use the AI Code Generator, Program Generator, AI Code Reviewer, Mini Project Generator and Code Converter to write, review and ship production-ready code faster.",
      },
      { property: "og:title", content: "AI Code Generator & Developer Toolkit — CodeMate AI" },
      {
        property: "og:description",
        content:
          "AI-powered coding companion — Program Generator, AI Code Reviewer, Mini Project Generator, Code Converter and Notes Generator in one place.",
      },
      { property: "og:url", content: canonicalUrl("/app") },
    ],
    links: [{ rel: "canonical", href: canonicalUrl("/app") }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "CodeMate AI",
          url: `${SITE_URL}/app`,
          applicationCategory: "DeveloperApplication",
          operatingSystem: "Any (web browser)",
          description:
            "AI Code Generator, Program Generator, AI Code Reviewer, Mini Project Generator, Code Converter, Notes Generator and developer utilities in one web app.",
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        }),
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
  "Delete dead code — version control remembers it for you.",
  "A function that needs a comment to explain its name needs a better name.",
  "Prefer composition over inheritance; it survives refactors better.",
  "Log the inputs, not just the error — you will thank yourself at 2am.",
  "Make it work, make it right, make it fast — in that order.",
  "Every `any` in TypeScript is a bug you have agreed to find later.",
  "Fix the failing test before writing the next feature.",
  "Immutable data removes a whole category of concurrency bugs.",
  "Profile before you optimize; intuition about performance is usually wrong.",
  "Handle the error path first, then the happy path reads cleanly.",
  "Keep functions short enough to fit on one screen.",
  "Use meaningful commit messages — future you is a different person.",
  "Validate input at the boundary, trust it everywhere inside.",
  "Avoid clever one-liners; clarity outlives cleverness.",
  "Indexes make reads fast and writes slower — measure both.",
  "Pin your dependencies, then upgrade them on purpose.",
  "Rubber-duck the bug out loud before adding another print statement.",
  "Write the README while the design is still fresh in your head.",
  "Nulls are cheap to create and expensive to debug — use optionals.",
  "Feature flags let you ship unfinished work safely.",
  "Automate anything you have done manually three times.",
  "Reading code is harder than writing it — optimize for the reader.",
]; 


function Home() {
  return <HomeInner />;
}

function Highlight({ text, query }: { text: string; query: string }) {
  const q = query.trim();
  if (!q) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(q.toLowerCase());
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="rounded bg-primary/15 px-0.5 text-primary">{text.slice(idx, idx + q.length)}</mark>
      <Highlight text={text.slice(idx + q.length)} query={q} />
    </>
  );
}

function HomeInner() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [bookmarkCount, setBookmarkCount] = useState(0);
  const [tip, setTip] = useState(tips[0]);
  const [loaded, setLoaded] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const navigate = useNavigate();
  const listRef = useRef<HTMLDivElement>(null);

  const q = query.trim().toLowerCase();
  const searching = q.length > 0;

  const results = useMemo(() => {
    if (!q) return { tools: [], languages: [], total: 0 };
    const tools = TOOLS.filter(
      (t) => t.title.toLowerCase().includes(q) || t.desc.toLowerCase().includes(q) || t.languages.toLowerCase().includes(q),
    );
    const languages = LANGUAGE_CONFIGS.filter(
      (l) => l.name.toLowerCase().includes(q) || l.slug.includes(q) || l.desc.toLowerCase().includes(q),
    );
    return { tools, languages, total: tools.length + languages.length };
  }, [q]);

  const flatResults = useMemo(
    () => [
      ...results.tools.map((t) => ({ to: t.to as string, search: undefined as unknown })),
      ...results.languages.map((l) => ({ to: "/app/program", search: { language: l.slug } as unknown })),
    ],
    [results],
  );

  useEffect(() => {
    setActiveIndex(0);
  }, [q]);

  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(`[data-result-index="${activeIndex}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  const onSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!searching || flatResults.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % flatResults.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i - 1 + flatResults.length) % flatResults.length);
    } else if (e.key === "Home") {
      e.preventDefault();
      setActiveIndex(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setActiveIndex(flatResults.length - 1);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const target = flatResults[activeIndex];
      if (target) navigate({ to: target.to, search: target.search } as never);
    } else if (e.key === "Escape") {
      setQuery("");
    }
  };

  useEffect(() => {
    setHistory(storage.getHistory());
    setBookmarkCount(storage.getBookmarks().length);
    setTip(tips[Math.floor(Math.random() * tips.length)]);
    setLoaded(true);
  }, []);

  const recent = history.slice(0, 5);
  const programsGenerated = history.filter((h) => h.kind === "program").length;
  const projectsGenerated = history.filter((h) => h.kind === "project").length;
  const isNewUser = loaded && history.length === 0 && bookmarkCount === 0;

  return (
    <main className="pb-28 pt-[calc(env(safe-area-inset-top)+16px)]">
      <div className="mx-auto max-w-2xl px-5">
        <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
          <div className="min-w-0">
            <p className="text-sm text-subtitle">👋 Welcome to CodeMate AI</p>
            <p className="mt-0.5 truncate text-xl font-bold text-foreground">
              Let&apos;s build something amazing today.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <ThemeToggle />
          </div>
        </header>

        {/* Tool search */}
        <div className="mt-4 flex items-center gap-2 rounded-2xl border border-border bg-surface px-3 py-2 shadow-soft">
          <Search className="h-4 w-4 shrink-0 text-subtitle" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onSearchKeyDown}
            placeholder="Search tools…"
            aria-label="Search tools"
            role="combobox"
            aria-expanded={searching}
            aria-controls="tool-search-results"
            aria-activedescendant={searching && flatResults.length > 0 ? `tool-result-${activeIndex}` : undefined}
            className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-subtitle"
          />
          {searching && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="shrink-0 rounded-full px-2 py-1 text-xs font-semibold text-subtitle"
            >
              Clear
            </button>
          )}
        </div>

        {searching && (
          <section className="mt-4" aria-label="Search results">
            {results.total === 0 ? (
              <div className="rounded-3xl border border-dashed border-border bg-surface p-6 text-center">
                <p className="text-sm font-medium text-foreground">No tools found</p>
                <p className="mt-1 text-sm text-subtitle">
                  Nothing matches “{query}”. Try another keyword like “sql”, “convert” or “regex”.
                </p>
              </div>
            ) : (
              <div className="space-y-5" id="tool-search-results" ref={listRef}>
                <p className="sr-only" aria-live="polite">
                  {flatResults.length} results. Use arrow keys to navigate and Enter to open.
                </p>
                {results.tools.length > 0 && (
                  <div>
                    <SectionHeading>AI Tools</SectionHeading>
                    <div className="grid grid-cols-1 gap-2">
                      {results.tools.map((t, i) => (
                        <Link
                          key={t.title}
                          to={t.to}
                          id={`tool-result-${i}`}
                          data-result-index={i}
                          onMouseEnter={() => setActiveIndex(i)}
                          className={`${resultClass}${activeIndex === i ? " ring-2 ring-ring" : ""}`}
                        >
                          <span className="text-sm font-semibold text-foreground">
                            <Highlight text={t.title} query={q} />
                          </span>
                          <span className="text-xs leading-snug text-subtitle">
                            <Highlight text={t.desc} query={q} />
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
                {results.languages.length > 0 && (
                  <div>
                    <SectionHeading>Generators</SectionHeading>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {results.languages.map((l, i) => {
                        const idx = results.tools.length + i;
                        return (
                        <Link
                          key={l.slug}
                          to="/app/program"
                          search={{ language: l.slug }}
                          id={`tool-result-${idx}`}
                          data-result-index={idx}
                          onMouseEnter={() => setActiveIndex(idx)}
                          className={`${resultClass}${activeIndex === idx ? " ring-2 ring-ring" : ""}`}
                        >
                          <span className="text-sm font-semibold text-foreground">
                            <span aria-hidden="true">{l.emoji}</span> <Highlight text={`${l.name} Generator`} query={q} />
                          </span>
                          <span className="text-xs leading-snug text-subtitle">
                            <Highlight text={l.desc} query={q} />
                          </span>
                        </Link>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>
        )}

        {!searching && (
          <>

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
                search={{ language: undefined }}
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

        {/* First-visit onboarding */}
        {isNewUser && (
          <section className="mt-6 rounded-3xl border border-dashed border-primary/40 bg-surface p-5 shadow-soft">
            <div className="flex items-start gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl gradient-blue text-white">
                <Lock className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h2 className="text-sm font-semibold text-foreground">Welcome — you&apos;re all set</h2>
                <p className="mt-1 text-sm leading-relaxed text-subtitle">
                  Your stats, history and saved items live only on this device in your browser&apos;s local
                  storage. Nothing is uploaded, and there is no account to create.
                </p>
                <Link
                  to="/app/program"
                  search={{ language: undefined }}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-full gradient-blue px-4 py-2 text-sm font-semibold text-white shadow-glow"
                >
                  Generate your first program <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* See an example */}
        <SampleOutput />

        {/* Dashboard stats */}
        <section className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4" aria-label="Your activity summary">
          <StatCard label="Programs" value={programsGenerated} icon={Code2} gradient="gradient-blue" empty="No programs yet" />
          <StatCard label="Projects" value={projectsGenerated} icon={Rocket} gradient="gradient-purple" empty="No projects yet" />
          <StatCard label="Saved" value={bookmarkCount} icon={Bookmark} gradient="gradient-orange" empty="Nothing saved yet" />
          <StatCard label="Activity" value={history.length} icon={Clock} gradient="gradient-green" empty="No activity yet" />
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
            {FEATURED_LANGUAGES.map((l) => (
              <Link
                key={l.slug}
                to="/app/program"
                search={{ language: l.slug }}
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

        {/* Why CodeMate AI */}
        <section className="mt-8" aria-labelledby="why-title">
          <SectionHeading id="why-title">Why CodeMate AI</SectionHeading>
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

        {/* How CodeMate AI Works */}
        <section className="mt-8" aria-labelledby="how-title">
          <SectionHeading id="how-title">How CodeMate AI Works</SectionHeading>
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
              <p className="text-sm font-medium text-foreground">No recent activity yet.</p>
              <p className="mt-1 text-sm leading-relaxed text-subtitle">
                Generate your first program, review code or build a project to see your history here.
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <Link
                  to="/app/program"
                  search={{ language: undefined }}
                  className="inline-flex items-center gap-1.5 rounded-full gradient-blue px-4 py-2 text-sm font-semibold text-white shadow-glow"
                >
                  Generate Code <ArrowUpRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/app/review"
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-4 py-2 text-sm font-semibold text-foreground shadow-soft"
                >
                  Review Code
                </Link>
              </div>
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

          </>
        )}

        <SiteFooter />

      </div>
    </main>
  );
}

const resultClass =
  "flex flex-col gap-0.5 rounded-2xl border border-border bg-surface p-3 shadow-soft transition active:scale-[0.99]";

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
  empty,
}: {
  label: string;
  value: number;
  icon: typeof Code2;
  gradient: string;
  empty?: string;
}) {
  if (value === 0 && empty) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-surface p-4 shadow-soft">
        <Icon className="h-4 w-4 text-subtitle" />
        <p className="mt-2 text-xs font-medium leading-snug text-foreground">{empty}</p>
        <p className="mt-1 text-[11px] font-medium uppercase tracking-wide text-subtitle">{label}</p>
      </div>
    );
  }
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
