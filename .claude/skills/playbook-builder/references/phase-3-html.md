---
description: "HTML generation — design system, template structure, white-label sanitization, interactive elements"
---

# Phase 3: HTML Generation

Build a single-page interactive HTML file that matches the established JICATE playbook aesthetic. The reference template is at `/Users/omm/PROJECTS/jicate-playbook/index.html` — read it before generating any playbook HTML.

## Template Structure

The HTML follows this exact structure. Every playbook reuses the same CSS framework with industry-specific content injected.

```
<!DOCTYPE html>
<html lang="en">
<head>
  <!-- Meta tags (see references/seo-metadata.md) -->
  <!-- Google Fonts: Patrick Hand, Inter, JetBrains Mono -->
  <!-- CSP meta tag -->
  <!-- All CSS inline in <style> block -->
</head>
<body>
  <!-- Desktop nav (sticky, horizontal, blur backdrop) -->
  <!-- Mobile nav (hamburger menu, slide-down) -->
  <div class="wrap">
    <!-- 13 <section class="page"> blocks, each with id -->
  </div>
  <footer class="footer">
    <!-- Branding, copyright, disclaimer -->
  </footer>
  <!-- All JavaScript inline at bottom -->
  <!-- Analytics tracking script (see references/phase-4-analytics.md) -->
</body>
</html>
```

## Design System Quick Reference

Read `references/design-system.md` for the full specification. Key points:

- **Background:** Warm paper `#f7f3ea` with subtle texture gradient
- **Fonts:** Patrick Hand (headings), Inter (body), JetBrains Mono (code/prompts)
- **Colors:** Teal `#0d9488` (primary), Amber `#d97706` (secondary), Rose `#e11d48` (alert)
- **Everything self-contained** except Google Fonts CDN — CSS and JS inline in the HTML file

## Interactive Element Specifications

### Maturity Model Self-Assessment (Section 8)

- 4 groups of 4 checkboxes (16 total), each group representing a maturity dimension
- Client-side JavaScript scoring function
- Results mapping: Level 1 (0-4 checks), Level 2 (5-8), Level 3 (9-12), Level 4 (13-16)
- Display both score and level with visual progress bar
- Each result includes specific next-step advice tailored to the industry
- Corresponding maturity level card highlights visually (`.active` class)
- Scroll result into view after calculation

### Readiness Checklist (Section 12)

- 4 groups of 5 checkboxes (20 total)
- Scoring tiers: Not Ready (0-5), Getting There (6-10), Ready to Pilot (11-15), Ready to Lead (16-20)
- Each tier includes specific guidance for the industry
- Optional email capture form after result (see below)

### Optional Email Capture

- Appears after assessment result shows — pure opt-in, never required
- Input field with email format validation (`/^[^\s@]+@[^\s@]+\.[^\s@]+$/`)
- POSTs to Supabase Edge Function endpoint (from `registry-config.json`)
- If endpoint not configured, falls back to `mailto:solutions@jicate.solutions` (or white-label CTA email)
- Confirmation message on success: "Results saved! We'll follow up with personalized recommendations."
- **Consent checkbox (MANDATORY):** "I agree to receive follow-up from [JICATE Solutions / Client Name]" with privacy policy link
- Privacy policy URL: `jicate.solutions/privacy` (JICATE) or client-provided URL (white-label)
- Honeypot hidden field for bot detection

### Copy-to-Clipboard Prompts (Section 11)

- Each prompt card has a "Copy Prompt" button
- Uses `navigator.clipboard.writeText()`
- Button text changes to "Copied!" for 2 seconds, then reverts
- The prompt text is in a `<pre>` or `.codeish` styled block using JetBrains Mono

### Sticky Navigation

- **Desktop:** Horizontal nav bar fixed to top with section buttons, blur backdrop
- **Mobile:** Hamburger menu with full-screen section list, slide-down animation
- Active section highlights as user scrolls — use `IntersectionObserver` (no scroll event handlers)
- Threshold: 0.3, rootMargin: '-80px 0px -50% 0px'

## White-Label Input Sanitization (MANDATORY)

All client-provided strings pass through sanitization before injection into the HTML template. This prevents XSS and injection attacks.

### String Sanitization

HTML-encode all client-provided text (company name, CTA text):
- `&` → `&amp;`
- `<` → `&lt;`
- `>` → `&gt;`
- `"` → `&quot;`
- `'` → `&#x27;`

### Color Validation

Validate client-provided colors against strict hex pattern: `/^#[0-9A-Fa-f]{6}$/`
Reject anything else. Also apply the semantic color conflict rules from `references/design-system.md`.

### URL Validation

CTA URLs: only allow `https://` and `mailto:` schemes. Reject `javascript:`, `data:`, `ftp:`, and any other scheme.

### CSP Header

Add to every playbook:
```html
<meta http-equiv="Content-Security-Policy" content="script-src 'self' 'unsafe-inline'">
```

## Branding Injection

### JICATE-branded (default)

- Nav brand: "JICATE" with diamond symbol
- Hero: "JICATE Solutions presents"
- CTA: `mailto:solutions@jicate.solutions` with "Talk to JICATE Solutions"
- Footer: "JICATE Solutions — AI-Native Institution Operating Systems"
- Primary color: Teal `#0d9488`

### White-label (paid client)

- Nav brand: Client company name
- Hero: "[Client Name] presents"
- CTA: Client's email or URL
- Footer: Client company name with copyright
- Primary color: Client's color (applied via `--primary` CSS variable only — Amber, Rose, Blue, Sage unchanged)
- JICATE is not mentioned anywhere in white-label playbooks

## Mobile Responsive Requirements

The playbook must render cleanly at 375px width (iPhone SE). Key breakpoints:

- **768px and below:** Hide desktop nav, show mobile hamburger. Single-column grids. Reduce title font size. Smaller padding.
- **480px and below:** Further reduce hero stats to single column. Smaller title.
- **Print:** Clean background, no nav, no box shadows, page-break-inside: avoid.

## File Size Target

The complete HTML file (CSS + content + JS, excluding Google Fonts CDN load) must be under 150KB. If it exceeds this:

1. Minify CSS (remove comments, compress whitespace)
2. Minify JS (compress variable names is optional — readability matters for maintenance)
3. Reduce section verbosity (tighten prose, remove redundant paragraphs)
4. If still over: report actual size and ask user whether to proceed
