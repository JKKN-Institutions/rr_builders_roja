-- BuildWise Dashboard Tables — Projects, Users, Alerts
-- These tables power the Next.js dashboard and role-based access

-- ============================================================
-- Projects (auto-created from Tally cost centres)
-- ============================================================

CREATE TABLE projects (
  id TEXT PRIMARY KEY,  -- slug from cost centre name, e.g. 'brigade-gateway-tower-a'
  client_id TEXT NOT NULL REFERENCES clients(id),
  name TEXT NOT NULL,
  cost_centre_name TEXT NOT NULL,  -- exact Tally cost centre name for mapping
  location TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'on-hold')),
  budget DECIMAL(15,2),
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(client_id, cost_centre_name)
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Dashboard users see own projects" ON projects
  FOR SELECT USING (client_id = (auth.jwt()->'app_metadata'->>'client_id'));

-- Allow authenticated users to update projects (e.g. set budget, location)
CREATE POLICY "Dashboard users update own projects" ON projects
  FOR UPDATE USING (client_id = (auth.jwt()->'app_metadata'->>'client_id'));

CREATE POLICY "Block non-service-role inserts on projects" ON projects FOR INSERT WITH CHECK (false);
CREATE POLICY "Block non-service-role deletes on projects" ON projects FOR DELETE USING (false);

CREATE INDEX idx_projects_client ON projects(client_id);
CREATE INDEX idx_projects_cost_centre ON projects(client_id, cost_centre_name);

-- ============================================================
-- Dashboard Users (linked to Supabase Auth)
-- ============================================================

CREATE TABLE dashboard_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id TEXT NOT NULL REFERENCES clients(id),
  role TEXT NOT NULL CHECK (role IN ('owner', 'accountant', 'site-engineer', 'viewer')),
  display_name TEXT,
  phone TEXT,
  email TEXT,
  assigned_project_ids TEXT[],  -- for site-engineer role (array of project.id)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE dashboard_users ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "Users see own profile" ON dashboard_users
  FOR SELECT USING (id = auth.uid());

-- Owners can see all users in their client
CREATE POLICY "Owners see all client users" ON dashboard_users
  FOR SELECT USING (
    client_id = (auth.jwt()->'app_metadata'->>'client_id')
    AND (auth.jwt()->'app_metadata'->>'role') IN ('owner', 'accountant')
  );

-- Users can update their own profile (name, phone)
CREATE POLICY "Users update own profile" ON dashboard_users
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Block non-service-role inserts on users" ON dashboard_users FOR INSERT WITH CHECK (false);
CREATE POLICY "Block non-service-role deletes on users" ON dashboard_users FOR DELETE USING (false);

CREATE INDEX idx_dashboard_users_client ON dashboard_users(client_id);

-- ============================================================
-- Alert Preferences
-- ============================================================

CREATE TABLE alert_preferences (
  id BIGSERIAL PRIMARY KEY,
  client_id TEXT NOT NULL REFERENCES clients(id),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  channel TEXT NOT NULL CHECK (channel IN ('whatsapp', 'email', 'in_app')),
  event_type TEXT NOT NULL CHECK (event_type IN (
    'sync_failure', 'anomaly', 'budget_overrun', 'daily_summary',
    'reconciliation_mismatch', 'new_voucher'
  )),
  enabled BOOLEAN DEFAULT TRUE,
  destination TEXT,  -- phone number or email (null for in_app)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, channel, event_type)
);

ALTER TABLE alert_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own alert preferences" ON alert_preferences
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users manage own alert preferences" ON alert_preferences
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users insert own alert preferences" ON alert_preferences
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users delete own alert preferences" ON alert_preferences
  FOR DELETE USING (user_id = auth.uid());

-- ============================================================
-- Alert Log
-- ============================================================

CREATE TABLE alert_log (
  id BIGSERIAL PRIMARY KEY,
  client_id TEXT NOT NULL REFERENCES clients(id),
  user_id UUID REFERENCES auth.users(id),
  event_type TEXT NOT NULL,
  channel TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  recipient TEXT,
  payload JSONB,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'read')),
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE alert_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own alerts" ON alert_log
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users mark own alerts read" ON alert_log
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Block non-service-role inserts on alerts" ON alert_log FOR INSERT WITH CHECK (false);
CREATE POLICY "Block non-service-role deletes on alerts" ON alert_log FOR DELETE USING (false);

CREATE INDEX idx_alert_log_user ON alert_log(user_id, status);
CREATE INDEX idx_alert_log_client ON alert_log(client_id, created_at DESC);

-- ============================================================
-- Materialized Views for Dashboard Performance
-- ============================================================

-- Project financial summaries (refreshed after each ingest batch)
CREATE MATERIALIZED VIEW project_summaries AS
SELECT
  v.client_id,
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
GROUP BY v.client_id, p.id, p.name, p.cost_centre_name, p.budget, p.status, p.location;

CREATE UNIQUE INDEX idx_project_summaries_pk ON project_summaries(client_id, project_id);

-- Daily cashflow (refreshed after each ingest batch)
CREATE MATERIALIZED VIEW daily_cashflow AS
SELECT
  client_id,
  date,
  SUM(total_amount) FILTER (WHERE voucher_type IN ('Receipt', 'Sales', 'Credit Note', 'Contra')) AS inflow,
  SUM(ABS(total_amount)) FILTER (WHERE voucher_type IN ('Payment', 'Purchase', 'Debit Note')) AS outflow,
  COUNT(*) AS voucher_count
FROM tally_vouchers
GROUP BY client_id, date
ORDER BY date;

CREATE UNIQUE INDEX idx_daily_cashflow_pk ON daily_cashflow(client_id, date);

-- Financial summary (refreshed after each ingest batch)
CREATE MATERIALIZED VIEW financial_summary AS
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
  -- Current month stats
  SUM(total_amount) FILTER (
    WHERE voucher_type IN ('Receipt', 'Sales', 'Credit Note')
    AND date >= date_trunc('month', CURRENT_DATE)
  ) AS month_inflow,
  SUM(ABS(total_amount)) FILTER (
    WHERE voucher_type IN ('Payment', 'Purchase', 'Debit Note')
    AND date >= date_trunc('month', CURRENT_DATE)
  ) AS month_outflow
FROM tally_vouchers
GROUP BY client_id;

CREATE UNIQUE INDEX idx_financial_summary_pk ON financial_summary(client_id);

-- ============================================================
-- Enable Realtime for alert_log (in-app notifications)
-- ============================================================

ALTER PUBLICATION supabase_realtime ADD TABLE alert_log;

-- ============================================================
-- Helper function to refresh all materialized views
-- ============================================================

CREATE OR REPLACE FUNCTION refresh_dashboard_views()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY project_summaries;
  REFRESH MATERIALIZED VIEW CONCURRENTLY daily_cashflow;
  REFRESH MATERIALIZED VIEW CONCURRENTLY financial_summary;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
