import { NextResponse } from "next/server";
import { admin } from "@/firebase/admin";

export async function POST(req: Request) {
  // 🔐 1. 간단한 인증
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.NEXT_PUBLIC_CRON_SECRET}`) {
    return NextResponse.json(
      { ok: false, message: "Unauthorized" },
      { status: 401 },
    );
  }

  try {
    // 🕒 2. (선택) 날짜 정보 포함
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

    // 🔔 3. FCM Topic으로 전송
    const result = await admin.messaging().send({
      topic: "lunch-vote",

      notification: {
        title: "🍽️ 점심 투표 시간입니다",
        body: "오늘 점심 같이 드시나요?",
      },

      data: {
        type: "LUNCH_VOTE",
        date: today,
        url: "https://lunch.make-it.kro.kr/", // (옵션) SW에서 쓰고 싶으면 유지
      },

      webpush: {
        fcmOptions: {
          link: "https://lunch.make-it.kro.kr/",
        },
      },

      android: {
        priority: "high",
      },

      apns: {
        payload: {
          aps: {
            sound: "default",
          },
        },
      },
    });

    return NextResponse.json({
      ok: true,
      messageId: result,
      date: today,
    });
  } catch (error: any) {
    console.error("[lunch-notify] error:", error);
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 },
    );
  }
}