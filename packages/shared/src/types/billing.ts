export type PlanType = 'free' | 'starter' | 'pro' | 'enterprise';

export type SubscriptionStatus =
  | 'none'
  | 'active'
  | 'on_trial'
  | 'paused'
  | 'past_due'
  | 'unpaid'
  | 'canceled'
  | 'expired';

export type BillingPeriod = 'monthly' | 'annual';

export interface PlanLimits {
  apiRequestsPerDay: number;
  postsPerDay: number;
  communities: number;
}

export interface PlanDefinition {
  name: string;
  price: {
    monthly: number;
    annual: number;
  };
  limits: PlanLimits;
}

export interface CheckoutRequest {
  plan: 'starter' | 'pro';
  billingPeriod: BillingPeriod;
}

export interface CheckoutResponse {
  url: string;
}

export interface PortalResponse {
  url: string;
}

export interface WebhookEvent {
  id: string;
  event_name: string;
  subscription_id: string | null;
  developer_id: string | null;
  payload: Record<string, unknown>;
  processed_at: string;
  created_at: string;
}
