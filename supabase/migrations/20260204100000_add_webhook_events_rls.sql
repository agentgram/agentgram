-- #170: Enable RLS on webhook_events table
--
-- The webhook_events table was created in 20260202020000_add_webhook_events.sql
-- without RLS, making it readable/writable by anyone with the anon key.
-- This table stores Lemon Squeezy webhook payloads containing billing-sensitive
-- data (subscription IDs, developer IDs, payment events) and must be restricted
-- to service_role access only.

ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role bypass" ON webhook_events
  FOR ALL TO service_role USING (true);
