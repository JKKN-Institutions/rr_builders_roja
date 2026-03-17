"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

/**
 * Next.js Error Page
 * Handles runtime errors in the application
 * Automatically wraps route segments
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to console (can be sent to error tracking service)
    console.error("Application error:", error);

    // TODO: Send to error tracking service (Sentry, LogRocket, etc.)
    // trackError(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full space-y-6">
        {/* Error Icon */}
        <div className="flex justify-center">
          <div className="rounded-full bg-destructive/10 p-4">
            <AlertTriangle className="h-12 w-12 text-destructive" />
          </div>
        </div>

        {/* Error Message */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-foreground">
            Oops! Something went wrong
          </h1>
          <p className="text-muted-foreground">
            We encountered an unexpected error while loading this page.
            Please try again or return to the dashboard.
          </p>
        </div>

        {/* Error Details (development only) */}
        {process.env.NODE_ENV === "development" && (
          <div className="space-y-2">
            <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
              <p className="text-sm font-semibold text-destructive mb-2">
                Error Details:
              </p>
              <p className="text-xs font-mono text-destructive/80 break-all">
                {error.message}
              </p>
              {error.digest && (
                <p className="text-xs text-muted-foreground mt-2">
                  Error ID: {error.digest}
                </p>
              )}
            </div>
            {error.stack && (
              <details className="rounded-lg border border-border bg-muted/50 p-4">
                <summary className="text-xs font-semibold cursor-pointer text-muted-foreground hover:text-foreground">
                  Stack Trace
                </summary>
                <pre className="text-xs mt-2 overflow-auto text-muted-foreground">
                  {error.stack}
                </pre>
              </details>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={reset}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium touch-manipulation min-h-[44px]"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </button>

          <Link
            href="/dashboard"
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors font-medium touch-manipulation min-h-[44px]"
          >
            <Home className="h-4 w-4" />
            Go to Dashboard
          </Link>
        </div>

        {/* BuildWise Footer */}
        <div className="text-center text-xs text-muted-foreground pt-4 border-t border-border">
          <p className="font-semibold">BuildWise Cashflow</p>
          <p>RR Thulasi Builders</p>
        </div>
      </div>
    </div>
  );
}
