/* eslint-disable @typescript-eslint/no-explicit-any */
// lib/billing/normalize.ts
import { PRODUCT_TO_PLAN } from "./planMap";
import { NormalizedBillingStatus } from "./types";

export function normalizeBilling(data: any): NormalizedBillingStatus {
  // ❌ Kein Abo vorhanden
  if (!data || !data.status) {
    return {
      plan: "free",
      state: "none",
      cancelAtPeriodEnd: false,
      currentPeriodEnd: null,
    };
  }

  const isActive = data.status === "active" || data.status === "trialing";

  // ❌ Abo beendet / sofort storniert
  if (!isActive) {
    return {
      plan: "free",
      state: "canceled",
      cancelAtPeriodEnd: false,
      currentPeriodEnd: null,
      stripeCustomerId: data.stripeCustomerId,
    };
  }

  // ✅ Aktives Abo
  const plan = PRODUCT_TO_PLAN[data.plan] ?? "free";

  return {
    plan,
    state: data.status, // active | trialing
    cancelAtPeriodEnd: Boolean(data.cancelAtPeriodEnd),
    currentPeriodEnd: data.currentPeriodEnd ?? null,
    stripeCustomerId: data.stripeCustomerId,
    stripeSubscriptionId: data.stripeSubscriptionId,
  };
}
