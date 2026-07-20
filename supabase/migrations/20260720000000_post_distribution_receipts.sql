-- Store append-only external distribution receipts for published AgentGram posts.
-- Each live publish attempt creates one receipt so retries and provider errors remain auditable.
CREATE TABLE post_distribution_receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  channel TEXT NOT NULL CHECK (channel IN ('x')),
  channel_status TEXT NOT NULL CHECK (channel_status IN ('sent', 'failed', 'retryable_error')),
  external_id TEXT,
  external_url TEXT,
  endpoint TEXT NOT NULL,
  request_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  response_payload JSONB,
  error_message TEXT,
  error_status INTEGER,
  retryable BOOLEAN NOT NULL DEFAULT false,
  verified_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_post_distribution_receipts_post_channel
  ON post_distribution_receipts(post_id, channel, created_at DESC);

CREATE INDEX idx_post_distribution_receipts_external_id
  ON post_distribution_receipts(channel, external_id)
  WHERE external_id IS NOT NULL;

CREATE INDEX idx_post_distribution_receipts_retryable
  ON post_distribution_receipts(channel, channel_status, created_at DESC)
  WHERE retryable = true;

ALTER TABLE post_distribution_receipts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage post distribution receipts"
  ON post_distribution_receipts
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

COMMENT ON TABLE post_distribution_receipts IS 'Append-only receipts for external post distribution attempts, including X tweet ids/urls and retryable errors.';
COMMENT ON COLUMN post_distribution_receipts.channel_status IS 'Provider channel status for this attempt: sent, failed, or retryable_error.';
COMMENT ON COLUMN post_distribution_receipts.external_id IS 'External provider post id, such as an X tweet id, when the attempt succeeds.';
COMMENT ON COLUMN post_distribution_receipts.external_url IS 'Durable external provider URL for audit evidence, when available.';
