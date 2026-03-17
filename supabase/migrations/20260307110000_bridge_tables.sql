-- BuildWise Bridge Tables — Shared with tally-bridge agent
-- These tables receive data from the Bridge Agent running on client machines

-- ============================================================
-- Client Registry (API key validation for Bridge Agents)
-- ============================================================

CREATE TABLE clients (
  id TEXT PRIMARY KEY,  -- e.g., 'rr-thulasi-001'
  company_name TEXT NOT NULL,
  api_key_prefix TEXT NOT NULL,  -- First 8 chars after 'bw_live_' — non-secret, used for O(1) DB lookup
  api_key_hash TEXT NOT NULL,  -- SHA-256 hash of full bw_live_xxx key (never store plaintext)
  tally_company TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  revoked_at TIMESTAMPTZ  -- NULL = active, set timestamp to revoke
);

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Block non-service-role reads" ON clients FOR SELECT USING (false);
CREATE POLICY "Block non-service-role inserts" ON clients FOR INSERT WITH CHECK (false);
CREATE POLICY "Block non-service-role updates" ON clients FOR UPDATE USING (false);
CREATE POLICY "Block non-service-role deletes" ON clients FOR DELETE USING (false);

-- ============================================================
-- Raw Voucher Data from Tally (one row per voucher)
-- ============================================================

CREATE TABLE tally_vouchers (
  id BIGSERIAL PRIMARY KEY,
  client_id TEXT NOT NULL REFERENCES clients(id),
  tally_master_id INTEGER NOT NULL,
  tally_alter_id INTEGER NOT NULL,
  voucher_number TEXT,
  voucher_type TEXT NOT NULL,
  date DATE NOT NULL,
  party_name TEXT,
  narration TEXT,
  total_amount DECIMAL(15,2),
  ledger_entries JSONB NOT NULL,
  raw_tally_data JSONB,
  synced_at TIMESTAMPTZ DEFAULT NOW(),
  tally_company TEXT NOT NULL,
  UNIQUE(client_id, tally_company, tally_master_id)  -- Idempotent upsert
);

ALTER TABLE tally_vouchers ENABLE ROW LEVEL SECURITY;

-- Dashboard users see own client data via JWT app_metadata
CREATE POLICY "Dashboard users see own vouchers" ON tally_vouchers
  FOR SELECT USING (client_id = (auth.jwt()->'app_metadata'->>'client_id'));

-- All writes go through service role (bridge API routes)
CREATE POLICY "Block non-service-role inserts on vouchers" ON tally_vouchers FOR INSERT WITH CHECK (false);
CREATE POLICY "Block non-service-role updates on vouchers" ON tally_vouchers FOR UPDATE USING (false);
CREATE POLICY "Block non-service-role deletes on vouchers" ON tally_vouchers FOR DELETE USING (false);

-- Performance indexes
CREATE INDEX idx_vouchers_client_date ON tally_vouchers(client_id, date);
CREATE INDEX idx_vouchers_client_type ON tally_vouchers(client_id, voucher_type);
CREATE INDEX idx_vouchers_client_company_master ON tally_vouchers(client_id, tally_company, tally_master_id);
CREATE INDEX idx_vouchers_party ON tally_vouchers(client_id, party_name);

-- ============================================================
-- Client Connection Status (Bridge Agent heartbeat)
-- ============================================================

CREATE TABLE tally_connection_status (
  client_id TEXT PRIMARY KEY REFERENCES clients(id),
  agent_instance_id TEXT,
  tally_online BOOLEAN DEFAULT FALSE,
  tally_company TEXT,
  tally_version TEXT,
  bridge_version TEXT,
  last_heartbeat TIMESTAMPTZ,
  last_sync_time TIMESTAMPTZ,
  last_sync_voucher_count INTEGER DEFAULT 0,
  queue_pending INTEGER DEFAULT 0,
  queue_failed INTEGER DEFAULT 0,
  uptime_seconds INTEGER DEFAULT 0,
  errors_last_hour INTEGER DEFAULT 0,
  overflow_file_size_bytes BIGINT DEFAULT 0,
  reconciliation_status TEXT DEFAULT 'pending',
  last_reconciliation TIMESTAMPTZ,
  last_instance_change TIMESTAMPTZ
);

ALTER TABLE tally_connection_status ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Dashboard users see own connection status" ON tally_connection_status
  FOR SELECT USING (client_id = (auth.jwt()->'app_metadata'->>'client_id'));

CREATE POLICY "Block non-service-role inserts on status" ON tally_connection_status FOR INSERT WITH CHECK (false);
CREATE POLICY "Block non-service-role updates on status" ON tally_connection_status FOR UPDATE USING (false);
CREATE POLICY "Block non-service-role deletes on status" ON tally_connection_status FOR DELETE USING (false);

-- ============================================================
-- Reconciliation History
-- ============================================================

CREATE TABLE tally_reconciliations (
  id BIGSERIAL PRIMARY KEY,
  client_id TEXT NOT NULL REFERENCES clients(id),
  reconciliation_date DATE NOT NULL,
  tally_voucher_data_hash TEXT NOT NULL,
  cloud_voucher_data_hash TEXT,
  status TEXT DEFAULT 'pending',  -- pending | match | mismatch | resynced
  tally_voucher_count INTEGER,
  cloud_voucher_count INTEGER,
  tally_total_debit DECIMAL(15,2),
  tally_total_credit DECIMAL(15,2),
  cloud_total_debit DECIMAL(15,2),
  cloud_total_credit DECIMAL(15,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE tally_reconciliations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Dashboard users see own reconciliations" ON tally_reconciliations
  FOR SELECT USING (client_id = (auth.jwt()->'app_metadata'->>'client_id'));

CREATE POLICY "Block non-service-role inserts on reconciliations" ON tally_reconciliations FOR INSERT WITH CHECK (false);
CREATE POLICY "Block non-service-role updates on reconciliations" ON tally_reconciliations FOR UPDATE USING (false);
CREATE POLICY "Block non-service-role deletes on reconciliations" ON tally_reconciliations FOR DELETE USING (false);

CREATE INDEX idx_reconciliations_client_date ON tally_reconciliations(client_id, reconciliation_date);

-- ============================================================
-- Resync Requests
-- ============================================================

CREATE TABLE tally_resync_requests (
  id BIGSERIAL PRIMARY KEY,
  client_id TEXT NOT NULL REFERENCES clients(id),
  from_date DATE NOT NULL,
  to_date DATE NOT NULL,
  reason TEXT,
  status TEXT DEFAULT 'pending',  -- pending | in_progress | completed | failed
  resync_attempt_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  claimed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

ALTER TABLE tally_resync_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Dashboard users see own resync requests" ON tally_resync_requests
  FOR SELECT USING (client_id = (auth.jwt()->'app_metadata'->>'client_id'));

CREATE POLICY "Block non-service-role inserts on resync" ON tally_resync_requests FOR INSERT WITH CHECK (false);
CREATE POLICY "Block non-service-role updates on resync" ON tally_resync_requests FOR UPDATE USING (false);
CREATE POLICY "Block non-service-role deletes on resync" ON tally_resync_requests FOR DELETE USING (false);

CREATE INDEX idx_resync_client_status ON tally_resync_requests(client_id, status);

-- ============================================================
-- Enable Realtime for dashboard live updates
-- ============================================================

ALTER PUBLICATION supabase_realtime ADD TABLE tally_connection_status;
ALTER PUBLICATION supabase_realtime ADD TABLE tally_vouchers;
