import { NextResponse } from "next/server";
import { getSessionUserFromRequest } from "@/lib/auth";
import connectToDB from "@/lib/mongoose";
import User from "@/models/User";

export async function GET(req: Request) {
  await connectToDB();

  const session = await getSessionUserFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await User.findById(session.userId).select(
    "twoFactorEnabled backupCodesGenerated"
  );

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({
    twoFactorEnabled: Boolean(user.twoFactorEnabled),
    backupCodesGenerated: Boolean(user.backupCodesGenerated),
  });
}
