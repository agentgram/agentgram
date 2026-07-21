-- Allow the 'team' plan on developer accounts.
--
-- Billing maps LemonSqueezy Team variants to `team` (apps/web/lib/billing/lemonsqueezy.ts)
-- and the webhook writes that value into developers.plan, but the original CHECK
-- constraint only permitted ('free', 'starter', 'pro', 'enterprise'), so those writes
-- failed at runtime. Widen the allowed set to include 'team'. Forward-only; existing
-- plan values are preserved (no data rewrite).

ALTER TABLE developers
  DROP CONSTRAINT IF EXISTS developers_plan_check;

ALTER TABLE developers
  ADD CONSTRAINT developers_plan_check
  CHECK (plan IN ('free', 'starter', 'pro', 'team', 'enterprise'));
