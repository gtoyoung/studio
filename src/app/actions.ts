"use server";

import { revalidatePath } from "next/cache";
import { recordVote, cancelVote as cancelVoteInData } from "@/lib/data";
import type { Vote } from "@/lib/types";

export async function submitVote(choice: Vote) {
  try {
    await recordVote(choice);
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return { success: false, error: "투표를 기록하지 못했습니다." };
  }
}

export async function cancelVote(previousChoice: Vote) {
  try {
    await cancelVoteInData(previousChoice);
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return { success: false, error: "투표 취소에 실패했습니다." };
  }
}
