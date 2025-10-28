// app/api/push/register/route.ts
import { NextResponse } from "next/server";
import connectToDB from "@/lib/mongoose";
import User from "@/models/User";
import { getCurrentUser } from "@/lib/session";

export async function POST(req: Request) {
  await connectToDB();

  const me = await getCurrentUser();
  if (!me) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { expoPushToken } = await req.json();

  if (!expoPushToken || typeof expoPushToken !== "string") {
    return NextResponse.json(
      { error: "Missing or invalid token" },
      { status: 400 }
    );
  }

  await User.findByIdAndUpdate(me.id, { expoPushToken });

  return NextResponse.json({ success: true });
}
