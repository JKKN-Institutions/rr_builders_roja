// Mock data for BuildWise Cashflow MVP
// Realistic Indian construction company data for RR Thulasi Builders
// Types are imported from @/lib/types.ts — the single source of truth
import type { Project, Transaction, WIPIssue, Report, Document, ScheduleTask } from "@/lib/types";

// Projects - 18 active construction projects
export const projects: Project[] = [
  { id: 'P001', name: 'Sunrise Residency', location: 'Anna Nagar, Chennai', status: 'active', budget: 4500000, spent: 5625000, startDate: '2025-06-15', endDate: '2026-12-30', progress: 65 },
  { id: 'P002', name: 'Metro Complex Tower', location: 'T. Nagar, Chennai', status: 'active', budget: 12000000, spent: 9800000, startDate: '2025-03-01', endDate: '2027-06-30', progress: 45 },
  { id: 'P003', name: 'Valley View Apartments', location: 'Velachery, Chennai', status: 'active', budget: 3200000, spent: 2880000, startDate: '2025-08-10', endDate: '2026-08-10', progress: 72 },
  { id: 'P004', name: 'Green Park Villas', location: 'Adyar, Chennai', status: 'active', budget: 8500000, spent: 5100000, startDate: '2025-09-01', endDate: '2027-03-31', progress: 38 },
  { id: 'P005', name: 'Royal Heights', location: 'Porur, Chennai', status: 'active', budget: 6200000, spent: 4960000, startDate: '2025-04-15', endDate: '2026-10-15', progress: 58 },
  { id: 'P006', name: 'Lake Side Manor', location: 'Sholinganallur', status: 'active', budget: 2800000, spent: 1680000, startDate: '2025-10-01', endDate: '2026-06-30', progress: 42 },
  { id: 'P007', name: 'Tech Park Phase 2', location: 'OMR, Chennai', status: 'active', budget: 25000000, spent: 17500000, startDate: '2025-01-15', endDate: '2027-01-15', progress: 52 },
  { id: 'P008', name: 'Heritage House', location: 'Mylapore, Chennai', status: 'active', budget: 1800000, spent: 1620000, startDate: '2025-07-01', endDate: '2026-04-30', progress: 78 },
  { id: 'P009', name: 'Garden City Flats', location: 'Perungudi', status: 'active', budget: 5500000, spent: 3850000, startDate: '2025-05-20', endDate: '2026-11-20', progress: 55 },
  { id: 'P010', name: 'Marina Bay Towers', location: 'ECR, Chennai', status: 'active', budget: 18000000, spent: 9000000, startDate: '2025-06-01', endDate: '2027-12-31', progress: 32 },
  { id: 'P011', name: 'Temple Town Plaza', location: 'Triplicane', status: 'on-hold', budget: 4200000, spent: 1260000, startDate: '2025-08-15', endDate: '2026-08-15', progress: 22 },
  { id: 'P012', name: 'Industrial Hub Block C', location: 'Ambattur', status: 'active', budget: 7800000, spent: 6240000, startDate: '2025-02-01', endDate: '2026-08-31', progress: 68 },
  { id: 'P013', name: 'Skyline Apartments', location: 'Nungambakkam', status: 'active', budget: 9200000, spent: 7360000, startDate: '2025-04-01', endDate: '2026-10-31', progress: 62 },
  { id: 'P014', name: 'Coastal Breeze Villas', location: 'Palavakkam', status: 'active', budget: 3600000, spent: 2520000, startDate: '2025-09-15', endDate: '2026-09-15', progress: 48 },
  { id: 'P015', name: 'City Center Mall', location: 'Egmore', status: 'active', budget: 32000000, spent: 22400000, startDate: '2024-12-01', endDate: '2027-06-30', progress: 55 },
  { id: 'P016', name: 'Lotus Pond Estate', location: 'Pallavaram', status: 'active', budget: 4800000, spent: 2400000, startDate: '2025-11-01', endDate: '2026-11-01', progress: 35 },
  { id: 'P017', name: 'River View Complex', location: 'Saidapet', status: 'completed', budget: 5600000, spent: 5320000, startDate: '2024-06-01', endDate: '2025-12-15', progress: 100 },
  { id: 'P018', name: 'Golden Gate Residency', location: 'Guindy', status: 'active', budget: 7200000, spent: 5040000, startDate: '2025-07-15', endDate: '2027-01-15', progress: 50 },
];

