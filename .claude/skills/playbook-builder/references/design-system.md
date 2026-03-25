---
description: "Visual design system — colors, fonts, component styles, white-label color validation rules"
---

# Design System

All playbooks use the same visual language. Consistency builds brand recognition across industries. The reference implementation is at `/Users/omm/PROJECTS/jicate-playbook/index.html`.

## Color Palette

### Core Colors

| Token | Hex | CSS Variable | Usage |
|-------|-----|-------------|-------|
| Paper | `#f7f3ea` | `--paper` | Page background with subtle texture gradient |
| Ink | `#1a2332` | `--ink` | Primary text color |
| Muted | `#5a6577` | `--muted` | Secondary text, labels, captions |
| Line | `#d7d1c7` | `--line` | Borders, dividers |
| Shadow | `rgba(0,0,0,.10)` | `--shadow` | Box shadows |

### Accent Colors

| Token | Hex | CSS Variable | Usage |
|-------|-----|-------------|-------|
| **Teal** | `#0d9488` | `--teal` | Primary accent, CTAs, active states, checkmarks. **This is the white-label override target.** |
| **Amber** | `#d97706` | `--amber` | Secondary accent, sticky notes, warnings, Phase 2 timeline |
| **Rose** | `#e11d48` | `--rose` | Alert, urgency, bleeding areas, cost callouts |
| **Blue** | `#2563eb` | `--blue` | Info, Phase 3 timeline, architecture infra layer |
| **Sage** | `#16a34a` | `--sage` | Success, growth indicators |
| **Purple** | `#7c3aed` | `--purple` | AI layer in architecture diagram |

Each accent color has `-light` and `-mid` opacity variants for backgrounds and borders.

### Tab Background Colors

| Token | Value | Usage |
|-------|-------|-------|
| `--tab-teal` | `rgba(13,148,136,.22)` | Active nav button, teal tab labels |
| `--tab-amber` | `rgba(217,119,6,.22)` | Amber tab labels |
| `--tab-rose` | `rgba(225,29,72,.15)` | Rose tab labels |
| `--tab-blue` | `rgba(37,99,235,.15)` | Blue tab labels |
| `--tab-sage` | `rgba(11,109,65,.15)` | Sage tab labels |

## Font Stack

| Purpose | Font | Fallback | Weight |
|---------|------|----------|--------|
| Headings, nav, interactive labels | Patrick Hand | cursive | 400 (naturally appears bold) |
| Body text | Inter | system-ui, -apple-system, sans-serif | 400, 500, 600, 700, 800 |
| Code blocks, AI prompts | JetBrains Mono | monospace | 400, 500 |

Load from Google Fonts CDN:
```html
<link href="https://fonts.googleapis.com/css2?family=Patrick+Hand&family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
```

## Component Styles

### Page Cards (`.page`)

Each section is a `.page` card:
- Background: `rgba(255,255,255,.18)` — subtle white overlay on paper
- Border: `2px solid rgba(26,35,50,.18)`
- Border radius: 18px
- Box shadow: `0 18px 40px var(--shadow)`
- Scroll margin top: 75px (for nav offset)

### Content Cards (`.box`)

Cards within sections:
- Background: `rgba(255,255,255,.28)`
- Border: `2px solid rgba(26,35,50,.22)`
- Border radius: 16px
- Padding: 16px
- Optional slight rotation (`.rotate-a`: 0.3deg, `.rotate-b`: -0.4deg) for notebook feel

### Sticky Notes

Amber-colored callout blocks:
- Background: `rgba(217,119,6,.18)`
- Border: `2px solid rgba(217,119,6,.35)`
- Border radius: 16px
- Transform: `rotate(-.5deg)`
- Box shadow for depth

### Tab Labels (`.tab`)

Colored pills for section categorization:
- Padding: 6px 12px
- Border radius: 12px
- Border: `2px solid rgba(26,35,50,.22)`
- Transform: `rotate(-.5deg)`
- Variants: `.teal`, `.amber`, `.rose`, `.blue`, `.sage`, `.purple`

### Custom Checkboxes (`.cb`)

Interactive checkboxes for assessments:
- Size: 16x16px
- Border: `2px solid rgba(26,35,50,.45)`
- Border radius: 4px
- Unchecked: white background
- Checked: teal fill with white checkmark ("checkmark" character)
- Transition: 0.2s for smooth state change

### Bleeding Area Cards (`.bleed-card`)

Pain-point cards with urgency styling:
- Border: `2px solid rgba(225,29,72,.25)`
- Background: `rgba(225,29,72,.04)`
- Decorative circle (pseudo-element) in top-right
- Heading color: Rose
- Cost callout with rose background pill

### Architecture Layers (`.arch-layer`)

Stacked layer cards for the 4-layer diagram:
- Each layer has a distinct color: AI (purple), Core (teal), Sector (amber), Infra (blue)
- Pills inside each layer list the specific capabilities/modules

### Prompt Cards (`.prompt-card`)

AI prompt display:
- White background with strong border
- Decorative "tape" element (pseudo-element) at top-left
- Code block in JetBrains Mono (`.codeish`)
- Copy button below

## White-Label Color Override

### What Changes

Only `--teal` (and its variants `--teal-light`, `--teal-mid`, `--tab-teal`) is replaced with the client's primary color. Everything else stays the same:
- Amber, Rose, Blue, Sage, Purple — unchanged (they carry semantic meaning)
- Paper background, Ink text, Muted text — unchanged
- Component shapes, spacing, fonts — unchanged

### Color Validation Rules (MANDATORY)

**WCAG AA Contrast:**
- Client color must have 4.5:1 contrast ratio against white `#ffffff` for body text
- Client color must have 3:1 contrast ratio against white for large text and UI elements
- If contrast is insufficient: auto-darken the client color by stepping toward black in 5% increments until it passes

**Semantic Color Conflict Prevention:**
- Reject colors within 30 hue degrees of Amber (`#d97706`, hue ~37) — because amber means "warning/secondary"
- Reject colors within 30 hue degrees of Rose (`#e11d48`, hue ~343) — because rose means "alert/urgency"
- If rejected: suggest a shifted variant that clears the 30-degree buffer. Explain why: "Your color is too close to our warning/alert color, which would confuse the visual hierarchy."

**How to calculate hue distance:**
1. Convert both hex colors to HSL
2. Calculate angular distance: `min(abs(h1 - h2), 360 - abs(h1 - h2))`
3. If distance < 30: reject

## Background Texture

The paper background uses layered gradients for depth:
```css
background:
  radial-gradient(1200px 800px at 20% 10%, rgba(255,255,255,.55), transparent 55%),
  radial-gradient(900px 700px at 85% 35%, rgba(255,255,255,.35), transparent 60%),
  repeating-linear-gradient(0deg, rgba(0,0,0,.012), rgba(0,0,0,.012) 1px, transparent 3px, transparent 7px),
  linear-gradient(0deg, var(--paper), var(--paper));
```

This creates a warm, slightly textured paper feel without any external images.
