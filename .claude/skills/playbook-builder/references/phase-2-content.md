---
description: "Content generation rules — 13-section structure, content quality rules, JICATE OS reference guidance"
---

# Phase 2: Content Generation

Transform raw research data points into authoritative, industry-specific content. The difference between a forgettable playbook and an authority-establishing one is specificity — every sentence must prove you understand the reader's world.

## 13-Section Playbook Structure

Every playbook follows this exact structure. Content is industry-specific; structure is consistent.

| # | Section | Purpose | Key Elements |
|---|---------|---------|--------------|
| 1 | **Hero** | Hook + credibility | Title, subtitle, 4 stat boxes, "how to use this playbook" sticky note |
| 2 | **The Problem** | Create urgency | Hidden costs, the real situation, 3 shocking stats specific to this industry |
| 3 | **5 Bleeding Areas** | Name their pain | 5 industry-specific operational areas where money/time is wasted. Each with: description, bullet points, estimated annual cost |
| 4 | **The AI Shift** | Reframe the category | "Software that stores" vs "OS that thinks" — adapted to this industry's workflows. Before/after comparison |
| 5 | **What AI-Native Means** | Educate on YOUR terms | Native AI, Agentic AI, Natural Language — with industry-specific examples |
| 6 | **Architecture** | Show the solution shape | 4-layer diagram: AI Layer, Core Platform, Sector Modules, India Infrastructure. Sector modules specific to this industry |
| 7 | **10 Must-Haves** | Subtle criteria section | "10 things your [industry] OS must have" — each is an objective best practice that happens to align with JICATE OS capabilities. Authority tone, not feature list |
| 8 | **Maturity Model** | Self-assessment hook | 4 levels adapted to industry maturity (Level 1: Paper, Level 4: AI-Native). Interactive checkboxes with scoring |
| 9 | **30-60-90 Plan** | Practical roadmap | Foundation, Pilot, Expand — with industry-specific actions and timelines |
| 10 | **Case Study** | Social proof | Cross-industry case study adapted to be relevant. See Case Study Reference below |
| 11 | **AI Prompts** | Immediate value | 4-5 copy-paste prompts that work with any AI. Each includes a subtle "With an AI-native OS, this is automated" note |
| 12 | **Readiness Checklist** | Lead qualification | 20-question interactive checklist. 4 groups of 5. Scoring with assessment result |
| 13 | **CTA** | Convert | "Talk to [JICATE / Client name]" with contact link. "No sales pitch. Just a conversation." |

## Content Quality Rules

| Rule | Why | How to Enforce |
|------|-----|----------------|
| **No generic advice** | "AI can help with inventory" is worthless. Specific is authority. | Every claim must reference a data point ID from research. If no data point supports it, rewrite or remove. |
| **Real numbers only** | Made-up stats destroy credibility faster than no stats at all. | Cross-reference every percentage/number against the research JSON. If unsourced, convert to qualitative: "most operators report..." |
| **Industry-specific language** | Using generic terms signals outsider status. | Pull terminology from Pain Hunter and Stat Collector research. Minimum 15 industry-specific terms throughout. |
| **Problem-first framing** | Technology-first = sales pitch. Problem-first = authority. | Every section opens with the pain BEFORE introducing any solution concept. |
| **Authority tone, not sales** | 80% education, 20% positioning. Reader should think "these people understand my problems." | Count sentences: if more than 20% reference JICATE or the CTA, rewrite. JICATE is mentioned by name ONLY in Section 13 (CTA). |

## JICATE OS Capabilities Reference

Sections 5, 6, and 7 reference JICATE OS features. Read the canonical reference at:
`/Users/omm/PROJECTS/jicate-playbooks/reference/jicate-os-capabilities.md`

Key rules from that document:

- **Section 5 (What AI-Native Means):** Use the AI-Bolted-On vs AI-Native comparison adapted to target industry. Give 3 industry-specific examples. Do NOT mention "JICATE OS" by name.
- **Section 6 (Architecture):** Use the 4-layer architecture. Customize Layer 3 (Sector Modules) and Layer 4 (India Infrastructure) for the target industry. Do NOT mention "JICATE OS" by name.
- **Section 7 (10 Must-Haves):** Each must-have is a genuinely objective best practice. Natural alignment with JICATE OS, never direct reference. If a criterion does not match a current JICATE capability, include it anyway — authority over sales.
- **JICATE OS is mentioned by name ONLY in Section 13 (CTA).**

If the capabilities file does not exist, flag to user: "JICATE OS capabilities reference not found. Sections 5-7 will use the JKKN Knowledge Vault framework (AI Layer, Core Platform, Sector Modules, India Infrastructure) as the reference."

## Case Study Reference

Read the canonical case study at:
`/Users/omm/PROJECTS/jicate-playbooks/reference/jkkn-case-study.md`

That document contains:
- The anonymized multi-institution case study (never reveal the institution name)
- Hard numbers (93% time reduction in fee reconciliation, 80% payroll time reduction, etc.)
- 7 lessons learned
- Industry-specific adaptation templates (education, healthcare, manufacturing, professional services, retail)
- A generic bridge template for any industry

**For JICATE-branded playbooks:** Use the case study with the appropriate industry bridge.
**For white-label playbooks:** Omit the JKKN story entirely. Replace Section 10 with a "How to evaluate your readiness" deep-dive section that expands on the maturity model.

If the case study file does not exist, flag to user: "Case study reference not found. Section 10 will use a 'How to evaluate your readiness' format instead."

## Content Generation Process

1. Load consolidated research from `/Users/omm/PROJECTS/jicate-playbooks/[industry-slug]/research.json`
2. For each of the 13 sections, pull data points tagged for that section (via `targetSection` field)
3. Generate section content following the structure and quality rules above
4. Cross-check: every stat has a source, every section starts with pain, industry language count hits 15+
5. Run the banned phrases check from `references/quality-gates.md` before proceeding to Phase 3
