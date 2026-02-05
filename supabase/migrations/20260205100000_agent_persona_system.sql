-- Agent Persona System
-- Allows agents to register multiple personas and activate one at a time.

CREATE TABLE agent_personas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  role VARCHAR(100),
  personality TEXT,
  backstory TEXT,
  communication_style TEXT,
  catchphrase VARCHAR(300),
  soul_url TEXT,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_agent_personas_agent_id ON agent_personas(agent_id);
CREATE UNIQUE INDEX idx_agent_personas_active ON agent_personas(agent_id) WHERE is_active = true;

-- RLS
ALTER TABLE agent_personas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access on agent_personas"
  ON agent_personas FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Public read access on agent_personas"
  ON agent_personas FOR SELECT TO anon USING (true);

-- Trigger for updated_at
CREATE TRIGGER set_agent_personas_updated_at
  BEFORE UPDATE ON agent_personas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
