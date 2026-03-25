---
description: "Deployment and packaging — Vercel deploy, registry management, human review gate, PDF generation for paid clients"
---

# Phase 5: Deploy + Package

The final phase takes the generated HTML through human review, deploys to Vercel, and updates the playbook registry. For paid clients, it also produces a full delivery package.

## Human Review Gate (MANDATORY)

**No automated deployment. Ever.**

1. Open the generated HTML in the default browser: `open /Users/omm/PROJECTS/jicate-playbooks/[industry-slug]/index.html`
2. Ask the user: "Review the playbook for accuracy and sensitive information. Type 'deploy' to confirm, or describe what needs changing."
3. Wait for explicit confirmation before proceeding
4. If user requests changes, make them and re-open for review

This gate exists because:
- Research may surface confidential insider knowledge
- Stats may be outdated or misattributed
- Industry terminology may need domain expert validation
- White-label playbooks must not accidentally reference JICATE

## Bootstrapping (First Run)

If this is the first playbook being built, create the project structure:

```
/Users/omm/PROJECTS/jicate-playbooks/
  registry.json           # {"playbooks": []}
  registry-config.json    # {"supabaseEndpoint": null, "vercelTeam": "jkkn-institutions-vercel"}
  reference/              # Already exists (jicate-os-capabilities.md, jkkn-case-study.md)
  .gitignore              # registry.json, *.raw.json, research-cache/
```

- If `registry.json` does not exist, initialize with `{"playbooks": []}`
- If `registry-config.json` does not exist, initialize with `{"supabaseEndpoint": null, "vercelTeam": "jkkn-institutions-vercel"}`
- Add `registry.json` to `.gitignore` because it contains client names and deployment URLs

## Concurrency Guard

Before Phase 1 begins, check for in-progress builds:

1. Read `registry.json`
2. Look for any entry with the same industry slug AND `"status": "in-progress"`
3. If found: abort with message "A playbook for [industry] is already being generated. Check the registry or wait for completion."
4. If not found: add a new entry with `"status": "in-progress"` before starting research

This prevents duplicate work if the user accidentally triggers two builds for the same industry.

## Vercel Deployment

After human review confirmation:

1. Save final HTML to `/Users/omm/PROJECTS/jicate-playbooks/[industry-slug]/index.html`
2. Deploy to Vercel:
   ```bash
   cd /Users/omm/PROJECTS/jicate-playbooks/[industry-slug]
   /Users/omm/.npm-global/bin/vercel --prod --yes --name jicate-[industry-slug]-playbook
   ```
3. Capture the deployed URL from Vercel output

**If Vercel deploy fails:**
- Report the error and the local file path
- Set registry status to `"local-only"`
- Suggest: "Run `/playbook-deploy [industry-slug]` to retry deployment."

## Registry Management

Update `/Users/omm/PROJECTS/jicate-playbooks/registry.json` after deployment:

```json
{
  "id": "pharmacy-chains",
  "industry": "Pharmacy Chains",
  "audience": "Chain owners and operations heads",
  "geography": "India",
  "branding": "jicate",
  "clientName": null,
  "createdDate": "2026-03-16",
  "lastUpdated": "2026-03-16",
  "deployedUrl": "https://jicate-pharmacy-chains-playbook.vercel.app",
  "status": "deployed",
  "sections": 13,
  "researchSources": 47,
  "version": "1.0",
  "versions": [
    {"version": "1.0", "date": "2026-03-16", "status": "deployed"}
  ]
}
```

**Status values:** `in-progress`, `deployed`, `local-only`

**If registry write fails:** Retry once. If still fails, save the entry to `[industry-slug]/registry-entry.json` for manual merge. Report to user.

## Update Flow (--update flag)

When invoked with `--update`:

1. Look up industry slug in `registry.json`
2. If not found: treat as new playbook
3. If found: re-run all 3 research agents with fresh queries
4. Regenerate content while preserving the 13-section structure
5. Archive old version: copy `index.html` to `index.v[N].html`
6. Deploy new version to the same Vercel URL
7. Update registry: increment version, add to `versions` array
8. Same quality gates apply as for new playbooks

## /playbook-deploy Retry Command

For retrying failed deployments:

1. Read registry for the industry slug
2. Verify `index.html` exists at the expected path
3. Run Vercel deploy
4. Update registry status from `local-only` to `deployed`

## Paid Client Full Package

For white-label client engagements, produce additional deliverables after the HTML is deployed:

### 1. PDF Executive Summary (5 pages)

Generate a separate print-optimized HTML template:
- No interactive elements (checkboxes become static lists)
- A4-sized layout with simplified CSS
- Key findings, maturity model explanation, and recommendations
- Client branding throughout

Convert to PDF:
```bash
wkhtmltopdf --page-size A4 --margin-top 20mm --margin-bottom 20mm \
  /Users/omm/PROJECTS/jicate-playbooks/[slug]/executive-summary.html \
  /Users/omm/PROJECTS/jicate-playbooks/[slug]/executive-summary.pdf
```

If `wkhtmltopdf` is not installed: report "PDF generation requires wkhtmltopdf. Install with `brew install wkhtmltopdf` or skip PDF for now."

### 2. Deployment Guide (1-page markdown)

Save to `[slug]/deployment-guide.md`:
- How to host on client's own domain
- Custom domain setup with Vercel (CNAME record)
- How to update content in the future

### 3. Analytics Setup Instructions

Save to `[slug]/analytics-setup.md`:
- How to add Google Analytics 4 tag (if client prefers GA over JICATE analytics)
- How to set up a simple page view counter
- How to monitor the playbook's performance

## Security Checklist Before Deploy

Before the human review gate, verify:

- [ ] No raw API responses saved (only extracted data points)
- [ ] White-label playbooks contain zero JICATE references
- [ ] Client-provided strings are HTML-encoded
- [ ] Color values are validated hex
- [ ] CTA URLs use only https:// or mailto: schemes
- [ ] CSP meta tag present
- [ ] Insider knowledge flagged for human review
- [ ] `registry.json` is in `.gitignore`
