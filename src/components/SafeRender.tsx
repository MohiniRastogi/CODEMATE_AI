import type { ReactNode } from "react";

/** Convert any unknown AI value into a display string. Never returns an object. */
export function toText(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) return value.map(toText).filter(Boolean).join("\n");
  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;
    for (const key of ["text", "value", "description", "content", "answer", "question"]) {
      if (typeof obj[key] === "string") return obj[key] as string;
    }
    return Object.entries(obj)
      .map(([k, v]) => `${k}: ${toText(v)}`)
      .join("\n");
  }
  return String(value);
}

/** Always returns an array, whatever the AI sent back. */
export function toArray<T = unknown>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[];
  if (value === null || value === undefined || value === "") return [];
  return [value as T];
}

/** Renders any unknown AI value safely — never throws "objects are not valid as a React child". */
export function SafeValue({ value }: { value: unknown }): ReactNode {
  if (value === null || value === undefined) return null;
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return <span className="whitespace-pre-wrap">{String(value)}</span>;
  }
  if (Array.isArray(value)) {
    return (
      <ul className="space-y-1.5">
        {value.map((v, i) => (
          <li key={i} className="text-sm text-foreground">
            <SafeValue value={v} />
          </li>
        ))}
      </ul>
    );
  }
  if (typeof value === "object") {
    return (
      <div className="space-y-1.5">
        {Object.entries(value as Record<string, unknown>).map(([k, v]) => (
          <div key={k} className="text-sm">
            <span className="font-semibold capitalize text-subtitle">{k.replace(/_/g, " ")}: </span>
            <SafeValue value={v} />
          </div>
        ))}
      </div>
    );
  }
  return <span>{String(value)}</span>;
}
