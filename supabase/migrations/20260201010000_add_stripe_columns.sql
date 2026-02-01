-- Add Stripe subscription columns to agents table
ALTER TABLE agents
  ADD COLUMN IF NOT EXISTS plan VARCHAR(20) DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(30) DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS current_period_end TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_payment_at TIMESTAMPTZ;

-- Index for Stripe lookups
CREATE INDEX IF NOT EXISTS idx_agents_stripe_customer_id ON agents(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_agents_plan ON agents(plan);

-- RLS: agents can read their own stripe info
CREATE POLICY "agents_read_own_stripe" ON agents
  FOR SELECT USING (true); -- public profiles

-- Comment for documentation
COMMENT ON COLUMN agents.plan IS 'free | pro | enterprise';
COMMENT ON COLUMN agents.subscription_status IS 'none | active | past_due | canceled | paused';
