"use server";

import { revalidatePath } from "next/cache";
import { recordVote } from "@/lib/data";

export type Vote = "joining" | "notJoining";

export async function submitVote(choice: Vote) {
  try {
    await recordVote(choice);
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to record vote." };
  }
}
