---
description: "Deep research phase — 3 parallel agents, fallback chains, research output schema, deduplication"
---

# Phase 1: Deep Research (30+ minutes)

Research is the foundation of playbook authority. Generic research produces generic playbooks. Every minute invested here directly improves the final output.

## 3 Parallel Research Agents

Spawn all three simultaneously. Each agent operates independently and returns structured data.

| Agent | Focus | What to Search For |
|-------|-------|--------------------|
| **Pain Hunter** | Industry pain points, operational costs, failure stories, inefficiencies | Firecrawl search for: industry complaints, operational costs, failure case studies, Reddit threads, LinkedIn discussions about frustrations, industry association complaints |
| **Stat Collector** | Hard numbers: market size, error rates, compliance costs, time waste, benchmarks | Government data portals, industry association reports, research papers, IBEF/NASSCOM/sector reports, survey results, regulatory filings |
| **Trend Scanner** | AI adoption in this industry, competitor moves, emerging tech, regulatory changes | News articles, analyst reports, vendor announcements, conference proceedings, funding news, regulatory gazette notifications |

## Quality Gate: Research Depth

Each agent must return at least 10 substantiated data points with sources. If an agent returns generic or shallow results:

1. Re-research with more specific queries (narrow geography, add time range, use industry-specific terminology)
2. Maximum 2 re-research cycles per agent
3. After 2 failures, flag to user: "Research for [agent] returned insufficient data. Proceeding with [N] data points."

## Research Fallback Chain

Try sources in this order. Move to the next only when the current fails or returns insufficient results.

1. **Firecrawl search** (primary) — `firecrawl search "[industry] [specific query]"` with `--limit 10`
2. **WebSearch** (secondary) — broader web search for data the Firecrawl index missed
3. **Context7** (tertiary) — check if any indexed industry documentation exists: `resolve-library-id` with industry terms
4. **Flag to user** — if all three fail, report what was found and ask whether to proceed with limited data or provide more context

## Industry Scoping

If the user provides a top-level category, ask them to narrow before researching. Broad industries produce shallow playbooks.

**Top-level categories that need narrowing:** healthcare, manufacturing, education, retail, agriculture, finance, logistics, construction, hospitality, media

**Good scoping example:** "Healthcare" → "Pharmacy chains in India" or "Multi-location dental clinics" or "Diagnostic lab networks"

Define the target segment clearly before any agent starts researching. The segment definition goes into every search query.

## Insider Knowledge Handling

If the user provided industry-specific knowledge in the interview:

- **New data not found in research:** Use it with attribution like "based on operator experience" — this is what makes the playbook non-generic
- **Contradicts published numbers:** Present BOTH with context: "Industry reports cite X, though practitioners report Y" — intellectual honesty builds more authority than cherry-picking
- **Never silently replace** a sourced stat with an unsourced insider claim
- **Never ignore insider knowledge** — it often contains the most valuable, hard-to-find insights

## Research Output Schema

Each agent returns a structured JSON document. This schema feeds directly into Phase 2 content generation.

```json
{
  "agent": "pain-hunter | stat-collector | trend-scanner",
  "industry": "industry-slug",
  "dataPoints": [
    {
      "id": "PH-001",
      "claim": "Indian pharmacy chains lose 8% of revenue to expired inventory annually",
      "source": "CDSCO Annual Report 2025",
      "sourceUrl": "https://...",
      "type": "stat | pattern | trend | quote | case",
      "targetSection": "hero | problem | bleeding-areas | ai-shift | ai-native | architecture | must-haves | maturity | plan | case-study | prompts | checklist | cta",
      "confidence": "high | medium | low"
    }
  ],
  "queryCount": 12,
  "timestamp": "2026-03-16T10:30:00Z"
}
```

**ID prefixes:** PH- (Pain Hunter), SC- (Stat Collector), TS- (Trend Scanner)

## Research Deduplication

After all 3 agents complete:

1. Merge all data points into a single consolidated document
2. Flag duplicate data points (same stat appearing across agents) — keep the version with the stronger source
3. Assign each data point to exactly one playbook section (use `targetSection` field)
4. If a data point could serve multiple sections, assign to the primary section and add a `"alsoRelevantTo"` field
5. Save consolidated research to `/Users/omm/PROJECTS/jicate-playbooks/[industry-slug]/research.json`

## Security

- Do NOT save raw API responses — only extracted data points and source URLs
- Add `*.raw.json` and `research-cache/` to the project `.gitignore`
- Research files contain public data, but treat insider knowledge as confidential until the human review gate in Phase 5
