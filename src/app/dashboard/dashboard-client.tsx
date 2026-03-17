"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  IndianRupee,
  Landmark,
  ArrowDownRight,
  ArrowUpRight,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  FileText,
  Building2,
} from "lucide-react";
import Link from "next/link";
import { formatINRCompact, formatINR } from "@/lib/format";
import { toast } from "sonner";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from "recharts";
import { useCompactView } from "@/hooks/use-compact-view";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import type { FinancialSummary, DailyCashFlow, Transaction, WIPIssue, Project } from "@/lib/types";

interface DashboardClientProps {
  financialSummary: FinancialSummary;
  dailyCashFlow: DailyCashFlow[];
  transactions: Transaction[];
  wipIssues: WIPIssue[];
  projects: Project[];
}

export function DashboardClient({
  financialSummary,
  dailyCashFlow,
  transactions,
  wipIssues,
  projects,
}: DashboardClientProps) {
  const { isCompact } = useCompactView();
  const { user } = useAuth();

  const activeProjects = projects.filter((p) => p.status === "active").length;
  const newIssues = wipIssues.filter((i) => i.status === "new");
  const criticalIssues = newIssues.filter((i) => i.severity === "critical");

  return (
    <div className={cn("space-y-6", isCompact && "space-y-3")}>
      {/* Page Header */}
      <div>
        <h1 className={cn("text-xl sm:text-2xl font-bold tracking-tight", isCompact && "text-lg sm:text-xl")}>
          Dashboard
        </h1>
        <p className={cn("text-sm sm:text-base text-muted-foreground", isCompact && "text-xs sm:text-sm")}>
          Welcome back, {user?.displayName ?? "there"}. Here&apos;s your financial overview.
        </p>
      </div>

      {/* Financial Summary Cards */}
      <div className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-4", isCompact && "gap-2 sm:gap-3")}>
        <Card>
          <CardHeader className={cn("flex flex-row items-center justify-between space-y-0 pb-2", isCompact && "pb-1")}>
            <CardTitle className={cn("text-sm font-medium", isCompact && "text-xs")}>
              Cash Balance
            </CardTitle>
            <IndianRupee className={cn("h-4 w-4 text-muted-foreground", isCompact && "h-3 w-3")} />
          </CardHeader>
          <CardContent className={isCompact ? "py-2" : ""}>
            <div className={cn("text-2xl font-bold", isCompact && "text-xl")}>
              {formatINRCompact(financialSummary.cashBalance)}
            </div>
            <div className={cn(`flex items-center text-xs ${financialSummary.todayChange.cash >= 0 ? "text-green-600" : "text-red-600"}`, isCompact && "text-[10px]")}>
              {financialSummary.todayChange.cash >= 0
                ? <ArrowUpRight className={cn("mr-1 h-3 w-3", isCompact && "h-2 w-2")} />
                : <ArrowDownRight className={cn("mr-1 h-3 w-3", isCompact && "h-2 w-2")} />}
              {financialSummary.todayChange.cash >= 0 ? "+" : ""}{formatINR(financialSummary.todayChange.cash)} this month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className={cn("flex flex-row items-center justify-between space-y-0 pb-2", isCompact && "pb-1")}>
            <CardTitle className={cn("text-sm font-medium", isCompact && "text-xs")}>
              Bank Balance
            </CardTitle>
            <Landmark className={cn("h-4 w-4 text-muted-foreground", isCompact && "h-3 w-3")} />
          </CardHeader>
          <CardContent className={isCompact ? "py-2" : ""}>
            <div className={cn("text-2xl font-bold", isCompact && "text-xl")}>
              {formatINRCompact(financialSummary.bankBalance)}
            </div>
            <div className={cn(`flex items-center text-xs ${financialSummary.todayChange.bank >= 0 ? "text-green-600" : "text-red-600"}`, isCompact && "text-[10px]")}>
              {financialSummary.todayChange.bank >= 0
                ? <ArrowUpRight className={cn("mr-1 h-3 w-3", isCompact && "h-2 w-2")} />
                : <ArrowDownRight className={cn("mr-1 h-3 w-3", isCompact && "h-2 w-2")} />}
              {financialSummary.todayChange.bank >= 0 ? "+" : ""}{formatINR(financialSummary.todayChange.bank)} this month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className={cn("flex flex-row items-center justify-between space-y-0 pb-2", isCompact && "pb-1")}>
            <CardTitle className={cn("text-sm font-medium", isCompact && "text-xs")}>
              Receivables
            </CardTitle>
            <TrendingUp className={cn("h-4 w-4 text-muted-foreground", isCompact && "h-3 w-3")} />
          </CardHeader>
          <CardContent className={isCompact ? "py-2" : ""}>
            <div className={cn("text-2xl font-bold", isCompact && "text-xl")}>
              {formatINRCompact(financialSummary.receivables)}
            </div>
            <div className={cn(`flex items-center text-xs ${financialSummary.todayChange.receivables >= 0 ? "text-green-600" : "text-red-600"}`, isCompact && "text-[10px]")}>
              {financialSummary.todayChange.receivables >= 0
                ? <TrendingUp className={cn("mr-1 h-3 w-3", isCompact && "h-2 w-2")} />
                : <TrendingDown className={cn("mr-1 h-3 w-3", isCompact && "h-2 w-2")} />}
              {financialSummary.todayChange.receivables >= 0 ? "+" : ""}{formatINRCompact(financialSummary.todayChange.receivables)} this month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className={cn("flex flex-row items-center justify-between space-y-0 pb-2", isCompact && "pb-1")}>
            <CardTitle className={cn("text-sm font-medium", isCompact && "text-xs")}>
              Payables
            </CardTitle>
            <TrendingDown className={cn("h-4 w-4 text-muted-foreground", isCompact && "h-3 w-3")} />
          </CardHeader>
          <CardContent className={isCompact ? "py-2" : ""}>
            <div className={cn("text-2xl font-bold", isCompact && "text-xl")}>
              {formatINRCompact(financialSummary.payables)}
            </div>
            <div className={cn(`flex items-center text-xs ${financialSummary.todayChange.payables >= 0 ? "text-amber-600" : "text-green-600"}`, isCompact && "text-[10px]")}>
              {financialSummary.todayChange.payables >= 0
                ? <TrendingUp className={cn("mr-1 h-3 w-3", isCompact && "h-2 w-2")} />
                : <TrendingDown className={cn("mr-1 h-3 w-3", isCompact && "h-2 w-2")} />}
              {financialSummary.todayChange.payables >= 0 ? "+" : ""}{formatINRCompact(financialSummary.todayChange.payables)} this month
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cash Flow Trend Chart */}
      {dailyCashFlow.length > 0 ? (
        <Card>
          <CardHeader className={isCompact ? "pb-3" : ""}>
            <CardTitle className={isCompact ? "text-base" : ""}>Cash Flow Trend</CardTitle>
            <CardDescription className={isCompact ? "text-xs" : ""}>
              Last 7 days inflows and outflows
            </CardDescription>
          </CardHeader>
          <CardContent className={isCompact ? "pb-3" : ""}>
            <ChartContainer
              config={{
                inflow: { label: "Inflow", color: "hsl(142, 71%, 45%)" },
                outflow: { label: "Outflow", color: "hsl(0, 84%, 60%)" },
              }}
              className={cn("h-[250px] sm:h-[300px] w-full", isCompact && "h-[180px] sm:h-[220px]")}
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={dailyCashFlow}
                  onClick={(data) => {
                    if (data?.activePayload) {
                      const point = data.activePayload[0].payload;
                      toast.info(`${point.date}: Inflow ${formatINR(point.inflow)}, Outflow ${formatINR(point.outflow)}`);
                    }
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" className="text-xs" tick={{ fontSize: 12 }} />
                  <YAxis className="text-xs" tick={{ fontSize: 12 }} tickFormatter={(value) => `₹${(value / 100000).toFixed(1)}L`} />
                  <ChartTooltip content={<ChartTooltipContent formatter={(value) => formatINR(value as number)} />} />
                  <Legend verticalAlign="top" height={36} formatter={(value) => value === "inflow" ? "Inflow" : "Outflow"} />
                  <Line type="monotone" dataKey="inflow" stroke="var(--color-inflow)" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="outflow" stroke="var(--color-outflow)" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Cash Flow Trend</CardTitle>
            <CardDescription>No transaction data yet. Connect your Tally bridge to start seeing real data.</CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* Quick Actions / Module Cards */}
      <div className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-3", isCompact && "gap-2 sm:gap-3")}>
        <Link href="/dashboard/reports">
          <Card className="cursor-pointer transition-colors hover:bg-muted/50">
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
                <FileText className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <CardTitle className="text-lg">Reports</CardTitle>
                <CardDescription>View financial & project reports</CardDescription>
              </div>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/dashboard/wip">
          <Card className="cursor-pointer transition-colors hover:bg-muted/50">
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-destructive">
                <AlertTriangle className="h-6 w-6 text-destructive-foreground" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-lg">WIP Analysis</CardTitle>
                  {newIssues.length > 0 && <Badge variant="destructive">{newIssues.length} new</Badge>}
                </div>
                <CardDescription>{criticalIssues.length} critical issues detected</CardDescription>
              </div>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/dashboard/tally">
          <Card className="cursor-pointer transition-colors hover:bg-muted/50">
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-600">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg">Live Tally</CardTitle>
                <CardDescription>Real-time transactions</CardDescription>
              </div>
            </CardHeader>
          </Card>
        </Link>
      </div>

      {/* Two Column Layout */}
      <div className={cn("grid gap-6 lg:grid-cols-2", isCompact && "gap-3")}>
        {/* Recent WIP Alerts */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent WIP Alerts</CardTitle>
              <Link href="/dashboard/wip" className="text-sm text-primary hover:underline">View All &rarr;</Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {wipIssues.length === 0 ? (
              <p className="text-sm text-muted-foreground">No issues detected. All projects within budget.</p>
            ) : (
              wipIssues.slice(0, 4).map((issue) => (
                <div key={issue.id} className="flex items-start gap-3 rounded-lg border p-3">
                  <div className={`mt-0.5 h-2 w-2 rounded-full ${issue.severity === "critical" ? "bg-red-500" : issue.severity === "warning" ? "bg-amber-500" : "bg-blue-500"}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{issue.title}</p>
                    <p className="text-xs text-muted-foreground">{issue.projectName}</p>
                  </div>
                  <Badge variant={issue.severity === "critical" ? "destructive" : issue.severity === "warning" ? "secondary" : "outline"} className="shrink-0">{issue.severity}</Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Transactions</CardTitle>
              <Link href="/dashboard/tally" className="text-sm text-primary hover:underline">View All &rarr;</Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {transactions.length === 0 ? (
              <p className="text-sm text-muted-foreground">No transactions yet. Data will appear once the Tally bridge starts syncing.</p>
            ) : (
              transactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${tx.type === "receipt" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}>
                      {tx.type === "receipt" ? <ArrowDownRight className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{tx.party}</p>
                      <p className="text-xs text-muted-foreground">{tx.project}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`text-sm font-semibold ${tx.type === "receipt" ? "text-green-600" : "text-red-600"}`}>
                      {tx.type === "receipt" ? "+" : "-"}{formatINR(tx.amount)}
                    </p>
                    <p className="text-xs text-muted-foreground">{tx.time}</p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Active Projects Summary */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Active Projects ({activeProjects})</CardTitle>
            </div>
            <Link href="/dashboard/projects" className="text-sm text-primary hover:underline">View All &rarr;</Link>
          </div>
        </CardHeader>
        <CardContent>
          {projects.length === 0 ? (
            <p className="text-sm text-muted-foreground">No projects yet. Projects are auto-created from Tally cost centres when the bridge starts syncing.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {projects.filter((p) => p.status === "active").slice(0, 6).map((project) => {
                const budgetUsed = project.budget > 0 ? (project.spent / project.budget) * 100 : 0;
                const isOverBudget = budgetUsed > 100;
                return (
                  <Link key={project.id} href={`/dashboard/projects/${project.id}`}>
                    <div className="rounded-lg border p-4 cursor-pointer transition-all hover:shadow-md hover:border-primary/50">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium">{project.name}</p>
                          <p className="text-xs text-muted-foreground">{project.location}</p>
                        </div>
                        {isOverBudget && <Badge variant="destructive" className="shrink-0">Over Budget</Badge>}
                      </div>
                      <div className="mt-3">
                        <div className="flex justify-between text-xs mb-1">
                          <span>Budget Used</span>
                          <span>{project.progress}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-muted">
                          <div className="h-2 rounded-full bg-primary" style={{ width: `${Math.min(project.progress, 100)}%` }} />
                        </div>
                      </div>
                      <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                        <span>Budget: {formatINRCompact(project.budget)}</span>
                        <span className={isOverBudget ? "text-red-600 font-medium" : ""}>Spent: {formatINRCompact(project.spent)}</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
