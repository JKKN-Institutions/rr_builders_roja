import { getConnectionStatus } from "@/lib/data/tally-status";
import { getRecentTransactions } from "@/lib/data/dashboard";
import { TallyClient } from "./tally-client";

export const dynamic = "force-dynamic";

export default async function TallyPage() {
  const [connectionStatus, transactions] = await Promise.all([
    getConnectionStatus(),
    getRecentTransactions(50),
  ]);

  return (
    <TallyClient
      connectionStatus={connectionStatus}
      transactions={transactions}
    />
  );
}
