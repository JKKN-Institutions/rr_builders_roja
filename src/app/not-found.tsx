"use client";

import { FileQuestion, Home, ArrowLeft } from "lucide-react";
import Link from "next/link";

/**
 * Next.js 404 Not Found Page
 * Displayed when a route doesn't exist
 */
export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full space-y-6">
        {/* 404 Icon */}
        <div className="flex justify-center">
          <div className="rounded-full bg-accent/10 p-4">
            <FileQuestion className="h-12 w-12 text-accent" />
          </div>
        </div>

        {/* 404 Message */}
        <div className="text-center space-y-2">
          <h1 className="text-6xl font-bold text-primary">404</h1>
          <h2 className="text-2xl font-bold text-foreground">
            Page Not Found
          </h2>
          <p className="text-muted-foreground">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
        </div>

        {/* Helpful Links */}
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm font-semibold text-card-foreground mb-3">
            You might be looking for:
          </p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              <Link href="/dashboard" className="hover:text-primary transition-colors">
                Dashboard
              </Link>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              <Link href="/dashboard/projects" className="hover:text-primary transition-colors">
                Projects
              </Link>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              <Link href="/dashboard/wip" className="hover:text-primary transition-colors">
                WIP Analysis
              </Link>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              <Link href="/dashboard/tally" className="hover:text-primary transition-colors">
                Tally Integration
              </Link>
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Link
            href="/dashboard"
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium touch-manipulation min-h-[44px]"
          >
            <Home className="h-4 w-4" />
            Go to Dashboard
          </Link>

          <button
            onClick={() => window.history.back()}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors font-medium touch-manipulation min-h-[44px]"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </button>
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
