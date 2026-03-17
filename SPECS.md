# BuildWise Cashflow - Technical Specifications

## Project Overview

**BuildWise Cashflow** is a Financial Intelligence and WIP Analysis Platform designed specifically for **RR Thulasi Builders**, a construction company based in Chennai, India. The application provides real-time financial insights, project tracking, and work-in-progress analysis with planned Tally ERP integration.

### Client Information

| Field | Value |
|-------|-------|
| **Company** | RR Thulasi Builders |
| **Location** | Chennai, Tamil Nadu, India |
| **Industry** | Construction / Real Estate |
| **Primary User** | Thulasi Raman (MD/Owner) |
| **Project Type** | Residential & Commercial Construction |

### Business Objectives

1. **Real-time Financial Visibility** - Track cash flow, bank balances, receivables, and payables
2. **Project Cost Control** - Monitor budget vs actual spending across 18+ active projects
3. **WIP Issue Detection** - Automated alerts for cost overruns, duplicate entries, and anomalies
4. **Compliance Tracking** - GST, TDS, ESI/PF compliance monitoring
5. **Document Management** - Centralized storage for contracts, invoices, and drawings

---

## Tech Stack

| Layer | Technology | Version |
|-------|------------|---------|
| **Framework** | Next.js (App Router) | 14.2.35 |
| **Language** | TypeScript | 5.x |
| **Styling** | Tailwind CSS | 3.4.1 |
| **UI Components** | shadcn/ui + Radix UI | Latest |
| **Charts** | Recharts | 2.15.4 |
| **Icons** | Lucide React | 0.562.0 |
| **Date Handling** | date-fns | 4.1.0 |
| **Notifications** | Sonner | 2.0.7 |
| **Theming** | next-themes | 0.4.6 |
| **Deployment** | Vercel | - |

### Key Dependencies

```json
{
  "@radix-ui/react-*": "UI primitives (avatar, dialog, dropdown, tabs, etc.)",
  "class-variance-authority": "Component variant management",
  "tailwind-merge": "Tailwind class merging",
  "tailwindcss-animate": "Animation utilities"
}
```

---

## Features

### 1. Landing Page
- Hero section with product branding
- Feature highlights (6 key benefits)
- Mobile-responsive design
- Call-to-action buttons (Get Started, Learn More)

### 2. Authentication
- Login page with email/password
- Remember me functionality
- Cookie-based session management
- Logout with session cleanup

### 3. Dashboard (Main)
- **Financial Summary Cards**
  - Cash Balance (with daily change)
  - Bank Balance (with daily change)
  - Receivables (with weekly trend)
  - Payables (with weekly trend)
- **Cash Flow Trend Chart** - 7-day inflow/outflow visualization
- **Module Quick Links** - Reports, WIP Analysis, Live Tally
- **Recent WIP Alerts** - Top 4 issues with severity badges
- **Recent Transactions** - Last 5 transactions with type indicators
- **Active Projects Summary** - Grid of 6 projects with progress bars

### 4. Projects Module
- **Project List View**
  - Search and filter functionality
  - Status filters (All, Active, On-Hold, Completed)
  - Project cards with key metrics
  - Budget utilization progress bars
- **Project Detail View**
  - Project overview and statistics
  - Budget breakdown chart
  - Recent transactions list
  - Project-specific documents

### 5. Live Tally Integration
- **Transaction Feed**
  - Real-time transaction display (mock data)
  - Filter by type (All, Receipts, Payments)
  - Search by party name
  - Export to CSV functionality
- **Transaction Summary**
  - Today's totals (receipts, payments, net)
  - Visual type distribution
- **Status indicators** for transaction health

### 6. WIP Analysis
- **Issue Categories**
  - Cost Overrun detection
  - Duplicate Entry alerts
  - Missing Entry warnings
  - Anomaly detection
- **Severity Levels** - Critical, Warning, Info
- **Status Tracking** - New, Viewed, Reviewed
- **Filtering & Search**
- **Issue Detail Cards** with variance calculations

### 7. Reports Module
- **Report Categories**
  - Financial (P&L, Bank Reconciliation, Cash Flow)
  - Project (Cost Analysis, Progress Reports)
  - Compliance (TDS, GST, ESI/PF)
- **Search & Filter** functionality
- **Category Statistics Chart**
- **Export All** to CSV
- **File Type Indicators** (PDF, XLSX, CSV)

### 8. Documents Module
- **Document Types**
  - Contracts
  - Purchase Orders
  - Invoices
  - Receipts
  - Approvals
  - Drawings
- **Category Filtering**
- **Upload Interface** (UI only, mock)
- **Document Preview** (planned)

### 9. Schedules Module
- **Gantt-style Task View**
  - Hierarchical task structure
  - Expandable/collapsible tree
  - Progress indicators
- **Project Selection**
- **Task Details**
  - Start/End dates
  - Progress percentage
  - Status badges (Completed, In Progress, Not Started, Delayed)

### 10. Settings Module
- **Profile Settings**
  - Name, email, phone display
  - Avatar management (UI)
- **Notification Preferences**
  - Email notifications toggle
  - WIP alerts toggle
  - Daily summary toggle
- **Display Settings**
  - Dark mode toggle
  - Compact view toggle
- **Data Management**
  - Export settings (UI)
  - Clear cache (UI)

---

## Data Model

### Core Entities

