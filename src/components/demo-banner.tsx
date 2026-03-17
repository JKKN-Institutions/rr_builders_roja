"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { X, Info } from "lucide-react";

/**
 * Demo Banner Component
 * Displays a dismissible demo mode indicator with tooltip
 * Stores dismissed state in localStorage
 */
export function DemoBanner() {
  const [isDismissed, setIsDismissed] = useState(true);

  useEffect(() => {
    const dismissed = localStorage.getItem("demo-banner-dismissed");
    setIsDismissed(dismissed === "true");
  }, []);

  const handleDismiss = () => {
    localStorage.setItem("demo-banner-dismissed", "true");
    setIsDismissed(true);
  };

  if (isDismissed) return null;

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2 bg-amber-100 dark:bg-amber-950 border border-amber-300 dark:border-amber-800 px-3 py-1.5 rounded-md">
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-1.5 cursor-help">
              <Info className="h-3.5 w-3.5 text-amber-700 dark:text-amber-400" />
              <Badge
                className="bg-amber-500 hover:bg-amber-600 text-white border-0 text-xs font-bold"
              >
                DEMO
              </Badge>
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-xs">
            <p className="text-xs">Demo mode uses simulated construction data. Real Tally integration available in production.</p>
          </TooltipContent>
        </Tooltip>
        <button
          onClick={handleDismiss}
          className="ml-1 p-0.5 hover:bg-amber-200 dark:hover:bg-amber-900 rounded transition-colors"
          aria-label="Dismiss demo banner"
        >
          <X className="h-3.5 w-3.5 text-amber-700 dark:text-amber-400" />
        </button>
      </div>
    </TooltipProvider>
  );
}

/**
 * Demo Footer Component
 * Subtle disclaimer for demo mode
 */
export function DemoFooter() {
  return (
    <div className="mt-8 pt-4 border-t border-border">
      <p className="text-xs text-center text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <Info className="h-3 w-3" aria-hidden="true" />
          <span>
            <strong className="text-amber-600 dark:text-amber-500">Demo Mode:</strong> Using simulated data. Real Tally integration available in production.
          </span>
        </span>
      </p>
    </div>
  );
}
