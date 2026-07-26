import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { Mic, Sparkles, Bookmark, ChevronRight } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { generateInterview } from "@/lib/ai.functions";
import { storage } from "@/lib/storage";
import { FeatureShell, GradientButton, LoadingShimmer, SectionCard, EmptyState } from "@/components/FeatureShell";
import { ErrorCard, FeatureErrorBoundary } from "@/components/FeatureError";
import { SafeValue, toArray, toText } from "@/components/SafeRender";
import { RelatedTools } from "@/components/RelatedTools";

export const Route = createFileRoute("/app/interview")({
  head: () => ({
    meta: [
      { title: "Interview Preparation — CodeMateAI" },
      {
        name: "description",
        content:
          "Practice interview preparation questions across Python, Java, DBMS, OS, Computer Networks, OOPS, HR and JavaScript with model answers and follow-ups.",
      },
      { property: "og:title", content: "Interview Preparation — CodeMateAI" },
      {
        property: "og:description",
        content: "Role-based programming interview questions with model answers, examples, tips and follow-ups.",
      },
    ],
  }),
  component: InterviewPage,
});

const CATEGORIES = ["Python", "Java", "DBMS", "Operating System", "Computer Networks", "OOPS", "HR", "JavaScript"];

function InterviewPage() {
  const [category, setCategory] = useState("Python");
  const [seen, setSeen] = useState<string[]>([]);
  const fn = useServerFn(generateInterview);
  const mutation = useMutation({
    mutationFn: (i: { category: string; previousQuestions?: string[] }) => fn({ data: i }),
    onError: (e: Error) => toast.error(e.message || "AI request failed"),
    onSuccess: (data) => {
      const q = toText(data?.question);
      if (q) setSeen((s) => [q, ...s].slice(0, 8));
      storage.addHistory({ kind: "interview", title: q.slice(0, 60) || "Interview question", data });
    },
  });

  const result = mutation.data;
  const question = toText(result?.question);
  const answer = toText(result?.answer);
  const examples = toArray(result?.examples);
  const tips = toArray(result?.tips);
  const followUps = toArray(result?.followUps);

  const run = () => mutation.mutate({ category, previousQuestions: seen });

  return (
    <FeatureShell
      title="Interview Prep"
      subtitle="Practice smarter, land the offer"
      icon={Mic}
      gradient="gradient-sunset"
    >
      <div className="rounded-3xl border border-border bg-surface p-5 shadow-soft">
        <span className="mb-2 block text-xs font-medium text-subtitle">Category</span>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                category === c
                  ? "gradient-sunset text-white shadow-glow"
                  : "border border-border bg-background text-foreground"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="mt-4">
          <GradientButton gradient="gradient-sunset" onClick={run} disabled={mutation.isPending}>
            <Sparkles className="h-4 w-4" />
            {mutation.isPending ? "Generating..." : result ? "Next Question" : "Start Practice"}
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

      {!mutation.isPending && !mutation.isError && !result && (
        <div className="mt-5">
          <EmptyState
            emoji="🎤"
            title="No question yet"
            description={`Pick a category and start practicing ${category} interview questions.`}
          />
        </div>
      )}

      {result && !mutation.isPending && (
        <FeatureErrorBoundary onReset={run}>
          <div className="mt-5 space-y-4">
            <SectionCard title="Question">
              <p className="text-base font-medium leading-relaxed text-foreground">
                {question || "The AI did not return a question. Try again."}
              </p>
            </SectionCard>

            {answer && (
              <SectionCard title="Model Answer">
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">{answer}</p>
              </SectionCard>
            )}

            {examples.length > 0 && (
              <SectionCard title="Examples">
                <ul className="space-y-2">
                  {examples.map((e, i) => (
                    <li key={i} className="rounded-xl bg-muted p-3 text-sm text-foreground">
                      <SafeValue value={e} />
                    </li>
                  ))}
                </ul>
              </SectionCard>
            )}

            {tips.length > 0 && (
              <SectionCard title="Tips">
                <ul className="space-y-1.5 text-sm text-foreground">
                  {tips.map((t, i) => (
                    <li key={i} className="flex gap-2">
                      <span aria-hidden="true">💡</span>
                      <SafeValue value={t} />
                    </li>
                  ))}
                </ul>
              </SectionCard>
            )}

            {followUps.length > 0 && (
              <SectionCard title="Follow-up Questions">
                <ul className="space-y-1.5 text-sm text-foreground">
                  {followUps.map((f, i) => (
                    <li key={i} className="flex gap-2">
                      <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <SafeValue value={f} />
                    </li>
                  ))}
                </ul>
              </SectionCard>
            )}

            <button
              onClick={() => {
                storage.addBookmark({
                  kind: "interview",
                  title: question.slice(0, 60) || "Interview question",
                  data: result,
                });
                toast.success("Bookmarked");
              }}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-surface py-3 text-sm font-medium text-foreground shadow-soft"
            >
              <Bookmark className="h-4 w-4 text-primary" /> Bookmark
            </button>
          </div>
        </FeatureErrorBoundary>
      )}

      <RelatedTools current="/app/interview" />
    </FeatureShell>
  );
}
