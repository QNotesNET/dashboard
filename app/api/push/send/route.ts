// app/api/push/send/route.ts
import { NextResponse } from "next/server";
import connectToDB from "@/lib/mongoose";
import User from "@/models/User";
import { getCurrentUser } from "@/lib/session";
import { Expo } from "expo-server-sdk";

const expo = new Expo({ accessToken: process.env.EXPO_ACCESS_TOKEN });

export async function POST(req: Request) {
  await connectToDB();

  const me = await getCurrentUser();
  if (!me || me.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { userId, title, body } = await req.json();
  if (!userId || !title || !body) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const user = await User.findById(userId);
  if (!user || !user.expoPushToken) {
    return NextResponse.json(
      { error: "User has no push token" },
      { status: 404 }
    );
  }

  try {
    const messages = [
      {
        to: user.expoPushToken,
        sound: "default",
        title,
        body,
        data: { from: "powrbook-admin", userId },
      },
    ];

    const tickets = await expo.sendPushNotificationsAsync(messages);
    return NextResponse.json({ success: true, tickets });
  } catch (err) {
    console.error("Push send failed:", err);
    return NextResponse.json({ error: "Failed to send push" }, { status: 500 });
  }
}
