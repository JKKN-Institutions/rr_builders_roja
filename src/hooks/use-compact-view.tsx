"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface CompactViewContextType {
  isCompact: boolean;
  toggleCompact: () => void;
  mounted: boolean;
}

const CompactViewContext = createContext<CompactViewContextType | undefined>(undefined);

export function CompactViewProvider({ children }: { children: ReactNode }) {
  const [isCompact, setIsCompact] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Load from localStorage on mount - prevents hydration mismatch
  useEffect(() => {
    const stored = localStorage.getItem("buildwise-compact-view");
    if (stored !== null) {
      setIsCompact(stored === "true");
    }
    setMounted(true);
  }, []);

  const toggleCompact = () => {
    setIsCompact((prev) => {
      const newValue = !prev;
      localStorage.setItem("buildwise-compact-view", String(newValue));
      return newValue;
    });
  };

  return (
    <CompactViewContext.Provider value={{ isCompact, toggleCompact, mounted }}>
      {children}
    </CompactViewContext.Provider>
  );
}

export function useCompactView() {
  const context = useContext(CompactViewContext);
  if (context === undefined) {
    // Return safe defaults during SSR
    if (typeof window === "undefined") {
      return {
        isCompact: false,
        toggleCompact: () => {},
        mounted: false,
      };
    }
    throw new Error("useCompactView must be used within CompactViewProvider");
  }
  return context;
}
