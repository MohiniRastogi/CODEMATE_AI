import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import {
  Rocket,
  Save,
  Sparkles,
  Copy,
  Download,
  RefreshCw,
  FileCode2,
  Folder,
  FileText,
  ChevronDown,
  Play,
  Pencil,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import JSZip from "jszip";
import { generateProject, regenerateProjectFile } from "@/lib/ai.functions";
import { storage } from "@/lib/storage";
import {
  FeatureShell,
  GradientButton,
  LoadingShimmer,
  SectionCard,
} from "@/components/FeatureShell";
import { ErrorCard, FeatureErrorBoundary } from "@/components/FeatureError";
import { RelatedTools } from "@/components/RelatedTools";
import { CodeBlock } from "@/components/CodeBlock";


export const Route = createFileRoute("/app/project")({
  head: () => ({
    meta: [
      { title: "Mini Project Generator — CodeMateAI" },
      {
        name: "description",
        content:
          "Generate complete multi-file mini projects with README, folder structure, dependencies, database schema and source code.",
      },
    ],
  }),
  component: ProjectPage,
});

const LANGUAGES = ["Python", "Java", "JavaScript", "TypeScript", "C++", "Go", "Rust", "PHP"];
const FRAMEWORKS = ["None", "Flask", "Django", "FastAPI", "Express", "Next.js", "React", "Spring Boot", "Gin"];
const CATEGORIES = ["Web App", "CLI Tool", "Data Science", "Game", "API", "Automation", "AI/ML"];
const PROJECT_TYPES = ["CLI App", "REST API", "Web App", "Script", "Full-Stack", "Library"];
const SIZES = ["Small", "Medium", "Large"];
const DIFFS = ["Easy", "Medium", "Hard"];

function ProjectPage() {
  const [language, setLanguage] = useState("Python");
  const [framework, setFramework] = useState("None");
  const [category, setCategory] = useState("CLI Tool");
  const [projectType, setProjectType] = useState("CLI App");
  const [difficulty, setDifficulty] = useState("Medium");
  const [size, setSize] = useState("Small");
  const [activeFile, setActiveFile] = useState(0);
  const fn = useServerFn(generateProject);

  const mutation = useMutation({
    mutationFn: (input: {
      language: string;
      framework?: string;
      category: string;
      projectType?: string;
      difficulty: string;
      size: string;
    }) => fn({ data: input }),
    onError: (e: Error) => toast.error(e.message),
    onSuccess: (data) => {
      storage.addHistory({ kind: "project", title: data.projectName, data });
      setActiveFile(0);
    },
  });

  const result = mutation.data;
  const currentFile = result?.files?.[activeFile];

  const run = () =>
    mutation.mutate({
      language,
      framework: framework === "None" ? undefined : framework,
      category,
      projectType,
      difficulty,
      size,
    });

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied");
    } catch {
      toast.error("Copy failed");
    }
  };

  const downloadZip = async () => {
    if (!result) return;
    try {
      const zip = new JSZip();
      for (const f of result.files ?? []) zip.file(f.path, f.content);
      if (result.readme && !(result.files ?? []).some((f) => /readme\.md$/i.test(f.path))) {
        zip.file("README.md", result.readme);
      }
      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${result.projectName.replace(/[^a-z0-9-_]+/gi, "-").toLowerCase()}.zip`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Project downloaded");
    } catch {
      toast.error("Could not build the ZIP");
    }
  };

  return (
    <FeatureShell
      title="Mini Project Generator"
      subtitle="Real, multi-file projects in minutes"
      icon={Rocket}
      gradient="gradient-purple"
    >
      <div className="rounded-3xl border border-border bg-surface p-5 shadow-soft">
        <div className="grid grid-cols-2 gap-3">
          <Select label="Language" value={language} onChange={setLanguage} options={LANGUAGES} />
          <Select label="Framework" value={framework} onChange={setFramework} options={FRAMEWORKS} />
          <Select label="Category" value={category} onChange={setCategory} options={CATEGORIES} />
          <Select label="Project Type" value={projectType} onChange={setProjectType} options={PROJECT_TYPES} />
          <Select label="Difficulty" value={difficulty} onChange={setDifficulty} options={DIFFS} />
          <Select label="Size" value={size} onChange={setSize} options={SIZES} />
        </div>
        <div className="mt-4">
          <GradientButton gradient="gradient-purple" onClick={run} disabled={mutation.isPending}>
            <Sparkles className="h-4 w-4" />
            {mutation.isPending ? "Building..." : "Generate Project"}
          </GradientButton>
        </div>
      </div>

      {mutation.isPending && (
        <div className="mt-5">
          <LoadingShimmer lines={10} />
        </div>
      )}

      {mutation.isError && (
        <div className="mt-5">
          <ErrorCard message={(mutation.error as Error)?.message} onRetry={run} />
        </div>
      )}

      {result && (
        <FeatureErrorBoundary onReset={run}>
        <div className="mt-5 space-y-4">

          <SectionCard title={result.projectName}>
            <p className="text-sm leading-relaxed text-foreground">{result.description}</p>
          </SectionCard>

          <SectionCard
            title="Project Structure"
            action={
              <button
                onClick={downloadZip}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-foreground"
              >
                <Download className="h-3 w-3" /> Download ZIP
              </button>
            }
          >
            <FileTree
              paths={(result.files ?? []).map((f) => f.path)}
              onSelect={(p) =>
                setActiveFile(Math.max(0, (result.files ?? []).findIndex((f) => f.path === p)))
              }
            />
            {result.folderStructure && (
              <details className="mt-3">
                <summary className="cursor-pointer text-xs font-medium text-primary">
                  View raw folder structure
                </summary>
                <pre className="mt-2 overflow-x-auto rounded-xl bg-muted p-3 font-mono text-xs text-foreground">
                  {result.folderStructure}
                </pre>
              </details>
            )}
          </SectionCard>

          <SectionCard title="Files">
            <div className="mb-3 -mx-1 flex gap-2 overflow-x-auto px-1">
              {(result.files ?? []).map((f, i) => (
                <button
                  key={f.path + i}
                  onClick={() => setActiveFile(i)}
                  className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition ${
                    i === activeFile
                      ? "gradient-purple text-white shadow-glow"
                      : "border border-border bg-surface text-foreground"
                  }`}
                >
                  <FileCode2 className="h-3.5 w-3.5" />
                  {f.path}
                </button>
              ))}
            </div>
            {currentFile && (
              <>
                <CodeBlock code={currentFile.content} language={extLang(currentFile.path, language)} />
                <div className="mt-3 grid grid-cols-3 gap-2">
                  <ActionButton icon={Copy} label="Copy File" onClick={() => copy(currentFile.content)} />
                  <ActionButton
                    icon={Download}
                    label="Download ZIP"
                    onClick={downloadZip}
                  />
                  <ActionButton icon={RefreshCw} label="Regenerate" onClick={run} />
                </div>
              </>
            )}
          </SectionCard>

          {result.databaseSchema && result.databaseSchema.trim().length > 0 && (
            <SectionCard title="Database Schema">
              <CodeBlock code={result.databaseSchema} language="sql" />
            </SectionCard>
          )}

          <SectionCard title="Dependencies">
            <div className="flex flex-wrap gap-2">
              {(result.dependencies ?? []).map((d) => (
                <span
                  key={d}
                  className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-foreground"
                >
                  {d}
                </span>
              ))}
            </div>
          </SectionCard>

          {(result.envVariables ?? []).length > 0 && (
            <SectionCard title="Environment Variables">
              <ul className="space-y-2">
                {(result.envVariables ?? []).map((e, i) => (
                  <li key={i} className="text-sm text-foreground">
                    <code className="rounded bg-muted px-2 py-0.5 font-mono text-xs">{e.key}</code>
                    <span className="ml-2 text-xs text-subtitle">{e.description}</span>
                  </li>
                ))}
              </ul>
            </SectionCard>
          )}



          <SectionCard title="Installation">
            <ol className="space-y-2">
              {(result.installation ?? []).map((s, i) => (
                <li key={i} className="flex gap-2 text-sm text-foreground">
                  <span className="font-mono text-xs text-subtitle">{i + 1}.</span>
                  <code className="rounded bg-muted px-2 py-0.5 font-mono text-xs">{s}</code>
                </li>
              ))}
            </ol>
          </SectionCard>

          <SectionCard title="Execution Steps">
            <ol className="space-y-2">
              {(result.execution ?? []).map((s, i) => (
                <li key={i} className="flex gap-2 text-sm text-foreground">
                  <span className="font-mono text-xs text-subtitle">{i + 1}.</span>
                  <code className="rounded bg-muted px-2 py-0.5 font-mono text-xs">{s}</code>
                </li>
              ))}
            </ol>
          </SectionCard>

          <SectionCard title="Features">
            <ul className="space-y-2">
              {(result.features ?? []).map((f, i) => (
                <li key={i} className="flex gap-2 text-sm text-foreground">
                  <span className="text-success">✓</span>
                  {f}
                </li>
              ))}
            </ul>
          </SectionCard>

          <SectionCard title="README">
            <div className="max-h-96 overflow-auto whitespace-pre-wrap text-sm text-foreground">
              {result.readme}
            </div>
          </SectionCard>

          <SectionCard title="Future Scope">
            <ul className="space-y-2">
              {(result.futureScope ?? []).map((f, i) => (
                <li key={i} className="flex gap-2 text-sm text-foreground">
                  <span className="text-primary">→</span>
                  {f}
                </li>
              ))}
            </ul>
          </SectionCard>

          <button
            onClick={() => {
              storage.addBookmark({ kind: "project", title: result.projectName, data: result });
              toast.success("Saved to bookmarks");
            }}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-surface py-3 text-sm font-medium text-foreground shadow-soft"
          >
            <Save className="h-4 w-4 text-primary" /> Save Project
          </button>
        </div>
        </FeatureErrorBoundary>
      )}

      <RelatedTools current="/app/project" />
    </FeatureShell>

  );
}

