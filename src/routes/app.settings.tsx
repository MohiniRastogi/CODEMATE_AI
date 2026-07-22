import { createFileRoute } from "@tanstack/react-router";
import { Info, Star, Share2, MessageSquare, Shield, FileText, Sun } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/settings")({
  head: () => ({
    meta: [
      { title: "Settings — CodeMateAI" },
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
  const share = async () => {
    try {
      await navigator.share?.({
        title: "CodeMateAI",
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
            <span className="font-mono text-lg font-bold">{`<>`}</span>
          </div>
          <div>
            <p className="text-lg font-bold">CodeMateAI</p>
            <p className="text-xs opacity-90">Version 1.0.0</p>
          </div>
        </div>
      </section>

      <section className="mt-6">
        <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-subtitle">
          Appearance
        </h2>
        <div className="space-y-2">
          <Row icon={Sun} label="Theme" value="Light (dark theme coming soon)" onClick={() => toast.info("Only light theme in v1")} />
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
