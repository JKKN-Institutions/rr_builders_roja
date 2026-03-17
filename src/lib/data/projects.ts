import { createAuthenticatedClient } from "@/lib/supabase/server";
import type { Project } from "@/lib/types";

export async function getProjects(): Promise<Project[]> {
  const { supabase, clientId } = await createAuthenticatedClient();
  if (!clientId) return [];

  // Get projects with financial data from materialized view
  const { data: projects, error: projError } = await supabase
    .from("projects")
    .select("*")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false });

  if (projError || !projects) return [];

  const { data: summaries } = await supabase
    .from("project_summaries")
    .select("*")
    .eq("client_id", clientId);

  const summaryMap = new Map(
    (summaries ?? []).map((s) => [s.project_id, s])
  );

  return projects.map((p) => {
    const summary = summaryMap.get(p.id);
    const spent = Number(summary?.total_spent ?? 0);
    const budget = Number(p.budget ?? 0);
    const progress = budget > 0 ? Math.min(Math.round((spent / budget) * 100), 100) : 0;

    return {
      id: p.id,
      name: p.name,
      location: p.location ?? "",
      status: p.status as Project["status"],
      budget,
      spent,
      startDate: p.start_date ?? "",
      endDate: p.end_date ?? "",
      progress,
    };
  });
}

export async function getProjectById(id: string): Promise<Project | null> {
  const { supabase, clientId } = await createAuthenticatedClient();
  if (!clientId) return null;

  const { data: p, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .eq("client_id", clientId)
    .single();

  if (error || !p) return null;

  const { data: summary } = await supabase
    .from("project_summaries")
    .select("*")
    .eq("project_id", id)
    .eq("client_id", clientId)
    .single();

  const spent = Number(summary?.total_spent ?? 0);
  const budget = Number(p.budget ?? 0);

  return {
    id: p.id,
    name: p.name,
    location: p.location ?? "",
    status: p.status as Project["status"],
    budget,
    spent,
    startDate: p.start_date ?? "",
    endDate: p.end_date ?? "",
    progress: budget > 0 ? Math.min(Math.round((spent / budget) * 100), 100) : 0,
  };
}

export async function getProjectVouchers(projectId: string, limit = 50) {
  const { supabase, clientId } = await createAuthenticatedClient();
  if (!clientId) return [];

  // Get the project's cost centre name
  const { data: project } = await supabase
    .from("projects")
    .select("cost_centre_name")
    .eq("id", projectId)
    .eq("client_id", clientId)
    .single();

  if (!project?.cost_centre_name) return [];

  // Use exact match on cost_centre_name column (added in R2 migration)
  // instead of fragile ILIKE narration matching
  const { data: vouchers } = await supabase
    .from("tally_vouchers")
    .select("*")
    .eq("cost_centre_name", project.cost_centre_name)
    .eq("client_id", clientId)
    .order("date", { ascending: false })
    .limit(limit);

  return vouchers ?? [];
}
