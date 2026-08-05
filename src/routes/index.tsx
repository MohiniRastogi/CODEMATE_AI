import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { storage } from "@/lib/storage";
import { LogoMark } from "@/components/Logo";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CodeMate AI — Launching your coding companion" },
      {
        name: "description",
        content: "CodeMate AI is loading. Your personal AI coding companion is starting up.",
      },
    ],
  }),
  component: Splash,
});

function Splash() {
  const navigate = useNavigate();

  useEffect(() => {
    const t = setTimeout(() => {
      const dest = storage.isOnboarded() ? "/app" : "/onboarding";
      navigate({ to: dest });
    }, 2000);
    return () => clearTimeout(t);
  }, [navigate]);

  const symbols = ["<>", "{}", "()", "=>", "[]", "//", "*/", "&&"];

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden animated-gradient">
      {symbols.map((s, i) => (
        <span
          key={i}
          className="float pointer-events-none absolute select-none font-mono text-2xl font-bold text-white/25"
          style={{
            top: `${(i * 37) % 90}%`,
            left: `${(i * 53) % 90}%`,
            animationDelay: `${i * 0.4}s`,
          }}
        >
          {s}
        </span>
      ))}

      <div className="relative z-10 animate-in fade-in zoom-in-95 duration-700 text-center">
        <div className="mx-auto flex items-center justify-center gap-3">
          <div className="grid h-16 w-16 place-items-center rounded-3xl bg-white/25 backdrop-blur-xl shadow-2xl">
            <LogoMark variant="mono-light" className="size-9" />
          </div>
        </div>
        <h1 className="mt-5 text-4xl font-bold tracking-tight text-white">CodeMate AI</h1>
        <p className="mt-2 text-sm font-medium text-white/85">
          Your Personal AI Coding Companion
        </p>
        <div className="mx-auto mt-8 h-1 w-24 overflow-hidden rounded-full bg-white/25">
          <div className="h-full w-1/2 animate-pulse rounded-full bg-white" />
        </div>
      </div>
    </main>
  );
}
