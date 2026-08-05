import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { ScanSearch, Sparkles, Save, RefreshCw, Copy, Wand2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import { reviewCode } from "@/lib/ai.functions";
import { storage } from "@/lib/storage";
import { FeatureShell, GradientButton, LoadingShimmer, SectionCard } from "@/components/FeatureShell";
import { ErrorCard, FeatureErrorBoundary } from "@/components/FeatureError";
import { RelatedTools } from "@/components/RelatedTools";
import { CodeBlock } from "@/components/CodeBlock";
import { AnnotatedCode, extractLine, type Annotation } from "@/components/AnnotatedCode";
import { CodeDiff } from "@/components/CodeDiff";


export const Route = createFileRoute("/app/review")({
  head: () => ({
    meta: [
      { title: "AI Code Reviewer — CodeMate AI" },
      {
        name: "description",
        content:
          "AI code review with scores for quality, performance, security and complexity, bug explanations, best practices and before/after comparison.",
      },
    ],
  }),
  component: ReviewPage,
});

function ReviewPage() {
  const [code, setCode] = useState("");
  const [showDiff, setShowDiff] = useState(false);
  const fn = useServerFn(reviewCode);
  const mutation = useMutation({
    mutationFn: (input: { code: string }) => fn({ data: input }),
    onError: (e: Error) => toast.error(e.message),
    onSuccess: (data) => storage.addHistory({ kind: "review", title: `Score: ${data.overallScore}`, data }),
  });

  const result = mutation.data;

  const annotations = useMemo<Annotation[]>(() => {
    if (!result) return [];
    const out: Annotation[] = [];
    for (const s of result.syntaxErrors ?? []) {
      const line = extractLine(s);
      if (line) out.push({ line, text: s, severity: "error" });
    }
    for (const s of result.logicErrors ?? []) {
      const line = extractLine(s);
      if (line) out.push({ line, text: s, severity: "warning" });
    }
    for (const b of result.bugs ?? []) {
      const line = extractLine(`${b.issue} ${b.fix}`);
      if (line) out.push({ line, text: `${b.issue} — ${b.fix}`, severity: "error" });
    }
    return out;
  }, [result]);

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
      title="AI Code Reviewer"
      subtitle="Rigorous, honest AI feedback"
      icon={ScanSearch}
      gradient="gradient-green"
    >
      <div className="rounded-3xl border border-border bg-surface p-5 shadow-soft">
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-subtitle">Paste your code</span>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Paste code here..."
            rows={10}
            className="w-full resize-none rounded-xl border border-border bg-background px-3 py-2.5 font-mono text-xs text-foreground"
          />
        </label>
        <div className="mt-4">
          <GradientButton
            gradient="gradient-green"
            onClick={() => (code.trim() ? mutation.mutate({ code }) : toast.error("Paste some code first"))}
            disabled={mutation.isPending}
          >
            <Sparkles className="h-4 w-4" />
            {mutation.isPending ? "Reviewing..." : "Review Code"}
          </GradientButton>
        </div>
      </div>

      {mutation.isPending && (
        <div className="mt-5">
          <LoadingShimmer lines={10} />
        </div>
      )}

      {mutation.isError && (
        <div className="mt-5">
          <ErrorCard message={(mutation.error as Error)?.message} onRetry={() => mutation.mutate({ code })} />
        </div>
      )}

      {result && (
        <FeatureErrorBoundary onReset={() => mutation.mutate({ code })}>
        <div className="mt-5 space-y-4">
          <div className="rounded-3xl gradient-green p-6 text-center text-white shadow-lift">
            <p className="text-xs font-medium uppercase tracking-wide opacity-90">Overall Score</p>
            <p className="mt-1 text-6xl font-bold">{result.overallScore}</p>
            <p className="text-xs opacity-90">out of 100</p>
          </div>

          <SectionCard title="Breakdown">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart
                  data={[
                    { metric: "Readability", value: result.readability },
                    { metric: "Performance", value: result.performance },
                    { metric: "Security", value: result.security },
                    { metric: "Maintainability", value: result.maintainability ?? result.codeQuality },
                  ]}
                >
                  <PolarGrid stroke="var(--border)" />
                  <PolarAngleAxis
                    dataKey="metric"
                    tick={{ fill: "var(--subtitle)", fontSize: 11 }}
                  />
                  <PolarRadiusAxis domain={[0, 100]} tick={{ fill: "var(--subtitle)", fontSize: 10 }} />
                  <Radar
                    dataKey="value"
                    stroke="var(--primary)"
                    fill="var(--primary)"
                    fillOpacity={0.35}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3">
              <Bar label="Code Quality" value={result.codeQuality} />
              <Bar label="Performance" value={result.performance} />
              <Bar label="Readability" value={result.readability} />
              <Bar label="Security" value={result.security} />
              <Bar label="Maintainability" value={result.maintainability ?? result.codeQuality} />
              <Bar label="Complexity" value={result.complexity} />
              <Bar label="Optimization" value={result.optimization} />
            </div>
          </SectionCard>

          {((result.logicErrors ?? []).length > 0 || (result.syntaxErrors ?? []).length > 0) && (
            <SectionCard title="Detected Errors">
              {(result.syntaxErrors ?? []).length > 0 && (
                <>
                  <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-subtitle">
                    Syntax errors
                  </p>
                  <ul className="mb-3 space-y-1.5">
                    {(result.syntaxErrors ?? []).map((s, i) => (
                      <li key={i} className="flex gap-2 text-sm text-foreground">
                        <span className="text-danger">✗</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </>
              )}
              {(result.logicErrors ?? []).length > 0 && (
                <>
                  <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-subtitle">
                    Logic errors
                  </p>
                  <ul className="space-y-1.5">
                    {(result.logicErrors ?? []).map((s, i) => (
                      <li key={i} className="flex gap-2 text-sm text-foreground">
                        <span className="text-warning">⚠</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </SectionCard>
          )}


          {(result.bugs ?? []).length > 0 && (
            <SectionCard title="Bugs & Fixes">
              <ul className="space-y-3">
                {(result.bugs ?? []).map((b, i) => (
                  <li key={i} className="rounded-2xl border border-danger/20 bg-danger/5 p-3">
                    <p className="flex gap-2 text-sm font-semibold text-danger">
                      <span>🐛</span> {b.issue}
                    </p>
                    <p className="mt-2 text-xs text-foreground">
                      <span className="font-semibold text-subtitle">Why: </span>
                      {b.why}
                    </p>
                    <p className="mt-1 text-xs text-foreground">
                      <span className="font-semibold text-subtitle">Fix: </span>
                      {b.fix}
                    </p>
                  </li>
                ))}
              </ul>
            </SectionCard>
          )}

          <SectionCard title="Suggestions">
            <ul className="space-y-2">
              {(result.suggestions ?? []).map((s, i) => (
                <li key={i} className="flex gap-2 text-sm text-foreground">
                  <span className="text-success">✓</span>
                  {s}
                </li>
              ))}
            </ul>
          </SectionCard>

          {(result.bestPractices ?? []).length > 0 && (
            <SectionCard title="Best Practices">
              <ul className="space-y-2">
                {(result.bestPractices ?? []).map((s, i) => (
                  <li key={i} className="flex gap-2 text-sm text-foreground">
                    <span className="text-primary">★</span>
                    {s}
                  </li>
                ))}
              </ul>
            </SectionCard>
          )}

          {annotations.length > 0 && (
            <SectionCard title="Inline Annotations">
              <p className="mb-2 text-xs text-subtitle">
                Lines the reviewer flagged, annotated in place.
              </p>
              <AnnotatedCode code={code} annotations={annotations} />
            </SectionCard>
          )}

          <SectionCard
            title="Before vs After"
            action={
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => setShowDiff((d) => !d)}
                  className="inline-flex items-center gap-1 rounded-full gradient-green px-3 py-1 text-xs font-semibold text-white shadow-glow"
                >
                  <Wand2 className="h-3 w-3" /> {showDiff ? "Hide diff" : "Fix all issues"}
                </button>
                <button
                  onClick={() => copy(result.fixedCode || result.optimizedCode)}
                  className="inline-flex items-center gap-1 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-foreground"
                >
                  <Copy className="h-3 w-3" /> Copy fixed
                </button>
              </div>
            }
          >
            {showDiff ? (
              <div>
                <p className="mb-2 text-xs text-subtitle">
                  Diff of your code against the fully fixed version.
                </p>
                <CodeDiff before={code} after={result.fixedCode || result.optimizedCode} />
              </div>
            ) : (
            <div className="space-y-3">
              <div>
                <p className="mb-1 text-xs font-medium text-subtitle">Before (your code)</p>
                <CodeBlock code={code} />
              </div>
              <div>
                <p className="mb-1 text-xs font-medium text-subtitle">After (bug-fixed)</p>
                <CodeBlock code={result.fixedCode || result.optimizedCode} />
              </div>
            </div>
            )}
          </SectionCard>

          <SectionCard title="Optimized Code">
            <CodeBlock code={result.optimizedCode} />
          </SectionCard>

          <div className="grid grid-cols-3 gap-2">
            <ActionButton
              icon={Copy}
              label="Copy Report"
              onClick={() => copy(JSON.stringify(result, null, 2))}
            />
            <ActionButton
              icon={Save}
              label="Save"
              onClick={() => {
                storage.addBookmark({
                  kind: "review",
                  title: `Review · Score ${result.overallScore}`,
                  data: result,
                });
                toast.success("Saved");
              }}
            />
            <ActionButton
              icon={RefreshCw}
              label="Re-review"
              onClick={() => mutation.mutate({ code })}
            />
          </div>
        </div>
        </FeatureErrorBoundary>
      )}

      <RelatedTools current="/app/review" />
    </FeatureShell>

  );
}

function ActionButton({
  icon: Icon,
  label,
  onClick,
}: {
  icon: typeof ScanSearch;
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

function Bar({ label, value }: { label: string; value: number }) {
  const color =
    value >= 80
      ? "gradient-green"
      : value >= 60
        ? "gradient-blue"
        : value >= 40
          ? "gradient-orange"
          : "gradient-sunset";
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs">
        <span className="font-medium text-foreground">{label}</span>
        <span className="font-semibold text-subtitle">{value}/100</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div className={`h-full ${color} transition-all duration-700`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
