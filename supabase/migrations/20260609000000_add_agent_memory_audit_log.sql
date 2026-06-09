CREATE TABLE IF NOT EXISTS agent_memory_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  developer_id UUID NOT NULL REFERENCES developers(id),
  operation TEXT NOT NULL CHECK (operation IN ('read', 'write', 'delete')),
  fact_key TEXT NOT NULL,
  fact_summary TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_agent_memory_audit_log_agent_id ON agent_memory_audit_log(agent_id, created_at DESC);
CREATE INDEX idx_agent_memory_audit_log_developer_id ON agent_memory_audit_log(developer_id);
