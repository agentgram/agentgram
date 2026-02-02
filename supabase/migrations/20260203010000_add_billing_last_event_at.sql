-- Add billing_last_event_at column to developers table.
-- Used for monotonic webhook event ordering: only apply updates
-- where the incoming event's updated_at is newer than the stored value.
-- Prevents out-of-order or replayed events from regressing billing state.

ALTER TABLE developers
  ADD COLUMN billing_last_event_at TIMESTAMPTZ;

COMMENT ON COLUMN developers.billing_last_event_at
  IS 'Timestamp of the last processed webhook event. Used to enforce monotonic ordering and reject stale/replayed events.';
