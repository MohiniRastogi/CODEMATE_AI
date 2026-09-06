import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { BookOpen, Sparkles, Save, FileDown, Copy, Layers, RotateCcw } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { generateNotes } from "@/lib/ai.functions";
import { storage } from "@/lib/storage";
import { FeatureShell, GradientButton, LoadingShimmer, SectionCard } from "@/components/FeatureShell";
import { RelatedTools } from "@/components/RelatedTools";
import { CodeBlock } from "@/components/CodeBlock";
import type { ReactNode } from "react";
import { canonicalUrl } from "@/lib/seo";

type Unknown = unknown;

function isPlainObject(v: Unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function toText(v: Unknown): string {
  if (v == null) return "";
  if (typeof v === "string") return v;
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  if (Array.isArray(v)) return v.map(toText).filter(Boolean).join(", ");
  if (isPlainObject(v)) {
    for (const k of ["text", "value", "description", "content", "label", "name", "option", "answer"]) {
      if (typeof v[k] === "string") return v[k] as string;
    }
    return "";
  }
  return "";
}

function SafeValue({ value }: { value: Unknown }): ReactNode {
  if (value == null || value === "") return null;
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return <span>{String(value)}</span>;
  }
  if (Array.isArray(value)) {
    return (
      <ul className="list-disc space-y-1 pl-5">
        {value.map((item, i) => (
          <li key={i}>
            <SafeValue value={item} />
          </li>
        ))}
      </ul>
    );
  }
  if (isPlainObject(value)) {
    const { scenario, steps, visual_representation, visualRepresentation, ...rest } = value as Record<
      string,
      unknown
    >;
    const visual = visual_representation ?? visualRepresentation;
    return (
      <div className="space-y-2">
        {scenario != null && (
          <h4 className="text-sm font-semibold text-foreground">{toText(scenario)}</h4>
        )}
        {Array.isArray(steps) && steps.length > 0 && (
          <ol className="list-decimal space-y-1 pl-5 text-sm text-foreground">
            {steps.map((s, i) => (
              <li key={i}>
                <SafeValue value={s} />
              </li>
            ))}
          </ol>
        )}
        {typeof steps === "string" && steps && (
          <p className="text-sm text-foreground">{steps}</p>
        )}
        {visual != null && visual !== "" && (
          <CodeBlock code={typeof visual === "string" ? visual : JSON.stringify(visual, null, 2)} />
        )}
        {Object.entries(rest).map(([k, v]) =>
          v == null || v === "" ? null : (
            <div key={k}>
              <p className="text-xs font-medium uppercase tracking-wide text-subtitle">
                {k.replace(/[_-]/g, " ")}
              </p>
              <div className="mt-1 text-sm text-foreground">
                <SafeValue value={v} />
              </div>
            </div>
          ),
        )}
      </div>
    );
  }
  return null;
}

type Mcq = { question: string; options: string[]; answer: string };

/** Normalizes any AI MCQ shape into { question, options, answer } with plain-string options. */
function normalizeMcq(m: unknown): Mcq {
  const obj = isPlainObject(m) ? m : {};
  const question = toText(obj.question ?? m);
  const answer = toText(obj.answer ?? obj.correctAnswer ?? obj.correct_answer);
  let raw: unknown = obj.options ?? obj.choices ?? obj.answers;
  let list: unknown[] = [];
  if (Array.isArray(raw)) {
    list = raw;
  } else if (isPlainObject(raw)) {
    // Letter-keyed object like { A: "...", B: "..." } — take values in key order.
    list = Object.keys(raw)
      .sort()
      .map((k) => (raw as Record<string, unknown>)[k]);
  } else if (typeof raw === "string" && raw.includes("\n")) {
    list = raw.split("\n");
  } else if (raw != null && raw !== "") {
    list = [raw];
  }
  const options = list
    .map((o) => toText(o).replace(/^[A-Da-d][.)]\s*/, "").trim())
    .filter(Boolean);
  return { question, options, answer };
}

