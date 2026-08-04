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
  FlaskConical,
  Check,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
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

const EXAMPLE_IDEAS = [
  "Tic Tac Toe game",
  "Calculator",
  "To-Do List",
  "Weather App",
  "Quiz App",
  "Number Guessing Game",
];

const BROWSER_LANGS = ["JavaScript", "TypeScript", "HTML", "CSS"];

/** Smart defaults inferred from the project idea + language. */
function inferDefaults(idea: string, language: string) {
  const i = idea.toLowerCase();
  const isGame = /(game|tic tac toe|tictactoe|snake|puzzle|quiz|guess|hangman|memory|pong)/.test(i);
  const isApi = /(api|rest|backend|server|endpoint|crud service)/.test(i);
  const isData = /(data|analysis|chart|scraper|scraping|csv|pandas|ml|machine learning)/.test(i);
  const isWeb = /(web|website|dashboard|app|tracker|todo|to-do|list|blog|weather|calculator|clock|timer)/.test(i);
  const browser = BROWSER_LANGS.includes(language);

  const category = isGame
    ? "Game"
    : isApi
      ? "API"
      : isData
        ? "Data Science"
        : isWeb && browser
          ? "Web App"
          : browser
            ? "Web App"
            : "CLI Tool";

  const projectType = isApi
    ? "REST API"
    : browser
      ? "Web App"
      : isData
        ? "Script"
        : "CLI App";

  const hard = /(full[- ]stack|auth|realtime|real-time|compiler|interpreter|distributed|payment)/.test(i);
  const difficulty = hard ? "Hard" : isApi || isData ? "Medium" : "Easy";
  const size = hard ? "Medium" : "Small";

  return { category, projectType, difficulty, size };
}

