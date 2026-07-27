import { createFileRoute, Link } from "@tanstack/react-router";
import { Wrench } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { FeatureShell, GradientButton, SectionCard } from "@/components/FeatureShell";
import { UTILS, resolveUtil, type UtilSlug } from "@/lib/devtools";

export const Route = createFileRoute("/app/utils")({
  validateSearch: (search: Record<string, unknown>) => ({
    tool: typeof search.tool === "string" ? search.tool : undefined,
  }),
  head: ({ match }) => {
    const tool = resolveUtil(match.search?.tool);
    const title = `${tool.name} — Developer Utilities | CodeMateAI`;
    const description = `Free online ${tool.name}. Fast, private developer utilities that run entirely in your browser.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: UtilsPage,
});

function UtilsPage() {
  const { tool } = Route.useSearch();
  const active = resolveUtil(tool);

  return (
    <FeatureShell
      title={active.name}
      subtitle="Developer utilities that run in your browser"
      icon={Wrench}
      gradient="gradient-sky"
    >
      <nav aria-label="Developer utilities" className="mb-4 flex flex-wrap gap-2">
        {UTILS.map((u) => (
          <Link
            key={u.slug}
            to="/app/utils"
            search={{ tool: u.slug }}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
              u.slug === active.slug
                ? "gradient-sky text-white shadow-glow"
                : "border border-border bg-surface text-foreground"
            }`}
          >
            {u.name}
          </Link>
        ))}
      </nav>

      <SectionCard title={active.name}>
        <UtilBody slug={active.slug} />
      </SectionCard>
    </FeatureShell>
  );
}

function UtilBody({ slug }: { slug: UtilSlug }) {
  switch (slug) {
    case "json-formatter":
      return <JsonTool mode="format" />;
    case "json-validator":
      return <JsonTool mode="validate" />;
    case "uuid-generator":
      return <UuidTool />;
    case "hash-generator":
      return <HashTool />;
    case "base64-encoder":
      return <Base64Tool />;
    case "gradient-generator":
      return <GradientTool />;
    case "color-picker":
      return <ColorTool />;
    case "password-generator":
      return <PasswordTool />;
    default:
      return null;
  }
}

const inputClass =
  "w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground";
const outputClass =
  "mt-3 max-h-72 overflow-auto whitespace-pre-wrap break-all rounded-xl bg-muted p-3 font-mono text-xs text-foreground";

function copyText(text: string) {
  navigator.clipboard
    .writeText(text)
    .then(() => toast.success("Copied"))
    .catch(() => toast.error("Copy failed"));
}

function CopyRow({ value }: { value: string }) {
  if (!value) return null;
  return (
    <button onClick={() => copyText(value)} className="mt-2 text-xs font-semibold text-primary">
      Copy result
    </button>
  );
}

function JsonTool({ mode }: { mode: "format" | "validate" }) {
  const [text, setText] = useState('{"name":"CodeMateAI","version":1}');
  const result = useMemo(() => {
    if (!text.trim()) return { ok: true, message: "", output: "" };
    try {
      const parsed = JSON.parse(text);
      return {
        ok: true,
        message: "Valid JSON",
        output: mode === "format" ? JSON.stringify(parsed, null, 2) : "",
      };
    } catch (e) {
      return { ok: false, message: (e as Error).message, output: "" };
    }
  }, [text, mode]);

  return (
    <div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={6}
        className={`${inputClass} resize-none font-mono`}
        placeholder="Paste JSON here"
      />
      <p className={`mt-3 text-sm font-medium ${result.ok ? "text-success" : "text-danger"}`}>
        {result.message}
      </p>
      {result.output && <pre className={outputClass}>{result.output}</pre>}
      <CopyRow value={result.output} />
    </div>
  );
}

function UuidTool() {
  const [list, setList] = useState<string[]>([]);
  const generate = () =>
    setList(Array.from({ length: 5 }, () => crypto.randomUUID()));
  return (
    <div>
      <GradientButton onClick={generate}>Generate 5 UUIDs</GradientButton>
      {list.length > 0 && <pre className={outputClass}>{list.join("\n")}</pre>}
      <CopyRow value={list.join("\n")} />
    </div>
  );
}

