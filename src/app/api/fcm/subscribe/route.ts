import { NextResponse } from "next/server";
import { admin } from "@/firebase/admin";

export async function POST(req: Request) {
     debugger;
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json(
        { ok: false, message: "FCM token is required" },
        { status: 400 },
      );
    }
     
    await admin.messaging().subscribeToTopic(token, "lunch-vote");

    return NextResponse.json({
      ok: true,
      message: "Subscribed to lunch-vote topic",
    });
  } catch (error: any) {
    console.error("[fcm/subscribe] error:", error);
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 },
    );
  }
}