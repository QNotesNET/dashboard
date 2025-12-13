export const runtime = "nodejs";

import { NextResponse } from "next/server";
import speakeasy from "speakeasy";
import connectToDB from "@/lib/mongoose";
import User from "@/models/User";
import {
  createSessionJWT,
  cookieOptions,
  SESSION_COOKIE_NAME,
} from "@/lib/auth";

export async function POST(req: Request) {
  await connectToDB();

  const { userId, code } = await req.json();

  if (!userId || !code) {
    return NextResponse.json({ error: "Fehlende Daten" }, { status: 400 });
  }

  const user = await User.findById(userId).select(
    "twoFactorEnabled twoFactorSecret email role"
  );

  if (!user || !user.twoFactorEnabled || !user.twoFactorSecret) {
    return NextResponse.json({ error: "2FA nicht aktiv" }, { status: 400 });
  }

  const valid = speakeasy.totp.verify({
    secret: user.twoFactorSecret,
    encoding: "base32",
    token: String(code),
    window: 2,
  });

  if (!valid) {
    return NextResponse.json({ error: "Ungültiger Code" }, { status: 401 });
  }

  // ✅ JETZT Session erstellen
  const jwt = await createSessionJWT({
    sub: String(user._id),
    email: user.email,
    role: user.role,
  });

  const res = NextResponse.json({ success: true });
  res.cookies.set(SESSION_COOKIE_NAME, jwt, cookieOptions());
  return res;
}
