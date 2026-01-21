'use server';

import { revalidatePath } from 'next/cache';
import { admin } from '@/firebase/admin';

export async function signUpWithEmailAndPassword(email: string, password: string, nickname: string) {
  try {
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: nickname,
    });

    await admin.firestore().collection('users').doc(userRecord.uid).set({
      nickname,
      email,
    });

    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function submitVote(choice: any) {
  // This logic is now handled on the client in /src/components/poll-card.tsx
  try {
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    return { success: false, error: '투표를 기록하지 못했습니다.' };
  }
}

export async function cancelVote(previousChoice: any) {
  // This logic is now handled on the client in /src/components/poll-card.tsx
  try {
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    return { success: false, error: '투표 취소에 실패했습니다.' };
  }
}
