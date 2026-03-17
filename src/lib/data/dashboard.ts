import { createAuthenticatedClient } from "@/lib/supabase/server";
import { formatINRCompact } from "@/lib/format";
import type { FinancialSummary, DailyCashFlow, Transaction, WIPIssue } from "@/lib/types";

export async function getFinancialSummary(): Promise<FinancialSummary> {
  const { supabase, clientId } = await createAuthenticatedClient();
  if (!clientId) return { cashBalance: 0, bankBalance: 0, receivables: 0, payables: 0, todayChange: { cash: 0, bank: 0, receivables: 0, payables: 0 } };

  const { data: summary } = await supabase
    .from("financial_summary")
    .select("*")
    .eq("client_id", clientId)
    .limit(1)
    .maybeSingle();

  if (!summary) {
    return {
      cashBalance: 0,
      bankBalance: 0,
      receivables: 0,
      payables: 0,
      todayChange: { cash: 0, bank: 0, receivables: 0, payables: 0 },
    };
  }

  const totalInflow = Number(summary.total_inflow ?? 0);
  const totalOutflow = Number(summary.total_outflow ?? 0);
  const monthInflow = Number(summary.month_inflow ?? 0);
  const monthOutflow = Number(summary.month_outflow ?? 0);

  // Net cash position from actual transaction data
  // Bank/receivables/payables breakdown requires ledger-group-level data (not yet available)
  // NOTE: todayChange uses monthly data — UI labels should say "this month", not "today"
  return {
    cashBalance: totalInflow - totalOutflow,
    bankBalance: 0,
    receivables: 0,
    payables: 0,
    todayChange: {
      cash: monthInflow - monthOutflow, // Monthly, not daily — see dashboard-client.tsx labels
      bank: 0,
      receivables: 0,
      payables: 0,
    },
  };
}

export async function getDailyCashFlow(days = 7): Promise<DailyCashFlow[]> {
  const { supabase, clientId } = await createAuthenticatedClient();
  if (!clientId) return [];

  const { data } = await supabase
    .from("daily_cashflow")
    .select("*")
    .eq("client_id", clientId)
    .order("date", { ascending: false })
    .limit(days);

  if (!data || data.length === 0) return [];

  return data.reverse().map((d) => ({
    date: new Date(d.date).toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
    }),
    inflow: Number(d.inflow ?? 0),
    outflow: Number(d.outflow ?? 0),
  }));
}

export async function getRecentTransactions(limit = 10): Promise<Transaction[]> {
  const { supabase, clientId } = await createAuthenticatedClient();
  if (!clientId) return [];

  const { data: vouchers } = await supabase
    .from("tally_vouchers")
    .select("*")
    .eq("client_id", clientId)
    .order("date", { ascending: false })
    .order("synced_at", { ascending: false })
    .limit(limit);

  if (!vouchers) return [];

  return vouchers.map((v) => {
    const isReceipt = ["Receipt", "Sales", "Credit Note"].includes(v.voucher_type);
    const syncTime = new Date(v.synced_at);

    return {
      id: String(v.id),
      date: v.date,
      time: syncTime.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      type: isReceipt ? ("receipt" as const) : ("payment" as const),
      party: v.party_name ?? "Unknown Party",
      amount: Math.abs(Number(v.total_amount ?? 0)),
      project: v.narration ?? "",
      category: v.voucher_type,
      status: "on-track" as const,
    };
  });
}

export async function getWIPIssues(): Promise<WIPIssue[]> {
  const { supabase, clientId } = await createAuthenticatedClient();
  if (!clientId) return [];

  // Get projects with their summaries to detect anomalies
  const { data: summaries } = await supabase
    .from("project_summaries")
    .select("*")
    .eq("client_id", clientId);

  if (!summaries || summaries.length === 0) return [];

  const issues: WIPIssue[] = [];
  const detectionKeys: string[] = [];

  for (const s of summaries) {
    const budget = Number(s.budget ?? 0);
    const spent = Number(s.total_spent ?? 0);

    // Cost overrun detection
    if (budget > 0 && spent > budget) {
      const overrunPercent = Math.round(((spent - budget) / budget) * 100);
      const detectionKey = `WIP-${s.project_id}-overrun`;
      detectionKeys.push(detectionKey);
      issues.push({
        id: detectionKey,
        projectId: s.project_id,
        projectName: s.project_name ?? "Unknown",
        type: "cost-overrun",
        severity: overrunPercent > 20 ? "critical" : "warning",
        title: `Budget Overrun - ${overrunPercent}%`,
        description: `Spending exceeds budget by ${formatINRCompact(spent - budget)}. Budget: ${formatINRCompact(budget)}, Spent: ${formatINRCompact(spent)}.`,
        budgeted: budget,
        actual: spent,
        detectedAt: new Date().toISOString(),
        status: "new",
      });
    }
  }

  // Merge saved statuses from wip_issues table
  if (detectionKeys.length > 0) {
    const { data: savedStatuses } = await supabase
      .from("wip_issues")
      .select("detection_key, status")
      .eq("client_id", clientId)
      .in("detection_key", detectionKeys);

    if (savedStatuses && savedStatuses.length > 0) {
      // DB status → UI status mapping
      const dbToUiStatus: Record<string, WIPIssue["status"]> = {
        open: "new",
        in_progress: "viewed",
        resolved: "reviewed",
        closed: "reviewed",
      };

      const statusMap = new Map(
        savedStatuses.map((s) => [s.detection_key, dbToUiStatus[s.status] ?? "new"])
      );

      for (const issue of issues) {
        const savedStatus = statusMap.get(issue.id);
        if (savedStatus) {
          issue.status = savedStatus;
        }
      }
    }
  }

  return issues;
}
