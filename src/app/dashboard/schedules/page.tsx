"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  CheckCircle2,
  ListTodo,
  Users,
  GitBranch,
  Bell,
  BarChart3,
  Milestone,
} from "lucide-react";

const plannedFeatures = [
  {
    title: "Work Breakdown Structure",
    description: "Hierarchical task breakdown with parent-child relationships and dependency tracking",
    icon: GitBranch,
    status: "Planned",
  },
  {
    title: "Milestone Tracking",
    description: "Define key project milestones with due dates and automatic progress calculation",
    icon: Milestone,
    status: "Planned",
  },
  {
    title: "Task Assignment",
    description: "Assign tasks to site engineers and team members with role-based visibility",
    icon: Users,
    status: "Planned",
  },
  {
    title: "Progress Updates",
    description: "Site engineers update task completion from mobile with photo attachments",
    icon: CheckCircle2,
    status: "Planned",
  },
  {
    title: "Gantt Chart View",
    description: "Visual timeline of all tasks with drag-and-drop rescheduling",
    icon: BarChart3,
    status: "Planned",
  },
  {
    title: "Delay Alerts",
    description: "Automatic notifications when tasks are behind schedule or at risk",
    icon: Bell,
    status: "Planned",
  },
];

const scheduleStats = [
  { label: "Task Management", value: "WBS-based", icon: ListTodo },
  { label: "View Types", value: "List + Gantt", icon: Calendar },
  { label: "Mobile Updates", value: "Field-ready", icon: CheckCircle2 },
  { label: "Smart Alerts", value: "Auto-detect", icon: Bell },
];

export default function SchedulesPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Project Schedules</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Track WBS progress and milestone completion
        </p>
      </div>

      {/* Coming Soon Banner */}
      <Card className="border-amber-200 bg-amber-50/50">
        <CardContent className="flex flex-col sm:flex-row items-center gap-4 py-6">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-amber-100">
            <Calendar className="h-7 w-7 text-amber-600" />
          </div>
          <div className="text-center sm:text-left">
            <h2 className="text-lg font-semibold">Schedule management is coming</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Project scheduling with WBS, milestones, and Gantt charts is in development.
              You will be able to create task hierarchies, assign work to team members,
              and track progress from the field.
            </p>
          </div>
          <Badge variant="secondary" className="shrink-0 gap-1">
            <Clock className="h-3 w-3" />
            Coming Soon
          </Badge>
        </CardContent>
      </Card>

      {/* Capability Preview Cards */}
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
        {scheduleStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  {stat.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Planned Features */}
      <div>
        <h2 className="text-base font-semibold mb-4 text-muted-foreground uppercase tracking-wide">
          Planned Features
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {plannedFeatures.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card
                key={feature.title}
                className="relative overflow-hidden opacity-80 hover:opacity-100 transition-opacity"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                      <Icon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <Badge variant="outline" className="text-xs gap-1">
                      <Clock className="h-3 w-3" />
                      {feature.status}
                    </Badge>
                  </div>
                  <CardTitle className="text-sm sm:text-base mt-3">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-xs sm:text-sm">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
