import { createFileRoute, Link } from "@tanstack/react-router";
import { FileText } from "lucide-react";
import { FeatureShell, SectionCard } from "@/components/FeatureShell";

const DOCS = {
  privacy: {
    name: "Privacy Policy",
    body: [
      "CodeMateAI stores your generation history and bookmarks on your own device using browser storage. We do not keep a server-side copy of your prompts or generated code.",
      "Prompts you submit are sent to an AI provider solely to produce a response. They are not used to build a profile of you and are not sold or shared with advertisers.",
      "Clearing your browser storage — or using the Clear History action in Settings — permanently removes your local data.",
    ],
  },
  terms: {
    name: "Terms of Service",
    body: [
      "CodeMateAI is provided as-is for educational and productivity purposes. AI-generated code may contain mistakes, so always review and test it before using it in production.",
      "You are responsible for the prompts you submit and for complying with the licences of any code you ship.",
      "We may adjust or limit access to features to keep the service available for everyone.",
    ],
  },
  contact: {
    name: "Contact",
    body: [
      "Questions, bug reports and feature requests are welcome.",
      "Email: hello@codemateai.app",
      "Built and maintained by Mohini Rastogi.",
    ],
  },
} as const;

type DocKey = keyof typeof DOCS;

function resolveDoc(input?: string | null): DocKey {
  return input && input in DOCS ? (input as DocKey) : "privacy";
}

export const Route = createFileRoute("/app/legal")({
  validateSearch: (search: Record<string, unknown>) => ({
    doc: typeof search.doc === "string" ? search.doc : undefined,
  }),
  head: ({ match }) => {
    const doc = DOCS[resolveDoc(match.search?.doc)];
    const title = `${doc.name} — CodeMateAI`;
    const description = `${doc.name} for CodeMateAI, the AI-powered developer toolkit.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: LegalPage,
});

function LegalPage() {
  const { doc } = Route.useSearch();
  const key = resolveDoc(doc);
  const active = DOCS[key];

  return (
    <FeatureShell
      title={active.name}
      subtitle="CodeMateAI policies and support"
      icon={FileText}
      gradient="gradient-purple"
    >
      <nav aria-label="Legal pages" className="mb-4 flex flex-wrap gap-2">
        {(Object.keys(DOCS) as DocKey[]).map((k) => (
          <Link
            key={k}
            to="/app/legal"
            search={{ doc: k }}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
              k === key
                ? "gradient-purple text-white shadow-glow"
                : "border border-border bg-surface text-foreground"
            }`}
          >
            {DOCS[k].name}
          </Link>
        ))}
      </nav>
      <SectionCard title={active.name}>
        <div className="space-y-3">
          {active.body.map((p, i) => (
            <p key={i} className="text-sm leading-relaxed text-foreground">
              {p}
            </p>
          ))}
        </div>
      </SectionCard>
    </FeatureShell>
  );
}