function extLang(path: string, fallback: string) {
  const ext = path.split(".").pop()?.toLowerCase() ?? "";
  return EXT_MAP[ext] ?? fallback.toLowerCase();
}

const EXT_MAP: Record<string, string> = {
  py: "python",
  js: "javascript",
  jsx: "jsx",
  ts: "typescript",
  tsx: "tsx",
  java: "java",
  c: "c",
  cpp: "cpp",
  h: "c",
  go: "go",
  rs: "rust",
  php: "php",
  html: "html",
  css: "css",
  sql: "sql",
  json: "json",
  md: "markdown",
  yml: "yaml",
  yaml: "yaml",
  sh: "bash",
  txt: "text",
};

type TreeNode = { name: string; path: string; children: TreeNode[]; isFile: boolean };

function buildTree(paths: string[]): TreeNode[] {
  const root: TreeNode[] = [];
  for (const full of paths) {
    const parts = full.split("/").filter(Boolean);
    let level = root;
    parts.forEach((part, i) => {
      const isFile = i === parts.length - 1;
      let node = level.find((n) => n.name === part && n.isFile === isFile);
      if (!node) {
        node = { name: part, path: full, children: [], isFile };
        level.push(node);
      }
      level = node.children;
    });
  }
  return root;
}

function FileTree({ paths, onSelect }: { paths: string[]; onSelect: (path: string) => void }) {
  const tree = buildTree(paths);
  if (tree.length === 0) return null;
  return (
    <ul className="rounded-xl bg-muted p-3 font-mono text-xs text-foreground">
      <TreeLevel nodes={tree} depth={0} onSelect={onSelect} />
    </ul>
  );
}

