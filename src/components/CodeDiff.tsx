type Row = { type: "same" | "add" | "remove"; text: string };

function diffLines(before: string, after: string): Row[] {
  const a = before.split("\n");
  const b = after.split("\n");
  const n = a.length;
  const m = b.length;
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }
  const rows: Row[] = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) {
      rows.push({ type: "same", text: a[i] });
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      rows.push({ type: "remove", text: a[i++] });
    } else {
      rows.push({ type: "add", text: b[j++] });
    }
  }
  while (i < n) rows.push({ type: "remove", text: a[i++] });
  while (j < m) rows.push({ type: "add", text: b[j++] });
  return rows;
}

export function CodeDiff({ before, after }: { before: string; after: string }) {
  const rows = diffLines(before ?? "", after ?? "");
  return (
    <div className="max-h-[420px] overflow-auto rounded-2xl border border-border bg-muted/50 font-mono text-xs">
      {rows.map((r, i) => (
        <div
          key={i}
          className={`flex gap-2 whitespace-pre-wrap break-all px-3 py-0.5 ${
            r.type === "add"
              ? "bg-success/10 text-success"
              : r.type === "remove"
                ? "bg-danger/10 text-danger"
                : "text-foreground"
          }`}
        >
          <span className="w-3 shrink-0 select-none opacity-70">
            {r.type === "add" ? "+" : r.type === "remove" ? "-" : " "}
          </span>
          <span>{r.text || " "}</span>
        </div>
      ))}
    </div>
  );
}