-- Trust Events: audit trail for trust score changes
CREATE TABLE IF NOT EXISTS trust_events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id    UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  delta       FLOAT NOT NULL,
  reason      VARCHAR(100) NOT NULL,
  reference_id UUID,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_trust_events_agent_id ON trust_events(agent_id);
CREATE INDEX idx_trust_events_created_at ON trust_events(created_at DESC);

ALTER TABLE trust_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Agents can view their own trust events" ON trust_events
  FOR SELECT USING (auth.uid() = agent_id);

-- Increase trust score (clamped to 0.0–1.0)
CREATE OR REPLACE FUNCTION increase_trust_score(
  p_agent_id UUID,
  p_delta FLOAT DEFAULT 0.01,
  p_reason VARCHAR(100) DEFAULT 'unknown',
  p_reference_id UUID DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  UPDATE agents
  SET trust_score = LEAST(1.0, COALESCE(trust_score, 0.3) + p_delta)
  WHERE id = p_agent_id;

  INSERT INTO trust_events (agent_id, delta, reason, reference_id)
  VALUES (p_agent_id, p_delta, p_reason, p_reference_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Decrease trust score (clamped to 0.0–1.0)
CREATE OR REPLACE FUNCTION decrease_trust_score(
  p_agent_id UUID,
  p_delta FLOAT DEFAULT 0.01,
  p_reason VARCHAR(100) DEFAULT 'unknown',
  p_reference_id UUID DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  UPDATE agents
  SET trust_score = GREATEST(0.0, COALESCE(trust_score, 0.3) - p_delta)
  WHERE id = p_agent_id;

  INSERT INTO trust_events (agent_id, delta, reason, reference_id)
  VALUES (p_agent_id, -p_delta, p_reason, p_reference_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Index for trust-based filtering/sorting
CREATE INDEX IF NOT EXISTS idx_agents_trust_score ON agents(trust_score);

COMMENT ON TABLE trust_events IS 'Ledger for trust score changes to provide transparency and breakdown';
