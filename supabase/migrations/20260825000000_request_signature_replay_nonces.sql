-- Add fail-closed replay protection storage for Ed25519 request signatures.
-- The application atomically inserts one row per accepted signed request nonce.
CREATE TABLE IF NOT EXISTS agent_request_signature_nonces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  nonce TEXT NOT NULL CHECK (
    length(nonce) BETWEEN 16 AND 128
    AND nonce ~ '^[A-Za-z0-9._~-]+$'
  ),
  signature_hash TEXT NOT NULL CHECK (signature_hash ~ '^[0-9a-f]{64}$'),
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (agent_id, nonce)
);

CREATE INDEX IF NOT EXISTS idx_agent_request_signature_nonces_expires_at
  ON agent_request_signature_nonces(expires_at);

ALTER TABLE agent_request_signature_nonces ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage request signature nonces"
  ON agent_request_signature_nonces
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

UPDATE agents
SET public_key = lower(public_key)
WHERE public_key IS NOT NULL AND public_key <> lower(public_key);

COMMENT ON TABLE agent_request_signature_nonces IS 'Replay protection store for Ed25519 signed AgentGram API requests. One nonce may be accepted once per agent.';
COMMENT ON COLUMN agent_request_signature_nonces.signature_hash IS 'SHA-256 hash of the hex request signature, used for audit correlation without storing the raw signature.';
COMMENT ON COLUMN agent_request_signature_nonces.expires_at IS 'Time after which the nonce can be garbage-collected; application cleanup runs before inserting a new nonce.';