// Financial summary
export const financialSummary = {
  cashBalance: 1254320,
  bankBalance: 4523150,
  receivables: 12450000,
  payables: 8542000,
  todayChange: {
    cash: 45000,
    bank: -210000,
    receivables: -500000,
    payables: 300000,
  },
};

// Recent transactions
export const transactions: Transaction[] = [
  { id: 'T001', date: '2026-01-13', time: '14:32', type: 'payment', party: 'Steel Suppliers India Pvt Ltd', amount: 215000, project: 'Sunrise Residency', category: 'Materials', status: 'over-budget' },
  { id: 'T002', date: '2026-01-13', time: '14:15', type: 'receipt', party: 'Mr. Rajesh Kumar (Client)', amount: 500000, project: 'Metro Complex Tower', category: 'Advance', status: 'on-track' },
  { id: 'T003', date: '2026-01-13', time: '13:45', type: 'payment', party: 'Kumar Labor Contractors', amount: 85000, project: 'Valley View Apartments', category: 'Labor', status: 'on-track' },
  { id: 'T004', date: '2026-01-13', time: '12:30', type: 'payment', party: 'Chennai Cement Works', amount: 156000, project: 'Green Park Villas', category: 'Materials', status: 'on-track' },
  { id: 'T005', date: '2026-01-13', time: '11:20', type: 'payment', party: 'Electricals Plus', amount: 78500, project: 'Royal Heights', category: 'Electrical', status: 'under-budget' },
  { id: 'T006', date: '2026-01-13', time: '10:45', type: 'receipt', party: 'Mrs. Lakshmi Devi (Client)', amount: 250000, project: 'Lake Side Manor', category: 'Milestone', status: 'on-track' },
  { id: 'T007', date: '2026-01-13', time: '10:15', type: 'payment', party: 'JK Plumbing Services', amount: 45000, project: 'Tech Park Phase 2', category: 'Plumbing', status: 'on-track' },
  { id: 'T008', date: '2026-01-13', time: '09:30', type: 'payment', party: 'Quality Paints Pvt Ltd', amount: 92000, project: 'Heritage House', category: 'Finishing', status: 'on-track' },
  { id: 'T009', date: '2026-01-12', time: '16:45', type: 'payment', party: 'Titan Ready Mix', amount: 324000, project: 'Garden City Flats', category: 'Materials', status: 'on-track' },
  { id: 'T010', date: '2026-01-12', time: '15:30', type: 'receipt', party: 'Tech Mahindra (Corporate)', amount: 1500000, project: 'Tech Park Phase 2', category: 'Progress', status: 'on-track' },
  { id: 'T011', date: '2026-01-12', time: '14:20', type: 'payment', party: 'Safety Equipment Store', amount: 28000, project: 'Marina Bay Towers', category: 'Safety', status: 'on-track' },
  { id: 'T012', date: '2026-01-12', time: '11:00', type: 'payment', party: 'Sri Ganesh Metals', amount: 445000, project: 'City Center Mall', category: 'Materials', status: 'over-budget' },
];

// WIP Issues
export const wipIssues: WIPIssue[] = [
  {
    id: 'WIP001',
    projectId: 'P001',
    projectName: 'Sunrise Residency',
    type: 'cost-overrun',
    severity: 'critical',
    title: 'Material Cost Overrun - 25%',
    description: 'Steel and cement costs exceed budget by ₹11,25,000. Original budget ₹45,00,000, current spend ₹56,25,000.',
    budgeted: 4500000,
    actual: 5625000,
    detectedAt: '2026-01-13T14:30:00',
    status: 'new',
  },
  {
    id: 'WIP002',
    projectId: 'P003',
    projectName: 'Valley View Apartments',
    type: 'duplicate',
    severity: 'warning',
    title: 'Potential Duplicate Entry',
    description: 'Two payments to Kumar Labor Contractors on same date for similar amounts (₹85,000 and ₹84,500).',
    budgeted: 85000,
    actual: 169500,
    detectedAt: '2026-01-13T13:45:00',
    status: 'new',
  },
  {
    id: 'WIP003',
    projectId: 'P007',
    projectName: 'Tech Park Phase 2',
    type: 'missing',
    severity: 'warning',
    title: 'Missing Monthly Cement Entry',
    description: 'No cement purchase recorded for December 2025. Historical average is ₹3,20,000/month.',
    budgeted: 320000,
    actual: 0,
    detectedAt: '2026-01-12T09:00:00',
    status: 'viewed',
  },
  {
    id: 'WIP004',
    projectId: 'P012',
    projectName: 'Industrial Hub Block C',
    type: 'anomaly',
    severity: 'info',
    title: 'Unusual Payment Pattern',
    description: 'Three payments to different vendors on same day totaling ₹12,40,000. Higher than typical daily spend.',
    budgeted: 500000,
    actual: 1240000,
    detectedAt: '2026-01-11T16:00:00',
    status: 'reviewed',
  },
  {
    id: 'WIP005',
    projectId: 'P015',
    projectName: 'City Center Mall',
    type: 'cost-overrun',
    severity: 'critical',
    title: 'Electrical Work 18% Over Budget',
    description: 'Electrical contractor costs running 18% over estimates. Budget ₹48,00,000, current ₹56,64,000.',
    budgeted: 4800000,
    actual: 5664000,
    detectedAt: '2026-01-13T11:30:00',
    status: 'new',
  },
  {
    id: 'WIP006',
    projectId: 'P005',
    projectName: 'Royal Heights',
    type: 'cost-overrun',
    severity: 'warning',
    title: 'Labor Costs 12% Over',
    description: 'Labor contractor billing 12% higher than quoted. May need renegotiation.',
    budgeted: 1200000,
    actual: 1344000,
    detectedAt: '2026-01-12T14:00:00',
    status: 'new',
  },
];

