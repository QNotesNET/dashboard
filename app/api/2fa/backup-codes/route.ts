import { NextResponse } from "next/server";
import connectToDB from "@/lib/mongoose";
import { getSessionUserFromRequest } from "@/lib/auth";
import User from "@/models/User";
import { generateBackupCodes } from "@/lib/backupCodes";

export async function GET(req: Request) {
  await connectToDB();

  const session = await getSessionUserFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await User.findById(session.userId).select(
    "twoFactorEnabled backupCodes"
  );

  if (!user || !user.twoFactorEnabled) {
    return NextResponse.json(
      { error: "2FA not enabled" },
      { status: 400 }
    );
  }

  const hasBackupCodes =
    Array.isArray(user.backupCodes) && user.backupCodes.length > 0;

  return NextResponse.json({
    hasBackupCodes,
  });
}


export async function POST(req: Request) {
  await connectToDB();

  const session = await getSessionUserFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await User.findById(session.userId);
  if (!user?.twoFactorEnabled) {
    return NextResponse.json(
      { error: "2FA not enabled" },
      { status: 400 }
    );
  }

  const { plainCodes, hashedCodes } = generateBackupCodes(10);

  user.backupCodes = hashedCodes;
  await user.save();

  // ⚠️ Klartext nur JETZT zurückgeben
  return NextResponse.json({
    codes: plainCodes,
  });
}
