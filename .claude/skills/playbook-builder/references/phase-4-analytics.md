---
description: "Analytics injection — tracking script, Supabase schema, Edge Function security, privacy compliance"
---

# Phase 4: Analytics Injection

Every playbook includes a lightweight tracking script. The analytics infrastructure is a separate project — this phase only handles injecting the client-side script into the generated HTML.

## Injection Decision Flow

1. Read `/Users/omm/PROJECTS/jicate-playbooks/registry-config.json`
2. Check `supabaseEndpoint` field
3. If endpoint is live (non-null URL): inject full tracking script with that endpoint URL
4. If endpoint is null: inject no-op tracking stub so the HTML structure is ready for when analytics infra is built
5. Note in output: "Analytics tracking not active — run `/setup-playbook-analytics` first."

## Tracking Script (~2KB minified)

Inject as a `<script>` block at the bottom of the HTML, before `</body>`. The script handles:

### Session ID Generation

```javascript
const SESSION_ID = sessionStorage.getItem('pb_sid') || (() => {
  const id = crypto.randomUUID();
  sessionStorage.setItem('pb_sid', id);
  return id;
})();
```

- Uses `sessionStorage` (per-tab, expires on tab close)
- No `localStorage`, no cookies, no fingerprinting — privacy-friendly
- No IP-based derivation

### Events Tracked

| Event | Data Captured | Purpose |
|-------|---------------|---------|
| `page_view` | Playbook ID, timestamp, referrer, device type, country | Traffic volume |
| `scroll_depth` | 25%, 50%, 75%, 100% thresholds reached | Content engagement |
| `section_view` | Section ID when in viewport for 5+ seconds | Most-read sections |
| `checkbox_click` | Assessment group, checkbox index, checked/unchecked | Engagement depth |
| `assessment_complete` | Maturity level result, score, checklist score | Lead qualification |
| `email_submit` | Email, assessment score, playbook ID | Direct lead capture |
| `cta_click` | CTA type (email, link), playbook ID | Conversion |
| `prompt_copy` | Which prompt was copied | Content value signal |

### Event Batching

- Queue events in memory array
- Flush every 10 seconds via `setInterval`
- Also flush on `beforeunload` using `navigator.sendBeacon()` (more reliable than fetch on page close)
- If endpoint unreachable, silently discard — playbook works fine without analytics

### Device Type Detection

Simple user-agent parsing (not a full library):
- Mobile: screen width < 768px
- Tablet: screen width 768-1024px
- Desktop: screen width > 1024px

### No-Op Stub (when endpoint not configured)

```javascript
// Analytics stub — endpoint not configured
// Run /setup-playbook-analytics to enable tracking
window.pbTrack = function() {};
```

This ensures any inline `pbTrack()` calls in interactive elements do not throw errors.

## Supabase Schema

The analytics backend uses these tables. This schema is created by the `/setup-playbook-analytics` setup skill, NOT by playbook-builder. Documented here for reference so the tracking script sends compatible payloads.

```sql
-- Events table
CREATE TABLE playbook_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  playbook_id text NOT NULL,
  event_type text NOT NULL CHECK (event_type IN (
    'page_view', 'scroll_depth', 'section_view',
    'checkbox_click', 'assessment_complete',
    'email_submit', 'cta_click', 'prompt_copy'
  )),
  event_data jsonb CHECK (pg_column_size(event_data) < 4096),
  device_type text CHECK (device_type IN ('mobile', 'desktop', 'tablet')),
  country text,
  referrer text,
  session_id text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_events_playbook ON playbook_events(playbook_id);
CREATE INDEX idx_events_created ON playbook_events(created_at);

-- Leads table
CREATE TABLE playbook_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  playbook_id text NOT NULL,
  email text NOT NULL CHECK (length(email) <= 320),
  maturity_score int CHECK (maturity_score >= 0 AND maturity_score <= 16),
  readiness_score int CHECK (readiness_score >= 0 AND readiness_score <= 20),
  consent_given boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_leads_playbook ON playbook_leads(playbook_id);

-- Row Level Security
ALTER TABLE playbook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE playbook_leads ENABLE ROW LEVEL SECURITY;
```

## Edge Function Security Requirements

The Supabase Edge Function that receives events must enforce:

- **Rate limiting:** Max 10 events per session_id per minute; max 1 `email_submit` per session per hour
- **Payload validation:** Only known event types accepted; bounded field lengths
- **Origin validation:** Accept requests only from known playbook domains (`*.vercel.app`, `jicate.solutions`, registered client domains from registry)
- **Honeypot field:** Hidden form input on `email_submit` — if filled, silently discard (bot submission)
- **IP to country:** Derive country code from visitor IP at the Edge Function level. The IP itself is NOT stored — only the country code. This processing must be disclosed in the privacy policy.

## Privacy and Consent (MANDATORY)

### DPDPA 2023 (India) and GDPR (EU) Compliance

- **Email capture requires explicit consent:** Consent checkbox must be checked before form submission is allowed
- **Consent text:** "I agree to receive follow-up from [JICATE Solutions / Client Name]"
- **Privacy policy link:** `jicate.solutions/privacy` (JICATE) or client-provided URL (white-label)
- **No cookies, no localStorage for tracking** — only `sessionStorage` (per-tab, auto-clears)
- **No PII in analytics events** — only anonymous session_id, device type, country
- **Email is PII** — stored only in `playbook_leads` table with consent flag, protected by RLS
- **Right to deletion:** The analytics dashboard (separate project) must support deleting a lead's data on request

### White-Label Client Analytics

- JICATE-branded playbooks: tracking always on, data flows to JICATE Supabase
- White-label playbooks: tracking script included by default, CAN be removed if client prefers their own analytics
- Client NEVER sees other clients' data (RLS on `playbook_id`)
- For white-label: Edge Function sends notification email to client's CTA email on new `email_submit` events