// Reports
export const reports: Report[] = [
  { id: 'R001', name: 'Monthly P&L Summary - December 2025', category: 'financial', updatedAt: '2026-01-10T09:00:00', fileType: 'pdf', size: '2.4 MB' },
  { id: 'R002', name: 'Project Sunrise - Cost Analysis', category: 'project', updatedAt: '2026-01-13T09:00:00', fileType: 'xlsx', size: '1.8 MB' },
  { id: 'R003', name: 'TDS Compliance Status - Q3 2025', category: 'compliance', updatedAt: '2026-01-08T14:00:00', fileType: 'pdf', size: '890 KB' },
  { id: 'R004', name: 'Bank Reconciliation - December 2025', category: 'financial', updatedAt: '2026-01-05T10:30:00', fileType: 'xlsx', size: '1.2 MB' },
  { id: 'R005', name: 'Metro Complex - Progress Report', category: 'project', updatedAt: '2026-01-12T16:00:00', fileType: 'pdf', size: '5.6 MB' },
  { id: 'R006', name: 'GST Returns - December 2025', category: 'compliance', updatedAt: '2026-01-07T11:00:00', fileType: 'pdf', size: '456 KB' },
  { id: 'R007', name: 'Cash Flow Forecast - Q1 2026', category: 'financial', updatedAt: '2026-01-11T15:00:00', fileType: 'xlsx', size: '980 KB' },
  { id: 'R008', name: 'Valley View - Material Tracking', category: 'project', updatedAt: '2026-01-13T10:00:00', fileType: 'xlsx', size: '1.5 MB' },
  { id: 'R009', name: 'Annual Audit Checklist 2025', category: 'compliance', updatedAt: '2025-12-31T12:00:00', fileType: 'pdf', size: '320 KB' },
  { id: 'R010', name: 'Vendor Payment Summary', category: 'financial', updatedAt: '2026-01-13T08:00:00', fileType: 'xlsx', size: '2.1 MB' },
  { id: 'R011', name: 'Green Park - Budget vs Actual', category: 'project', updatedAt: '2026-01-09T14:30:00', fileType: 'pdf', size: '3.2 MB' },
  { id: 'R012', name: 'ESI/PF Compliance - December', category: 'compliance', updatedAt: '2026-01-06T09:00:00', fileType: 'pdf', size: '210 KB' },
];

