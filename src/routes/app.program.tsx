import { useServerFn } from "@tanstack/react-start";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import {
  Code2,
  Save,
  Share2,
  RefreshCw,
  Sparkles,
  Copy,
  Download,
  ChevronDown,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { generateProgram } from "@/lib/ai.functions";
import { storage } from "@/lib/storage";
import { LANGUAGE_NAMES, resolveLanguage } from "@/lib/languages";
import {
  FeatureShell,
  GradientButton,
  LoadingShimmer,
  SectionCard,
} from "@/components/FeatureShell";
import { ErrorCard, FeatureErrorBoundary } from "@/components/FeatureError";
import { RelatedTools } from "@/components/RelatedTools";
import { CodeBlock } from "@/components/CodeBlock";


export const Route = createFileRoute("/app/program")({
  validateSearch: (search: Record<string, unknown>) => ({
    language: typeof search.language === "string" ? search.language : undefined,
  }),
  head: ({ match }) => {
    const lang = resolveLanguage(match.search?.language);
    const title = `${lang.name} Code Generator — Program Generator | CodeMate AI`;
    const description = `Free online ${lang.name} Code Generator. Generate ${lang.name} code with line-by-line explanations, complexity analysis and best practices.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      {
        name: "keywords",
        content:
          "AI Code Generator, Program Generator, Online Code Generator, Python Code Generator, Java Code Generator, C Program Generator, Programming Code Generator, Generate Code with AI, Write Code Online, Code Generator Tool",
      },
      ],
    };
  },
  component: ProgramPage,
});

const LANGUAGES = LANGUAGE_NAMES;
const DIFFICULTIES = ["Easy", "Medium", "Hard"];

type Variant = "productionCode" | "beginnerCode" | "optimizedCode";
const VARIANT_LABELS: Record<Variant, string> = {
  productionCode: "Production",
  beginnerCode: "Beginner Friendly",
  optimizedCode: "Optimized",
};

function ProgramPage() {
  const { language: languageParam } = Route.useSearch();
  const navigate = Route.useNavigate();
  const selected = resolveLanguage(languageParam);
  const [language, setLanguage] = useState(selected.name);
  const [difficulty, setDifficulty] = useState("Easy");
  const [prompt, setPrompt] = useState("");
  const [variant, setVariant] = useState<Variant>("productionCode");
  const fn = useServerFn(generateProgram);

  // Keep the selection in sync when arriving from a language card.
  useEffect(() => {
    setLanguage(selected.name);
  }, [selected.name]);

  const active = resolveLanguage(language);

  const mutation = useMutation({
    mutationFn: (input: { language: string; difficulty: string; prompt: string }) =>
      fn({ data: input }),
    onError: (e: Error) => toast.error(e.message || "AI request failed"),
    onSuccess: (data) => {
      storage.addHistory({
        kind: "program",
        title: prompt.slice(0, 60) || `${language} program`,
        data: { language, difficulty, prompt, result: data },
      });
    },
  });

  const run = () => {
    if (!prompt.trim()) return toast.error("Describe what you want to build.");
    mutation.mutate({ language, difficulty, prompt });
  };

  const result = mutation.data;
  const activeCode = result ? result[variant] : "";

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied");
    } catch {
      toast.error("Copy failed");
    }
  };

  return (
    <FeatureShell
      title={`${active.name} Code Generator`}
      subtitle={`Generate clean, optimized ${active.name} code in seconds`}
      icon={Code2}
      gradient="gradient-blue"
    >
      <div className="rounded-3xl border border-border bg-surface p-5 shadow-soft">
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-subtitle">Language</span>
            <select
              value={language}
              onChange={(e) => {
                setLanguage(e.target.value);
                navigate({
                  search: { language: resolveLanguage(e.target.value).slug },
                  replace: true,
                });
              }}
              className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm font-medium text-foreground"
            >
              {LANGUAGES.map((l) => (
                <option key={l}>{l}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-subtitle">Difficulty</span>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm font-medium text-foreground"
            >
              {DIFFICULTIES.map((l) => (
                <option key={l}>{l}</option>
              ))}
            </select>
          </label>
        </div>
        <label className="mt-4 block">
          <span className="mb-1.5 block text-xs font-medium text-subtitle">Prompt</span>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={active.placeholder}
            rows={4}
            className="w-full resize-none rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground"
          />
        </label>
        <button
          type="button"
          onClick={() => setPrompt(active.example)}
          className="mt-2 text-left text-xs font-medium text-primary"
        >
          Try an example: {active.example}
        </button>
        <div className="mt-4">
          <GradientButton onClick={run} disabled={mutation.isPending}>
            <Sparkles className="h-4 w-4" />
            {mutation.isPending ? "Generating..." : "Generate Code"}
          </GradientButton>
        </div>
      </div>

      {mutation.isPending && (
        <div className="mt-5">
          <LoadingShimmer lines={8} />
        </div>
      )}

      {mutation.isError && (
        <div className="mt-5">
          <ErrorCard message={(mutation.error as Error)?.message} onRetry={run} />
        </div>
      )}


      {result && (
        <FeatureErrorBoundary onReset={run}>
        <div className="mt-5 space-y-4">

          <SectionCard
            title="Generated Code"
            action={
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="rounded-full bg-muted px-2.5 py-1 font-mono text-[11px] font-semibold text-primary">
                  ⏱ {result.timeComplexity}
                </span>
                <span className="rounded-full bg-muted px-2.5 py-1 font-mono text-[11px] font-semibold text-secondary">
                  ▤ {result.spaceComplexity}
                </span>
              </div>
            }
          >
            <div className="mb-3 flex flex-wrap gap-2">
              {(Object.keys(VARIANT_LABELS) as Variant[]).map((v) => (
                <button
                  key={v}
                  onClick={() => setVariant(v)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                    v === variant
                      ? "gradient-blue text-white shadow-glow"
                      : "border border-border bg-surface text-foreground"
                  }`}
                >
                  {VARIANT_LABELS[v]}
                </button>
              ))}
            </div>
            <CodeBlock code={activeCode} language={language.toLowerCase()} />
            <div className="mt-3 grid grid-cols-2 gap-2">
              <ActionButton icon={Copy} label="Copy code" onClick={() => copy(activeCode)} />
              <ActionButton
                icon={Save}
                label="Save to history"
                onClick={() => {
                  storage.addHistory({
                    kind: "program",
                    title: prompt.slice(0, 60) || `${language} program`,
                    data: { language, difficulty, prompt, result },
                  });
                  toast.success("Saved to history");
                }}
              />
            </div>
          </SectionCard>

          <SectionCard title="Line by Line Explanation">
            <ol className="space-y-2 text-sm text-foreground">
              {(result.lineByLine ?? []).map((l, i) => (
                <li key={i} className="flex gap-3">
                  <span className="w-6 shrink-0 font-mono text-xs text-subtitle">{i + 1}.</span>
                  <span>{l}</span>
                </li>
              ))}
            </ol>
          </SectionCard>

          <SectionCard title="Explanation">
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
              {result.explanation}
            </p>
          </SectionCard>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-border bg-surface p-4">
              <p className="text-xs font-medium text-subtitle">Time Complexity</p>
              <p className="mt-1 font-mono text-base font-semibold text-primary">
                {result.timeComplexity}
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-surface p-4">
              <p className="text-xs font-medium text-subtitle">Space Complexity</p>
              <p className="mt-1 font-mono text-base font-semibold text-secondary">
                {result.spaceComplexity}
              </p>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <SectionCard title="Example Input">
              <pre className="overflow-x-auto rounded-xl bg-muted p-3 font-mono text-xs text-foreground">
                {result.exampleInput}
              </pre>
            </SectionCard>
            <SectionCard title="Example Output">
              <pre className="overflow-x-auto rounded-xl bg-muted p-3 font-mono text-xs text-foreground">
                {result.exampleOutput}
              </pre>
            </SectionCard>
          </div>

          <SectionCard title="Best Practices">
            <ul className="space-y-2">
              {(result.bestPractices ?? []).map((b, i) => (
                <li key={i} className="flex gap-2 text-sm text-foreground">
                  <span className="text-success">✓</span>
                  {b}
                </li>
              ))}
            </ul>
          </SectionCard>

          <SectionCard title="Common Mistakes">
            <ul className="space-y-2">
              {(result.commonMistakes ?? []).map((b, i) => (
                <li key={i} className="flex gap-2 text-sm text-foreground">
                  <span className="text-danger">✗</span>
                  {b}
                </li>
              ))}
            </ul>
          </SectionCard>

          {(result.edgeCases ?? []).length > 0 && (
            <SectionCard title="Edge Cases">
              <ul className="space-y-2">
                {(result.edgeCases ?? []).map((e, i) => (
                  <li key={i} className="flex gap-2 text-sm text-foreground">
                    <span className="text-primary">◆</span>
                    {e}
                  </li>
                ))}
              </ul>
            </SectionCard>
          )}

          {(result.relatedConcepts ?? []).length > 0 && (
            <SectionCard title="Related Concepts">
              <div className="flex flex-wrap gap-2">
                {(result.relatedConcepts ?? []).map((c, i) => (
                  <span key={i} className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-foreground">
                    {c}
                  </span>
                ))}
              </div>
            </SectionCard>
          )}



          <div className="grid grid-cols-4 gap-2">
            <ActionButton icon={Copy} label="Copy" onClick={() => copy(activeCode)} />
            <ActionButton
              icon={Download}
              label="Download"
              onClick={() => {
                const ext = active.slug === "python" ? "py" : active.slug === "javascript" ? "js" : "txt";
                const blob = new Blob([activeCode], { type: "text/plain" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `codemate-${active.slug}.${ext}`;
                a.click();
                URL.revokeObjectURL(url);
              }}
            />
            <ActionButton
              icon={Share2}
              label="Share"
              onClick={async () => {
                try {
                  await navigator.share?.({ title: "CodeMate AI", text: activeCode });
                } catch {
                  copy(activeCode);
                }
              }}
            />
            <ActionButton
              icon={Save}
              label="Save"
              onClick={() => {
                storage.addBookmark({
                  kind: "program",
                  title: prompt.slice(0, 60),
                  data: { language, difficulty, prompt, result },
                });
                toast.success("Saved to bookmarks");
              }}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <ActionButton icon={RefreshCw} label="Regenerate" onClick={run} />
            <ActionButton
              icon={Sparkles}
              label="New Prompt"
              onClick={() => {
                setPrompt("");
                mutation.reset();
              }}
            />
          </div>
        </div>
        </FeatureErrorBoundary>
      )}


      {/* SEO Content */}
      <div className="mt-10 space-y-4">
        <SeoBlock
          title="What is an AI Code Generator?"
          body="An AI Code Generator is a tool that turns natural-language prompts into working source code. CodeMate AI uses large language models to generate clean, production-quality programs in any popular language, letting you write code online without leaving your browser."
        />
        <SeoBlock
          title="How does the AI Program Generator work?"
          body="Describe what you want to build, pick a language and difficulty, and the AI Program Generator returns idiomatic code together with a line-by-line explanation, time & space complexity, example input/output and best-practice tips."
        />
        <SeoBlock
          title="Why use AI for programming?"
          body="Whether you are a student learning Python, a developer scaffolding a Java service or an engineer prototyping in Go, an AI Code Generator dramatically shortens the loop from idea to running code, catches common mistakes, and teaches you patterns as you build."
        />
        <SeoBlock
          title="Benefits of AI Code Generation"
          body="Instant boilerplate, multiple solution styles (beginner, production, optimized), explanations in plain English, complexity analysis, and best-practice guidance — all from a single Programming Code Generator built into your workflow."
        />
        <SeoBlock
          title="Supported Programming Languages"
          body="This Online Code Generator supports Python, Java, C, C++, JavaScript, TypeScript, Go, Rust, PHP, Kotlin, Swift, HTML, CSS and SQL — so you can use it as a Python Code Generator, Java Code Generator, C Program Generator or general Code Generator Tool."
        />
        <Faq />
      </div>

      <RelatedTools current="/app/program" />
    </FeatureShell>

  );
}

