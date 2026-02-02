-- Migration: Stripe to Lemon Squeezy (provider-agnostic columns)
-- Renames Stripe-specific columns to generic payment columns.
-- No data loss — column renames only (no paying customers yet).

ALTER TABLE developers RENAME COLUMN stripe_customer_id TO payment_customer_id;
ALTER TABLE developers RENAME COLUMN stripe_subscription_id TO payment_subscription_id;

ALTER TABLE developers ADD COLUMN payment_provider VARCHAR(30) NOT NULL DEFAULT 'lemonsqueezy';
ALTER TABLE developers ADD COLUMN payment_variant_id TEXT;

DROP INDEX IF EXISTS idx_developers_stripe_customer_id;

CREATE INDEX idx_developers_payment_customer_id ON developers(payment_customer_id);
CREATE INDEX idx_developers_payment_subscription_id ON developers(payment_subscription_id);
CREATE INDEX idx_developers_payment_provider ON developers(payment_provider);
