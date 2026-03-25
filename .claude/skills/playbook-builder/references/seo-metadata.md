---
description: "SEO and social sharing metadata — Open Graph, JSON-LD, canonical URLs, copyright"
---

# SEO and Social Sharing Metadata

Every generated playbook must include complete metadata for search engines and social sharing. This ensures playbooks look professional when shared on LinkedIn, Twitter, WhatsApp, and other platforms.

## Required Meta Tags

### Basic Meta

```html
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>The AI-Native [Industry] Playbook — [Brand Name]</title>
<meta name="description" content="[Industry-specific summary, max 150 characters]">
```

The description must be industry-specific, not generic. Bad: "A guide to AI transformation." Good: "What pharmacy chain owners need to know before AI-native operations management replaces their legacy systems."

### Open Graph (Facebook, LinkedIn, WhatsApp)

```html
<meta property="og:title" content="The AI-Native [Industry] Playbook">
<meta property="og:description" content="[Same as meta description or slightly longer version]">
<meta property="og:type" content="article">
<meta property="og:image" content="[Social card image URL]">
```

**og:image for v1:** Use a generic JICATE social card image hosted on Vercel. The URL will be set once the card is created and deployed. Until then, omit `og:image` rather than using a broken URL.

**og:image for white-label:** Omit unless client provides a social card image URL.

### Twitter Card

```html
<meta name="twitter:card" content="summary_large_image">
```

### Canonical URL

```html
<link rel="canonical" href="[Vercel deployment URL]">
```

Set this AFTER deployment succeeds. If deploying fails (local-only status), omit the canonical tag — a canonical pointing to a non-existent URL hurts SEO.

### Copyright

```html
<meta name="copyright" content="[Year] [Brand Name]">
```

Example: `<meta name="copyright" content="2026 JICATE Solutions">` or `<meta name="copyright" content="2026 Client Company Name">`

## JSON-LD Structured Data

Add a `<script type="application/ld+json">` block in `<head>`:

```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "The AI-Native [Industry] Playbook",
  "description": "[Meta description]",
  "author": {
    "@type": "Organization",
    "name": "[JICATE Solutions / Client Name]"
  },
  "publisher": {
    "@type": "Organization",
    "name": "[JICATE Solutions / Client Name]"
  },
  "datePublished": "[ISO 8601 date]",
  "dateModified": "[ISO 8601 date]",
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "[Canonical URL]"
  }
}
```

For JICATE-branded playbooks, `author` and `publisher` are both "JICATE Solutions."
For white-label, both use the client's company name.

## White-Label Metadata Overrides

When generating white-label playbooks, replace ALL metadata references:

| Field | JICATE Default | White-Label Override |
|-------|---------------|---------------------|
| `<title>` | "... — JICATE Solutions" | "... — [Client Name]" |
| `og:title` | Same as title | Same as title |
| `og:description` | Industry summary | Industry summary (no JICATE mention) |
| `og:image` | JICATE social card | Client social card or omit |
| Copyright | "JICATE Solutions" | Client name |
| JSON-LD author | "JICATE Solutions" | Client name |
| JSON-LD publisher | "JICATE Solutions" | Client name |

**Zero occurrences of "JICATE" in white-label metadata.** This is also verified by Gate 8 (Branding Correct) in `references/quality-gates.md`.
