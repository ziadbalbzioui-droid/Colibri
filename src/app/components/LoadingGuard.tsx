import { useEffect, useState } from "react";
import { Loader2, RefreshCw, WifiOff } from "lucide-react";

interface LoadingGuardProps {
  /** Is the parent still loading? */
  loading: boolean;
  /** Optional error message — shown with a Retry button */
  error?: string | null;
  /** Called when user clicks "Réessayer" on an error */
  onRetry?: () => void;
  /** Seconds before the hard-reload button appears (default 5) */
  timeoutSeconds?: number;
  children: React.ReactNode;
}

/**
 * Wraps any async-loaded section.
 * - While loading: shows a spinner.
 * - If loading persists beyond `timeoutSeconds`: shows a hard-reload button.
 * - If error: shows the error + optional Retry button.
 * - Otherwise: renders children.
 */
export function LoadingGuard({
  loading,
  error,
  onRetry,
  timeoutSeconds = 5,
  children,
}: LoadingGuardProps) {
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    if (!loading) {
      setTimedOut(false);
      return;
    }
    const t = setTimeout(() => setTimedOut(true), timeoutSeconds * 1000);
    return () => clearTimeout(t);
  }, [loading, timeoutSeconds]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-6 text-muted-foreground">
        <div className="flex items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Chargement...</span>
        </div>

        {timedOut && (
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="flex items-center gap-2 text-amber-600 text-sm">
              <WifiOff className="w-4 h-4" />
              Le chargement prend trop de temps.
            </div>
            <button
              onClick={() => window.location.reload()}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Recharger la page
            </button>
          </div>
        )}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-700 flex items-center justify-between gap-4">
        <span className="text-sm">{error}</span>
        <div className="flex items-center gap-2 shrink-0">
          {onRetry && (
            <button
              onClick={onRetry}
              className="flex items-center gap-1.5 text-sm font-medium hover:underline"
            >
              <RefreshCw className="w-4 h-4" /> Réessayer
            </button>
          )}
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-1.5 text-sm font-medium text-red-900 hover:underline"
          >
            <RefreshCw className="w-4 h-4" /> Recharger
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