/** Build a self-contained HTML document for the sandboxed live preview. */
function buildPreviewDoc(files: { path: string; content: string }[]) {
  const html = files.find((f) => /(^|\/)index\.html$/i.test(f.path)) ?? files.find((f) => /\.html$/i.test(f.path));
  if (!html) return null;
  const base = html.path.includes("/") ? html.path.slice(0, html.path.lastIndexOf("/") + 1) : "";
  const find = (ref: string) => {
    const clean = ref.replace(/^\.\//, "").split(/[?#]/)[0];
    return (
      files.find((f) => f.path === base + clean) ??
      files.find((f) => f.path === clean) ??
      files.find((f) => f.path.endsWith("/" + clean))
    );
  };
  let doc = html.content;
  doc = doc.replace(/<link[^>]*href=["']([^"']+\.css)["'][^>]*>/gi, (m, href: string) => {
    const f = find(href);
    return f ? `<style>\n${f.content}\n</style>` : m;
  });
  doc = doc.replace(
    /<script[^>]*src=["']([^"']+\.js)["'][^>]*>\s*<\/script>/gi,
    (m, src: string) => {
      const f = find(src);
      return f ? `<script>\n${f.content}\n</script>` : m;
    },
  );
  return doc;
}

/** Build a sandboxed document that runs the project's browser tests and reports results. */
function buildTestDoc(
  files: { path: string; content: string }[],
  tests: { name: string; code: string }[],
) {
  const js = files
    .filter((f) => /\.m?js$/i.test(f.path))
    .map((f) => f.content)
    .join("\n;\n");
  const payload = JSON.stringify(tests);
  return `<!doctype html><html><body><div id="app"></div><script>
try { ${js} } catch (e) { /* setup errors surface per test */ }
var __tests = ${payload};
var __results = __tests.map(function (t) {
  try {
    (0, eval)(t.code);
    return { name: t.name, passed: true, error: "" };
  } catch (e) {
    return { name: t.name, passed: false, error: (e && e.message) || String(e) };
  }
});
parent.postMessage({ __codemateTests: __results }, "*");
<\/script></body></html>`;
}

function ProjectPage() {
  const [idea, setIdea] = useState("");
  const [ideaError, setIdeaError] = useState("");
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [advancedTouched, setAdvancedTouched] = useState(false);
  const [language, setLanguage] = useState("Python");
  const [framework, setFramework] = useState("None");
  const [category, setCategory] = useState("CLI Tool");
  const [projectType, setProjectType] = useState("CLI App");
  const [difficulty, setDifficulty] = useState("Medium");
  const [size, setSize] = useState("Small");
  const [activeFile, setActiveFile] = useState(0);
  const [files, setFiles] = useState<{ path: string; content: string }[]>([]);
  const [projectName, setProjectName] = useState("");
  const [historyId, setHistoryId] = useState<string | null>(null);
  const [renaming, setRenaming] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [previewKey, setPreviewKey] = useState(0);
  const [testResults, setTestResults] = useState<
    { name: string; passed: boolean; error: string }[] | null
  >(null);
  const [runningTests, setRunningTests] = useState(false);
  const testFrame = useRef<HTMLIFrameElement>(null);
  const fn = useServerFn(generateProject);
  const regenFileFn = useServerFn(regenerateProjectFile);

  const mutation = useMutation({
    mutationFn: (input: {
      idea: string;
      language: string;
      framework?: string;
      category?: string;
      projectType?: string;
      difficulty?: string;
      size?: string;
    }) => fn({ data: input }),
    onError: (e: Error) => toast.error(e.message),
    onSuccess: (data) => {
      const entry = storage.addHistory({ kind: "project", title: data.projectName, data });
      setHistoryId(entry?.id ?? null);
      setProjectName(data.projectName);
      setFiles([...arr(data.files), ...arr(data.testFiles)]);
      setActiveFile(0);
      setEditing(false);
      setTestResults(null);
      setPreviewKey((k) => k + 1);
    },
  });

  const result = mutation.data;
  const currentFile = files[activeFile];
  const previewDoc = useMemo(() => (files.length ? buildPreviewDoc(files) : null), [files]);
  const browserTests = arr(result?.browserTests);

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      const data = e.data as { __codemateTests?: { name: string; passed: boolean; error: string }[] };
      if (data && Array.isArray(data.__codemateTests)) {
        setTestResults(data.__codemateTests);
        setRunningTests(false);
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  const runTests = () => {
    if (!browserTests.length) return;
    setRunningTests(true);
    setTestResults(null);
    const frame = testFrame.current;
    if (frame) frame.srcdoc = buildTestDoc(files, browserTests);
    window.setTimeout(() => setRunningTests(false), 6000);
  };

  const saveEdit = () => {
    if (!currentFile) return;
    const next = files.map((f, i) => (i === activeFile ? { ...f, content: draft } : f));
    setFiles(next);
    persist(projectName, next);
    setEditing(false);
    setPreviewKey((k) => k + 1);
    setTestResults(null);
    setShowPreview(true);
    toast.success("File saved — preview refreshed");
  };

  const regenFile = useMutation({
    mutationFn: (input: { path: string; currentContent: string }) =>
      regenFileFn({
        data: {
          projectName,
          idea,
          language,
          path: input.path,
          currentContent: input.currentContent,
          otherPaths: files.map((f) => f.path).filter((p) => p !== input.path),
        },
      }),
    onError: (e: Error) => toast.error(e.message),
    onSuccess: (file) => {
      const next = files.map((f) => (f.path === file.path ? { ...f, content: file.content } : f));
      setFiles(next);
      persist(projectName, next);
      toast.success("File regenerated");
    },
  });

  const persist = (name: string, nextFiles: { path: string; content: string }[]) => {
    if (!historyId || !result) return;
    storage.updateHistory(historyId, {
      title: name,
      data: { ...result, projectName: name, files: nextFiles },
    });
  };

  const run = () => {
    if (!idea.trim()) {
      setIdeaError("Tell us what you want to build");
      return;
    }
    setIdeaError("");
    const smart = inferDefaults(idea, language);
    mutation.mutate({
      idea: idea.trim(),
      language,
      framework: framework === "None" ? undefined : framework,
      category: advancedTouched ? category : smart.category,
      projectType: advancedTouched ? projectType : smart.projectType,
      difficulty: advancedTouched ? difficulty : smart.difficulty,
      size: advancedTouched ? size : smart.size,
    });
  };

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied");
    } catch {
      toast.error("Copy failed");
    }
  };

  const copyAll = () =>
    copy(files.map((f) => `// ===== ${f.path} =====\n${f.content}`).join("\n\n"));

  const downloadZip = async () => {
    if (!result) return;
    try {
      const zip = new JSZip();
      for (const f of files) zip.file(f.path, f.content);
      if (result.readme && !files.some((f) => /readme\.md$/i.test(f.path))) {
        zip.file("README.md", result.readme);
      }
      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${(projectName || "project").replace(/[^a-z0-9-_]+/gi, "-").toLowerCase()}.zip`;
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
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-subtitle">Project idea</span>
          <input
            value={idea}
            onChange={(e) => {
              setIdea(e.target.value);
              if (e.target.value.trim()) setIdeaError("");
            }}
            placeholder="What do you want to build? e.g. Tic Tac Toe game, Calculator, To-Do List, Weather App, Number Guessing Game"
            className={`w-full rounded-xl border bg-background px-3 py-3 text-sm text-foreground outline-none focus:border-primary ${
              ideaError ? "border-danger" : "border-border"
            }`}
          />
        </label>
        {ideaError ? (
          <p className="mt-1.5 text-xs font-medium text-danger">{ideaError}</p>
        ) : (
          <p className="mt-1.5 text-xs text-subtitle">
            Be as simple or specific as you like — &ldquo;Tic Tac Toe&rdquo; works, or &ldquo;Tic Tac
            Toe with score tracking and a reset button&rdquo;.
          </p>
        )}

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-subtitle">Try an example:</span>
          {EXAMPLE_IDEAS.map((e) => (
            <button
              key={e}
              onClick={() => {
                setIdea(e);
                setIdeaError("");
              }}
              className="rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-foreground transition hover:border-primary hover:text-primary"
            >
              {e}
            </button>
          ))}
        </div>

        <div className="mt-4">
          <Select label="Language" value={language} onChange={setLanguage} options={LANGUAGES} />
        </div>

        <div className="mt-4 rounded-2xl border border-border">
          <button
            onClick={() => setAdvancedOpen((v) => !v)}
            aria-expanded={advancedOpen}
            className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left"
          >
            <span className="text-sm font-medium text-foreground">Advanced options</span>
            <span className="flex items-center gap-2 text-xs text-subtitle">
              {advancedTouched ? "Custom" : "Auto"}
              <ChevronDown
                className={`h-4 w-4 transition ${advancedOpen ? "rotate-180" : ""}`}
              />
            </span>
          </button>
          {advancedOpen && (
            <div
              className="grid grid-cols-2 gap-3 border-t border-border p-4"
              onChange={() => setAdvancedTouched(true)}
            >
              <Select label="Framework" value={framework} onChange={setFramework} options={FRAMEWORKS} />
              <Select label="Category" value={category} onChange={setCategory} options={CATEGORIES} />
              <Select label="Project Type" value={projectType} onChange={setProjectType} options={PROJECT_TYPES} />
              <Select label="Difficulty" value={difficulty} onChange={setDifficulty} options={DIFFS} />
              <Select label="Size" value={size} onChange={setSize} options={SIZES} />
            </div>
          )}
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

          <SectionCard
            title="Project"
            action={
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setRenaming((v) => !v)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-foreground"
                >
                  <Pencil className="h-3 w-3" /> Rename
                </button>
                <button
                  onClick={run}
                  disabled={mutation.isPending}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-foreground disabled:opacity-60"
                >
                  <RefreshCw className={`h-3 w-3 ${mutation.isPending ? "animate-spin" : ""}`} />
                  {mutation.isPending ? "Regenerating..." : "Regenerate project"}
                </button>
              </div>
            }
          >
            {renaming ? (
              <input
                autoFocus
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                onBlur={() => {
                  setRenaming(false);
                  persist(projectName, files);
                  toast.success("Project renamed");
                }}
                className="mb-2 w-full rounded-xl border border-border bg-background px-3 py-2 text-base font-semibold text-foreground outline-none focus:border-primary"
              />
            ) : (
              <h2 className="mb-2 text-base font-semibold text-foreground">{projectName}</h2>
            )}
            <p className="text-sm leading-relaxed text-foreground">{result.description}</p>
          </SectionCard>

          {previewDoc && (
            <SectionCard
              title="Live Preview"
              action={
                <button
                  onClick={() => setShowPreview((v) => !v)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-foreground"
                >
                  <Play className="h-3 w-3" /> {showPreview ? "Hide" : "Run"}
                </button>
              }
            >
              {showPreview ? (
                <iframe
                  key={previewKey}
                  title="Project live preview"
                  srcDoc={previewDoc}
                  sandbox="allow-scripts allow-modals"
                  className="h-[420px] w-full rounded-2xl border border-border bg-white"
                />
              ) : (
                <p className="text-sm text-subtitle">Preview hidden.</p>
              )}
            </SectionCard>
          )}

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
              paths={files.map((f) => f.path)}
              onSelect={(p) => setActiveFile(Math.max(0, files.findIndex((f) => f.path === p)))}
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

          <SectionCard
            title="Files"
            action={
              <button
                onClick={copyAll}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-foreground"
              >
                <Copy className="h-3 w-3" /> Copy all
              </button>
            }
          >
            <div className="mb-3 -mx-1 flex gap-2 overflow-x-auto px-1">
              {files.map((f, i) => (
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
                  <ActionButton
                    icon={RefreshCw}
                    label={regenFile.isPending ? "Working..." : "Regenerate File"}
                    onClick={() =>
                      regenFile.mutate({ path: currentFile.path, currentContent: currentFile.content })
                    }
                  />
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
              {arr(result.dependencies).map((d) => (
                <span
                  key={d}
                  className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-foreground"
                >
                  {d}
                </span>
              ))}
            </div>
          </SectionCard>

          {arr(result.envVariables).length > 0 && (
            <SectionCard title="Environment Variables">
              <ul className="space-y-2">
                {arr(result.envVariables).map((e, i) => (
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
              {arr(result.installation).map((s, i) => (
                <li key={i} className="flex gap-2 text-sm text-foreground">
                  <span className="font-mono text-xs text-subtitle">{i + 1}.</span>
                  <code className="rounded bg-muted px-2 py-0.5 font-mono text-xs">{s}</code>
                </li>
              ))}
            </ol>
          </SectionCard>

          <SectionCard title="Execution Steps">
            <ol className="space-y-2">
              {arr(result.execution).map((s, i) => (
                <li key={i} className="flex gap-2 text-sm text-foreground">
                  <span className="font-mono text-xs text-subtitle">{i + 1}.</span>
                  <code className="rounded bg-muted px-2 py-0.5 font-mono text-xs">{s}</code>
                </li>
              ))}
            </ol>
          </SectionCard>

          <SectionCard title="Features">
            <ul className="space-y-2">
              {arr(result.features).map((f, i) => (
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
              {arr(result.futureScope).map((f, i) => (
                <li key={i} className="flex gap-2 text-sm text-foreground">
                  <span className="text-primary">→</span>
                  {f}
                </li>
              ))}
            </ul>
          </SectionCard>

          <button
            onClick={() => {
              storage.addBookmark({
                kind: "project",
                title: projectName,
                data: { ...result, projectName, files },
              });
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

function arr<T>(v: T[] | undefined | null): T[] {
  return Array.isArray(v) ? v : [];
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
