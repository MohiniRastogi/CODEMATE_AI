import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeftRight, Sparkles, Copy, Share2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { convertCode } from "@/lib/ai.functions";
import { storage } from "@/lib/storage";
import { FeatureShell, GradientButton, LoadingShimmer, SectionCard } from "@/components/FeatureShell";
import { CodeBlock } from "@/components/CodeBlock";

export const Route = createFileRoute("/app/convert")({
  head: () => ({
    meta: [
      { title: "Code Converter — CodeMateAI" },
      {
        name: "description",
        content: "Translate code between languages with AI-powered explanations of the differences.",
      },
    ],
  }),
  component: ConvertPage,
});

const LANGS = ["Python", "Java", "JavaScript", "C", "C++", "C#", "Go", "Rust", "PHP", "TypeScript"];

function ConvertPage() {
  const [from, setFrom] = useState("Python");
  const [to, setTo] = useState("JavaScript");
  const [code, setCode] = useState("");
  const fn = useServerFn(convertCode);
  const mutation = useMutation({
    mutationFn: (i: { fromLanguage: string; toLanguage: string; code: string }) => fn({ data: i }),
    onError: (e: Error) => toast.error(e.message),
    onSuccess: (data) =>
      storage.addHistory({ kind: "convert", title: `${from} → ${to}`, data }),
  });

  const result = mutation.data;

  return (
    <FeatureShell
      title="Code Converter"
      subtitle="Translate between languages"
      icon={ArrowLeftRight}
      gradient="gradient-sky"
    >
      <div className="rounded-3xl border border-border bg-surface p-5 shadow-soft">
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-subtitle">From</span>
            <select
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm font-medium text-foreground"
            >
              {LANGS.map((l) => (
                <option key={l}>{l}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-subtitle">To</span>
            <select
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm font-medium text-foreground"
            >
              {LANGS.map((l) => (
                <option key={l}>{l}</option>
              ))}
            </select>
          </label>
        </div>
        <label className="mt-4 block">
          <span className="mb-1.5 block text-xs font-medium text-subtitle">Source Code</span>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            rows={8}
            placeholder={`Paste your ${from} code...`}
            className="w-full resize-none rounded-xl border border-border bg-background px-3 py-2.5 font-mono text-xs text-foreground"
          />
        </label>
        <div className="mt-4">
          <GradientButton
            gradient="gradient-sky"
            onClick={() =>
              code.trim()
                ? mutation.mutate({ fromLanguage: from, toLanguage: to, code })
                : toast.error("Paste some code first")
            }
            disabled={mutation.isPending}
          >
            <Sparkles className="h-4 w-4" />
            {mutation.isPending ? "Converting..." : "Convert Code"}
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
          <SectionCard title={`${to} Code`}>
            <CodeBlock code={result.convertedCode} language={to.toLowerCase()} />
          </SectionCard>
          <SectionCard title="Explanation">
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
              {result.explanation}
            </p>
          </SectionCard>
          <SectionCard title="Language Differences">
            <ul className="space-y-2">
              {result.languageDifferences.map((d, i) => (
                <li key={i} className="flex gap-2 text-sm text-foreground">
                  <span className="text-accent">→</span>
                  {d}
                </li>
              ))}
            </ul>
          </SectionCard>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                navigator.clipboard.writeText(result.convertedCode);
                toast.success("Copied");
              }}
              className="flex items-center justify-center gap-1.5 rounded-2xl border border-border bg-surface py-3 text-sm font-medium text-foreground shadow-soft"
            >
              <Copy className="h-4 w-4 text-primary" /> Copy
            </button>
            <button
              onClick={async () => {
                try {
                  await navigator.share?.({ title: "CodeMateAI", text: result.convertedCode });
                } catch {
                  navigator.clipboard.writeText(result.convertedCode);
                  toast.success("Copied");
                }
              }}
              className="flex items-center justify-center gap-1.5 rounded-2xl border border-border bg-surface py-3 text-sm font-medium text-foreground shadow-soft"
            >
              <Share2 className="h-4 w-4 text-primary" /> Share
            </button>
          </div>
        </div>
      )}
    </FeatureShell>
  );
}
