import { Link } from "@tanstack/react-router";
import { ArrowUp, Sparkles } from "lucide-react";
import { FEATURED_LANGUAGES } from "@/lib/languages";
import { UTILS } from "@/lib/devtools";

const AI_TOOLS = [
  { to: "/app/program", label: "AI Code Generator" },
  { to: "/app/project", label: "Mini Project Generator" },
  { to: "/app/review", label: "AI Code Reviewer" },
  { to: "/app/convert", label: "Code Converter" },
  { to: "/app/notes", label: "Notes Generator" },
  { to: "/app/interview", label: "Interview Preparation" },
] as const;

const linkClass = "text-xs text-subtitle transition hover:text-primary";

export function SiteFooter() {
  const scrollTop = () =>
    window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <footer className="mt-10 border-t border-border pt-8" aria-labelledby="footer-title">
      <div className="grid grid-cols-2 gap-x-4 gap-y-7 md:grid-cols-4">
        <div className="col-span-2 md:col-span-1">
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-xl gradient-blue text-white">
              <Sparkles className="h-4 w-4" />
            </span>
            <h2 id="footer-title" className="text-sm font-semibold text-foreground">
              CodeMateAI
            </h2>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-subtitle">
            AI-powered developer toolkit that helps developers generate production-ready code, review
            programs, build projects and improve coding productivity.
          </p>
        </div>

        <FooterColumn title="AI Tools">
          {AI_TOOLS.map((t) => (
            <li key={t.to}>
              <Link to={t.to} className={linkClass}>
                {t.label}
              </Link>
            </li>
          ))}
        </FooterColumn>

        <FooterColumn title="Programming Languages">
          {FEATURED_LANGUAGES.map((l) => (
            <li key={l.slug}>
              <Link to="/app/program" search={{ language: l.slug }} className={linkClass}>
                {l.name} Generator
              </Link>
            </li>
          ))}
        </FooterColumn>

        <FooterColumn title="Developer Utilities">
          {UTILS.map((u) => (
            <li key={u.slug}>
              <Link to="/app/utils" search={{ tool: u.slug }} className={linkClass}>
                {u.name}
              </Link>
            </li>
          ))}
        </FooterColumn>
      </div>

      <div className="mt-8 flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <p className="text-[11px] text-subtitle">© 2026 CodeMateAI · Version 1.0</p>
          <p className="text-[11px] text-subtitle">Made with ❤️ by Mohini Rastogi</p>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <Link to="/app/legal" search={{ doc: "privacy" }} className={linkClass}>
            Privacy Policy
          </Link>
          <Link to="/app/legal" search={{ doc: "terms" }} className={linkClass}>
            Terms
          </Link>
          <Link to="/app/legal" search={{ doc: "contact" }} className={linkClass}>
            Contact
          </Link>
          <button
            type="button"
            onClick={scrollTop}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-[11px] font-semibold text-foreground shadow-soft transition active:scale-95"
          >
            <ArrowUp className="h-3 w-3" /> Back to Top
          </button>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <nav aria-label={title}>
      <h3 className="text-xs font-semibold uppercase tracking-wide text-foreground">{title}</h3>
      <ul className="mt-2.5 space-y-2">{children}</ul>
    </nav>
  );
}
