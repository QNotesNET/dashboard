import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import User from "@/models/User";
import connectToDB from "@/lib/mongoose";
import { getSessionUserFromRequest } from "@/lib/auth";

export async function POST(req: Request) {
  await connectToDB();

  const session = await getSessionUserFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { password } = await req.json();

  if (!password) {
    return NextResponse.json(
      { error: "Passwort erforderlich" },
      { status: 400 }
    );
  }

  const user = await User.findById(session.userId);
  if (!user || !user.twoFactorEnabled) {
    return NextResponse.json(
      { error: "2FA nicht aktiv" },
      { status: 400 }
    );
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return NextResponse.json(
      { error: "Falsches Passwort" },
      { status: 400 }
    );
  }

  await User.updateOne(
    { _id: user._id },
    {
      $set: { twoFactorEnabled: false },
      $unset: {
        twoFactorSecret: "",
      },
    }
  );

  return NextResponse.json({ success: true });
}
