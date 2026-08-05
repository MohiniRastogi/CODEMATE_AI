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
        <linearGradient id={id} x1="6" y1="6" x2="42" y2="42" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FF6FAE" />
          <stop offset="1" stopColor="#FFB6D9" />
        </linearGradient>
      </defs>
      <g stroke={stroke} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18.5 7.5C13.5 7.5 13 11.5 13 15.5c0 4-4 5-4 8.5s4 4.5 4 8.5c0 4 .5 8 5.5 8" />
        <path d="M29.5 7.5c5 0 5.5 4 5.5 8 0 4 4 5 4 8.5s-4 4.5-4 8.5c0 4-.5 8-5.5 8" />
        <path d="M24 16.5v4.2M19.2 29.6l3.1-4M28.8 29.6l-3.1-4" strokeWidth="2.6" />
      </g>
      <g fill={stroke}>
        <circle cx="24" cy="14.6" r="3.1" />
        <circle cx="18.2" cy="31.4" r="2.6" />
        <circle cx="29.8" cy="31.4" r="2.6" />
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