import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeftRight, Sparkles, Copy, Share2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { convertCode } from "@/lib/ai.functions";
import { storage } from "@/lib/storage";
import { FeatureShell, GradientButton, LoadingShimmer, SectionCard } from "@/components/FeatureShell";
import { RelatedTools } from "@/components/RelatedTools";
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
          <ConversionWarning from={from} to={to} />
          <SectionCard title={`${from} → ${to}`}>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="min-w-0">
                <p className="mb-1 text-xs font-medium text-subtitle">Source · {from}</p>
                <CodeBlock code={code} language={from.toLowerCase()} />
              </div>
              <div className="min-w-0">
                <p className="mb-1 text-xs font-medium text-subtitle">Converted · {to}</p>
                <CodeBlock code={result.convertedCode} language={to.toLowerCase()} />
              </div>
            </div>
          </SectionCard>
          <SectionCard title="Explanation">
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
              {result.explanation}
            </p>
          </SectionCard>
          <SectionCard title="Language Differences">
            <ul className="space-y-2">
              {(result.languageDifferences ?? []).map((d, i) => (
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
    <RelatedTools current="/app/convert" />
    </FeatureShell>
  );
}

const DYNAMIC = ["Python", "JavaScript", "PHP"];
const STATIC = ["Java", "C", "C++", "C#", "Go", "Rust", "TypeScript"];

function ConversionWarning({ from, to }: { from: string; to: string }) {
  const notes: string[] = [];
  if (DYNAMIC.includes(from) && STATIC.includes(to)) {
    notes.push(
      `${from} is dynamically typed and ${to} is not — duck typing, dynamic attributes and flexible collections have to be replaced with explicit types, generics or interfaces.`,
    );
  }
  if (STATIC.includes(from) && DYNAMIC.includes(to)) {
    notes.push(
      `Type guarantees from ${from} disappear in ${to}; add runtime validation where the original relied on the compiler.`,
    );
  }
  if (["C", "C++", "Rust"].includes(from) && !["C", "C++", "Rust"].includes(to)) {
    notes.push("Manual memory management and pointer arithmetic have no direct equivalent and are emulated.");
  }
  if (from === to) notes.push("Source and target languages are the same — pick a different target to convert.");
  if (notes.length === 0) return null;
  return (
    <div className="rounded-2xl border border-warning/30 bg-warning/10 p-4">
      <p className="text-sm font-semibold text-foreground">⚠ Conversion confidence note</p>
      <ul className="mt-1.5 space-y-1 text-xs leading-relaxed text-subtitle">
        {notes.map((n, i) => (
          <li key={i}>• {n}</li>
        ))}
      </ul>
    </div>
  );
}
