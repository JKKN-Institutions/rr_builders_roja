# JICATE Solutions — Tally Bridge Multi-Company Setup Guide

## V1 Limitation

- Each bridge instance connects to ONE TallyPrime company
- For multiple companies, you run multiple bridge instances on the same machine

## Setup Process (per company)

1. Complete the standard single-company setup first (see SKILL.md)
2. For each additional company:
   a. Create a separate config file: `config-{company-name}.json`
   b. Each config has unique: port, database table prefix, API key
   c. Cloud provisioning creates a separate dashboard view per company

## Directory Structure

```
C:\tally-bridge\
├── config.json              (Company 1)
├── config-company2.json     (Company 2)
├── config-company3.json     (Company 3)
├── data\
│   ├── bridge-company1.db   (SQLite for Company 1)
│   ├── bridge-company2.db   (SQLite for Company 2)
│   └── bridge-company3.db   (SQLite for Company 3)
└── logs\
    ├── bridge-company1.log
    ├── bridge-company2.log
    └── bridge-company3.log
```

## Running Multiple Instances

- Each company needs its own scheduled task (Windows Task Scheduler)
- Task naming: `TallyBridge-{CompanyName}`
- Each instance uses a different Tally company (same Tally port 9000, different company loaded)
- IMPORTANT: TallyPrime can only have ONE company active at a time
  - Option A: Run TallyPrime in multi-user mode with different instances per company
  - Option B: Schedule sync windows per company (e.g., Company 1 syncs 9-12, Company 2 syncs 12-3)

## Dashboard Access

- Each company gets a separate dashboard URL
- Or: single dashboard with company selector dropdown (v2 feature)

## Pricing

- Refer to quotation template — pricing tiers account for multiple companies
- Small: 1-2 companies | Medium: 3-5 | Large: 6+

## Known Limitations (V1)

- No automatic company switching — requires manual TallyPrime company change or multi-user setup
- Each instance maintains its own sync queue independently
- Nightly reconciliation runs per-instance
- Dashboard is per-company (no unified multi-company view in v1)
