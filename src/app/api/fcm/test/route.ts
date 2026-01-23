import { NextResponse } from "next/server";
import { admin } from "@/firebase/admin";


export async function POST(req: Request) {
  const { token } = await req.json();
  if (!token) {
    return NextResponse.json({ error: "token missing" }, { status: 400 });
  }

  const message = {
    token,
    notification: {
      title: "🧪 FCM 테스트",
      body: "지금 바로 알림이 오면 성공입니다",
    },
    data: {
      type: "TEST",
    },
  };

  try {
    const result = await admin.messaging().send(message);
    return NextResponse.json({ success: true, result });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}