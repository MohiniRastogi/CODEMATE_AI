import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { AlertTriangle, ArrowLeftRight, RefreshCw, Sparkles, Copy, Share2 } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { convertCode } from "@/lib/ai.functions";
import { storage } from "@/lib/storage";
import { FeatureShell, GradientButton, LoadingShimmer, SectionCard } from "@/components/FeatureShell";
import { RelatedTools } from "@/components/RelatedTools";
import { CodeBlock } from "@/components/CodeBlock";
import { canonicalUrl } from "@/lib/seo";

export const Route = createFileRoute("/app/convert")({
  head: () => ({
    meta: [
      { title: "Code Converter — CodeMate AI" },
      {
        name: "description",
        content: "Translate code between languages with AI-powered explanations of the differences.",
      },
      { property: "og:title", content: "Code Converter — CodeMate AI" },
      {
        property: "og:description",
        content: "Translate code between languages with AI-powered explanations of the differences.",
      },
      { property: "og:url", content: canonicalUrl("/app/convert") },
    ],
    links: [{ rel: "canonical", href: canonicalUrl("/app/convert") }],
  }),
  component: ConvertPage,
});

const LANGS = ["Python", "Java", "JavaScript", "C", "C++", "C#", "Go", "Rust", "PHP", "TypeScript"];
type ConvertInput = { fromLanguage: string; toLanguage: string; code: string };
const convertResponseSchema = z.object({
  convertedCode: z.string().trim().min(1),
  explanation: z.string().trim().min(1),
  languageDifferences: z.array(z.string()),
  contentType: z.literal("application/json"),
});
type ConvertResult = z.infer<typeof convertResponseSchema>;

const CONVERSION_ERROR = "Conversion failed: the AI returned an unexpected response. Please try again.";

/** Maps zod validation issues on the AI response to short, user-friendly reasons. */
function describeResponseIssues(issues: z.ZodIssue[]): string[] {
  const reasons = new Set<string>();
  for (const issue of issues) {
    const field = issue.path.join(".");
    if (field.includes("convertedCode")) {
      reasons.add("The AI did not return any converted code for your input.");
    } else if (field.includes("explanation")) {
      reasons.add("The AI response was missing the conversion explanation.");
    } else if (field.includes("languageDifferences")) {
      reasons.add("The AI response had an invalid language-differences list.");
    } else if (field.includes("contentType")) {
      reasons.add("The response was not valid structured JSON.");
    } else {
      reasons.add("The response had an unexpected format.");
    }
  }
  return [...reasons];
}

type ConversionError = { message: string; reasons: string[] };

