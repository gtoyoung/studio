'use client'; // This will be a client-side module

import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  getDocs,
  runTransaction,
  Timestamp,
  DocumentReference,
  WriteBatch,
  writeBatch,
  deleteDoc,
  Firestore,
} from "firebase/firestore";
import type { Poll, ReportData, DailyParticipation, Vote, UserResponse } from "./types";

function getTodayDateString() {
    return new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD
}

// These functions will be called from client components
// and need access to the firestore instance.

export const getTodaysPollRef = (firestore: Firestore) => {
    const todayStr = getTodayDateString();
    return doc(firestore, "lunch_polls", todayStr);
}

export const getUserResponseForTodayRef = (firestore: Firestore, userId: string) => {
    const todayStr = getTodayDateString();
    // Use a consistent ID for the user's response for a given day
    return doc(firestore, `users/${userId}/responses`, todayStr);
}

export async function recordVote(firestore: Firestore, userId: string, choice: Vote) {
  const pollRef = getTodaysPollRef(firestore);
  const userResponseRef = getUserResponseForTodayRef(firestore, userId);

  await runTransaction(firestore, async (transaction) => {
    const pollDoc = await transaction.get(pollRef);

    // Set the user's vote
    transaction.set(userResponseRef, {
        lunchPollId: pollRef.id,
        userId: userId,
        response: choice,
        date: pollRef.id,
    });
    
    // Update or create the poll document
    if (pollDoc.exists()) {
        const newCount = (pollDoc.data()[choice] || 0) + 1;
        transaction.update(pollRef, { [choice]: newCount });
    } else {
        const newPoll = { joining: 0, notJoining: 0 };
        newPoll[choice] = 1;
        transaction.set(pollRef, newPoll);
    }
  });
}

export async function cancelVote(firestore: Firestore, userId: string, previousChoice: Vote) {
    const pollRef = getTodaysPollRef(firestore);
    const userResponseRef = getUserResponseForTodayRef(firestore, userId);

    await runTransaction(firestore, async (transaction) => {
        const pollDoc = await transaction.get(pollRef);
        const userResponseDoc = await transaction.get(userResponseRef);

        if (!pollDoc.exists() || !userResponseDoc.exists()) {
            // Nothing to cancel
            return;
        }

        // Delete the user's response
        transaction.delete(userResponseRef);

        // Decrement the count, ensuring it doesn't go below 0
        const currentCount = pollDoc.data()?.[previousChoice] || 0;
        const newCount = Math.max(0, currentCount - 1);
        transaction.update(pollRef, { [previousChoice]: newCount });
    });
}


export async function getHistoricalData(firestore: Firestore): Promise<ReportData> {
  const today = new Date();
  const todayStr = today.toLocaleDateString("en-CA");

  const pollsCollection = collection(firestore, "lunch_polls");
  const q = query(pollsCollection);
  const querySnapshot = await getDocs(q);

  const pollData: Record<string, { joining: number; notJoining: number }> = {};
  querySnapshot.forEach(doc => {
    pollData[doc.id] = doc.data() as { joining: number; notJoining: number };
  });
  
  const history = Object.entries(pollData)
    .filter(([date]) => {
      if (date === todayStr) return false;
      const day = new Date(date).getDay();
      return day > 0 && day < 6; // Monday to Friday
    })
    .sort(([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime());

  const dailyBreakdown: DailyParticipation[] = history.map(([date, counts]) => {
    const dayName = new Date(date).toLocaleDateString("ko-KR", { weekday: "short" });
    return { day: dayName, ...counts };
  });

  let totalJoining = 0;
  let totalVotes = 0;
  const participationByDay: Record<string, { joining: number; total: number }> = {
    '월': { joining: 0, total: 0 },
    '화': { joining: 0, total: 0 },
    '수': { joining: 0, total: 0 },
    '목': { joining: 0, total: 0 },
    '금': { joining: 0, total: 0 },
  };

  history.forEach(([date, counts]) => {
    totalJoining += counts.joining;
    totalVotes += counts.joining + counts.notJoining;
    const dayName = new Date(date).toLocaleDateString("ko-KR", { weekday: "short" });
    if (participationByDay[dayName]) {
        participationByDay[dayName].joining += counts.joining;
        participationByDay[dayName].total += counts.joining + counts.notJoining;
    }
  });

  const averageParticipation = totalVotes > 0 ? (totalJoining / totalVotes) * 100 : 0;
  
  const mostPopularDay = Object.entries(participationByDay).reduce(
    (popular, [day, counts]) => {
      const percentage = counts.total > 0 ? (counts.joining / counts.total) * 100 : 0;
      if (percentage > popular.percentage) {
        return { day, percentage };
      }
      return popular;
    },
    { day: "N/A", percentage: 0 }
  );

  return {
    averageParticipation: Math.round(averageParticipation),
    mostPopularDay,
    dailyBreakdown,
  };
}
