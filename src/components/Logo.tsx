import { cn } from "@/lib/utils";
import markAsset from "@/assets/codemate-mark.png.asset.json";

type MarkProps = {
  className?: string;
  /** "gradient" (default), "mono-dark" or "mono-light" */
  variant?: "gradient" | "mono-dark" | "mono-light";
  title?: string;
};

/** CodeMate AI brand mark — robot inside code brackets. */
export function LogoMark({ className, title = "CodeMate AI" }: MarkProps) {
  return (
    <img
      src={markAsset.url}
      alt={title}
      width={48}
      height={48}
      className={cn("size-10 object-contain", className)}
    />
  );
}

type LogoProps = MarkProps & { markClassName?: string; textClassName?: string };

/** Horizontal lockup: mark + "CodeMate" (charcoal) + "AI" (pink gradient). */
export function Logo({ className, markClassName, textClassName, variant = "gradient" }: LogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <LogoMark variant={variant} className={cn("size-8", markClassName)} />
      <span className={cn("text-xl font-bold tracking-tight", textClassName)}>
        <span className={variant === "mono-light" ? "text-white" : "text-foreground"}>CodeMate</span>
        <span className={variant === "gradient" ? "text-brand-gradient" : undefined}> AI</span>
      </span>
    </span>
  );
}