import { useServerFn } from "@tanstack/react-start";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { Code2, Save, Share2, RefreshCw, Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { generateProgram } from "@/lib/ai.functions";
import { storage } from "@/lib/storage";
import {
  FeatureShell,
  GradientButton,
  LoadingShimmer,
  SectionCard,
} from "@/components/FeatureShell";
import { CodeBlock } from "@/components/CodeBlock";

export const Route = _fr("/app/program")({
  head: () => ({
    meta: [
      { title: "Program Generator — CodeMateAI" },
      {
        name: "description",
        content: "Generate clean, production-quality code in 9+ languages with AI explanations and complexity analysis.",
      },
    ],
  }),
  component: ProgramPage,
});

const LANGUAGES = ["Python", "Java", "C", "C++", "JavaScript", "C#", "PHP", "Go", "Rust"];
const DIFFICULTIES = ["Easy", "Medium", "Hard"];

function ProgramPage() {
  const [language, setLanguage] = useState("Python");
  const [difficulty, setDifficulty] = useState("Easy");
  const [prompt, setPrompt] = useState("");
  const fn = useServerFn(generateProgram);

  const mutation = useMutation({
    mutationFn: (input: { language: string; difficulty: string; prompt: string }) =>
      fn({ data: input }),
    onError: (e: Error) => toast.error(e.message || "AI request failed"),
  });

  const run = () => {
    if (!prompt.trim()) return toast.error("Describe what you want to build.");
    mutation.mutate({ language, difficulty, prompt });
  };

  const result = mutation.data;

  return (
    <FeatureShell
      title="Program Generator"
      subtitle="AI-crafted code, ready to run"
      icon={Code2}
      gradient="gradient-blue"
    >
      <div className="rounded-3xl border border-border bg-surface p-5 shadow-soft">
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-subtitle">Language</span>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
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
            placeholder={`Write a ${language} program to find prime numbers...`}
            rows={4}
            className="w-full resize-none rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground"
          />
        </label>
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

      {result && (
        <div className="mt-5 space-y-4">
          <SectionCard title="Generated Code">
            <CodeBlock code={result.code} language={language.toLowerCase()} />
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

          <div className="grid grid-cols-4 gap-2">
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
            <ActionButton
              icon={Share2}
              label="Share"
              onClick={async () => {
                try {
                  await navigator.share?.({ title: "CodeMateAI", text: result.code });
                } catch {
                  navigator.clipboard.writeText(result.code);
                  toast.success("Copied to clipboard");
                }
              }}
            />
            <ActionButton
              icon={RefreshCw}
              label="Regenerate"
              onClick={run}
            />
            <ActionButton
              icon={Sparkles}
              label="History"
              onClick={() => {
                storage.addHistory({
                  kind: "program",
                  title: prompt.slice(0, 60),
                  data: { language, difficulty, prompt, result },
                });
                toast.success("Added to history");
              }}
            />
          </div>
        </div>
      )}
    </FeatureShell>
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

// Silence unused warning
export { createFileRoute as __unused };
