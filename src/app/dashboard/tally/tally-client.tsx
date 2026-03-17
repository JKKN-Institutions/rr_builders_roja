"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowDownRight,
  ArrowUpRight,
  Search,
  Clock,
  Building2,
  FileDown,
  Wifi,
  Server,
  Activity,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { convertToCSV, downloadCSV, getExportFilename } from "@/lib/export-utils";
import { formatINR } from "@/lib/format";
import { getRelativeTime } from "@/lib/format";
import { useAuth } from "@/lib/auth-context";
import type { ConnectionStatus, Transaction } from "@/lib/types";

interface TallyClientProps {
  connectionStatus: ConnectionStatus | null;
  transactions: Transaction[];
}

export function TallyClient({ connectionStatus, transactions }: TallyClientProps) {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "payment" | "receipt">("all");

  const isConnected = connectionStatus?.tallyOnline ?? false;

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const matchesType = filterType === "all" || tx.type === filterType;
      const matchesSearch =
        tx.party.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.project.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesType && matchesSearch;
    });
  }, [transactions, filterType, searchQuery]);

  // Compute today's summary from transactions
  const todaySummary = useMemo(() => {
    // Use local date (IST for Indian users) instead of UTC to avoid mismatch between midnight and 5:30 AM IST
    const today = new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD in local timezone
    const todayTx = transactions.filter((t) => t.date === today);
    const receipts = todayTx.filter((t) => t.type === "receipt").reduce((sum, t) => sum + t.amount, 0);
    const payments = todayTx.filter((t) => t.type === "payment").reduce((sum, t) => sum + t.amount, 0);
    const receiptCount = todayTx.filter((t) => t.type === "receipt").length;
    const paymentCount = todayTx.filter((t) => t.type === "payment").length;
    return { receipts, payments, receiptCount, paymentCount };
  }, [transactions]);

  const handleExportTransactions = () => {
    const csvData = convertToCSV(filteredTransactions, [
      { key: "date", label: "Date" },
      { key: "time", label: "Time" },
      { key: "party", label: "Party Name" },
      { key: "amount", label: "Amount (₹)" },
      { key: "type", label: "Type" },
      { key: "project", label: "Project" },
      { key: "category", label: "Category" },
      { key: "status", label: "Status" },
    ]);

    downloadCSV(csvData, getExportFilename("transactions"));
    toast.success(`Exported ${filteredTransactions.length} transactions to CSV`);
  };

  const canManage = user?.role === "owner" || user?.role === "accountant";

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Live Tally</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Real-time transaction feed from Tally
          </p>
        </div>
      </div>

      {/* Connection Status Card */}
      <Card className={`border-l-4 ${isConnected ? "border-l-green-500" : "border-l-red-500"}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">Tally Connection Status</CardTitle>
            <Badge variant={isConnected ? "default" : "destructive"} className="gap-1">
              <Wifi className="h-3 w-3" />
              {isConnected ? "Connected" : "Disconnected"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {connectionStatus ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="flex items-start gap-3">
                <Server className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Tally Company</p>
                  <p className="text-sm mt-1">{connectionStatus.tallyCompany ?? "—"}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Last Sync</p>
                  <p className="text-sm mt-1">
                    {connectionStatus.lastSyncTime
                      ? getRelativeTime(connectionStatus.lastSyncTime)
                      : "Never"}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Activity className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Last Sync Count</p>
                  <p className="text-sm mt-1">{connectionStatus.lastSyncVoucherCount} vouchers</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Queue / Errors</p>
                  <p className="text-sm mt-1">
                    {connectionStatus.queuePending} pending · {connectionStatus.errorsLastHour} errors/hr
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No connection data available. The Tally Bridge agent has not connected yet.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Today's Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Today&apos;s Receipts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              +{formatINR(todaySummary.receipts)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {todaySummary.receiptCount} transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Today&apos;s Payments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              -{formatINR(todaySummary.payments)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {todaySummary.paymentCount} transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Net Position
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${todaySummary.receipts - todaySummary.payments >= 0 ? "text-green-600" : "text-red-600"}`}>
              {formatINR(todaySummary.receipts - todaySummary.payments)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {todaySummary.receipts - todaySummary.payments >= 0 ? "Positive inflow" : "Negative outflow"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by party or project..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {canManage && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportTransactions}
              className="gap-2"
            >
              <FileDown className="h-4 w-4" />
              Export
            </Button>
          )}
          <Button
            variant={filterType === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterType("all")}
          >
            All
          </Button>
          <Button
            variant={filterType === "receipt" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterType("receipt")}
            className="gap-1"
          >
            <ArrowDownRight className="h-4 w-4 text-green-600" />
            Receipts
          </Button>
          <Button
            variant={filterType === "payment" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterType("payment")}
            className="gap-1"
          >
            <ArrowUpRight className="h-4 w-4 text-red-600" />
            Payments
          </Button>
        </div>
      </div>

      {/* Transaction List */}
      <Card>
        <CardHeader>
          <CardTitle>Transactions</CardTitle>
          <CardDescription>
            {filteredTransactions.length > 0
              ? `Showing ${filteredTransactions.length} transactions`
              : "No transactions synced yet"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Server className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">
                {transactions.length === 0
                  ? "No transactions have been synced from Tally yet. Connect the Tally Bridge to start syncing."
                  : "No transactions match your search."}
              </p>
            </div>
          ) : (
            filteredTransactions.map((tx) => (
              <div
                key={tx.id}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-lg border p-3 sm:p-4 transition-colors hover:bg-muted/50"
              >
                <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                      tx.type === "receipt"
                        ? "bg-green-100 text-green-600"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {tx.type === "receipt" ? (
                      <ArrowDownRight className="h-5 w-5" />
                    ) : (
                      <ArrowUpRight className="h-5 w-5" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm sm:text-base font-medium truncate">{tx.party}</p>
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground flex-wrap">
                      <div className="flex items-center gap-1">
                        <Building2 className="h-3 w-3" />
                        <span className="truncate">{tx.project || "Unassigned"}</span>
                      </div>
                      <span className="text-muted-foreground/50">•</span>
                      <span>{tx.category}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between sm:flex-col sm:items-end sm:text-right shrink-0 gap-2">
                  <p
                    className={`text-base sm:text-lg font-semibold ${
                      tx.type === "receipt" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {tx.type === "receipt" ? "+" : "-"}
                    {formatINR(tx.amount)}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{tx.date} {tx.time}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
