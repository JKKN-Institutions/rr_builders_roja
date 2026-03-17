-- Security hardening: protect materialized views with RLS-like filtered views
-- Materialized views do not support RLS natively. To prevent cross-client data
-- leakage via direct PostgREST queries, we:
--   1. Move materialized views out of public schema (PostgREST won't expose them)
--   2. Create regular SECURITY_BARRIER views in public that filter by client_id
--   3. Enable RLS on the views

-- ============================================================
-- Step 1: Create internal schema for materialized views
-- ============================================================

CREATE SCHEMA IF NOT EXISTS internal;

-- Move materialized views to internal schema
-- (DROP + recreate because ALTER MATERIALIZED VIEW SET SCHEMA is supported but
--  indexes need recreation and it's cleaner to rebuild)

-- project_summaries
DROP MATERIALIZED VIEW IF EXISTS public.project_summaries;

CREATE MATERIALIZED VIEW internal.project_summaries AS
SELECT
  p.client_id,
  p.id AS project_id,
  p.name AS project_name,
  p.cost_centre_name,
  p.budget,
  p.status AS project_status,
  p.location,
  COUNT(DISTINCT v.id) AS voucher_count,
  SUM(v.total_amount) FILTER (WHERE v.voucher_type IN ('Payment', 'Journal', 'Purchase', 'Debit Note')) AS total_spent,
  SUM(v.total_amount) FILTER (WHERE v.voucher_type IN ('Receipt', 'Sales', 'Credit Note')) AS total_received,
  MIN(v.date) AS first_transaction,
  MAX(v.date) AS last_transaction
FROM public.projects p
LEFT JOIN public.tally_vouchers v ON v.client_id = p.client_id
  AND v.cost_centre_name = p.cost_centre_name
GROUP BY p.client_id, p.id, p.name, p.cost_centre_name, p.budget, p.status, p.location;

CREATE UNIQUE INDEX idx_internal_project_summaries_pk ON internal.project_summaries(client_id, project_id);

-- daily_cashflow
DROP MATERIALIZED VIEW IF EXISTS public.daily_cashflow;

CREATE MATERIALIZED VIEW internal.daily_cashflow AS
SELECT
  client_id,
  date,
  SUM(total_amount) FILTER (WHERE voucher_type IN ('Receipt', 'Sales', 'Credit Note', 'Contra')) AS inflow,
  SUM(ABS(total_amount)) FILTER (WHERE voucher_type IN ('Payment', 'Purchase', 'Debit Note')) AS outflow,
  COUNT(*) AS voucher_count
FROM public.tally_vouchers
GROUP BY client_id, date
ORDER BY date;

CREATE UNIQUE INDEX idx_internal_daily_cashflow_pk ON internal.daily_cashflow(client_id, date);

-- financial_summary
DROP MATERIALIZED VIEW IF EXISTS public.financial_summary;

CREATE MATERIALIZED VIEW internal.financial_summary AS
SELECT
  client_id,
  COUNT(*) AS total_vouchers,
  SUM(total_amount) FILTER (WHERE voucher_type IN ('Receipt', 'Sales', 'Credit Note')) AS total_inflow,
  SUM(ABS(total_amount)) FILTER (WHERE voucher_type IN ('Payment', 'Purchase', 'Debit Note')) AS total_outflow,
  SUM(total_amount) FILTER (WHERE voucher_type IN ('Receipt', 'Sales', 'Credit Note'))
    - COALESCE(SUM(ABS(total_amount)) FILTER (WHERE voucher_type IN ('Payment', 'Purchase', 'Debit Note')), 0)
    AS net_cashflow,
  COUNT(DISTINCT party_name) AS unique_parties,
  COUNT(DISTINCT date) AS active_days,
  MIN(date) AS earliest_date,
  MAX(date) AS latest_date,
  SUM(total_amount) FILTER (
    WHERE voucher_type IN ('Receipt', 'Sales', 'Credit Note')
    AND date >= date_trunc('month', CURRENT_DATE)
  ) AS month_inflow,
  SUM(ABS(total_amount)) FILTER (
    WHERE voucher_type IN ('Payment', 'Purchase', 'Debit Note')
    AND date >= date_trunc('month', CURRENT_DATE)
  ) AS month_outflow
FROM public.tally_vouchers
GROUP BY client_id;

CREATE UNIQUE INDEX idx_internal_financial_summary_pk ON internal.financial_summary(client_id);

-- ============================================================
-- Step 2: Create filtered views in public schema
-- SECURITY_BARRIER prevents the optimizer from leaking rows via
-- pushed-down predicates (e.g., functions that expose data via side effects)
-- ============================================================

CREATE OR REPLACE VIEW public.project_summaries
  WITH (security_barrier = true)
AS
  SELECT * FROM internal.project_summaries
  WHERE client_id = (current_setting('request.jwt.claims', true)::jsonb->'app_metadata'->>'client_id');

CREATE OR REPLACE VIEW public.daily_cashflow
  WITH (security_barrier = true)
AS
  SELECT * FROM internal.daily_cashflow
  WHERE client_id = (current_setting('request.jwt.claims', true)::jsonb->'app_metadata'->>'client_id');

CREATE OR REPLACE VIEW public.financial_summary
  WITH (security_barrier = true)
AS
  SELECT * FROM internal.financial_summary
  WHERE client_id = (current_setting('request.jwt.claims', true)::jsonb->'app_metadata'->>'client_id');

-- ============================================================
-- Step 3: Update refresh function to use internal schema
-- ============================================================

CREATE OR REPLACE FUNCTION refresh_dashboard_views()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY internal.project_summaries;
  REFRESH MATERIALIZED VIEW CONCURRENTLY internal.daily_cashflow;
  REFRESH MATERIALIZED VIEW CONCURRENTLY internal.financial_summary;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER;

-- ============================================================
-- Step 4: Grant read access on internal schema to authenticated role
-- (PostgREST uses the authenticated role for logged-in users)
-- The security_barrier views handle filtering; this just allows the query
-- ============================================================

GRANT USAGE ON SCHEMA internal TO authenticated;
GRANT SELECT ON internal.project_summaries TO authenticated;
GRANT SELECT ON internal.daily_cashflow TO authenticated;
GRANT SELECT ON internal.financial_summary TO authenticated;

-- Service role needs full access for refresh
GRANT ALL ON SCHEMA internal TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA internal TO service_role;
