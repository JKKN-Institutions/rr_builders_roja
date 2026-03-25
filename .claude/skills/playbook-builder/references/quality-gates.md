---
description: "Quality gates and failure handling — 9 gates with retry limits, banned phrases, file size checks, accessibility"
---

# Quality Gates

Quality gates run sequentially after each phase completes. They catch problems early so the final output is publishable without human editing. Maximum 2 retry cycles per gate before flagging to user. All retries are internal — the user does not see intermediate failures.

## Operational Rules

- **Maximum total execution time:** 90 minutes. If exceeded, save current state and report progress.
- **Maximum retries per gate:** 2 (then flag to user with best-effort output)
- **File size override:** If the file size gate fails after optimization, report actual size and ask user whether to proceed with the larger file
- **All retries are internal** — user sees only the final result or the failure report

## The 9 Gates

### Gate 1: Research Depth

**When:** After Phase 1 completes
**Check:** Each of the 3 research agents returned at least 10 substantiated data points with sources
**Fail action:** Re-research with more specific queries (narrow geography, add time range, use industry-specific terminology)
**Max retries:** 2

### Gate 2: No Generic Content

**When:** After Phase 2 content generation
**Check:** Grep all section content for banned phrases. Any match fails the gate.

**Banned phrases (case-insensitive):**
- "AI can help with"
- "leverage technology"
- "digital transformation journey"
- "streamline operations"
- "cutting-edge technology"
- "unlock the power of"
- "in today's fast-paced"
- "holistic approach"
- "synergy"
- "paradigm shift"

**Why these are banned:** They signal generic, AI-generated content that destroys authority. Every claim must be specific, numbered, and industry-grounded. "AI can help with inventory management" tells the reader nothing. "Your average pharmacy chain loses 8% of revenue to expired stock annually — AI demand forecasting eliminates 60% of that waste" establishes authority.

**Fail action:** Rewrite flagged sections. Replace each banned phrase with a specific, numbered claim backed by a research data point.
**Max retries:** 2

### Gate 3: Industry Language

**When:** After Phase 2 content generation
**Check:** At least 15 industry-specific terms used throughout the playbook content (not counting section titles)
**Fail action:** Add terminology from research data points. Pull terms from Pain Hunter and Stat Collector outputs.
**Max retries:** 1

### Gate 4: Stats Are Real

**When:** After Phase 2 content generation
**Check:** Every percentage, currency amount, or specific number in the content has a corresponding source in the research JSON
**Fail action:** Remove unsourced stats OR convert to qualitative descriptions ("most operators report..." instead of "73% of operators...")
**Max retries:** 1

### Gate 5: Interactive Elements Work

**When:** After Phase 3 HTML generation
**Check:** All checkboxes toggle, scoring functions produce correct results, copy buttons work, navigation highlights correctly
**How to verify:** Review the JavaScript functions. Verify checkbox click handlers, scoring logic matches the spec (Maturity: 0-4 / 5-8 / 9-12 / 13-16; Readiness: 0-5 / 6-10 / 11-15 / 16-20), clipboard API calls are correct, IntersectionObserver is configured.
**Fail action:** Fix JavaScript
**Max retries:** 2

### Gate 6: Mobile Responsive

**When:** After Phase 3 HTML generation
**Check:** CSS includes media queries for 768px and 480px breakpoints. Desktop nav hides on mobile. Grids collapse to single column. Font sizes reduce appropriately.
**How to verify:** Review CSS media queries against the reference template patterns.
**Fail action:** Fix CSS — add missing breakpoints, adjust grid-template-columns, reduce font sizes
**Max retries:** 2

### Gate 7: File Size

**When:** After Phase 3 HTML generation
**Check:** HTML file size under 150KB (measured without Google Fonts CDN)
**Fail action:** Optimize — minify CSS/JS, reduce section verbosity, compress whitespace
**Max retries:** 1
**Override:** If still over after optimization, report actual size and ask user: "Playbook is [X]KB (target: 150KB). Deploy anyway?"

### Gate 8: Branding Correct

**When:** After Phase 3 HTML generation
**Check:**
- If JICATE: "JICATE Solutions" appears in nav, footer. Teal primary. `solutions@jicate.solutions` CTA.
- If white-label: Client name appears in nav, hero, CTA, footer. Client color applied. Zero occurrences of "JICATE" anywhere.
**Fail action:** Fix branding references
**Max retries:** 1

### Gate 9: Accessibility

**When:** After Phase 3 HTML generation
**Check:** ARIA labels on interactive elements (hamburger button, checkboxes), sufficient color contrast (WCAG AA), keyboard-navigable checkboxes, meaningful alt text where applicable
**How to verify:** Review HTML for `aria-label` attributes, check that custom checkboxes are keyboard-accessible (they use `<li>` click handlers from the reference template), verify color contrast ratios for text on colored backgrounds.
**Fail action:** Add missing ARIA labels, fix contrast issues, add keyboard event handlers
**Max retries:** 1

## Failure Handling

| Failure | User-Facing Behavior |
|---------|---------------------|
| Firecrawl rate-limited or down | "Research tool unavailable. Falling back to web search..." (use fallback chain from `references/phase-1-research.md`) |
| All research sources fail | "Could not gather sufficient research for [industry]. Please provide more context or try a different industry segment." |
| Quality gate fails after max retries | "Section [X] did not pass quality checks after 2 attempts. Proceeding with best version. Review recommended." |
| Vercel deploy fails | "Deployment failed. Playbook saved locally at [path]. Run `/playbook-deploy [slug]` to retry." |
| File size exceeds limit after optimization | "Generated playbook is [X]KB (target: 150KB). Attempting optimization..." then "Playbook is [X]KB. Deploy anyway?" |
| Registry write fails | Save entry to `[slug]/registry-entry.json`, report to user for manual merge |
| `wkhtmltopdf` not installed (paid client PDF) | "PDF generation requires wkhtmltopdf. Install with `brew install wkhtmltopdf` or skip PDF for now." |
| Supabase endpoint not configured | Inject no-op tracking stub. Note: "Analytics tracking not active — run `/setup-playbook-analytics` first." |

## Edge Cases

| Edge Case | Handling |
|-----------|---------|
| Industry with no AI adoption yet | Frame as "early mover advantage" — the playbook becomes even more valuable as the first authority content in that space |
| No hard stats available | Use qualitative descriptions, time estimates from industry interviews, and comparative benchmarks from adjacent industries |
| Industry too niche (e.g., "pigeon breeding farms") | Flag that research returned insufficient data, ask user to provide more context or broaden the industry definition |
| Industry too broad (e.g., "healthcare") | Ask follow-up to narrow to a segment (see Industry Scoping in `references/phase-1-research.md`) |
| Client wants to update later | Use `--update` flag. Re-runs research, regenerates content, archives old version, deploys to same URL. See `references/phase-5-deploy.md` |
| Multiple playbooks for same industry | Registry tracks versions. New invocation creates v2, does not overwrite v1 |
| Non-English language | Out of scope for v1. English only. |
| Firecrawl down or rate-limited | Follow fallback chain: Firecrawl, WebSearch, Context7. If all fail, flag to user. |
