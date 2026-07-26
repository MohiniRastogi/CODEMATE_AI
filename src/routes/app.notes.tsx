import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { BookOpen, Sparkles, Save, FileDown, Copy } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { generateNotes } from "@/lib/ai.functions";
import { storage } from "@/lib/storage";
import { FeatureShell, GradientButton, LoadingShimmer, SectionCard } from "@/components/FeatureShell";
import { RelatedTools } from "@/components/RelatedTools";
import { CodeBlock } from "@/components/CodeBlock";
import type { ReactNode } from "react";

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
    for (const k of ["text", "value", "description", "content", "label", "name"]) {
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

export const Route = createFileRoute("/app/notes")({
  head: () => ({
    meta: [
      { title: "Notes Generator — CodeMateAI" },
      {
        name: "description",
        content: "Generate detailed study notes with examples, MCQs and interview questions on any topic.",
      },
    ],
  }),
  component: NotesPage,
});

function NotesPage() {
  const [topic, setTopic] = useState("");
  const fn = useServerFn(generateNotes);
  const mutation = useMutation({
    mutationFn: (input: { topic: string }) => fn({ data: input }),
    onError: (e: Error) => toast.error(e.message),
    onSuccess: (data) => storage.addHistory({ kind: "notes", title: topic, data }),
  });

  const result = mutation.data;

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
          {(result.mcqs ?? []).length > 0 && (
            <SectionCard title="MCQs">
              <div className="space-y-4">
                {(result.mcqs ?? []).map((m, i) => (
                  <div key={i} className="rounded-xl border border-border p-3">
                    <p className="text-sm font-medium text-foreground">
                      {i + 1}. {toText(m?.question)}
                    </p>
                    <ul className="mt-2 space-y-1">
                      {(m?.options ?? []).map((o, j) => (
                        <li key={j} className="text-sm text-subtitle">
                          • {toText(o)}
                        </li>
                      ))}
                    </ul>
                    {m?.answer != null && (
                      <p className="mt-2 text-xs font-semibold text-success">
                        Answer: {toText(m.answer)}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </SectionCard>
          )}
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
              disabled
              className="relative flex flex-col items-center justify-center gap-1 rounded-2xl border border-border bg-surface py-3 text-xs font-medium text-subtitle shadow-soft opacity-60"
            >
              <FileDown className="h-4 w-4" />
              PDF
              <span className="absolute -top-2 right-2 rounded-full gradient-orange px-1.5 py-0.5 text-[9px] font-semibold text-white">
                Soon
              </span>
            </button>
          </div>
        </div>
      )}
    <RelatedTools current="/app/notes" />
    </FeatureShell>
  );
}
