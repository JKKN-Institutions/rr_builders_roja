import { getWIPIssues } from "@/lib/data/dashboard";
import { WIPClient } from "./wip-client";

export const dynamic = "force-dynamic";

export default async function WIPPage() {
  const wipIssues = await getWIPIssues();

  return <WIPClient initialIssues={wipIssues} />;
}
