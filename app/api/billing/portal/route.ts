import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";

const BILLING_PORTAL_URL = "https://billing.powrbook.com/api/billing/portal";

export async function GET() {
  try {
    const session = await getSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    const res = await fetch(
      `${BILLING_PORTAL_URL}?userId=${encodeURIComponent(userId)}`,
      { cache: "no-store" }
    );

    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to create portal session" },
        { status: 502 }
      );
    }

    const data = await res.json();

    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