// Documents
export const documents: Document[] = [
  { id: 'D001', name: 'Sunrise Residency - Main Contract', type: 'contract', project: 'Sunrise Residency', uploadedAt: '2025-06-10T10:00:00', fileType: 'pdf', size: '4.5 MB' },
  { id: 'D002', name: 'Steel Purchase Order #2024-156', type: 'po', project: 'Metro Complex Tower', uploadedAt: '2026-01-05T11:30:00', fileType: 'pdf', size: '120 KB' },
  { id: 'D003', name: 'Kumar Contractors Invoice - Dec 2025', type: 'invoice', project: 'Valley View Apartments', uploadedAt: '2026-01-02T09:00:00', fileType: 'pdf', size: '85 KB' },
  { id: 'D004', name: 'Site Plan - Green Park Villas', type: 'drawing', project: 'Green Park Villas', uploadedAt: '2025-08-20T14:00:00', fileType: 'pdf', size: '12.4 MB' },
  { id: 'D005', name: 'Electrical Approval - Royal Heights', type: 'approval', project: 'Royal Heights', uploadedAt: '2025-10-15T16:00:00', fileType: 'pdf', size: '890 KB' },
  { id: 'D006', name: 'Cement Receipt #45621', type: 'receipt', project: 'Tech Park Phase 2', uploadedAt: '2026-01-12T10:00:00', fileType: 'pdf', size: '45 KB' },
  { id: 'D007', name: 'City Center Mall - Amendment 3', type: 'contract', project: 'City Center Mall', uploadedAt: '2025-11-20T11:00:00', fileType: 'pdf', size: '2.1 MB' },
  { id: 'D008', name: 'Plumbing Layout - Heritage House', type: 'drawing', project: 'Heritage House', uploadedAt: '2025-07-25T09:30:00', fileType: 'pdf', size: '8.6 MB' },
];