function SeoBlock({ title, body }: { title: string; body: string }) {
  return (
    <section className="rounded-3xl border border-border bg-surface p-5 shadow-soft">
      <h2 className="text-base font-semibold text-foreground">{title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-subtitle">{body}</p>
    </section>
  );
}

const FAQS = [
  {
    q: "Is the AI Code Generator free?",
    a: "Yes — you can generate code with AI directly in your browser at no cost.",
  },
  {
    q: "Which language should I pick?",
    a: "Choose whichever your project needs. The Python Code Generator, Java Code Generator, C Program Generator, JavaScript Generator and HTML Generator all use the same model with language-tuned prompts.",
  },
  {
    q: "Can I use the generated code in production?",
    a: "The production variant is written to be clean and idiomatic, but always review and test AI-generated code before shipping.",
  },
  {
    q: "Does it explain the code?",
    a: "Every generation returns a line-by-line explanation, a paragraph overview, complexity analysis and best-practice tips.",
  },
];

function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="rounded-3xl border border-border bg-surface p-5 shadow-soft">
      <h2 className="text-base font-semibold text-foreground">Frequently Asked Questions</h2>
      <ul className="mt-3 divide-y divide-border">
        {FAQS.map((f, i) => (
          <li key={i}>
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="flex w-full items-center justify-between gap-3 py-3 text-left text-sm font-medium text-foreground"
            >
              {f.q}
              <ChevronDown
                className={`h-4 w-4 shrink-0 text-subtitle transition ${open === i ? "rotate-180" : ""}`}
              />
            </button>
            {open === i && <p className="pb-3 text-sm leading-relaxed text-subtitle">{f.a}</p>}
          </li>
        ))}
      </ul>
    </section>
  );
}

function ActionButton({
  icon: Icon,
  label,
  onClick,
}: {
  icon: typeof Code2;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-center gap-1 rounded-2xl border border-border bg-surface py-3 text-xs font-medium text-foreground shadow-soft transition active:scale-95"
    >
      <Icon className="h-4 w-4 text-primary" />
      {label}
    </button>
  );
}