export const Route = createFileRoute("/app/notes")({
  head: () => ({
    meta: [
      { title: "Notes Generator — CodeMate AI" },
      {
        name: "description",
        content: "Generate detailed study notes with examples, MCQs and interview questions on any topic.",
      },
      { property: "og:title", content: "Notes Generator — CodeMate AI" },
      { property: "og:description", content: "Generate detailed study notes with examples, MCQs and interview questions on any topic." },
      { property: "og:url", content: canonicalUrl("/app/notes") },
    ],
    links: [{ rel: "canonical", href: canonicalUrl("/app/notes") }],
  }),
  component: NotesPage,
});

function NotesPage() {
  const [topic, setTopic] = useState("");
  const [flashcards, setFlashcards] = useState(false);
  const fn = useServerFn(generateNotes);
  const mutation = useMutation({
    mutationFn: (input: { topic: string }) => fn({ data: input }),
    onError: (e: Error) => toast.error(e.message),
    onSuccess: (data) => storage.addHistory({ kind: "notes", title: topic, data }),
  });

  const result = mutation.data;

  const toMarkdown = () => {
    if (!result) return "";
    const lines: string[] = [`# ${topic}`, ""];
    if (result.definition) lines.push("## Definition", toText(result.definition), "");
    if (result.explanation) lines.push("## Explanation", toText(result.explanation), "");
    if ((result.examples ?? []).length)
      lines.push("## Examples", ...(result.examples ?? []).map((e) => `- ${toText(e)}`), "");
    if ((result.advantages ?? []).length)
      lines.push("## Advantages", ...(result.advantages ?? []).map((a) => `- ${toText(a)}`), "");
    if ((result.disadvantages ?? []).length)
      lines.push("## Disadvantages", ...(result.disadvantages ?? []).map((a) => `- ${toText(a)}`), "");
    if ((result.interviewQuestions ?? []).length) {
      lines.push("## Interview Questions");
      (result.interviewQuestions ?? []).forEach((qa, i) => {
        lines.push(`**Q${i + 1}. ${toText(qa?.q)}**`, "", toText(qa?.a), "");
      });
    }
    if ((result.mcqs ?? []).length) {
      lines.push("## MCQs");
      (result.mcqs ?? []).forEach((m, i) => {
        lines.push(`${i + 1}. ${toText(m?.question)}`);
        (m?.options ?? []).forEach((o) => lines.push(`   - ${toText(o)}`));
        lines.push(`   **Answer:** ${toText(m?.answer)}`, "");
      });
    }
    if (result.summary) lines.push("## Summary", toText(result.summary), "");
    return lines.join("\n");
  };

  const downloadMarkdown = () => {
    const blob = new Blob([toMarkdown()], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(topic || "notes").replace(/[^a-z0-9-_]+/gi, "-").toLowerCase()}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Markdown downloaded");
  };

  return (
    <FeatureShell
      title="Notes Generator"
      subtitle="Deep-dive study notes on demand"
      icon={BookOpen}
      gradient="gradient-orange"
    >
      <div className="rounded-3xl border border-border bg-surface p-5 shadow-soft">
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-subtitle">Topic</span>
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Binary Search Tree"
            className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground"
          />
        </label>
        <div className="mt-4">
          <GradientButton
            gradient="gradient-orange"
            onClick={() => (topic.trim() ? mutation.mutate({ topic }) : toast.error("Enter a topic"))}
            disabled={mutation.isPending}
          >
            <Sparkles className="h-4 w-4" />
            {mutation.isPending ? "Writing notes..." : "Generate Notes"}
          </GradientButton>
        </div>
      </div>

      {mutation.isPending && (
        <div className="mt-5">
          <LoadingShimmer lines={12} />
        </div>
      )}

      {mutation.isError && !mutation.isPending && (
        <div className="mt-5 rounded-2xl border border-danger/30 bg-danger/10 p-4 text-sm text-foreground">
          <p className="font-medium">Something went wrong.</p>
          <p className="mt-1 text-subtitle">{mutation.error?.message ?? "Please try again."}</p>
          <button
            onClick={() => topic.trim() && mutation.mutate({ topic })}
            className="mt-3 rounded-full border border-border bg-surface px-4 py-1.5 text-xs font-medium"
          >
            Retry
          </button>
        </div>
      )}

      {result && (
        <div className="mt-5 space-y-4">
          {result.definition && (
            <SectionCard title="Definition">
              <p className="text-sm leading-relaxed text-foreground">{toText(result.definition)}</p>
            </SectionCard>
          )}
          {result.explanation && (
            <SectionCard title="Explanation">
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                {toText(result.explanation)}
              </p>
            </SectionCard>
          )}
          {(result.examples ?? []).length > 0 && (
            <SectionCard title="Examples">
              <ul className="space-y-3">
                {(result.examples ?? []).map((e, i) => (
                  <li key={i} className="rounded-xl bg-muted p-3 text-sm text-foreground">
                    <SafeValue value={e} />
                  </li>
                ))}
              </ul>
            </SectionCard>
          )}
          <div className="grid gap-3 sm:grid-cols-2">
            {(result.advantages ?? []).length > 0 && (
              <SectionCard title="Advantages">
                <ul className="space-y-1.5 text-sm text-foreground">
                  {(result.advantages ?? []).map((a, i) => (
                    <li key={i}>✓ {toText(a)}</li>
                  ))}
                </ul>
              </SectionCard>
            )}
            {(result.disadvantages ?? []).length > 0 && (
              <SectionCard title="Disadvantages">
                <ul className="space-y-1.5 text-sm text-foreground">
                  {(result.disadvantages ?? []).map((a, i) => (
                    <li key={i}>✗ {toText(a)}</li>
                  ))}
                </ul>
              </SectionCard>
            )}
          </div>
          {(result.interviewQuestions ?? []).length > 0 && (
            <SectionCard title="Interview Questions">
              <div className="space-y-3">
                {(result.interviewQuestions ?? []).map((qa, i) => {
                  const q = toText((qa as { q?: unknown })?.q ?? qa);
                  const a = toText((qa as { a?: unknown })?.a);
                  return (
                    <details key={i} className="rounded-xl border border-border bg-background p-3">
                      <summary className="cursor-pointer text-sm font-medium text-foreground">
                        Q{i + 1}. {q}
                      </summary>
                      {a && <p className="mt-2 text-sm text-subtitle">{a}</p>}
                    </details>
                  );
                })}
              </div>
            </SectionCard>
          )}
          {(result.mcqs ?? []).length > 0 &&
            (() => {
              const mcqs = (result.mcqs ?? [])
                .map((m) => normalizeMcq(m))
                .filter((m) => m.question && m.options.length >= 2);
              if (mcqs.length === 0) {
                return (
                  <div className="rounded-2xl border border-danger/30 bg-danger/10 p-4 text-sm text-foreground">
                    <p className="font-medium">MCQ options could not be displayed.</p>
                    <p className="mt-1 text-subtitle">
                      The AI returned questions without valid answer options. Please regenerate the notes.
                    </p>
                    <button
                      onClick={() => topic.trim() && mutation.mutate({ topic })}
                      className="mt-3 rounded-full border border-border bg-surface px-4 py-1.5 text-xs font-medium"
                    >
                      Regenerate
                    </button>
                  </div>
                );
              }
              return (
            <SectionCard
              title="MCQs"
              action={
                <button
                  onClick={() => setFlashcards((f) => !f)}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition ${
                    flashcards
                      ? "gradient-orange text-white shadow-glow"
                      : "border border-border bg-surface text-foreground"
                  }`}
                >
                  <Layers className="h-3 w-3" /> Flashcard mode
                </button>
              }
            >
              {flashcards ? (
                <Flashcards cards={mcqs} />
              ) : (
              <div className="space-y-4">
                {mcqs.map((m, i) => (
                  <div key={i} className="rounded-xl border border-border p-3">
                    <p className="text-sm font-medium text-foreground">
                      {i + 1}. {m.question}
                    </p>
                    <ul className="mt-2 space-y-1">
                      {m.options.map((o, j) => (
                        <li key={j} className="text-sm text-subtitle">
                          {String.fromCharCode(65 + j)}. {o}
                        </li>
                      ))}
                    </ul>
                    {m.answer && (
                      <p className="mt-2 text-xs font-semibold text-success">
                        Answer: {m.answer}
                      </p>
                    )}
                  </div>
                ))}
              </div>
              )}
            </SectionCard>
              );
            })()}
          {result.summary && (
            <SectionCard title="Summary">
              <p className="text-sm leading-relaxed text-foreground">{toText(result.summary)}</p>
            </SectionCard>
          )}


          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => {
                navigator.clipboard.writeText(JSON.stringify(result, null, 2));
                toast.success("Copied");
              }}
              className="flex flex-col items-center justify-center gap-1 rounded-2xl border border-border bg-surface py-3 text-xs font-medium text-foreground shadow-soft"
            >
              <Copy className="h-4 w-4 text-primary" />
              Copy
            </button>
            <button
              onClick={() => {
                storage.addBookmark({ kind: "notes", title: topic, data: result });
                toast.success("Saved");
              }}
              className="flex flex-col items-center justify-center gap-1 rounded-2xl border border-border bg-surface py-3 text-xs font-medium text-foreground shadow-soft"
            >
              <Save className="h-4 w-4 text-primary" />
              Save
            </button>
            <button
              onClick={downloadMarkdown}
              className="flex flex-col items-center justify-center gap-1 rounded-2xl border border-border bg-surface py-3 text-xs font-medium text-foreground shadow-soft"
            >
              <FileDown className="h-4 w-4 text-primary" />
              Export .md
            </button>
          </div>
        </div>
      )}
    <RelatedTools current="/app/notes" />
    </FeatureShell>
  );
}

type Card = { question: string; options: string[]; answer: string };

function Flashcards({ cards }: { cards: Card[] }) {
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  if (cards.length === 0) return null;
  const card = cards[Math.min(index, cards.length - 1)];
  const go = (delta: number) => {
    setRevealed(false);
    setIndex((i) => (i + delta + cards.length) % cards.length);
  };
  return (
    <div>
      <p className="mb-2 text-xs font-medium text-subtitle">
        Card {index + 1} of {cards.length}
      </p>
      <button
        onClick={() => setRevealed((r) => !r)}
        className="min-h-40 w-full rounded-2xl border border-border bg-background p-5 text-left transition active:scale-[0.99]"
      >
        <p className="text-sm font-semibold text-foreground">{card.question}</p>
        {!revealed ? (
          <>
            <ul className="mt-3 space-y-1 text-sm text-subtitle">
              {card.options.map((o, i) => (
                <li key={i}>• {o}</li>
              ))}
            </ul>
            <p className="mt-3 text-xs font-medium text-primary">Tap to reveal the answer</p>
          </>
        ) : (
          <p className="mt-3 text-sm font-semibold text-success">✓ {card.answer}</p>
        )}
      </button>
      <div className="mt-3 grid grid-cols-3 gap-2">
        <button
          onClick={() => go(-1)}
          className="rounded-2xl border border-border bg-surface py-2.5 text-xs font-medium text-foreground shadow-soft"
        >
          Previous
        </button>
        <button
          onClick={() => {
            setIndex(0);
            setRevealed(false);
          }}
          className="inline-flex items-center justify-center gap-1.5 rounded-2xl border border-border bg-surface py-2.5 text-xs font-medium text-foreground shadow-soft"
        >
          <RotateCcw className="h-3 w-3" /> Restart
        </button>
        <button
          onClick={() => go(1)}
          className="rounded-2xl gradient-orange py-2.5 text-xs font-semibold text-white shadow-glow"
        >
          Next
        </button>
      </div>
    </div>
  );
}
