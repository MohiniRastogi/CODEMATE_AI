import { Link, useRouter } from "@tanstack/react-router";
import { ArrowLeft, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export function FeatureShell({
  title,
  subtitle,
  icon: Icon,
  gradient,
  children,
}: {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  gradient: string;
  children: ReactNode;
}) {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-background pb-24">
      <div className={`${gradient} px-5 pt-[calc(env(safe-area-inset-top)+16px)] pb-8`}>
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.history.back()}
            className="grid h-10 w-10 place-items-center rounded-full bg-white/25 text-white backdrop-blur"
            aria-label="Back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 text-white">
              <Icon className="h-5 w-5 shrink-0" />
              <h1 className="truncate text-xl font-semibold">{title}</h1>
            </div>
            <p className="mt-0.5 truncate text-sm text-white/80">{subtitle}</p>
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-2xl px-4 pt-5">{children}</div>
    </div>
  );
}

export function EmptyState({
  title,
  description,
  emoji = "✨",
  action,
}: {
  title: string;
  description: string;
  emoji?: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-dashed border-border bg-surface p-8 text-center">
      <div className="mx-auto grid h-16 w-16 place-items-center rounded-full gradient-blue text-3xl">
        <span>{emoji}</span>
      </div>
      <h3 className="mt-4 text-base font-semibold text-foreground">{title}</h3>
      <p className="mt-1 text-sm text-subtitle">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function LoadingShimmer({ lines = 6 }: { lines?: number }) {
  return (
    <div className="space-y-3 rounded-3xl border border-border bg-surface p-5">
      <div className="shimmer h-5 w-1/3 rounded-full" />
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="shimmer h-3 rounded-full"
          style={{ width: `${65 + ((i * 13) % 30)}%` }}
        />
      ))}
    </div>
  );
}

export function GradientButton({
  onClick,
  disabled,
  children,
  gradient = "gradient-blue",
  className = "",
  type = "button",
}: {
  onClick?: () => void;
  disabled?: boolean;
  children: ReactNode;
  gradient?: string;
  className?: string;
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${gradient} inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold text-white shadow-glow transition active:scale-[0.98] disabled:opacity-60 ${className}`}
    >
      {children}
    </button>
  );
}

export function SectionCard({
  title,
  children,
  action,
}: {
  title: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-border bg-surface p-5 shadow-soft">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-subtitle">{title}</h3>
        {action}
      </div>
      {children}
    </section>
  );
}

export function BackHomeLink() {
  return (
    <Link
      to="/app"
      className="inline-flex items-center gap-1.5 text-sm font-medium text-primary"
    >
      <ArrowLeft className="h-4 w-4" /> Back to home
    </Link>
  );
}
