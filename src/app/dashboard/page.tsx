import { getFinancialSummary, getDailyCashFlow, getRecentTransactions, getWIPIssues } from "@/lib/data/dashboard";
import { getProjects } from "@/lib/data/projects";
import { DashboardClient } from "./dashboard-client";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const results = await Promise.allSettled([
    getFinancialSummary(),
    getDailyCashFlow(),
    getRecentTransactions(5),
    getWIPIssues(),
    getProjects(),
  ]);

  const financialSummary = results[0].status === "fulfilled" ? results[0].value : {
    cashBalance: 0, bankBalance: 0, receivables: 0, payables: 0,
    todayChange: { cash: 0, bank: 0, receivables: 0, payables: 0 },
  };
  const dailyCashFlow = results[1].status === "fulfilled" ? results[1].value : [];
  const transactions = results[2].status === "fulfilled" ? results[2].value : [];
  const wipIssues = results[3].status === "fulfilled" ? results[3].value : [];
  const projects = results[4].status === "fulfilled" ? results[4].value : [];

  return (
    <DashboardClient
      financialSummary={financialSummary}
      dailyCashFlow={dailyCashFlow}
      transactions={transactions}
      wipIssues={wipIssues}
      projects={projects}
    />
  );
}
