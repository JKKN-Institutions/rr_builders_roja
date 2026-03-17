"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle2,
  Eye,
  Check,
  Clock,
  Building2,
  TrendingUp,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell } from "recharts";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatINRCompact, getRelativeTime } from "@/lib/format";
import { useAuth } from "@/lib/auth-context";
import type { WIPIssue } from "@/lib/types";

const severityConfig = {
  critical: {
    icon: AlertTriangle,
    color: "text-red-600",
    bgColor: "bg-red-100",
    badgeVariant: "destructive" as const,
  },
  warning: {
    icon: AlertCircle,
    color: "text-amber-600",
    bgColor: "bg-amber-100",
    badgeVariant: "secondary" as const,
  },
  info: {
    icon: Info,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
    badgeVariant: "outline" as const,
  },
};

const typeLabels: Record<string, string> = {
  "cost-overrun": "Cost Overrun",
  duplicate: "Duplicate Entry",
  missing: "Missing Entry",
  anomaly: "Anomaly Detected",
};

interface WIPClientProps {
  initialIssues: WIPIssue[];
}

export function WIPClient({ initialIssues }: WIPClientProps) {
  const { user } = useAuth();
  const [filter, setFilter] = useState<"all" | "new" | "viewed" | "reviewed">("all");
  const [severityFilter, setSeverityFilter] = useState<"all" | "critical" | "warning" | "info">("all");
  const [issues, setIssues] = useState(initialIssues);
  const [detailViewIssue, setDetailViewIssue] = useState<WIPIssue | null>(null);

  const filteredIssues = issues.filter((issue) => {
    const matchesStatus = filter === "all" || issue.status === filter;
    const matchesSeverity = severityFilter === "all" || issue.severity === severityFilter;
    return matchesStatus && matchesSeverity;
  });

  const criticalCount = issues.filter((i) => i.severity === "critical" && i.status === "new").length;
  const warningCount = issues.filter((i) => i.severity === "warning" && i.status === "new").length;
  const infoCount = issues.filter((i) => i.severity === "info" && i.status === "new").length;

  const severityChartData = [
    {
      severity: "Critical",
      count: issues.filter((i) => i.severity === "critical").length,
      fill: "hsl(0, 84%, 60%)",
    },
    {
      severity: "Warning",
      count: issues.filter((i) => i.severity === "warning").length,
      fill: "hsl(38, 92%, 50%)",
    },
    {
      severity: "Info",
      count: issues.filter((i) => i.severity === "info").length,
      fill: "hsl(221, 83%, 53%)",
    },
  ];

  const persistStatus = async (issue: WIPIssue, newStatus: WIPIssue["status"]) => {
    try {
      await fetch("/api/wip/auto-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          detectionKey: issue.id,
          status: newStatus,
          projectId: issue.projectId,
          title: issue.title,
          description: issue.description,
          severity: issue.severity,
        }),
      });
    } catch {
      // Status saved locally even if API fails — will sync on next page load
    }
  };

  const markAsReviewed = (id: string) => {
    const issue = issues.find((i) => i.id === id);
    setIssues(
      issues.map((i) =>
        i.id === id ? { ...i, status: "reviewed" as const } : i
      )
    );
    if (issue) persistStatus(issue, "reviewed");
    toast.success("Issue marked as reviewed");
  };

  const markAsViewed = (id: string) => {
    const issue = issues.find((i) => i.id === id);
    if (issue && issue.status === "new") {
      setIssues(
        issues.map((i) =>
          i.id === id ? { ...i, status: "viewed" as const } : i
        )
      );
      persistStatus(issue, "viewed");
    }
  };

  const canManage = user?.role === "owner" || user?.role === "accountant";

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight">WIP Analysis</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          {issues.length > 0
            ? "AI-detected issues requiring your attention"
            : "Budget anomalies will appear here once projects have data"}
        </p>
      </div>

      {issues.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CheckCircle2 className="h-12 w-12 text-green-600 mb-4" />
            <p className="text-lg font-medium">No issues detected</p>
            <p className="text-sm text-muted-foreground">
              WIP analysis runs automatically when projects have budget and spending data from Tally.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Issues by Severity Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Issues by Severity</CardTitle>
              <CardDescription>
                {severityFilter === "all"
                  ? "Click a bar to filter issues by severity"
                  : `Showing ${severityFilter} issues - Click to reset`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  count: {
                    label: "Issues",
                    color: "hsl(var(--primary))",
                  },
                }}
                className="h-[200px] sm:h-[250px] w-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={severityChartData}
                    onClick={(data) => {
                      if (data && data.activePayload) {
                        const severity = data.activePayload[0].payload.severity.toLowerCase() as "critical" | "warning" | "info";
                        if (severityFilter === severity) {
                          setSeverityFilter("all");
                          toast.info("Filter cleared");
                        } else {
                          setSeverityFilter(severity);
                          toast.success(`Filtered to ${severity} issues`);
                        }
                      }
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="severity" className="text-xs" tick={{ fontSize: 12 }} />
                    <YAxis className="text-xs" tick={{ fontSize: 12 }} allowDecimals={false} />
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          formatter={(value) => [`${value} issues - Click to filter`, "Count"]}
                        />
                      }
                      cursor={{ fill: "rgba(0, 0, 0, 0.1)" }}
                    />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]} cursor="pointer">
                      {severityChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Summary Cards */}
          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="border-l-4 border-l-red-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  Critical Issues
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600">{criticalCount}</div>
                <p className="text-xs text-muted-foreground mt-1">Require immediate action</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-amber-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  Warnings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-amber-600">{warningCount}</div>
                <p className="text-xs text-muted-foreground mt-1">Need review soon</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-blue-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Info className="h-4 w-4 text-blue-600" />
                  Info
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">{infoCount}</div>
                <p className="text-xs text-muted-foreground mt-1">For your awareness</p>
              </CardContent>
            </Card>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 flex-wrap">
            <Button variant={filter === "all" ? "default" : "outline"} size="sm" onClick={() => setFilter("all")}>
              All ({issues.length})
            </Button>
            <Button variant={filter === "new" ? "default" : "outline"} size="sm" onClick={() => setFilter("new")}>
              New ({issues.filter((i) => i.status === "new").length})
            </Button>
            <Button variant={filter === "viewed" ? "default" : "outline"} size="sm" onClick={() => setFilter("viewed")}>
              Viewed ({issues.filter((i) => i.status === "viewed").length})
            </Button>
            <Button variant={filter === "reviewed" ? "default" : "outline"} size="sm" onClick={() => setFilter("reviewed")}>
              Reviewed ({issues.filter((i) => i.status === "reviewed").length})
            </Button>
          </div>

          {/* Issues List */}
          <div className="space-y-4">
            {filteredIssues.map((issue) => {
              const config = severityConfig[issue.severity];
              const Icon = config.icon;
              const variance = issue.actual - issue.budgeted;
              const variancePercent = issue.budgeted > 0 ? ((variance / issue.budgeted) * 100).toFixed(1) : "0";

              return (
                <Card
                  key={issue.id}
                  className={`transition-colors cursor-pointer ${issue.status === "new" ? "border-l-4 border-l-red-500" : ""}`}
                  onClick={() => markAsViewed(issue.id)}
                >
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <div className={`p-2 rounded-full ${config.bgColor} shrink-0`}>
                          <Icon className={`h-5 w-5 ${config.color}`} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <CardTitle className="text-base sm:text-lg">{issue.title}</CardTitle>
                            {issue.status === "new" && (
                              <Badge variant="destructive" className="text-xs">NEW</Badge>
                            )}
                          </div>
                          <CardDescription className="flex items-center gap-2 mt-1 text-xs sm:text-sm flex-wrap">
                            <div className="flex items-center gap-1">
                              <Building2 className="h-3 w-3" />
                              <span>{issue.projectName}</span>
                            </div>
                            <span className="text-muted-foreground/50">•</span>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>{getRelativeTime(issue.detectedAt)}</span>
                            </div>
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex gap-2 shrink-0 flex-wrap">
                        <Badge variant={config.badgeVariant}>{issue.severity}</Badge>
                        <Badge variant="outline">{typeLabels[issue.type] ?? issue.type}</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">{issue.description}</p>

                    <div className="grid gap-4 sm:grid-cols-3 p-4 bg-muted/50 rounded-lg">
                      <div>
                        <p className="text-xs text-muted-foreground">Budgeted</p>
                        <p className="text-lg font-semibold">{formatINRCompact(issue.budgeted)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Actual</p>
                        <p className="text-lg font-semibold">{formatINRCompact(issue.actual)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Variance</p>
                        <p className={`text-lg font-semibold ${variance > 0 ? "text-red-600" : "text-green-600"}`}>
                          {variance > 0 ? "+" : ""}{formatINRCompact(variance)} ({variancePercent}%)
                        </p>
                      </div>
                    </div>

                    {issue.status !== "reviewed" && (
                      <div className="flex flex-col sm:flex-row gap-2 mt-4">
                        {canManage && (
                          <Button
                            variant="default"
                            size="sm"
                            className="gap-2 w-full sm:w-auto"
                            onClick={(e) => { e.stopPropagation(); markAsReviewed(issue.id); }}
                          >
                            <Check className="h-4 w-4" />
                            <span>Mark as Reviewed</span>
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2 w-full sm:w-auto"
                          onClick={(e) => { e.stopPropagation(); setDetailViewIssue(issue); }}
                        >
                          <Eye className="h-4 w-4" />
                          <span>View Details</span>
                        </Button>
                      </div>
                    )}
                    {issue.status === "reviewed" && (
                      <div className="flex items-center gap-2 mt-4 text-green-600">
                        <CheckCircle2 className="h-4 w-4" />
                        <span className="text-sm">Reviewed</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {filteredIssues.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CheckCircle2 className="h-12 w-12 text-green-600 mb-4" />
                <p className="text-lg font-medium">No issues in this category</p>
                <p className="text-sm text-muted-foreground">
                  All caught up! Check back later for new alerts.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Issue Detail Dialog */}
          <Dialog open={!!detailViewIssue} onOpenChange={(open) => !open && setDetailViewIssue(null)}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              {detailViewIssue && (() => {
                const config = severityConfig[detailViewIssue.severity];
                const Icon = config.icon;
                const variance = detailViewIssue.actual - detailViewIssue.budgeted;
                const variancePercent = detailViewIssue.budgeted > 0
                  ? ((variance / detailViewIssue.budgeted) * 100).toFixed(1) : "0";

                const getRecommendedActions = () => {
                  switch (detailViewIssue.type) {
                    case "cost-overrun":
                      return [
                        "Review and verify all line items in the affected category",
                        "Check for duplicate entries or misclassifications",
                        "Consult with the project manager about budget adjustments",
                        "Document the reason for variance in project notes",
                      ];
                    case "duplicate":
                      return [
                        "Identify the original entry and mark duplicate for deletion",
                        "Verify if this represents two separate transactions",
                        "Update accounting records to remove duplicate",
                        "Review data entry process to prevent future duplicates",
                      ];
                    case "missing":
                      return [
                        "Locate the missing documentation or receipt",
                        "Contact the relevant vendor or project team",
                        "Add the missing entry with proper documentation",
                        "Update the project ledger accordingly",
                      ];
                    case "anomaly":
                      return [
                        "Investigate the unusual pattern or value",
                        "Cross-reference with project documentation",
                        "Verify if this is a data entry error",
                        "Consult with stakeholders if pattern is legitimate",
                      ];
                    default:
                      return ["Review issue details and take appropriate action"];
                  }
                };

                return (
                  <>
                    <DialogHeader>
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-full ${config.bgColor} shrink-0`}>
                          <Icon className={`h-6 w-6 ${config.color}`} />
                        </div>
                        <div className="flex-1">
                          <DialogTitle className="text-xl mb-2">{detailViewIssue.title}</DialogTitle>
                          <DialogDescription className="flex gap-2 flex-wrap">
                            <Badge variant={config.badgeVariant}>{detailViewIssue.severity}</Badge>
                            <Badge variant="outline">{typeLabels[detailViewIssue.type] ?? detailViewIssue.type}</Badge>
                            {detailViewIssue.status === "new" && (
                              <Badge variant="destructive" className="text-xs">NEW</Badge>
                            )}
                          </DialogDescription>
                        </div>
                      </div>
                    </DialogHeader>

                    <div className="space-y-6 mt-6">
                      <div>
                        <h3 className="font-semibold mb-2 text-sm uppercase tracking-wide text-muted-foreground">Description</h3>
                        <p className="text-sm">{detailViewIssue.description}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                        <div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                            <Building2 className="h-3 w-3" />
                            Project
                          </div>
                          <p className="font-medium">{detailViewIssue.projectName}</p>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                            <Calendar className="h-3 w-3" />
                            Detected
                          </div>
                          <p className="font-medium">{getRelativeTime(detailViewIssue.detectedAt)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Issue Type</p>
                          <p className="font-medium">{typeLabels[detailViewIssue.type] ?? detailViewIssue.type}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Status</p>
                          <p className="font-medium capitalize">{detailViewIssue.status}</p>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <TrendingUp className="h-4 w-4 text-muted-foreground" />
                          <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Financial Impact</h3>
                        </div>
                        <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Budgeted</p>
                            <p className="text-xl font-bold">{formatINRCompact(detailViewIssue.budgeted)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Actual</p>
                            <p className="text-xl font-bold">{formatINRCompact(detailViewIssue.actual)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Variance</p>
                            <p className={`text-xl font-bold ${variance > 0 ? "text-red-600" : "text-green-600"}`}>
                              {variance > 0 ? "+" : ""}{formatINRCompact(variance)}
                            </p>
                            <p className={`text-xs ${variance > 0 ? "text-red-600" : "text-green-600"}`}>
                              {variancePercent}% {variance > 0 ? "over" : "under"} budget
                            </p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-semibold mb-3 text-sm uppercase tracking-wide text-muted-foreground">Recommended Actions</h3>
                        <ul className="space-y-2">
                          {getRecommendedActions().map((action, index) => (
                            <li key={index} className="flex gap-2 text-sm">
                              <span className="text-primary font-semibold shrink-0">{index + 1}.</span>
                              <span>{action}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {detailViewIssue.status !== "reviewed" && (
                        <div className="flex gap-2 pt-4 border-t">
                          {canManage && (
                            <Button
                              variant="default"
                              className="gap-2 flex-1"
                              onClick={() => { markAsReviewed(detailViewIssue.id); setDetailViewIssue(null); }}
                            >
                              <Check className="h-4 w-4" />
                              Mark as Reviewed
                            </Button>
                          )}
                          <Button variant="outline" className="gap-2" onClick={() => setDetailViewIssue(null)}>
                            Close
                          </Button>
                        </div>
                      )}
                    </div>
                  </>
                );
              })()}
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
}
