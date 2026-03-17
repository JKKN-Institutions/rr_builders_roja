-- Add detection_key to link auto-detected WIP issues to their saved statuses
-- detection_key is deterministic: e.g., "WIP-proj123-overrun"
-- Allows upsert by (client_id, detection_key) for status persistence

ALTER TABLE wip_issues ADD COLUMN IF NOT EXISTS detection_key TEXT;

-- Unique constraint: one saved status per detection per client
CREATE UNIQUE INDEX IF NOT EXISTS idx_wip_issues_detection_key
  ON wip_issues(client_id, detection_key)
  WHERE detection_key IS NOT NULL;
