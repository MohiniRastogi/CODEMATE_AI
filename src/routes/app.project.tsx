import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { Rocket, Save, Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { generateProject } from "@/lib/ai.functions";
import { storage } from "@/lib/storage";
import {
  FeatureShell,
  GradientButton,
  LoadingShimmer,
  SectionCard,
} from "@/components/FeatureShell";
import { CodeBlock } from "@/components/CodeBlock";

export const Route = createFileRoute("/app/project")({
  head: () => ({
    meta: [
      { title: "Mini Project Generator — CodeMateAI" },
      {
        name: "description",
        content: "Generate complete mini projects with README, folder structure, dependencies and source code.",
      },
    ],
  }),
  component: ProjectPage,
});

const LANGUAGES = ["Python", "Java", "JavaScript", "C++", "Go", "Rust", "PHP"];
const CATEGORIES = ["Web App", "CLI Tool", "Data Science", "Game", "API", "Automation", "AI/ML"];
const SIZES = ["Small", "Medium", "Large"];
const DIFFS = ["Easy", "Medium", "Hard"];

function ProjectPage() {
  const [language, setLanguage] = useState("Python");
  const [category, setCategory] = useState("CLI Tool");
  const [difficulty, setDifficulty] = useState("Medium");
  const [size, setSize] = useState("Small");
  const fn = useServerFn(generateProject);

  const mutation = useMutation({
    mutationFn: (input: { language: string; category: string; difficulty: string; size: string }) =>
      fn({ data: input }),
    onError: (e: Error) => toast.error(e.message),
    onSuccess: (data) => {
      storage.addHistory({ kind: "project", title: data.projectName, data });
    },
  });

  const result = mutation.data;

  return (
    <FeatureShell
      title="Mini Project Generator"
      subtitle="Full projects, minutes not months"
      icon={Rocket}
      gradient="gradient-purple"
    >
      <div className="rounded-3xl border border-border bg-surface p-5 shadow-soft">
        <div className="grid grid-cols-2 gap-3">
          <Select label="Language" value={language} onChange={setLanguage} options={LANGUAGES} />
          <Select label="Category" value={category} onChange={setCategory} options={CATEGORIES} />
          <Select label="Difficulty" value={difficulty} onChange={setDifficulty} options={DIFFS} />
          <Select label="Size" value={size} onChange={setSize} options={SIZES} />
        </div>
        <div className="mt-4">
          <GradientButton
            gradient="gradient-purple"
            onClick={() => mutation.mutate({ language, category, difficulty, size })}
            disabled={mutation.isPending}
          >
            <Sparkles className="h-4 w-4" />
            {mutation.isPending ? "Building..." : "Generate Project"}
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
          <SectionCard title={result.projectName}>
            <p className="text-sm leading-relaxed text-foreground">{result.overview}</p>
          </SectionCard>
          <SectionCard title="Folder Structure">
            <pre className="overflow-x-auto rounded-xl bg-muted p-3 font-mono text-xs text-foreground">
              {result.folderStructure}
            </pre>
          </SectionCard>
          <SectionCard title="README">
            <div className="max-h-96 overflow-auto whitespace-pre-wrap text-sm text-foreground">
              {result.readme}
            </div>
          </SectionCard>
          <SectionCard title="Dependencies">
            <div className="flex flex-wrap gap-2">
              {(result.dependencies ?? []).map((d) => (
                <span
                  key={d}
                  className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-foreground"
                >
                  {d}
                </span>
              ))}
            </div>
          </SectionCard>
          <SectionCard title="Source Code">
            <CodeBlock code={result.sourceCode} language={language.toLowerCase()} />
          </SectionCard>
          <SectionCard title="Future Scope">
            <ul className="space-y-2">
              {result.futureScope.map((f, i) => (
                <li key={i} className="flex gap-2 text-sm text-foreground">
                  <span className="text-primary">→</span>
                  {f}
                </li>
              ))}
            </ul>
          </SectionCard>
          <button
            onClick={() => {
              storage.addBookmark({ kind: "project", title: result.projectName, data: result });
              toast.success("Saved to bookmarks");
            }}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-surface py-3 text-sm font-medium text-foreground shadow-soft"
          >
            <Save className="h-4 w-4 text-primary" /> Save Project
          </button>
        </div>
      )}
    </FeatureShell>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-subtitle">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm font-medium text-foreground"
      >
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </label>
  );
}
