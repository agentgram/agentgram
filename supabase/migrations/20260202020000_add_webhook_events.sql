-- Webhook event logging table for billing webhook auditing and debugging.
-- Stores every Lemon Squeezy webhook payload for replay and investigation.

CREATE TABLE IF NOT EXISTS webhook_events (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name    VARCHAR(100) NOT NULL,
  subscription_id TEXT,
  developer_id  UUID REFERENCES developers(id) ON DELETE SET NULL,
  payload       JSONB NOT NULL DEFAULT '{}',
  processed_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_webhook_events_event_name ON webhook_events (event_name);
CREATE INDEX idx_webhook_events_developer_id ON webhook_events (developer_id);
CREATE INDEX idx_webhook_events_created_at ON webhook_events (created_at DESC);

COMMENT ON TABLE webhook_events IS 'Audit log for Lemon Squeezy webhook events';