function TreeLevel({
  nodes,
  depth,
  onSelect,
}: {
  nodes: TreeNode[];
  depth: number;
  onSelect: (path: string) => void;
}) {
  return (
    <>
      {nodes.map((n) => (
        <li key={n.path + n.name + depth}>
          {n.isFile ? (
            <button
              onClick={() => onSelect(n.path)}
              style={{ paddingLeft: depth * 14 }}
              className="flex w-full items-center gap-1.5 rounded py-0.5 text-left transition hover:text-primary"
            >
              <FileText className="h-3 w-3 shrink-0 text-subtitle" /> {n.name}
            </button>
          ) : (
            <div
              style={{ paddingLeft: depth * 14 }}
              className="flex items-center gap-1.5 py-0.5 font-semibold"
            >
              <Folder className="h-3 w-3 shrink-0 text-primary" /> {n.name}/
            </div>
          )}
          {n.children.length > 0 && (
            <ul>
              <TreeLevel nodes={n.children} depth={depth + 1} onSelect={onSelect} />
            </ul>
          )}
        </li>
      ))}
    </>
  );
}

function ActionButton({
  icon: Icon,
  label,
  onClick,
}: {
  icon: typeof Rocket;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-center gap-1 rounded-2xl border border-border bg-surface py-3 text-xs font-medium text-foreground shadow-soft transition active:scale-95"
    >
      <Icon className="h-4 w-4 text-primary" />
      {label}
    </button>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-subtitle">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm font-medium text-foreground"
      >
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </label>
  );
}
