-- WIP Issues table — persists WIP issue statuses across sessions
-- Previously, WIP status changes (new → viewed → reviewed) were lost on page refresh

CREATE TABLE wip_issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id TEXT NOT NULL REFERENCES clients(id),
  project_id TEXT,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

ALTER TABLE wip_issues ENABLE ROW LEVEL SECURITY;

-- SELECT: users can see wip_issues belonging to their client
CREATE POLICY "Users see own client wip_issues" ON wip_issues
  FOR SELECT USING (
    client_id = (auth.jwt()->'app_metadata'->>'client_id')
  );

-- INSERT: users can create wip_issues for their client
CREATE POLICY "Users create own client wip_issues" ON wip_issues
  FOR INSERT WITH CHECK (
    client_id = (auth.jwt()->'app_metadata'->>'client_id')
  );

-- UPDATE: users can update wip_issues belonging to their client
CREATE POLICY "Users update own client wip_issues" ON wip_issues
  FOR UPDATE USING (
    client_id = (auth.jwt()->'app_metadata'->>'client_id')
  );

-- DELETE: users can delete wip_issues belonging to their client
CREATE POLICY "Users delete own client wip_issues" ON wip_issues
  FOR DELETE USING (
    client_id = (auth.jwt()->'app_metadata'->>'client_id')
  );

-- Index for fast lookups by client + status
CREATE INDEX idx_wip_issues_client_status ON wip_issues(client_id, status);
