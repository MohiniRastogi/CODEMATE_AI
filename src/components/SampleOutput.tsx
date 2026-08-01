import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Eye } from "lucide-react";
import { useState } from "react";
import { CodeBlock } from "@/components/CodeBlock";

const SAMPLE = `def two_sum(nums: list[int], target: int) -> tuple[int, int] | None:
    """Return the indices of the two numbers adding up to target."""
    seen: dict[int, int] = {}
    for i, n in enumerate(nums):
        if (rest := target - n) in seen:
            return seen[rest], i
        seen[n] = i
    return None`;

export function SampleOutput() {
  const [open, setOpen] = useState(false);
  return (
    <section className="mt-6 rounded-3xl border border-border bg-surface p-4 shadow-soft" aria-label="Example output">
      <div className="flex items-start gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl gradient-blue text-white">
          <Eye className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground">See an example</p>
          <p className="mt-0.5 text-xs leading-relaxed text-subtitle">
            A real snippet from the AI Code Generator — clean code, typed, with complexity analysis.
          </p>
        </div>
        <button
          onClick={() => setOpen((o) => !o)}
          className="shrink-0 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground"
        >
          {open ? "Hide" : "Show"}
        </button>
      </div>
      {open && (
        <div className="mt-3 space-y-3">
          <CodeBlock code={SAMPLE} language="python" />
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-muted px-3 py-1 text-[11px] font-semibold text-foreground">
              Time O(n)
            </span>
            <span className="rounded-full bg-muted px-3 py-1 text-[11px] font-semibold text-foreground">
              Space O(n)
            </span>
            <Link
              to="/app/program"
              search={{ language: "python" }}
              className="ml-auto inline-flex items-center gap-1 text-xs font-semibold text-primary"
            >
              Try it yourself <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}