```typescript
interface Project {
  id: string;
  name: string;
  location: string;
  status: 'active' | 'completed' | 'on-hold';
  budget: number;
  spent: number;
  startDate: string;
  endDate: string;
  progress: number;
}

interface Transaction {
  id: string;
  date: string;
  time: string;
  type: 'payment' | 'receipt';
  party: string;
  amount: number;
  project: string;
  category: string;
  status: 'on-track' | 'over-budget' | 'under-budget';
}

interface WIPIssue {
  id: string;
  projectId: string;
  projectName: string;
  type: 'cost-overrun' | 'duplicate' | 'missing' | 'anomaly';
  severity: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  budgeted: number;
  actual: number;
  detectedAt: string;
  status: 'new' | 'viewed' | 'reviewed';
}

interface Report {
  id: string;
  name: string;
  category: 'financial' | 'project' | 'compliance' | 'custom';
  updatedAt: string;
  fileType: 'pdf' | 'xlsx' | 'csv';
  size: string;
}

interface Document {
  id: string;
  name: string;
  type: 'contract' | 'po' | 'invoice' | 'receipt' | 'approval' | 'drawing';
  project: string;
  uploadedAt: string;
  fileType: string;
  size: string;
}

interface ScheduleTask {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  progress: number;
  parent?: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'accountant' | 'site-engineer' | 'viewer';
  avatar: string;
}
```

### Mock Data Summary

| Entity | Count | Notes |
|--------|-------|-------|
| Projects | 18 | Various statuses, Chennai locations |
| Transactions | 12 | Mix of payments and receipts |
| WIP Issues | 6 | All severity levels |
| Reports | 12 | All categories |
| Documents | 8 | All document types |
| Schedule Tasks | 16 | Hierarchical structure |

---

## API Endpoints (Planned)

### Authentication
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/login` | POST | User login |
| `/api/auth/logout` | POST | User logout |
| `/api/auth/refresh` | POST | Token refresh |

### Projects
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/projects` | GET | List all projects |
| `/api/projects/:id` | GET | Get project details |
| `/api/projects/:id/transactions` | GET | Project transactions |
| `/api/projects/:id/documents` | GET | Project documents |

### Transactions
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/transactions` | GET | List transactions (with filters) |
| `/api/transactions/summary` | GET | Daily/weekly summaries |

### WIP Analysis
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/wip/issues` | GET | List WIP issues |
| `/api/wip/issues/:id` | PATCH | Update issue status |
| `/api/wip/analyze` | POST | Trigger WIP analysis |

### Reports
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/reports` | GET | List reports |
| `/api/reports/:id/download` | GET | Download report file |
| `/api/reports/generate` | POST | Generate new report |

### Tally Integration (Future)
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/tally/sync` | POST | Trigger Tally sync |
| `/api/tally/status` | GET | Sync status |
| `/api/tally/transactions` | GET | Tally transactions |

---

## File Structure

```
buildwise-mvp/
├── .claude/                    # Claude AI instructions
│   └── CLAUDE.md
├── .next/                      # Next.js build output
├── .vercel/                    # Vercel deployment config
├── public/                     # Static assets
│   ├── icons/                  # PWA icons
│   └── manifest.json           # PWA manifest
├── src/
│   ├── app/
│   │   ├── dashboard/
│   │   │   ├── documents/      # Documents module
│   │   │   ├── projects/       # Projects module
│   │   │   │   └── [id]/       # Project detail page
│   │   │   ├── reports/        # Reports module
│   │   │   ├── schedules/      # Schedules module
│   │   │   ├── settings/       # Settings module
│   │   │   ├── tally/          # Tally integration
│   │   │   ├── wip/            # WIP analysis
│   │   │   ├── layout.tsx      # Dashboard layout with sidebar
│   │   │   ├── loading.tsx     # Dashboard skeleton
│   │   │   └── page.tsx        # Main dashboard
│   │   ├── login/              # Login page
│   │   ├── globals.css         # Global styles
│   │   ├── layout.tsx          # Root layout
│   │   └── page.tsx            # Landing page
│   ├── components/
│   │   ├── ui/                 # shadcn/ui components
│   │   ├── app-sidebar.tsx     # Main navigation
│   │   └── ServiceWorkerRegistration.tsx
│   └── lib/
│       ├── export-utils.ts     # CSV export utilities
│       ├── mock-data.ts        # Mock data definitions
│       └── utils.ts            # Utility functions
├── features.json               # Feature tracking
├── progress.txt                # Session progress
├── SPECS.md                    # This file
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

---

## Responsive Design

All pages are optimized for:
- **Mobile** (320px - 640px)
- **Tablet** (640px - 1024px)
- **Desktop** (1024px+)

Key responsive patterns:
- Collapsible sidebar on mobile
- Grid layouts adapt from 1 to 4 columns
- Touch-friendly tap targets (min 44px)
- Truncated text with tooltips on small screens

---

## Performance Optimizations

1. **Loading States** - Skeleton loaders for all pages
2. **Code Splitting** - Dynamic imports where appropriate
3. **Image Optimization** - Next.js Image component (when images added)
4. **Font Optimization** - Geist font with next/font
5. **CSS Optimization** - Tailwind purging unused styles

---

## Future Roadmap

### Phase 2 - Backend Integration
- [ ] Supabase/PostgreSQL database
- [ ] Real API endpoints
- [ ] User authentication with NextAuth
- [ ] Role-based access control

### Phase 3 - Tally Integration
- [ ] Tally Prime connector
- [ ] Real-time transaction sync
- [ ] Automated WIP analysis
- [ ] Reconciliation tools

### Phase 4 - Advanced Features
- [ ] Document OCR and parsing
- [ ] Predictive cash flow
- [ ] WhatsApp notifications
- [ ] Mobile app (React Native)

---

*Last Updated: January 13, 2026*
*Version: MVP 0.1.0*
