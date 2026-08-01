export type Annotation = { line: number; text: string; severity: "error" | "warning" | "info" };

/** Pulls "line 12" / "lines 4-6" references out of an issue description. */
export function extractLine(text: string): number | null {
  const m = /lines?\s*#?\s*(\d+)/i.exec(text);
  return m ? Number(m[1]) : null;
}

export function AnnotatedCode({ code, annotations }: { code: string; annotations: Annotation[] }) {
  const lines = code.split("\n");
  const byLine = new Map<number, Annotation[]>();
  for (const a of annotations) {
    if (a.line < 1 || a.line > lines.length) continue;
    byLine.set(a.line, [...(byLine.get(a.line) ?? []), a]);
  }
  return (
    <div className="max-h-[420px] overflow-auto rounded-2xl border border-border bg-muted/50 font-mono text-xs">
      {lines.map((l, i) => {
        const num = i + 1;
        const notes = byLine.get(num);
        return (
          <div key={num}>
            <div
              className={`flex gap-3 whitespace-pre-wrap break-all px-3 py-0.5 ${
                notes ? "bg-warning/10" : ""
              }`}
            >
              <span className="w-7 shrink-0 select-none text-right text-subtitle">{num}</span>
              <span className="text-foreground">{l || " "}</span>
            </div>
            {notes?.map((a, k) => (
              <p
                key={k}
                className={`px-3 py-1 pl-12 font-sans text-[11px] leading-snug ${
                  a.severity === "error"
                    ? "text-danger"
                    : a.severity === "warning"
                      ? "text-warning"
                      : "text-primary"
                }`}
              >
                ↳ {a.text}
              </p>
            ))}
          </div>
        );
      })}
    </div>
  );
}