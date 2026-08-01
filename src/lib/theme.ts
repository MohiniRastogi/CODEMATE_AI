import { useSyncExternalStore } from "react";

export type ThemeMode = "light" | "dark";
export type AccentKey = "blue" | "purple" | "green" | "orange" | "rose";

export const ACCENTS: Array<{ key: AccentKey; label: string; swatch: string }> = [
  { key: "blue", label: "Blue", swatch: "linear-gradient(135deg,#2563eb,#06b6d4)" },
  { key: "purple", label: "Purple", swatch: "linear-gradient(135deg,#7c3aed,#ec4899)" },
  { key: "green", label: "Green", swatch: "linear-gradient(135deg,#16a34a,#14b8a6)" },
  { key: "orange", label: "Orange", swatch: "linear-gradient(135deg,#ea580c,#f59e0b)" },
  { key: "rose", label: "Rose", swatch: "linear-gradient(135deg,#e11d48,#f472b6)" },
];

const MODE_KEY = "codemate.themeMode";
const ACCENT_KEY = "codemate.accent";

type ThemeState = { mode: ThemeMode; accent: AccentKey };

let state: ThemeState = { mode: "light", accent: "blue" };
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

export function applyTheme(next: ThemeState) {
  state = next;
  if (typeof document !== "undefined") {
    document.documentElement.classList.toggle("dark", next.mode === "dark");
    document.documentElement.dataset.accent = next.accent;
  }
  emit();
}

export function initTheme() {
  if (typeof window === "undefined") return;
  const mode = (localStorage.getItem(MODE_KEY) as ThemeMode | null) ?? "light";
  const accent = (localStorage.getItem(ACCENT_KEY) as AccentKey | null) ?? "blue";
  applyTheme({ mode: mode === "dark" ? "dark" : "light", accent });
}

export function setMode(mode: ThemeMode) {
  if (typeof window !== "undefined") localStorage.setItem(MODE_KEY, mode);
  applyTheme({ ...state, mode });
}

export function setAccent(accent: AccentKey) {
  if (typeof window !== "undefined") localStorage.setItem(ACCENT_KEY, accent);
  applyTheme({ ...state, accent });
}

const serverSnapshot: ThemeState = { mode: "light", accent: "blue" };

export function useTheme() {
  const current = useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => state,
    () => serverSnapshot,
  );
  return { ...current, setMode, setAccent };
}