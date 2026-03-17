-- Fresh Eyes Round 2 Fixes
-- Addresses: PERF-01 (ILIKE -> cost_centre_name JOIN), cost_centre_name column on tally_vouchers

-- ============================================================
-- FIX PERF-01: Add cost_centre_name to tally_vouchers for direct JOIN
-- Previously: project_summaries used ILIKE narration matching (slow, error-prone)
-- Now: exact match on cost_centre_name column (fast, correct)
-- ============================================================

-- Add the new column (nullable — existing rows won't have it yet)
ALTER TABLE tally_vouchers ADD COLUMN IF NOT EXISTS cost_centre_name TEXT;

-- Index for the JOIN in project_summaries
CREATE INDEX IF NOT EXISTS idx_vouchers_cost_centre
  ON tally_vouchers(client_id, cost_centre_name);

-- ============================================================
-- Rebuild project_summaries with exact JOIN instead of ILIKE
-- ============================================================

DROP MATERIALIZED VIEW IF EXISTS project_summaries;

CREATE MATERIALIZED VIEW project_summaries AS
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
FROM projects p
LEFT JOIN tally_vouchers v ON v.client_id = p.client_id
  AND v.cost_centre_name = p.cost_centre_name
GROUP BY p.client_id, p.id, p.name, p.cost_centre_name, p.budget, p.status, p.location;

CREATE UNIQUE INDEX idx_project_summaries_pk ON project_summaries(client_id, project_id);
