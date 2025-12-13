/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { normalizeBilling } from "@/lib/billing/normalize";

const BILLING_BASE_URL = "https://billing.powrbook.com/api/billing/status";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    const billingRes = await fetch(
      `${BILLING_BASE_URL}?userId=${encodeURIComponent(userId)}`,
      { cache: "no-store" }
    );

    if (!billingRes.ok) {
      return NextResponse.json(
        { plan: "free", state: "none" },
        { status: 200 }
      );
    }

    const raw = await billingRes.json();

    const normalized = normalizeBilling(raw);

    return NextResponse.json(normalized, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (err) {
    console.error("❌ Billing status error", err);
    return NextResponse.json({ plan: "free", state: "none" }, { status: 200 });
  }
}
