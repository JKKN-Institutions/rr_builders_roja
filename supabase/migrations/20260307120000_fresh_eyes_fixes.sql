-- Fresh Eyes Fixes Migration
-- Addresses: SEC-12 (role escalation), BUG-10 (NULL client_id), SEC-09 (SECURITY DEFINER)

-- ============================================================
-- FIX SEC-12: Restrict dashboard_users self-update to safe columns only
-- Previously: users could update their own role, client_id, assigned_project_ids
-- ============================================================

DROP POLICY IF EXISTS "Users update own profile" ON dashboard_users;

-- Only allow users to update display_name and phone (not role, client_id, etc.)
CREATE POLICY "Users update own profile" ON dashboard_users
  FOR UPDATE USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid()
    AND role = (SELECT role FROM dashboard_users WHERE id = auth.uid())
    AND client_id = (SELECT client_id FROM dashboard_users WHERE id = auth.uid())
  );

-- ============================================================
-- FIX BUG-10: project_summaries uses v.client_id instead of p.client_id
-- Projects with no vouchers get NULL client_id, breaking the unique index
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
  AND v.narration ILIKE '%' || p.cost_centre_name || '%'
GROUP BY p.client_id, p.id, p.name, p.cost_centre_name, p.budget, p.status, p.location;

CREATE UNIQUE INDEX idx_project_summaries_pk ON project_summaries(client_id, project_id);

-- ============================================================
-- FIX SEC-09: Change refresh_dashboard_views to SECURITY INVOKER
-- ============================================================

CREATE OR REPLACE FUNCTION refresh_dashboard_views()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY project_summaries;
  REFRESH MATERIALIZED VIEW CONCURRENTLY daily_cashflow;
  REFRESH MATERIALIZED VIEW CONCURRENTLY financial_summary;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER;
