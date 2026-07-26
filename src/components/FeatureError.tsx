import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

/** Friendly, retryable error card used by every AI feature page. */
export function ErrorCard({
  title = "Something went wrong",
  message,
  onRetry,
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="rounded-3xl border border-danger/30 bg-danger/5 p-5 text-center">
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-danger/10 text-danger">
        <AlertTriangle className="h-5 w-5" />
      </div>
      <h3 className="mt-3 text-sm font-semibold text-foreground">{title}</h3>
      <p className="mt-1 text-sm text-subtitle">
        {message || "The AI request failed. Please try again in a moment."}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-4 py-2 text-sm font-semibold text-foreground shadow-soft"
        >
          <RefreshCw className="h-4 w-4 text-primary" /> Try again
        </button>
      )}
    </div>
  );
}

type BoundaryProps = { children: ReactNode; onReset?: () => void };
type BoundaryState = { error: Error | null };

/** Prevents any render-time crash (including object-as-child) from blanking the page. */
export class FeatureErrorBoundary extends Component<BoundaryProps, BoundaryState> {
  state: BoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): BoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[FeatureErrorBoundary]", error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <ErrorCard
          title="This section could not be displayed"
          message="The AI returned an unexpected response. Try generating again."
          onRetry={() => {
            this.setState({ error: null });
            this.props.onReset?.();
          }}
        />
      );
    }
    return this.props.children;
  }
}
