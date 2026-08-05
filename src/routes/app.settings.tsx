import { createFileRoute } from "@tanstack/react-router";
import { Info, Star, Share2, MessageSquare, Shield, FileText, Sun, Moon, Check } from "lucide-react";
import { toast } from "sonner";
import { ACCENTS, useTheme } from "@/lib/theme";
import { LogoMark } from "@/components/Logo";

export const Route = createFileRoute("/app/settings")({
  head: () => ({
    meta: [
      { title: "Settings — CodeMate AI" },
      { name: "description", content: "App preferences, theme and about." },
    ],
  }),
  component: SettingsPage,
});

function Row({
  icon: Icon,
  label,
  value,
  onClick,
}: {
  icon: typeof Info;
  label: string;
  value?: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-2xl border border-border bg-surface p-4 text-left shadow-soft transition active:scale-[0.99]"
    >
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl gradient-blue text-white">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground">{label}</p>
        {value && <p className="truncate text-xs text-subtitle">{value}</p>}
      </div>
    </button>
  );
}

function SettingsPage() {
  const { mode, accent, setMode, setAccent } = useTheme();
  const share = async () => {
    try {
      await navigator.share?.({
        title: "CodeMate AI",
        text: "Your Personal AI Coding Companion",
        url: typeof window !== "undefined" ? window.location.origin : "",
      });
    } catch {
      navigator.clipboard.writeText(window.location.origin);
      toast.success("Link copied");
    }
  };

  return (
    <main className="mx-auto max-w-2xl px-5 pb-28 pt-[calc(env(safe-area-inset-top)+16px)]">
      <header>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-subtitle">Personalize your experience</p>
      </header>

      <section className="mt-6 rounded-3xl gradient-hero p-5 text-white shadow-lift">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/25 backdrop-blur">
            <LogoMark variant="mono-light" className="size-7" />
          </div>
          <div>
            <p className="text-lg font-bold">CodeMate AI</p>
            <p className="text-xs opacity-90">Version 1.0.0</p>
          </div>
        </div>
      </section>

      <section className="mt-6">
        <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-subtitle">
          Appearance
        </h2>
        <div className="space-y-3 rounded-2xl border border-border bg-surface p-4 shadow-soft">
          <div>
            <p className="text-sm font-medium text-foreground">Theme</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {(
                [
                  { key: "light" as const, label: "Light", icon: Sun },
                  { key: "dark" as const, label: "Dark", icon: Moon },
                ]
              ).map((m) => {
                const Icon = m.icon;
                const active = mode === m.key;
                return (
                  <button
                    key={m.key}
                    onClick={() => setMode(m.key)}
                    className={`inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                      active
                        ? "gradient-blue text-white shadow-glow"
                        : "border border-border bg-background text-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4" /> {m.label}
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Accent colour</p>
            <p className="text-xs text-subtitle">Applies across every page and is saved on this device.</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {ACCENTS.map((a) => (
                <button
                  key={a.key}
                  onClick={() => setAccent(a.key)}
                  aria-label={`${a.label} accent`}
                  aria-pressed={accent === a.key}
                  className={`grid h-10 w-10 place-items-center rounded-full text-white transition ${
                    accent === a.key ? "ring-2 ring-primary ring-offset-2 ring-offset-surface" : ""
                  }`}
                  style={{ backgroundImage: a.swatch }}
                >
                  {accent === a.key && <Check className="h-4 w-4" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mt-6">
        <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-subtitle">
          Support
        </h2>
        <div className="space-y-2">
          <Row icon={MessageSquare} label="Feedback" onClick={() => toast.info("Feedback: hello@codemateai.app")} />
          <Row icon={Star} label="Rate App" onClick={() => toast.success("Thanks for the love ⭐")} />
          <Row icon={Share2} label="Share App" onClick={share} />
        </div>
      </section>

      <section className="mt-6">
        <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-subtitle">
          Legal
        </h2>
        <div className="space-y-2">
          <Row icon={Shield} label="Privacy Policy" onClick={() => toast.info("Privacy policy coming soon")} />
          <Row icon={FileText} label="Terms of Service" onClick={() => toast.info("Terms coming soon")} />
          <Row icon={Info} label="About" value="Your Personal AI Coding Companion" />
        </div>
      </section>

      <p className="mt-8 text-center text-xs text-subtitle">
        Made with 💙 for developers everywhere
      </p>
    </main>
  );
}
