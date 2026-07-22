import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { Target, Sparkles, CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { generateChallenge } from "@/lib/ai.functions";
import { storage } from "@/lib/storage";
import { FeatureShell, GradientButton, LoadingShimmer, SectionCard } from "@/components/FeatureShell";
import { CodeBlock } from "@/components/CodeBlock";

export const Route = createFileRoute("/app/challenge")({
  head: () => ({
    meta: [
      { title: "Daily Coding Challenge — CodeMateAI" },
      {
        name: "description",
        content: "A new coding challenge every day with hints, solution and complexity analysis.",
      },
    ],
  }),
  component: ChallengePage,
});

function ChallengePage() {
  const today = new Date().toISOString().slice(0, 10);
  const fn = useServerFn(generateChallenge);
  const mutation = useMutation({
    mutationFn: (i: { seed: string }) => fn({ data: i }),
    onError: (e: Error) => toast.error(e.message),
    onSuccess: (data) =>
      storage.addHistory({ kind: "challenge", title: data.title, data }),
  });
  const [done, setDone] = useState(false);
  const [showSolution, setShowSolution] = useState(false);

  useEffect(() => {
    setDone(!!storage.getChallengeProgress()[today]);
    mutation.mutate({ seed: today });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const complete = () => {
    storage.markChallengeDone(today);
    setDone(true);
    confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
    toast.success("Challenge completed! 🎉");
  };

  const result = mutation.data;
  const badgeColor =
    result?.difficulty === "Easy"
      ? "gradient-green"
      : result?.difficulty === "Medium"
        ? "gradient-orange"
        : "gradient-sunset";

  return (
    <FeatureShell
      title="Daily Challenge"
      subtitle={`Challenge for ${today}`}
      icon={Target}
      gradient="gradient-hero"
    >
      {mutation.isPending && !result && <LoadingShimmer lines={10} />}

      {result && (
        <div className="space-y-4">
          <div className="rounded-3xl border border-border bg-surface p-5 shadow-soft">
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-lg font-bold text-foreground">{result.title}</h2>
              <span className={`shrink-0 rounded-full ${badgeColor} px-3 py-1 text-xs font-semibold text-white`}>
                {result.difficulty}
              </span>
            </div>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-foreground">
              {result.question}
            </p>
          </div>

          <SectionCard title="Hints">
            <div className="space-y-2">
              {(result.hints ?? []).map((h, i) => (
                <details key={i} className="rounded-xl border border-border bg-background p-3">
                  <summary className="cursor-pointer text-sm font-medium text-primary">
                    Hint {i + 1}
                  </summary>
                  <p className="mt-2 text-sm text-subtitle">{h}</p>
                </details>
              ))}
            </div>
          </SectionCard>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-border bg-surface p-4">
              <p className="text-xs font-medium text-subtitle">Time</p>
              <p className="mt-1 font-mono text-base font-semibold text-primary">
                {result.timeComplexity}
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-surface p-4">
              <p className="text-xs font-medium text-subtitle">Space</p>
              <p className="mt-1 font-mono text-base font-semibold text-secondary">
                {result.spaceComplexity}
              </p>
            </div>
          </div>

          {!showSolution ? (
            <button
              onClick={() => setShowSolution(true)}
              className="w-full rounded-2xl border border-dashed border-border bg-surface py-4 text-sm font-medium text-primary shadow-soft"
            >
              Reveal Solution
            </button>
          ) : (
            <SectionCard title="Solution">
              <CodeBlock code={result.solution} language="python" />
            </SectionCard>
          )}

          {done ? (
            <div className="flex items-center justify-center gap-2 rounded-3xl bg-success/10 py-4 text-success">
              <CheckCircle2 className="h-5 w-5" />
              <span className="text-sm font-semibold">Completed for today</span>
            </div>
          ) : (
            <GradientButton gradient="gradient-green" onClick={complete}>
              <Sparkles className="h-4 w-4" /> Mark as Completed
            </GradientButton>
          )}
        </div>
      )}
    </FeatureShell>
  );
}
