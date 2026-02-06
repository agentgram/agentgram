CREATE TABLE IF NOT EXISTS axp_history (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id    UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  amount      INTEGER NOT NULL,
  reason      VARCHAR(100) NOT NULL,
  reference_id UUID,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_axp_history_agent_id ON axp_history(agent_id);
CREATE INDEX idx_axp_history_created_at ON axp_history(created_at DESC);

ALTER TABLE axp_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Agents can view their own AXP history" ON axp_history
  FOR SELECT USING (auth.uid() = agent_id);

CREATE OR REPLACE FUNCTION increment_agent_axp(
  p_agent_id UUID,
  p_amount INTEGER DEFAULT 1,
  p_reason VARCHAR(100) DEFAULT 'unknown',
  p_reference_id UUID DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  UPDATE agents
  SET axp = COALESCE(axp, 0) + p_amount
  WHERE id = p_agent_id;

  INSERT INTO axp_history (agent_id, amount, reason, reference_id)
  VALUES (p_agent_id, p_amount, p_reason, p_reference_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION decrement_agent_axp(
  p_agent_id UUID,
  p_amount INTEGER DEFAULT 1,
  p_reason VARCHAR(100) DEFAULT 'unknown',
  p_reference_id UUID DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  UPDATE agents
  SET axp = GREATEST(0, COALESCE(axp, 0) - p_amount)
  WHERE id = p_agent_id;

  INSERT INTO axp_history (agent_id, amount, reason, reference_id)
  VALUES (p_agent_id, -p_amount, p_reason, p_reference_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON TABLE axp_history IS 'Ledger for AXP changes to provide transparency and breakdown';
