import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";

export type ToolPath =
  | "/app/program"
  | "/app/project"
  | "/app/review"
  | "/app/notes"
  | "/app/convert"
  | "/app/interview";

const LABELS: Record<ToolPath, string> = {
  "/app/program": "AI Code Generator",
  "/app/project": "Mini Project Generator",
  "/app/review": "AI Code Reviewer",
  "/app/convert": "Code Converter",
  "/app/notes": "Programming Notes Generator",
  "/app/interview": "Interview Preparation",
};

/** Contextual internal links between tool pages — no duplicate navigation. */
export function RelatedTools({ current }: { current: ToolPath }) {
  const others = (Object.keys(LABELS) as ToolPath[]).filter((p) => p !== current);
  return (
    <nav aria-label="Related developer tools" className="mt-8">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-subtitle">
        Related Programming Tools
      </h2>
      <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {others.map((p) => (
          <li key={p}>
            <Link
              to={p}
              className="flex items-center justify-between gap-2 rounded-2xl border border-border bg-surface px-4 py-3 text-sm font-medium text-foreground shadow-soft transition active:scale-[0.99]"
            >
              {LABELS[p]}
              <ArrowUpRight className="h-4 w-4 text-subtitle" />
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
