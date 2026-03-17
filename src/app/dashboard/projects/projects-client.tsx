"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Building2,
  Grid3x3,
  List,
  Search,
  MapPin,
  Calendar,
  TrendingUp,
  FileDown,
} from "lucide-react";
import Link from "next/link";
import { convertToCSV, downloadCSV, getExportFilename } from "@/lib/export-utils";
import { formatINRCompact } from "@/lib/format";
import { toast } from "sonner";
import type { Project } from "@/lib/types";

interface ProjectsClientProps {
  projects: Project[];
}

export function ProjectsClient({ projects }: ProjectsClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const handleExport = () => {
    if (filteredProjects.length === 0) {
      toast.info("No projects to export with current filters");
      return;
    }
    const csvData = convertToCSV(filteredProjects, [
      { key: "name", label: "Project Name" },
      { key: "location", label: "Location" },
      { key: "budget", label: "Budget (₹)" },
      { key: "spent", label: "Spent (₹)" },
      { key: "progress", label: "Budget Used (%)" },
      { key: "status", label: "Status" },
      { key: "startDate", label: "Start Date" },
      { key: "endDate", label: "End Date" },
    ]);

    downloadCSV(csvData, getExportFilename("projects"));
    toast.success(`Exported ${filteredProjects.length} projects to CSV`);
  };

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesSearch =
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (project.location ?? "").toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || project.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [projects, searchQuery, statusFilter]);

  const statusCounts = useMemo(() => ({
    all: projects.length,
    active: projects.filter((p) => p.status === "active").length,
    completed: projects.filter((p) => p.status === "completed").length,
    "on-hold": projects.filter((p) => p.status === "on-hold").length,
  }), [projects]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
        <p className="text-muted-foreground">
          Manage and monitor all construction projects
        </p>
      </div>

      {/* Filters and View Toggle */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-4 flex-wrap">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <Tabs value={statusFilter} onValueChange={setStatusFilter}>
            <TabsList>
              <TabsTrigger value="all">
                All ({statusCounts.all})
              </TabsTrigger>
              <TabsTrigger value="active">
                Active ({statusCounts.active})
              </TabsTrigger>
              <TabsTrigger value="completed">
                Completed ({statusCounts.completed})
              </TabsTrigger>
              <TabsTrigger value="on-hold">
                On Hold ({statusCounts["on-hold"]})
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="default"
            onClick={handleExport}
            className="gap-2"
          >
            <FileDown className="h-4 w-4" />
            Export
          </Button>
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="icon"
            onClick={() => setViewMode("grid")}
          >
            <Grid3x3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="icon"
            onClick={() => setViewMode("list")}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Projects Grid/List */}
      {filteredProjects.length > 0 ? (
        viewMode === "grid" ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredProjects.map((project) => (
              <ProjectListItem key={project.id} project={project} />
            ))}
          </div>
        )
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">
              {projects.length === 0 ? "No projects yet" : "No projects found"}
            </p>
            <p className="text-sm text-muted-foreground">
              {projects.length === 0
                ? "Projects are auto-created when Tally vouchers with cost centres are synced."
                : "Try adjusting your filters or search query"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function ProjectCard({ project }: { project: Project }) {
  const budgetUsed = project.budget > 0 ? (project.spent / project.budget) * 100 : 0;
  const isOverBudget = budgetUsed > 100;

  return (
    <Link href={`/dashboard/projects/${project.id}`}>
      <Card className="cursor-pointer transition-all hover:shadow-md hover:border-primary/50">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base leading-tight line-clamp-2">
                {project.name}
              </CardTitle>
              {project.location && (
                <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  <span className="truncate">{project.location}</span>
                </div>
              )}
            </div>
            <Badge
              variant={
                project.status === "active"
                  ? "default"
                  : project.status === "completed"
                  ? "secondary"
                  : "outline"
              }
              className="shrink-0"
            >
              {project.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Budget Utilization */}
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-muted-foreground">Budget Used</span>
              <span className="font-medium">{project.progress}%</span>
            </div>
            <div className="h-2 rounded-full bg-muted">
              <div
                className={`h-2 rounded-full ${
                  project.progress === 100 ? "bg-green-600" : "bg-primary"
                }`}
                style={{ width: `${Math.min(project.progress, 100)}%` }}
              />
            </div>
          </div>

          {/* Budget */}
          <div className="space-y-1">
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground">Budget</span>
              <span className="font-medium">
                {project.budget > 0 ? formatINRCompact(project.budget) : "—"}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground">Spent</span>
              <span
                className={`font-medium ${
                  isOverBudget ? "text-red-600" : "text-green-600"
                }`}
              >
                {formatINRCompact(project.spent)}
                {isOverBudget && (
                  <span className="ml-1 text-[10px]">
                    (+{Math.round(budgetUsed - 100)}%)
                  </span>
                )}
              </span>
            </div>
          </div>

          {/* Timeline */}
          {project.startDate && project.endDate && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-2 border-t">
              <Calendar className="h-3 w-3" />
              <span>
                {new Date(project.startDate).toLocaleDateString("en-IN", {
                  month: "short",
                  year: "numeric",
                })}{" "}
                -{" "}
                {new Date(project.endDate).toLocaleDateString("en-IN", {
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

function ProjectListItem({ project }: { project: Project }) {
  const budgetUsed = project.budget > 0 ? (project.spent / project.budget) * 100 : 0;
  const isOverBudget = budgetUsed > 100;

  return (
    <Link href={`/dashboard/projects/${project.id}`}>
      <Card className="cursor-pointer transition-all hover:shadow-md hover:border-primary/50">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Building2 className="h-6 w-6 text-primary" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <div>
                  <h3 className="font-semibold truncate">{project.name}</h3>
                  {project.location && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      <span>{project.location}</span>
                    </div>
                  )}
                </div>
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
              </div>

              <div className="grid grid-cols-3 gap-4 mt-3">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Progress</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full bg-muted">
                      <div
                        className="h-1.5 rounded-full bg-primary"
                        style={{ width: `${Math.min(project.progress, 100)}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium">
                      {project.progress}%
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground mb-1">Budget</p>
                  <p className="text-sm font-semibold">
                    {project.budget > 0 ? formatINRCompact(project.budget) : "—"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground mb-1">Spent</p>
                  <p
                    className={`text-sm font-semibold ${
                      isOverBudget ? "text-red-600" : "text-green-600"
                    }`}
                  >
                    {formatINRCompact(project.spent)}
                  </p>
                </div>
              </div>
            </div>

            <TrendingUp className="h-5 w-5 text-muted-foreground shrink-0" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