function HashTool() {
  const [text, setText] = useState("");
  const [algo, setAlgo] = useState("SHA-256");
  const [hash, setHash] = useState("");
  const run = async () => {
    const buf = await crypto.subtle.digest(algo, new TextEncoder().encode(text));
    setHash(
      Array.from(new Uint8Array(buf))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join(""),
    );
  };
  return (
    <div>
      <div className="grid grid-cols-2 gap-3">
        <select value={algo} onChange={(e) => setAlgo(e.target.value)} className={inputClass}>
          {["SHA-1", "SHA-256", "SHA-384", "SHA-512"].map((a) => (
            <option key={a}>{a}</option>
          ))}
        </select>
        <GradientButton onClick={run}>Hash</GradientButton>
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={4}
        placeholder="Text to hash"
        className={`${inputClass} mt-3 resize-none`}
      />
      {hash && <pre className={outputClass}>{hash}</pre>}
      <CopyRow value={hash} />
    </div>
  );
}

function Base64Tool() {
  const [text, setText] = useState("");
  const [decode, setDecode] = useState(false);
  const output = useMemo(() => {
    if (!text) return "";
    try {
      return decode
        ? new TextDecoder().decode(Uint8Array.from(atob(text), (c) => c.charCodeAt(0)))
        : btoa(String.fromCharCode(...new TextEncoder().encode(text)));
    } catch {
      return "Invalid input";
    }
  }, [text, decode]);
  return (
    <div>
      <div className="flex gap-2">
        {[false, true].map((d) => (
          <button
            key={String(d)}
            onClick={() => setDecode(d)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
              decode === d
                ? "gradient-sky text-white shadow-glow"
                : "border border-border bg-surface text-foreground"
            }`}
          >
            {d ? "Decode" : "Encode"}
          </button>
        ))}
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={4}
        placeholder={decode ? "Base64 to decode" : "Text to encode"}
        className={`${inputClass} mt-3 resize-none`}
      />
      {output && <pre className={outputClass}>{output}</pre>}
      <CopyRow value={output} />
    </div>
  );
}

function GradientTool() {
  const [from, setFrom] = useState("#4f7cff");
  const [to, setTo] = useState("#9b5cff");
  const [angle, setAngle] = useState(135);
  const css = `background: linear-gradient(${angle}deg, ${from}, ${to});`;
  return (
    <div>
      <div
        className="h-24 rounded-2xl border border-border"
        style={{ background: `linear-gradient(${angle}deg, ${from}, ${to})` }}
      />
      <div className="mt-3 grid grid-cols-3 gap-3">
        <input type="color" value={from} onChange={(e) => setFrom(e.target.value)} className="h-10 w-full rounded-xl border border-border bg-background" aria-label="From colour" />
        <input type="color" value={to} onChange={(e) => setTo(e.target.value)} className="h-10 w-full rounded-xl border border-border bg-background" aria-label="To colour" />
        <input
          type="number"
          value={angle}
          min={0}
          max={360}
          onChange={(e) => setAngle(Number(e.target.value))}
          className={inputClass}
          aria-label="Angle"
        />
      </div>
      <pre className={outputClass}>{css}</pre>
      <CopyRow value={css} />
    </div>
  );
}

function ColorTool() {
  const [color, setColor] = useState("#4f7cff");
  const rgb = useMemo(() => {
    const n = parseInt(color.slice(1), 16);
    return `rgb(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255})`;
  }, [color]);
  return (
    <div>
      <div className="h-24 rounded-2xl border border-border" style={{ background: color }} />
      <input
        type="color"
        value={color}
        onChange={(e) => setColor(e.target.value)}
        className="mt-3 h-10 w-full rounded-xl border border-border bg-background"
        aria-label="Pick a colour"
      />
      <pre className={outputClass}>{`${color}\n${rgb}`}</pre>
      <CopyRow value={color} />
    </div>
  );
}

function PasswordTool() {
  const [length, setLength] = useState(16);
  const [password, setPassword] = useState("");
  const generate = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-_=+";
    const bytes = crypto.getRandomValues(new Uint32Array(length));
    setPassword(Array.from(bytes, (b) => chars[b % chars.length]).join(""));
  };
  return (
    <div>
      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-subtitle">Length</span>
          <input
            type="number"
            min={6}
            max={64}
            value={length}
            onChange={(e) => setLength(Math.min(64, Math.max(6, Number(e.target.value) || 6)))}
            className={inputClass}
          />
        </label>
        <div className="flex items-end">
          <GradientButton onClick={generate}>Generate</GradientButton>
        </div>
      </div>
      {password && <pre className={outputClass}>{password}</pre>}
      <CopyRow value={password} />
    </div>
  );
}
