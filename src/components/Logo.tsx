import { cn } from "@/lib/utils";

type MarkProps = {
  className?: string;
  /** "gradient" (default), "mono-dark" or "mono-light" */
  variant?: "gradient" | "mono-dark" | "mono-light";
  title?: string;
};

/**
 * CodeMate AI brand mark — a neural node triad enclosed by code brackets.
 * Flat vector, no shadows, readable down to 16px.
 */
export function LogoMark({ className, variant = "gradient", title = "CodeMate AI" }: MarkProps) {
  const id = `cm-grad-${variant}`;
  const stroke = variant === "gradient" ? `url(#${id})` : "currentColor";
  return (
    <svg
      viewBox="0 0 48 48"
      role="img"
      aria-label={title}
      className={cn(
        "size-10",
        variant === "mono-dark" && "text-foreground",
        variant === "mono-light" && "text-white",
        className,
      )}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={id} x1="8" y1="8" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FF6FAE" />
          <stop offset="1" stopColor="#FFB6D9" />
        </linearGradient>
      </defs>
      <g stroke={stroke} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 7h-2.5C12 7 11 8.4 11 11v7.5c0 2.6-1 4-3 5.5 2 1.5 3 2.9 3 5.5V37c0 2.6 1 4 3.5 4H17" />
        <path d="M31 7h2.5C36 7 37 8.4 37 11v7.5c0 2.6 1 4 3 5.5-2 1.5-3 2.9-3 5.5V37c0 2.6-1 4-3.5 4H31" />
        <path d="M24 18.5v4M21.4 29.2l1.6-2.4M26.6 29.2L25 26.8" strokeWidth="2.4" />
      </g>
      <g fill={stroke}>
        <circle cx="24" cy="15.6" r="3.2" />
        <circle cx="19.4" cy="31.2" r="2.8" />
        <circle cx="28.6" cy="31.2" r="2.8" />
      </g>
    </svg>
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