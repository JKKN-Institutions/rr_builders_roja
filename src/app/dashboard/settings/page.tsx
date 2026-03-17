"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Shield,
  Database,
  User,
  Building2,
  Download,
  Trash2,
  Monitor,
  Moon,
  Sun,
} from "lucide-react";
import { toast } from "sonner";
import { useCompactView } from "@/hooks/use-compact-view";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";

interface CompanyInfo {
  companyName: string;
  tallyCompany: string | null;
  projectCount: number;
  lastSyncAt: string | null;
}

export default function SettingsPage() {
  const { user } = useAuth();
  const { isCompact, toggleCompact } = useCompactView();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);

  // Password change state
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch company info
  useEffect(() => {
    if (!user?.clientId) return;

    const fetchCompanyInfo = async () => {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();

      // Fetch company name from clients table
      const { data: client } = await supabase
        .from("clients")
        .select("company_name, tally_company")
        .eq("id", user.clientId)
        .single();

      // Fetch project count
      const { count: projectCount } = await supabase
        .from("projects")
        .select("id", { count: "exact", head: true })
        .eq("client_id", user.clientId);

      // Fetch last sync time
      const { data: lastVoucher } = await supabase
        .from("tally_vouchers")
        .select("synced_at")
        .eq("client_id", user.clientId)
        .order("synced_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      setCompanyInfo({
        companyName: client?.company_name ?? "Unknown Company",
        tallyCompany: client?.tally_company ?? null,
        projectCount: projectCount ?? 0,
        lastSyncAt: lastVoucher?.synced_at ?? null,
      });
    };

    fetchCompanyInfo();
  }, [user?.clientId]);

  // Export settings to JSON
  const handleExportSettings = () => {
    const settings = {
      display: {
        compactView: isCompact,
        theme: theme ?? "system",
      },
      exportedAt: new Date().toISOString(),
      version: "MVP 1.0.0",
    };

    const dataStr = JSON.stringify(settings, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `buildwise-settings-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success("Settings exported successfully");
  };

  // Clear cache (preserving auth tokens)
  const handleClearCache = async () => {
    try {
      // Preserve Supabase auth tokens while clearing app cache
      const keysToPreserve: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith("sb-") || key.includes("supabase"))) {
          keysToPreserve.push(key);
        }
      }
      const preserved = keysToPreserve.map(k => [k, localStorage.getItem(k)!]);

      localStorage.clear();

      // Restore auth tokens
      for (const [key, value] of preserved) {
        localStorage.setItem(key, value);
      }

      // Clear only BuildWise service worker caches (not other sites' caches)
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames
            .filter(name => name.startsWith('buildwise-'))
            .map(cacheName => caches.delete(cacheName))
        );
      }

      toast.success("Cache cleared successfully");

      // Reload page after a brief delay
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      toast.error("Failed to clear cache");
      console.error("Cache clear error:", error);
    }
  };

  // Handle password change
  const handlePasswordChange = async () => {
    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("All fields are required");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New password and confirm password do not match");
      return;
    }

    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();

      // Verify current password by attempting sign-in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email ?? "",
        password: currentPassword,
      });

      if (signInError) {
        toast.error("Current password is incorrect");
        return;
      }

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        toast.error("Failed to update password. Please try again.");
        return;
      }

      // Invalidate all other sessions for security
      await supabase.auth.signOut({ scope: "others" });

      toast.success("Password changed successfully. Other sessions have been signed out.");

      // Reset form and close dialog
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordDialogOpen(false);
    } catch {
      toast.error("An error occurred. Please try again.");
    }
  };

  const formatLastSync = (isoDate: string | null) => {
    if (!isoDate) return "Never";
    const date = new Date(isoDate);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString("en-IN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Manage your account and application preferences
        </p>
      </div>

      {/* Display Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Monitor className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Display Settings</CardTitle>
          </div>
          <CardDescription>Customize your viewing experience</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Compact View</Label>
              <p className="text-sm text-muted-foreground">
                Reduce spacing and use smaller text for more content
              </p>
            </div>
            <Switch
              checked={isCompact}
              onCheckedChange={(checked) => {
                toggleCompact();
                toast.success(
                  `Compact view ${checked ? "enabled" : "disabled"}`
                );
              }}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Dark Mode</Label>
              <p className="text-sm text-muted-foreground">
                Toggle between light and dark themes
              </p>
            </div>
            <div className="flex items-center gap-2">
              {mounted && (
                <>
                  <Button
                    variant={theme === "light" ? "default" : "outline"}
                    size="sm"
                    className="gap-2"
                    onClick={() => {
                      setTheme("light");
                      toast.success("Light mode enabled");
                    }}
                  >
                    <Sun className="h-4 w-4" />
                    Light
                  </Button>
                  <Button
                    variant={theme === "dark" ? "default" : "outline"}
                    size="sm"
                    className="gap-2"
                    onClick={() => {
                      setTheme("dark");
                      toast.success("Dark mode enabled");
                    }}
                  >
                    <Moon className="h-4 w-4" />
                    Dark
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Profile</CardTitle>
          </div>
          <CardDescription>Your account information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground text-xl font-semibold">
              {user?.displayName?.charAt(0)?.toUpperCase() ?? "U"}
            </div>
            <div>
              <p className="text-lg font-semibold">{user?.displayName ?? "User"}</p>
              <p className="text-sm text-muted-foreground">{user?.email ?? ""}</p>
              <div className="mt-2">
                <p className="text-xs text-muted-foreground mb-1">Access Level</p>
                <Badge
                  variant={user?.role === 'owner' ? 'default' : 'secondary'}
                  className="text-sm font-semibold capitalize"
                >
                  {user?.role === 'site-engineer' ? 'Site Engineer' : (user?.role ?? 'viewer')}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Company Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Company</CardTitle>
          </div>
          <CardDescription>Organization details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">Company Name</p>
              <p className="font-medium">{companyInfo?.companyName ?? "Loading..."}</p>
            </div>
            {companyInfo?.tallyCompany && (
              <div>
                <p className="text-sm text-muted-foreground">Tally Company</p>
                <p className="font-medium">{companyInfo.tallyCompany}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-muted-foreground">Active Projects</p>
              <p className="font-medium">
                {companyInfo ? `${companyInfo.projectCount} project${companyInfo.projectCount !== 1 ? "s" : ""}` : "Loading..."}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Data</CardTitle>
          </div>
          <CardDescription>Sync status and data management</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div>
              <p className="font-medium">Last Tally Sync</p>
              <p className="text-sm text-muted-foreground">
                {companyInfo ? formatLastSync(companyInfo.lastSyncAt) : "Loading..."}
              </p>
            </div>
            <Badge variant={companyInfo?.lastSyncAt ? "default" : "secondary"} className={companyInfo?.lastSyncAt ? "bg-green-600" : ""}>
              {companyInfo?.lastSyncAt ? "Connected" : "No data"}
            </Badge>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Button
              variant="outline"
              className="gap-2 justify-start"
              onClick={handleExportSettings}
            >
              <Download className="h-4 w-4" />
              Export Settings
            </Button>
            <Button
              variant="outline"
              className="gap-2 justify-start text-destructive hover:text-destructive"
              onClick={handleClearCache}
            >
              <Trash2 className="h-4 w-4" />
              Clear Cache
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Export your preferences as JSON or clear cached data to free up space
          </p>
        </CardContent>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Security</CardTitle>
          </div>
          <CardDescription>Account security settings</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            onClick={() => setPasswordDialogOpen(true)}
          >
            Change Password
          </Button>
        </CardContent>
      </Card>

      {/* App Info */}
      <Card>
        <CardHeader>
          <CardTitle>About BuildWise</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Version</span>
              <span className="font-medium">MVP 1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Environment</span>
              <Badge variant="outline">Demo</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Password Change Dialog */}
      <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Update your account password. Make sure it&#39;s at least 8 characters long.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Current Password</Label>
              <Input
                id="current-password"
                type="password"
                placeholder="Enter current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                placeholder="Enter new password (min 8 characters)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setPasswordDialogOpen(false);
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
              }}
            >
              Cancel
            </Button>
            <Button onClick={handlePasswordChange}>
              Save Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
