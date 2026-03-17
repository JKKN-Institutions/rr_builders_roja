"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  IndianRupee,
  Building2,
  Shield,
  BarChart3,
  TrendingUp,
  PieChart,
  FileSpreadsheet,
  Clock,
} from "lucide-react";

const plannedReports = [
  {
    title: "Project Cost Summary",
    description: "Budget vs. actual spending breakdown per project with variance analysis",
    icon: Building2,
    category: "Project",
    categoryColor: "bg-green-100 text-green-800",
  },
  {
    title: "Cash Flow Statement",
    description: "Inflows, outflows, and net position over customizable date ranges",
    icon: IndianRupee,
    category: "Financial",
    categoryColor: "bg-blue-100 text-blue-800",
  },
  {
    title: "Vendor Payment Tracker",
    description: "Outstanding payables, aging analysis, and payment history by vendor",
    icon: FileSpreadsheet,
    category: "Financial",
    categoryColor: "bg-blue-100 text-blue-800",
  },
  {
    title: "GST Compliance Report",
    description: "Input/output tax summary, ITC reconciliation from Tally voucher data",
    icon: Shield,
    category: "Compliance",
    categoryColor: "bg-purple-100 text-purple-800",
  },
  {
    title: "Budget Utilization Dashboard",
    description: "Real-time budget consumption rates with overrun forecasts",
    icon: PieChart,
    category: "Project",
    categoryColor: "bg-green-100 text-green-800",
  },
  {
    title: "Monthly Financial Summary",
    description: "Auto-generated month-end report with key metrics and trends",
    icon: BarChart3,
    category: "Financial",
    categoryColor: "bg-blue-100 text-blue-800",
  },
  {
    title: "Material Cost Analysis",
    description: "Cost trends for key materials across projects with rate comparisons",
    icon: TrendingUp,
    category: "Project",
    categoryColor: "bg-green-100 text-green-800",
  },
  {
    title: "TDS/TCS Deduction Report",
    description: "Tax deduction tracking for contractor and vendor payments",
    icon: Shield,
    category: "Compliance",
    categoryColor: "bg-purple-100 text-purple-800",
  },
  {
    title: "Custom Report Builder",
    description: "Build your own reports with drag-and-drop fields and filters",
    icon: FileText,
    category: "Custom",
    categoryColor: "bg-gray-100 text-gray-800",
  },
];

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Reports</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Access financial, project, and compliance reports
        </p>
      </div>

      {/* Coming Soon Banner */}
      <Card className="border-blue-200 bg-blue-50/50">
        <CardContent className="flex flex-col sm:flex-row items-center gap-4 py-6">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-blue-100">
            <BarChart3 className="h-7 w-7 text-blue-600" />
          </div>
          <div className="text-center sm:text-left">
            <h2 className="text-lg font-semibold">Reports are being built</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Reports will be auto-generated from your synced Tally data. Once enough
              transaction data is available, reports will appear here. Below is a preview
              of planned report types.
            </p>
          </div>
          <Badge variant="secondary" className="shrink-0 gap-1">
            <Clock className="h-3 w-3" />
            Coming Soon
          </Badge>
        </CardContent>
      </Card>

      {/* Planned Reports Grid */}
      <div>
        <h2 className="text-base font-semibold mb-4 text-muted-foreground uppercase tracking-wide">
          Planned Report Types
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {plannedReports.map((report) => {
            const Icon = report.icon;
            return (
              <Card
                key={report.title}
                className="relative overflow-hidden opacity-80 hover:opacity-100 transition-opacity"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                      <Icon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <Badge className={report.categoryColor} variant="secondary">
                      {report.category}
                    </Badge>
                  </div>
                  <CardTitle className="text-sm sm:text-base mt-3">
                    {report.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-xs sm:text-sm">
                    {report.description}
                  </CardDescription>
                </CardContent>
                {/* Coming Soon overlay indicator */}
                <div className="absolute top-0 right-0 m-0">
                  <div className="bg-muted text-muted-foreground text-[10px] font-medium px-2 py-0.5 rounded-bl">
                    Soon
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