// Schedule tasks for projects
export const scheduleTasks: ScheduleTask[] = [
  // Sunrise Residency (P001) - 16 tasks
  { id: 'S001', name: 'Sunrise Residency', startDate: '2025-06-15', endDate: '2026-12-30', progress: 65, projectId: 'P001' },
  { id: 'S002', name: 'Foundation Work', startDate: '2025-06-15', endDate: '2025-09-30', progress: 100, parent: 'S001', projectId: 'P001' },
  { id: 'S003', name: 'Excavation', startDate: '2025-06-15', endDate: '2025-07-15', progress: 100, parent: 'S002', projectId: 'P001' },
  { id: 'S004', name: 'Pile Foundation', startDate: '2025-07-16', endDate: '2025-08-31', progress: 100, parent: 'S002', projectId: 'P001' },
  { id: 'S005', name: 'Foundation Slab', startDate: '2025-09-01', endDate: '2025-09-30', progress: 100, parent: 'S002', projectId: 'P001' },
  { id: 'S006', name: 'Structure Work', startDate: '2025-10-01', endDate: '2026-06-30', progress: 75, parent: 'S001', projectId: 'P001' },
  { id: 'S007', name: 'Ground Floor', startDate: '2025-10-01', endDate: '2025-11-30', progress: 100, parent: 'S006', projectId: 'P001' },
  { id: 'S008', name: 'First Floor', startDate: '2025-12-01', endDate: '2026-01-05', progress: 85, parent: 'S006', projectId: 'P001' }, // DELAYED
  { id: 'S009', name: 'Second Floor', startDate: '2026-01-06', endDate: '2026-01-10', progress: 60, parent: 'S006', projectId: 'P001' }, // DELAYED
  { id: 'S010', name: 'Third Floor', startDate: '2026-01-11', endDate: '2026-03-31', progress: 20, parent: 'S006', projectId: 'P001' },
  { id: 'S011', name: 'Roof Slab', startDate: '2026-04-01', endDate: '2026-06-30', progress: 0, parent: 'S006', projectId: 'P001' },
  { id: 'S012', name: 'Finishing Work', startDate: '2026-07-01', endDate: '2026-12-30', progress: 0, parent: 'S001', projectId: 'P001' },
  { id: 'S013', name: 'Plastering', startDate: '2026-07-01', endDate: '2026-08-31', progress: 0, parent: 'S012', projectId: 'P001' },
  { id: 'S014', name: 'Electrical & Plumbing', startDate: '2026-09-01', endDate: '2026-10-31', progress: 0, parent: 'S012', projectId: 'P001' },
  { id: 'S015', name: 'Painting & Flooring', startDate: '2026-11-01', endDate: '2026-12-15', progress: 0, parent: 'S012', projectId: 'P001' },
  { id: 'S016', name: 'Final Inspection', startDate: '2026-12-16', endDate: '2026-12-30', progress: 0, parent: 'S012', projectId: 'P001' },

  // Metro Complex Tower (P002) - Commercial tower project
  { id: 'S017', name: 'Metro Complex Tower', startDate: '2025-03-01', endDate: '2027-06-30', progress: 45, projectId: 'P002' },
  { id: 'S018', name: 'Site Preparation', startDate: '2025-03-01', endDate: '2025-05-31', progress: 100, parent: 'S017', projectId: 'P002' },
  { id: 'S019', name: 'Demolition & Clearing', startDate: '2025-03-01', endDate: '2025-04-15', progress: 100, parent: 'S018', projectId: 'P002' },
  { id: 'S020', name: 'Site Survey & Layout', startDate: '2025-04-16', endDate: '2025-05-31', progress: 100, parent: 'S018', projectId: 'P002' },
  { id: 'S021', name: 'Foundation & Basement', startDate: '2025-06-01', endDate: '2025-11-30', progress: 100, parent: 'S017', projectId: 'P002' },
  { id: 'S022', name: 'Basement Excavation', startDate: '2025-06-01', endDate: '2025-08-31', progress: 100, parent: 'S021', projectId: 'P002' },
  { id: 'S023', name: 'Raft Foundation', startDate: '2025-09-01', endDate: '2025-11-30', progress: 100, parent: 'S021', projectId: 'P002' },
  { id: 'S024', name: 'Superstructure', startDate: '2025-12-01', endDate: '2026-12-31', progress: 35, parent: 'S017', projectId: 'P002' },
  { id: 'S025', name: 'Columns & Beams - Floors 1-5', startDate: '2025-12-01', endDate: '2026-04-30', progress: 100, parent: 'S024', projectId: 'P002' },
  { id: 'S026', name: 'Columns & Beams - Floors 6-10', startDate: '2026-05-01', endDate: '2026-08-31', progress: 40, parent: 'S024', projectId: 'P002' },
  { id: 'S027', name: 'Columns & Beams - Floors 11-15', startDate: '2026-09-01', endDate: '2026-12-31', progress: 0, parent: 'S024', projectId: 'P002' },
  { id: 'S028', name: 'MEP & Finishing', startDate: '2027-01-01', endDate: '2027-06-30', progress: 0, parent: 'S017', projectId: 'P002' },
  { id: 'S029', name: 'HVAC Installation', startDate: '2027-01-01', endDate: '2027-03-31', progress: 0, parent: 'S028', projectId: 'P002' },
  { id: 'S030', name: 'Interior Finishing', startDate: '2027-04-01', endDate: '2027-06-30', progress: 0, parent: 'S028', projectId: 'P002' },

  // Valley View Apartments (P003) - Residential apartments
  { id: 'S031', name: 'Valley View Apartments', startDate: '2025-08-10', endDate: '2026-08-10', progress: 72, projectId: 'P003' },
  { id: 'S032', name: 'Foundation Phase', startDate: '2025-08-10', endDate: '2025-11-15', progress: 100, parent: 'S031', projectId: 'P003' },
  { id: 'S033', name: 'Soil Testing', startDate: '2025-08-10', endDate: '2025-08-25', progress: 100, parent: 'S032', projectId: 'P003' },
  { id: 'S034', name: 'Foundation Casting', startDate: '2025-08-26', endDate: '2025-11-15', progress: 100, parent: 'S032', projectId: 'P003' },
  { id: 'S035', name: 'Structure Phase', startDate: '2025-11-16', endDate: '2026-04-30', progress: 90, parent: 'S031', projectId: 'P003' },
  { id: 'S036', name: 'Block A Structure', startDate: '2025-11-16', endDate: '2026-02-15', progress: 100, parent: 'S035', projectId: 'P003' },
  { id: 'S037', name: 'Block B Structure', startDate: '2026-01-15', endDate: '2026-04-30', progress: 80, parent: 'S035', projectId: 'P003' },
  { id: 'S038', name: 'Finishing Phase', startDate: '2026-05-01', endDate: '2026-08-10', progress: 30, parent: 'S031', projectId: 'P003' },
  { id: 'S039', name: 'Internal Plastering', startDate: '2026-05-01', endDate: '2026-06-15', progress: 50, parent: 'S038', projectId: 'P003' },
  { id: 'S040', name: 'Flooring & Tiling', startDate: '2026-06-16', endDate: '2026-07-20', progress: 10, parent: 'S038', projectId: 'P003' },
  { id: 'S041', name: 'Final Touches', startDate: '2026-07-21', endDate: '2026-08-10', progress: 0, parent: 'S038', projectId: 'P003' },

  // Green Park Villas (P004) - Villa project
  { id: 'S042', name: 'Green Park Villas', startDate: '2025-09-01', endDate: '2027-03-31', progress: 38, projectId: 'P004' },
  { id: 'S043', name: 'Land Development', startDate: '2025-09-01', endDate: '2025-12-31', progress: 100, parent: 'S042', projectId: 'P004' },
  { id: 'S044', name: 'Leveling & Roads', startDate: '2025-09-01', endDate: '2025-11-15', progress: 100, parent: 'S043', projectId: 'P004' },
  { id: 'S045', name: 'Underground Utilities', startDate: '2025-11-16', endDate: '2025-12-31', progress: 100, parent: 'S043', projectId: 'P004' },
  { id: 'S046', name: 'Villa Construction', startDate: '2026-01-01', endDate: '2026-12-31', progress: 25, parent: 'S042', projectId: 'P004' },
  { id: 'S047', name: 'Villa Type A (10 units)', startDate: '2026-01-01', endDate: '2026-08-31', progress: 45, parent: 'S046', projectId: 'P004' },
  { id: 'S048', name: 'Villa Type B (8 units)', startDate: '2026-04-01', endDate: '2026-12-31', progress: 15, parent: 'S046', projectId: 'P004' },
  { id: 'S049', name: 'Amenities & Landscaping', startDate: '2027-01-01', endDate: '2027-03-31', progress: 0, parent: 'S042', projectId: 'P004' },
  { id: 'S050', name: 'Clubhouse', startDate: '2027-01-01', endDate: '2027-02-28', progress: 0, parent: 'S049', projectId: 'P004' },
  { id: 'S051', name: 'Landscaping & Handover', startDate: '2027-03-01', endDate: '2027-03-31', progress: 0, parent: 'S049', projectId: 'P004' },

  // Royal Heights (P005) - Apartment complex
  { id: 'S052', name: 'Royal Heights', startDate: '2025-04-15', endDate: '2026-10-15', progress: 58, projectId: 'P005' },
  { id: 'S053', name: 'Foundation & Basement', startDate: '2025-04-15', endDate: '2025-08-31', progress: 100, parent: 'S052', projectId: 'P005' },
  { id: 'S054', name: 'Structure Work', startDate: '2025-09-01', endDate: '2026-04-30', progress: 70, parent: 'S052', projectId: 'P005' },
  { id: 'S055', name: 'Floors 1-4', startDate: '2025-09-01', endDate: '2025-12-31', progress: 100, parent: 'S054', projectId: 'P005' },
  { id: 'S056', name: 'Floors 5-8', startDate: '2026-01-01', endDate: '2026-04-30', progress: 40, parent: 'S054', projectId: 'P005' },
  { id: 'S057', name: 'Finishing & Handover', startDate: '2026-05-01', endDate: '2026-10-15', progress: 0, parent: 'S052', projectId: 'P005' },

  // Lake Side Manor (P006) - Boutique apartments
  { id: 'S058', name: 'Lake Side Manor', startDate: '2025-10-01', endDate: '2026-06-30', progress: 42, projectId: 'P006' },
  { id: 'S059', name: 'Foundation', startDate: '2025-10-01', endDate: '2025-12-15', progress: 100, parent: 'S058', projectId: 'P006' },
  { id: 'S060', name: 'Structure', startDate: '2025-12-16', endDate: '2026-04-15', progress: 55, parent: 'S058', projectId: 'P006' },
  { id: 'S061', name: 'Finishing', startDate: '2026-04-16', endDate: '2026-06-30', progress: 0, parent: 'S058', projectId: 'P006' },
];

// Daily cash flow data for charts (last 7 days)
export const dailyCashFlow = [
  { date: 'Jan 7', inflow: 850000, outflow: 620000 },
  { date: 'Jan 8', inflow: 450000, outflow: 780000 },
  { date: 'Jan 9', inflow: 1200000, outflow: 540000 },
  { date: 'Jan 10', inflow: 320000, outflow: 890000 },
  { date: 'Jan 11', inflow: 1500000, outflow: 1240000 },
  { date: 'Jan 12', inflow: 1500000, outflow: 797000 },
  { date: 'Jan 13', inflow: 750000, outflow: 671500 },
];

// User for demo
export const currentUser = {
  id: 'U001',
  name: 'Thulasi Raman',
  email: 'md@rrthulasibuilders.com',
  role: 'owner' as 'owner' | 'accountant' | 'site-engineer' | 'viewer',
  avatar: 'TR',
};

// Formatting functions are in @/lib/format.ts — import from there, not here.
// These re-exports maintain backward compatibility for any remaining imports.
export { formatINR, formatINRCompact, getRelativeTime } from "@/lib/format";