/** Friendly, retryable error panel with the validated reasons the conversion failed. */
function ConversionErrorPanel({
  error,
  onRetry,
}: {
  error: ConversionError;
  onRetry: () => void;
}) {
  return (
    <div
      role="alert"
      className="rounded-3xl border border-danger/30 bg-danger/5 p-5"
      data-testid="conversion-error-panel"
    >
      <div className="flex items-start gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-danger/10 text-danger">
          <AlertTriangle className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-foreground">Conversion failed</h3>
          <p className="mt-1 text-sm leading-relaxed text-subtitle">{error.message}</p>
          {error.reasons.length > 0 && (
            <div className="mt-3 rounded-2xl border border-danger/20 bg-surface p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-subtitle">Why this happened</p>
              <ul className="mt-1.5 space-y-1">
                {error.reasons.map((reason, i) => (
                  <li key={i} className="flex gap-2 text-xs leading-relaxed text-foreground">
                    <span className="text-danger">•</span>
                    {reason}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <button
            onClick={onRetry}
            className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-4 py-2 text-sm font-semibold text-foreground shadow-soft"
          >
            <RefreshCw className="h-4 w-4 text-primary" /> Try again
          </button>
        </div>
      </div>
    </div>
  );
}

function ConvertPage() {
  const [from, setFrom] = useState("Python");
  const [to, setTo] = useState("JavaScript");
  const [code, setCode] = useState("");
  const [visibleResult, setVisibleResult] = useState<ConvertResult | null>(null);
  const [requestError, setRequestError] = useState<ConversionError | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const requestIdRef = useRef(0);
  const fn = useServerFn(convertCode);
  const failConversion = (requestId: number, message = CONVERSION_ERROR, reasons: string[] = []) => {
    if (requestId !== requestIdRef.current) return;
    setIsConverting(false);
    setVisibleResult(null);
    setRequestError({ message, reasons });
    toast.error(message);
  };
  const mutation = useMutation({
    mutationFn: ({ input }: { input: ConvertInput; requestId: number }) => fn({ data: input }),
    onError: (e: Error, variables) => {
      console.error("[CodeConverter] request failed", {
        requestId: variables.requestId,
        message: e.message,
      });
      failConversion(variables.requestId, e.message || "Conversion failed, please try again");
    },
    onSuccess: (rawData, variables) => {
      if (variables.requestId !== requestIdRef.current) return;
      const parsed = convertResponseSchema.safeParse(rawData);
      if (!parsed.success) {
        const reasons = describeResponseIssues(parsed.error.issues);
        console.error("[CodeConverter] malformed response", {
          requestId: variables.requestId,
          issues: parsed.error.issues,
          reasons,
          rawData,
        });
        failConversion(variables.requestId, CONVERSION_ERROR, reasons);
        return;
      }
      console.info("[CodeConverter] response", {
        requestId: variables.requestId,
        contentType: parsed.data.contentType,
        convertedCode: parsed.data.convertedCode,
      });
      setVisibleResult(parsed.data);
      setIsConverting(false);
      setRequestError(null);
      storage.addHistory({
        kind: "convert",
        title: `${variables.input.fromLanguage} → ${variables.input.toLanguage}`,
        data: parsed.data,
      });
    },
  });

  const clearForLanguageChange = () => {
    requestIdRef.current += 1;
    setVisibleResult(null);
    setRequestError(null);
    setIsConverting(false);
    mutation.reset();
  };

  const run = () => {
    if (!code.trim()) {
      toast.error("Paste some code first");
      return;
    }
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    setVisibleResult(null);
    setRequestError(null);
    setIsConverting(true);
    mutation.reset();
    const input = { fromLanguage: from, toLanguage: to, code };
    console.info("[CodeConverter] request", { requestId, ...input });
    mutation.mutate({ input, requestId });
  };

  const result = visibleResult;

  return (
    <FeatureShell
      title="Code Converter"
      subtitle="Translate between languages"
      icon={ArrowLeftRight}
      gradient="gradient-sky"
    >
      <form
        className="rounded-3xl border border-border bg-surface p-5 shadow-soft"
        onSubmit={(event) => {
          event.preventDefault();
          run();
        }}
      >
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-subtitle">From</span>
            <select
              value={from}
              onChange={(e) => {
                clearForLanguageChange();
                setFrom(e.target.value);
              }}
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
              onChange={(e) => {
                clearForLanguageChange();
                setTo(e.target.value);
              }}
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
            disabled={isConverting}
            type="submit"
          >
            <Sparkles className="h-4 w-4" />
            {isConverting ? "Converting..." : "Convert Code"}
          </GradientButton>
        </div>
      </form>

      {isConverting && (
        <div className="mt-5">
          <LoadingShimmer lines={8} />
        </div>
      )}

      {requestError && (
        <div className="mt-5">
          <ConversionErrorPanel
            error={requestError}
            onRetry={() => {
              setRequestError(null);
              run();
            }}
          />
        </div>
      )}

      {result && (
        <div className="mt-5 space-y-4">
          <ConversionWarning from={from} to={to} />
          <SectionCard title={`${from} → ${to}`}>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="min-w-0">
                <p className="mb-1 text-xs font-medium text-subtitle">Source · {from}</p>
                 <CodeBlock code={code} language={from} />
              </div>
              <div className="min-w-0">
                <p className="mb-1 text-xs font-medium text-subtitle">Converted · {to}</p>
                 <CodeBlock code={result.convertedCode} language={to} />
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
              onClick={async () => {
                if (!result.convertedCode.trim()) {
                  setRequestError({
                    message: "Conversion failed, please try again",
                    reasons: ["The converted code panel is empty."],
                  });
                  toast.error("Conversion failed, please try again");
                  return;
                }
                await navigator.clipboard.writeText(result.convertedCode);
                toast.success("Copied converted code");
              }}
              className="flex items-center justify-center gap-1.5 rounded-2xl border border-border bg-surface py-3 text-sm font-medium text-foreground shadow-soft"
            >
              <Copy className="h-4 w-4 text-primary" /> Copy
            </button>
            <button
              onClick={async () => {
                if (!result.convertedCode.trim()) {
                  setRequestError("Conversion failed, please try again");
                  toast.error("Conversion failed, please try again");
                  return;
                }
                try {
                  await navigator.share?.({ title: "CodeMate AI", text: result.convertedCode });
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
