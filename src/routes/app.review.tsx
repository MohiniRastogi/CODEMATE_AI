import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { ScanSearch, Sparkles, Save } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { reviewCode } from "@/lib/ai.functions";
import { storage } from "@/lib/storage";
import { FeatureShell, GradientButton, LoadingShimmer, SectionCard } from "@/components/FeatureShell";
import { CodeBlock } from "@/components/CodeBlock";

export const Route = createFileRoute("/app/review")({
  head: () => ({
    meta: [
      { title: "Code Reviewer — CodeMateAI" },
      {
        name: "description",
        content: "AI-powered code review with quality scoring, bug detection and optimization suggestions.",
      },
    ],
  }),
  component: ReviewPage,
});

function ReviewPage() {
  const [code, setCode] = useState("");
  const fn = useServerFn(reviewCode);
  const mutation = useMutation({
    mutationFn: (input: { code: string }) => fn({ data: input }),
    onError: (e: Error) => toast.error(e.message),
    onSuccess: (data) => storage.addHistory({ kind: "review", title: `Score: ${data.overallScore}`, data }),
  });

  const result = mutation.data;

  return (
    <FeatureShell
      title="Code Reviewer"
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
            onClick={() => code.trim() ? mutation.mutate({ code }) : toast.error("Paste some code first")}
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

      {result && (
        <div className="mt-5 space-y-4">
          <div className="rounded-3xl gradient-green p-6 text-center text-white shadow-lift">
            <p className="text-xs font-medium uppercase tracking-wide opacity-90">Overall Score</p>
            <p className="mt-1 text-6xl font-bold">{result.overallScore}</p>
            <p className="text-xs opacity-90">out of 100</p>
          </div>

          <SectionCard title="Breakdown">
            <div className="space-y-3">
              <Bar label="Code Quality" value={result.codeQuality} />
              <Bar label="Performance" value={result.performance} />
              <Bar label="Readability" value={result.readability} />
              <Bar label="Security" value={result.security} />
              <Bar label="Optimization" value={result.optimization} />
            </div>
          </SectionCard>

          {(result.bugs ?? []).length > 0 && (
            <SectionCard title="Bugs">
              <ul className="space-y-2">
                {(result.bugs ?? []).map((b, i) => (
                  <li key={i} className="flex gap-2 rounded-xl bg-danger/10 p-3 text-sm text-foreground">
                    <span className="text-danger">🐛</span>
                    {b}
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

          <SectionCard title="Optimized Code">
            <CodeBlock code={result.optimizedCode} />
          </SectionCard>

          <button
            onClick={() => {
              storage.addBookmark({ kind: "review", title: `Review · Score ${result.overallScore}`, data: result });
              toast.success("Saved");
            }}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-surface py-3 text-sm font-medium text-foreground shadow-soft"
          >
            <Save className="h-4 w-4 text-primary" /> Save Review
          </button>
        </div>
      )}
    </FeatureShell>
  );
}

function Bar({ label, value }: { label: string; value: number }) {
  const color =
    value >= 80 ? "gradient-green" : value >= 60 ? "gradient-blue" : value >= 40 ? "gradient-orange" : "gradient-sunset";
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
