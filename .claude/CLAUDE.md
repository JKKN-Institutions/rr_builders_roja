# BuildWise Cashflow MVP - Claude Instructions

## What This Project Is

**BuildWise Cashflow** is a Financial Intelligence and WIP Analysis Platform for RR Thulasi Builders, a Chennai-based construction company. This is the frontend MVP with mock data - backend integration is planned for Phase 2.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| UI Components | shadcn/ui + Radix UI |
| Charts | Recharts |
| Icons | Lucide React |
| Notifications | Sonner |
| Theming | next-themes |

## Project-Specific Rules

1. **Indian Rupee Formatting** - Always use `formatINR()` or `formatINRCompact()` from `@/lib/mock-data` for currency display. Never use USD or generic currency symbols.

2. **Mock Data Only** - This MVP uses mock data from `@/lib/mock-data.ts`. Do NOT create API routes or backend logic until Phase 2.

3. **Mobile-First** - All new components must be responsive. Test at 375px viewport width minimum.

4. **shadcn/ui Components** - Use existing components from `@/components/ui/`. If a new component is needed, use `npx shadcn@latest add [component]`.

5. **Chennai Context** - All project locations are in Chennai, Tamil Nadu. Transactions are in INR. Client is "RR Thulasi Builders".

6. **No Hardcoded Secrets** - Even in mock mode, never hardcode credentials. Use environment variables.

7. **Feature Tracking** - Update `features.json` when adding/modifying features. Keep status current.

## File Structure

```
src/
├── app/
│   ├── dashboard/           # Protected dashboard routes
│   │   ├── documents/       # Document management
│   │   ├── projects/        # Project list & detail
│   │   ├── reports/         # Reports module
│   │   ├── schedules/       # Schedule/Gantt view
│   │   ├── settings/        # User settings
│   │   ├── tally/           # Tally integration
│   │   ├── wip/             # WIP analysis
│   │   └── page.tsx         # Main dashboard
│   ├── login/               # Authentication
│   └── page.tsx             # Landing page
├── components/
│   ├── ui/                  # shadcn/ui components
│   └── app-sidebar.tsx      # Main navigation
└── lib/
    ├── export-utils.ts      # CSV export helpers
    ├── mock-data.ts         # All mock data & types
    └── utils.ts             # Utility functions
```

## Common Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start development server (localhost:3000) |
| `npm run build` | Build for production |
| `npm run lint` | Run ESLint |
| `npm start` | Start production server |

## Key Components

| Component | Path | Purpose |
|-----------|------|---------|
| AppSidebar | `components/app-sidebar.tsx` | Main navigation sidebar |
| Mock Data | `lib/mock-data.ts` | All data types and mock data |
| Export Utils | `lib/export-utils.ts` | CSV export functions |
| UI Components | `components/ui/` | shadcn/ui primitives |

## Data Types

Always import types from `@/lib/mock-data`:
- `Project` - Construction project
- `Transaction` - Payment/receipt
- `WIPIssue` - Work-in-progress issue
- `Report` - Generated report
- `Document` - Uploaded document
- `ScheduleTask` - Schedule item

## Helper Functions

From `@/lib/mock-data`:
- `formatINR(amount)` - Full INR formatting (e.g., "Rs. 45,00,000")
- `formatINRCompact(amount)` - Compact format (e.g., "Rs. 45L" or "Rs. 4.5Cr")
- `getRelativeTime(dateStr)` - Human-readable time (e.g., "2 hours ago")

From `@/lib/export-utils`:
- `convertToCSV(data, columns)` - Convert array to CSV string
- `downloadCSV(csvData, filename)` - Trigger CSV download
- `getExportFilename(prefix)` - Generate timestamped filename

## Environment Variables

| Variable | Purpose | Default |
|----------|---------|---------|
| `NEXT_PUBLIC_APP_URL` | Application URL | localhost:3000 |

## Known Issues / Gotchas

1. **Login is Mock** - Any email/password works. Real auth comes in Phase 2.

2. **Sidebar Badge** - WIP issues badge count is dynamic from mock data. Update `wipIssues` array to change count.

3. **Charts Need Container** - Recharts requires `ResponsiveContainer` wrapper for responsive sizing.

4. **Dark Mode Charts** - Use CSS variables for chart colors to support dark mode.

5. **Toast on Dashboard** - A success toast auto-fires on dashboard load. This is intentional for demo purposes.

## Testing Notes

- Run `npm run build` before marking features complete
- Test responsive design at 375px, 768px, and 1280px viewports
- Test dark mode toggle for all pages
- Verify CSV exports contain correct data

## Demo Credentials

For client demos:
- **User:** Thulasi Raman (MD)
- **Email:** md@rrthulasibuilders.com
- **Company:** RR Thulasi Builders

---

*Project initialized: January 13, 2026*
*Template: ~/.claude/templates/project-claude-md.md*
