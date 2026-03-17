// BuildWise shared types — used by both data layer and UI components

export interface Project {
  id: string;
  name: string;
  location: string;
  status: "active" | "completed" | "on-hold";
  budget: number;
  spent: number;
  startDate: string;
  endDate: string;
  progress: number;
}

export interface Transaction {
  id: string;
  date: string;
  time: string;
  type: "payment" | "receipt";
  party: string;
  amount: number;
  project: string;
  category: string;
  status: "on-track" | "over-budget" | "under-budget";
}

export interface WIPIssue {
  id: string;
  projectId: string;
  projectName: string;
  type: "cost-overrun" | "duplicate" | "missing" | "anomaly";
  severity: "critical" | "warning" | "info";
  title: string;
  description: string;
  budgeted: number;
  actual: number;
  detectedAt: string;
  status: "new" | "viewed" | "reviewed";
}

export interface Report {
  id: string;
  name: string;
  category: "financial" | "project" | "compliance" | "custom";
  updatedAt: string;
  fileType: "pdf" | "xlsx" | "csv";
  size: string;
}

export interface Document {
  id: string;
  name: string;
  type: "contract" | "po" | "invoice" | "receipt" | "approval" | "drawing";
  project: string;
  uploadedAt: string;
  fileType: string;
  size: string;
}

export interface ScheduleTask {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  progress: number;
  parent?: string;
  projectId: string;
}

export interface FinancialSummary {
  cashBalance: number;
  bankBalance: number;
  receivables: number;
  payables: number;
  todayChange: {
    cash: number;
    bank: number;
    receivables: number;
    payables: number;
  };
}

export interface DailyCashFlow {
  date: string;
  inflow: number;
  outflow: number;
}

export interface WipIssue {
  id: string;
  client_id: string;
  project_id: string | null;
  title: string;
  description: string | null;
  status: "open" | "in_progress" | "resolved" | "closed";
  priority: "low" | "medium" | "high" | "critical";
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export interface ConnectionStatus {
  tallyOnline: boolean;
  lastHeartbeat: string | null;
  bridgeVersion: string | null;
  tallyCompany: string | null;
  tallyVersion: string | null;
  queuePending: number;
  queueFailed: number;
  lastSyncTime: string | null;
  lastSyncVoucherCount: number;
  errorsLastHour: number;
  uptimeSeconds: number;
  reconciliationStatus: string;
}
