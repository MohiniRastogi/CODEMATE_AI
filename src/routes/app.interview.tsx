import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { Mic, Sparkles, Bookmark, ChevronRight } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { generateInterview } from "@/lib/ai.functions";
import { storage } from "@/lib/storage";
import { FeatureShell, GradientButton, LoadingShimmer, SectionCard } from "@/components/FeatureShell";

export const Route = createFileRoute("/app/interview")({
  head: () => ({
    meta: [
      { title: "Interview Preparation — CodeMateAI" },
      {
        name: "description",
        content: "Practice interview questions across Python, Java, DBMS, OS, CN, OOPS, HR and JavaScript.",
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
    onError: (e: Error) => toast.error(e.message),
    onSuccess: (data) => {
      setSeen((s) => [data.question, ...s].slice(0, 8));
      storage.addHistory({ kind: "interview", title: data.question.slice(0, 60), data });
    },
  });

  const result = mutation.data;

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
          <GradientButton
            gradient="gradient-sunset"
            onClick={() => mutation.mutate({ category, previousQuestions: seen })}
            disabled={mutation.isPending}
          >
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

      {result && (
        <div className="mt-5 space-y-4">
          <SectionCard title="Question">
            <p className="text-base font-medium leading-relaxed text-foreground">
              {result.question}
            </p>
          </SectionCard>
          <SectionCard title="Model Answer">
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
              {result.answer}
            </p>
          </SectionCard>
          {result.examples.length > 0 && (
            <SectionCard title="Examples">
              <ul className="space-y-2">
                {(result.examples ?? []).map((e, i) => (
                  <li key={i} className="rounded-xl bg-muted p-3 text-sm text-foreground">
                    {e}
                  </li>
                ))}
              </ul>
            </SectionCard>
            <SectionCard title="Tips">
              <ul className="space-y-1.5 text-sm text-foreground">
                {(result.tips ?? []).map((t, i) => (
                  <li key={i}>💡 {t}</li>
                ))}
              </ul>
            </SectionCard>
            <SectionCard title="Follow-up Questions">
              <ul className="space-y-1.5 text-sm text-foreground">
                {(result.followUps ?? []).map((f, i) => (
                <li key={i} className="flex gap-2 text-sm text-foreground">
                  <ChevronRight className="h-4 w-4 shrink-0 text-primary" />
                  {f}
                </li>
              ))}
            </ul>
          </SectionCard>
          <button
            onClick={() => {
              storage.addBookmark({ kind: "interview", title: result.question.slice(0, 60), data: result });
              toast.success("Bookmarked");
            }}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-surface py-3 text-sm font-medium text-foreground shadow-soft"
          >
            <Bookmark className="h-4 w-4 text-primary" /> Bookmark
          </button>
        </div>
      )}
    </FeatureShell>
  );
}
