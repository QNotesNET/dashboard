// lib/billing/types.ts
export type Plan = "free" | "plus" | "pro";

export type SubscriptionState = "active" | "trialing" | "canceled" | "none";

export interface NormalizedBillingStatus {
  plan: Plan;
  state: SubscriptionState;
  cancelAtPeriodEnd: boolean;
  currentPeriodEnd: number | null;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
}
