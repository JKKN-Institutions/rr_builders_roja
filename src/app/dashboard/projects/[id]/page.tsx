import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Building2,
  MapPin,
  Calendar,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle,
  FileText,
  ChevronLeft,
} from "lucide-react";
import Link from "next/link";
import { getProjectById, getProjectVouchers } from "@/lib/data/projects";
import { getWIPIssues } from "@/lib/data/dashboard";
import { formatINR, formatINRCompact } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [project, vouchers, allIssues] = await Promise.all([
    getProjectById(id),
    getProjectVouchers(id),
    getWIPIssues(),
  ]);

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Building2 className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">Project Not Found</h2>
        <p className="text-muted-foreground mb-4">
          The project you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link href="/dashboard/projects">
          <Button>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Projects
          </Button>
        </Link>
      </div>
    );
  }

  // Map vouchers to display-friendly transactions
  const projectTransactions = vouchers.map((v: Record<string, unknown>) => {
    const isReceipt = ["Receipt", "Sales", "Credit Note"].includes(String(v.voucher_type ?? ""));
    return {
      id: String(v.id),
      date: String(v.date ?? ""),
      type: isReceipt ? "receipt" : "payment",
      party: String(v.party_name ?? "Unknown Party"),
      amount: Math.abs(Number(v.total_amount ?? 0)),
      category: String(v.voucher_type ?? ""),
    };
  });

  const projectIssues = allIssues.filter((i) => i.projectId === id);

  // Calculate metrics
  const budgetUsed = project.budget > 0 ? (project.spent / project.budget) * 100 : 0;
  const isOverBudget = budgetUsed > 100;

  const startDate = project.startDate ? new Date(project.startDate) : null;
  const endDate = project.endDate ? new Date(project.endDate) : null;
  const today = new Date();

  const totalDays = startDate && endDate
    ? Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    : 0;
  const daysElapsed = startDate
    ? Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    : 0;
  const daysRemaining = endDate
    ? Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link href="/dashboard/projects">
        <Button variant="ghost" size="sm">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Projects
        </Button>
      </Link>

      {/* Project Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-primary">
            <Building2 className="h-7 w-7 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {project.name}
            </h1>
            {project.location && (
              <div className="flex items-center gap-2 mt-1 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{project.location}</span>
              </div>
            )}
            <div className="flex items-center gap-2 mt-2">
              <Badge
                variant={
                  project.status === "active"
                    ? "default"
                    : project.status === "completed"
                    ? "secondary"
                    : "outline"
                }
              >
                {project.status}
              </Badge>
              {isOverBudget && (
                <Badge variant="destructive">Over Budget</Badge>
              )}
              {projectIssues.filter((i) => i.severity === "critical").length > 0 && (
                <Badge variant="destructive">
                  {projectIssues.filter((i) => i.severity === "critical").length}{" "}
                  Critical Issues
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Budget
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {project.budget > 0 ? formatINRCompact(project.budget) : "—"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Spent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                isOverBudget ? "text-red-600" : "text-green-600"
              }`}
            >
              {formatINRCompact(project.spent)}
            </div>
            {project.budget > 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                {budgetUsed.toFixed(1)}% of budget
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{project.progress}%</div>
            <div className="h-2 rounded-full bg-muted mt-2">
              <div
                className={`h-2 rounded-full ${
                  project.progress === 100 ? "bg-green-600" : "bg-primary"
                }`}
                style={{ width: `${project.progress}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Days Remaining
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalDays > 0 ? Math.max(daysRemaining, 0) : "—"}
            </div>
            {totalDays > 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                {daysElapsed} of {totalDays} days elapsed
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Budget Overview */}
      {project.budget > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Budget Overview</CardTitle>
            <CardDescription>
              Budget allocation and spending analysis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Budget Utilization</span>
                <span className="font-medium">
                  {formatINR(project.spent)} / {formatINR(project.budget)}
                </span>
              </div>
              <div className="h-4 rounded-full bg-muted relative overflow-hidden">
                <div
                  className={`h-4 rounded-full transition-all ${
                    isOverBudget
                      ? "bg-red-600"
                      : budgetUsed > 80
                      ? "bg-amber-600"
                      : "bg-green-600"
                  }`}
                  style={{ width: `${Math.min(budgetUsed, 100)}%` }}
                />
              </div>
              {isOverBudget && (
                <p className="text-xs text-red-600 mt-1 font-medium">
                  Over budget by {formatINR(project.spent - project.budget)} (
                  {(budgetUsed - 100).toFixed(1)}%)
                </p>
              )}
            </div>

            <Separator />

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Budget</p>
                <p className="text-lg font-semibold">{formatINR(project.budget)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Spent</p>
                <p className="text-lg font-semibold text-red-600">
                  {formatINR(project.spent)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  {isOverBudget ? "Overrun" : "Remaining"}
                </p>
                <p
                  className={`text-lg font-semibold ${
                    isOverBudget ? "text-red-600" : "text-green-600"
                  }`}
                >
                  {formatINR(Math.abs(project.budget - project.spent))}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Timeline */}
      {startDate && endDate && (
        <Card>
          <CardHeader>
            <CardTitle>Project Timeline</CardTitle>
            <CardDescription>Schedule and milestones</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100">
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Start Date</p>
                  <p className="font-semibold">
                    {startDate.toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-100">
                  <Calendar className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">End Date</p>
                  <p className="font-semibold">
                    {endDate.toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-100">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Duration</p>
                  <p className="font-semibold">{totalDays} days</p>
                  <p className="text-xs text-muted-foreground">
                    {daysElapsed} days completed
                  </p>
                </div>
              </div>
            </div>

            {totalDays > 0 && (
              <div className="mt-6">
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-muted-foreground">Timeline Progress</span>
                  <span className="font-medium">
                    {((daysElapsed / totalDays) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="h-2 rounded-full bg-muted">
                  <div
                    className="h-2 rounded-full bg-primary"
                    style={{
                      width: `${Math.min((daysElapsed / totalDays) * 100, 100)}%`,
                    }}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Two Column Layout */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Transactions</CardTitle>
              <Badge variant="outline">
                {projectTransactions.length} total
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {projectTransactions.length > 0 ? (
              projectTransactions.slice(0, 5).map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                        tx.type === "receipt"
                          ? "bg-green-100 text-green-600"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {tx.type === "receipt" ? (
                        <ArrowDownRight className="h-4 w-4" />
                      ) : (
                        <ArrowUpRight className="h-4 w-4" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{tx.party}</p>
                      <p className="text-xs text-muted-foreground">
                        {tx.category}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p
                      className={`text-sm font-semibold ${
                        tx.type === "receipt"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {tx.type === "receipt" ? "+" : "-"}
                      {formatINR(tx.amount)}
                    </p>
                    <p className="text-xs text-muted-foreground">{tx.date}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No transactions for this project yet</p>
              </div>
            )}
            {projectTransactions.length > 5 && (
              <Link href="/dashboard/tally" className="block">
                <Button variant="outline" className="w-full mt-2">
                  View All Transactions
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>

        {/* WIP Issues */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>WIP Issues</CardTitle>
              <Badge
                variant={
                  projectIssues.filter((i) => i.status === "new").length > 0
                    ? "destructive"
                    : "outline"
                }
              >
                {projectIssues.filter((i) => i.status === "new").length} new
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {projectIssues.length > 0 ? (
              projectIssues.map((issue) => (
                <div
                  key={issue.id}
                  className="flex items-start gap-3 rounded-lg border p-3"
                >
                  <div
                    className={`mt-0.5 h-2 w-2 rounded-full shrink-0 ${
                      issue.severity === "critical"
                        ? "bg-red-500"
                        : issue.severity === "warning"
                        ? "bg-amber-500"
                        : "bg-blue-500"
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{issue.title}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                      {issue.description}
                    </p>
                  </div>
                  <Badge
                    variant={
                      issue.severity === "critical"
                        ? "destructive"
                        : issue.severity === "warning"
                        ? "secondary"
                        : "outline"
                    }
                    className="shrink-0"
                  >
                    {issue.severity}
                  </Badge>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No issues detected</p>
              </div>
            )}
            {projectIssues.length > 0 && (
              <Link href="/dashboard/wip" className="block">
                <Button variant="outline" className="w-full mt-2">
                  View All Issues
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
