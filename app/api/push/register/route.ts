import { NextRequest, NextResponse } from "next/server";
import User from "@/models/User";
import { getSessionUserFromRequest } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    // 1️⃣ Session-User ermitteln
    const session = await getSessionUserFromRequest(req);
    if (!session?.userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // 2️⃣ Body lesen und beide Feldnamen akzeptieren
    const data = await req.json();
    const expoPushToken = data.expoPushToken || data.token;
    if (!expoPushToken) {
      return NextResponse.json({ error: "Missing token" }, { status: 400 });
    }

    // 3️⃣ User updaten
    const updated = await User.findByIdAndUpdate(
      session.userId,
      { expoPushToken },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    console.log(
      `[ExpoPushRegister] ${updated.email} -> ${expoPushToken.slice(0, 20)}...`
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[PushRegister]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
