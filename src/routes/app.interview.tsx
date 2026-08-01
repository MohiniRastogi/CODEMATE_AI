import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { Mic, Sparkles, Bookmark, ChevronRight, Timer, Trophy } from "lucide-react";
import { useEffect, useState } from "react";
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
  const [mock, setMock] = useState(false);
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [mockIndex, setMockIndex] = useState(0);
  const [mockScore, setMockScore] = useState(0);
  const [mockDone, setMockDone] = useState(false);
  const [seconds, setSeconds] = useState(120);
  const MOCK_TOTAL = 5;
  const fn = useServerFn(generateInterview);
  const mutation = useMutation({
    mutationFn: (i: { category: string; previousQuestions?: string[] }) => fn({ data: i }),
    onError: (e: Error) => toast.error(e.message || "AI request failed"),
    onSuccess: (data) => {
      const q = toText(data?.question);
      if (q) setSeen((s) => [q, ...s].slice(0, 8));
      storage.addHistory({ kind: "interview", title: q.slice(0, 60) || "Interview question", data });
      setProgress(storage.markInterviewPracticed(category));
      setSeconds(120);
    },
  });

  useEffect(() => {
    setProgress(storage.getInterviewProgress());
  }, []);

  useEffect(() => {
    if (!mock || mockDone || !mutation.data) return;
    const id = setInterval(() => setSeconds((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, [mock, mockDone, mutation.data]);

  const result = mutation.data;
  const question = toText(result?.question);
  const answer = toText(result?.answer);
  const examples = toArray(result?.examples);
  const tips = toArray(result?.tips);
  const followUps = toArray(result?.followUps);

  const run = () => mutation.mutate({ category, previousQuestions: seen });

  const startMock = () => {
    setMock(true);
    setMockIndex(0);
    setMockScore(0);
    setMockDone(false);
    setSeconds(120);
    run();
  };

  const answerMock = (correct: boolean) => {
    const next = mockIndex + 1;
    if (correct) setMockScore((s) => s + 1);
    if (next >= MOCK_TOTAL) {
      setMockDone(true);
      return;
    }
    setMockIndex(next);
    run();
  };

  const totalPracticed = Object.values(progress).reduce((a, b) => a + b, 0);

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
          <div className="grid gap-2 sm:grid-cols-2">
            <GradientButton gradient="gradient-sunset" onClick={() => { setMock(false); run(); }} disabled={mutation.isPending}>
              <Sparkles className="h-4 w-4" />
              {mutation.isPending && !mock ? "Generating..." : result && !mock ? "Next Question" : "Start Practice"}
            </GradientButton>
            <GradientButton gradient="gradient-purple" onClick={startMock} disabled={mutation.isPending}>
              <Timer className="h-4 w-4" />
              Mock Interview
            </GradientButton>
          </div>
        </div>
      </div>

      <SectionCard title="Your Practice Progress">
        {totalPracticed === 0 ? (
          <p className="text-sm text-subtitle">
            No questions practiced yet — your per-category progress will appear here.
          </p>
        ) : (
          <div className="space-y-2">
            {CATEGORIES.filter((c) => (progress[c] ?? 0) > 0).map((c) => {
              const n = progress[c] ?? 0;
              return (
                <div key={c}>
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="font-medium text-foreground">{c}</span>
                    <span className="font-semibold text-subtitle">{n} practiced</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full gradient-sunset transition-all duration-700"
                      style={{ width: `${Math.min(100, (n / 10) * 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
            <p className="pt-1 text-xs text-subtitle">{totalPracticed} questions practiced in total.</p>
          </div>
        )}
      </SectionCard>

      {mock && mockDone && (
        <div className="mt-5 rounded-3xl gradient-purple p-6 text-center text-white shadow-lift">
          <Trophy className="mx-auto h-8 w-8" />
          <p className="mt-2 text-sm font-medium opacity-90">Mock interview complete</p>
          <p className="mt-1 text-5xl font-bold">
            {mockScore}/{MOCK_TOTAL}
          </p>
          <p className="mt-1 text-xs opacity-90">
            {mockScore >= 4 ? "Strong performance — keep it up." : "Review the weak answers and try again."}
          </p>
          <button
            onClick={startMock}
            className="mt-4 rounded-full bg-white px-5 py-2 text-sm font-semibold text-primary"
          >
            Run another mock
          </button>
        </div>
      )}

      {mock && !mockDone && (
        <div className="mt-5 flex items-center justify-between rounded-2xl border border-border bg-surface p-4 shadow-soft">
          <p className="text-sm font-medium text-foreground">
            Question {Math.min(mockIndex + 1, MOCK_TOTAL)} of {MOCK_TOTAL}
          </p>
          <p className={`font-mono text-sm font-semibold ${seconds <= 15 ? "text-danger" : "text-primary"}`}>
            <Timer className="mr-1 inline h-4 w-4" />
            {String(Math.floor(seconds / 60)).padStart(2, "0")}:{String(seconds % 60).padStart(2, "0")}
          </p>
        </div>
      )}

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

      {result && !mutation.isPending && !(mock && mockDone) && (
        <FeatureErrorBoundary onReset={run}>
          <div className="mt-5 space-y-4">
            {mock && (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => answerMock(true)}
                  className="rounded-2xl gradient-green py-3 text-sm font-semibold text-white shadow-glow"
                >
                  I answered this well
                </button>
                <button
                  onClick={() => answerMock(false)}
                  className="rounded-2xl border border-border bg-surface py-3 text-sm font-semibold text-foreground shadow-soft"
                >
                  Needs more work
                </button>
              </div>
            )}
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
