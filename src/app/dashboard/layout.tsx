"use client";

import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Bell, Wifi, WifiOff } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { CompactViewProvider } from "@/hooks/use-compact-view";
import { BottomNavbar } from "@/components/BottomNav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    setIsOnline(navigator.onLine);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <CompactViewProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 items-center gap-2 sm:gap-4 border-b bg-background px-3 sm:px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="h-6 hidden sm:block" />

          <div className="flex-1" />

          {/* Connection Status */}
          <div className="flex items-center gap-1 sm:gap-2 text-sm">
            {isOnline ? (
              <>
                <Wifi className="h-4 w-4 text-green-600" />
                <span className="hidden text-muted-foreground sm:inline text-xs sm:text-sm">
                  Online
                </span>
              </>
            ) : (
              <>
                <WifiOff className="h-4 w-4 text-red-600" />
                <Badge variant="destructive" className="text-xs">Offline</Badge>
              </>
            )}
          </div>

          {/* Notifications */}
          <button
            className="relative p-2 hover:bg-muted rounded-md touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center"
            onClick={() => {
              toast.info("Notifications coming soon");
            }}
            title="Notifications coming soon"
          >
            <Bell className="h-5 w-5" />
            <span className="sr-only">Notifications</span>
          </button>
        </header>

        <main className="flex-1 overflow-auto p-4 md:p-6 pb-24 lg:pb-6">
          {!isOnline && (
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950 p-3 text-xs sm:text-sm text-amber-800 dark:text-amber-200">
              <WifiOff className="h-4 w-4 shrink-0" />
              <span>You&apos;re offline. Data may not be current.</span>
            </div>
          )}
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </main>
      </SidebarInset>

      {/* Mobile Bottom Navigation */}
      <BottomNavbar />
    </SidebarProvider>
    </CompactViewProvider>
  );
}
