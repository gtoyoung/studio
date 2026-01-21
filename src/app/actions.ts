"use server";

import { revalidatePath } from "next/cache";
// Note: The core logic has been moved to client-side components to work
// with Firebase's real-time features and client authentication.
// These server actions are kept for potential future use but are not
// currently called by the voting components.

export async function submitVote(choice: any) {
  // This logic is now handled on the client in /src/components/poll-card.tsx
  try {
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return { success: false, error: "투표를 기록하지 못했습니다." };
  }
}

export async function cancelVote(previousChoice: any) {
    // This logic is now handled on the client in /src/components/poll-card.tsx
  try {
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return { success: false, error: "투표 취소에 실패했습니다." };
  }
}
