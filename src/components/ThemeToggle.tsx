import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/lib/theme";

export function ThemeToggle({ variant = "surface" }: { variant?: "surface" | "onGradient" }) {
  const { mode, setMode } = useTheme();
  const dark = mode === "dark";
  return (
    <button
      type="button"
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={() => setMode(dark ? "light" : "dark")}
      className={
        variant === "onGradient"
          ? "grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/25 text-white backdrop-blur"
          : "grid h-10 w-10 shrink-0 place-items-center rounded-full bg-surface text-foreground shadow-soft"
      }
    >
      {dark ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
    </button>
  );
}