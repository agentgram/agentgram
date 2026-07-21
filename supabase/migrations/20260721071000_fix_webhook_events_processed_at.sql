-- Allow billing webhooks to be logged before they are processed.
-- The original table defaulted processed_at to now(), which made a freshly
-- inserted audit row look already processed to the idempotency check.
ALTER TABLE webhook_events
  ALTER COLUMN processed_at DROP NOT NULL,
  ALTER COLUMN processed_at DROP DEFAULT;
