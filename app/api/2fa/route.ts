import { NextResponse } from "next/server";
import speakeasy from "speakeasy";
import QRCode from "qrcode";
import User from "@/models/User";
import { getSessionUserFromRequest } from "@/lib/auth";
import connectToDB from "@/lib/mongoose";

/**
 * POST /api/2fa
 * Startet oder setzt das 2FA-Setup fort
 */
export async function POST(req: Request) {
  await connectToDB();

  const session = await getSessionUserFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await User.findById(session.userId);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // 🔁 Setup läuft bereits → NICHT neu generieren
  if (user.twoFactorTempSecret && user.twoFactorTempOtpAuthUrl) {
    const qrCode = await QRCode.toDataURL(user.twoFactorTempOtpAuthUrl);
    return NextResponse.json({
      qrCode,
      secret: user.twoFactorTempSecret,
    });
  }

  // 🆕 NEUES Secret (WICHTIG: generateSecret!)
  const secret = speakeasy.generateSecret({
    length: 20,
    name: `Powrbook (${user.email})`,
  });

  if (!secret.otpauth_url) {
    return NextResponse.json({ error: "Failed to generate otpauth url" }, { status: 500 });
  }

  const qrCode = await QRCode.toDataURL(secret.otpauth_url);

  await User.updateOne(
    { _id: user._id },
    {
      $set: {
        twoFactorTempSecret: secret.base32,
        twoFactorTempOtpAuthUrl: secret.otpauth_url,
      },
    }
  );

  return NextResponse.json({
    qrCode,
    secret: secret.base32,
  });
}

/**
 * PUT /api/2fa
 * Verifiziert Code & aktiviert 2FA
 */
export async function PUT(req: Request) {
  await connectToDB();

  const session = await getSessionUserFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { code } = await req.json();

  if (typeof code !== "string" || !/^\d{6}$/.test(code)) {
    return NextResponse.json({ error: "Invalid code format" }, { status: 400 });
  }

  const user = await User.findById(session.userId);
  if (!user?.twoFactorTempSecret) {
    return NextResponse.json({ error: "No setup in progress" }, { status: 400 });
  }

  const verified = speakeasy.totp.verify({
    secret: user.twoFactorTempSecret,
    encoding: "base32",
    token: code,
    window: 4, // ⏱ extra tolerant (±120s)
  });

  if (!verified) {
    return NextResponse.json({ error: "Invalid code" }, { status: 400 });
  }

  await User.updateOne(
    { _id: user._id },
    {
      $set: {
        twoFactorEnabled: true,
        twoFactorSecret: user.twoFactorTempSecret,
      },
      $unset: {
        twoFactorTempSecret: "",
        twoFactorTempOtpAuthUrl: "",
      },
    }
  );

  return NextResponse.json({ success: true });
}
