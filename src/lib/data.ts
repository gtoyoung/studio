'use client'; // This will be a client-side module

import {
  doc,
  getDocs,
  collection,
  query,
  runTransaction,
  Firestore,
} from "firebase/firestore";
import type { ReportData, DailyParticipation, Vote, UserResponse } from "./types";

function getTodayDateString() {
  return new Date().toLocaleDateString("ko-KR"); // YYYY-MM-DD
}

export const getTodaysPollRef = (firestore: Firestore) => {
  const todayStr = getTodayDateString();
  return doc(firestore, "lunch_polls", todayStr);
};

export const getUserResponseForTodayRef = (
  firestore: Firestore,
  userId: string,
) => {
  const todayStr = getTodayDateString();
  return doc(firestore, `users/${userId}/responses`, todayStr);
};

export async function recordVote(
  firestore: Firestore,
  userId: string,
  choice: Vote,
) {
  const pollRef = getTodaysPollRef(firestore);
  const userResponseRef = getUserResponseForTodayRef(firestore, userId);

  await runTransaction(firestore, async (transaction) => {
    const pollDoc = await transaction.get(pollRef);
    const userResponseDoc = await transaction.get(userResponseRef);

    const previousChoice = userResponseDoc.exists()
      ? (userResponseDoc.data().response as Vote | boolean)
      : null;

    // Convert boolean to Vote string for backward compatibility
    const normalizedPreviousChoice: Vote | null =
      typeof previousChoice === "boolean"
        ? previousChoice
          ? "joining"
          : "notJoining"
        : previousChoice;

    if (normalizedPreviousChoice === choice) {
      return; // No change in vote
    }

    // Set/update the user's vote document with the string value
    transaction.set(userResponseRef, {
      lunchPollId: pollRef.id,
      userId: userId,
      response: choice,
      date: pollRef.id,
    });

    // Calculate increments and decrements
    const joiningIncrement = choice === "joining" ? 1 : 0;
    const notJoiningIncrement = choice === "notJoining" ? 1 : 0;

    const joiningDecrement = normalizedPreviousChoice === "joining" ? 1 : 0;
    const notJoiningDecrement =
      normalizedPreviousChoice === "notJoining" ? 1 : 0;

    if (pollDoc.exists()) {
      const currentJoining = pollDoc.data().joining || 0;
      const currentNotJoining = pollDoc.data().notJoining || 0;
      transaction.update(pollRef, {
        joining: currentJoining + joiningIncrement - joiningDecrement,
        notJoining:
          currentNotJoining + notJoiningIncrement - notJoiningDecrement,
      });
    } else {
      transaction.set(pollRef, {
        joining: joiningIncrement,
        notJoining: notJoiningIncrement,
      });
    }
  });
}

export async function cancelVote(
  firestore: Firestore,
  userId: string,
  previousChoice: Vote,
) {
  const pollRef = getTodaysPollRef(firestore);
  const userResponseRef = getUserResponseForTodayRef(firestore, userId);

  await runTransaction(firestore, async (transaction) => {
    const pollDoc = await transaction.get(pollRef);
    const userResponseDoc = await transaction.get(userResponseRef);

    if (!pollDoc.exists() || !userResponseDoc.exists()) {
      return; // Nothing to cancel
    }

    const storedChoice = userResponseDoc.data().response as Vote | boolean;
    const normalizedStoredChoice: Vote | null =
      typeof storedChoice === "boolean"
        ? storedChoice
          ? "joining"
          : "notJoining"
        : storedChoice;

    if (normalizedStoredChoice !== previousChoice) {
      return; // Race condition: vote has changed since UI rendered
    }

    transaction.delete(userResponseRef);

    const decrementField = previousChoice;
    const currentCount = pollDoc.data()?.[decrementField] || 0;
    transaction.update(pollRef, {
      [decrementField]: Math.max(0, currentCount - 1),
    });
  });
}

export async function getHistoricalData(
  firestore: Firestore,
): Promise<ReportData> {
  const today = new Date();
  const todayStr = today.toLocaleDateString("ko-KR");

  const pollsCollection = collection(firestore, "lunch_polls");
  const q = query(pollsCollection);
  const querySnapshot = await getDocs(q);

  const pollData: Record<string, { joining: number; notJoining: number }> = {};
  querySnapshot.forEach((doc) => {
    pollData[doc.id] = doc.data() as { joining: number; notJoining: number };
  });

  const history = Object.entries(pollData)
    .filter(([date]) => {
      if (date === todayStr) return false;
      const day = new Date(date).getDay();
      return day > 0 && day < 6; // Monday to Friday
    })
    .sort(
      ([dateA], [dateB]) =>
        new Date(dateA).getTime() - new Date(dateB).getTime(),
    );

  const dailyBreakdown: DailyParticipation[] = history.map(([date, counts]) => {
    const dayName = new Date(date).toLocaleDateString("ko-KR", {
      weekday: "short",
    });
    return {
      day: dayName,
      joining: counts.joining || 0,
      notJoining: counts.notJoining || 0,
    };
  });

  let totalJoining = 0;
  let totalVotes = 0;
  const participationByDay: Record<string, { joining: number; total: number }> =
    {
      월: { joining: 0, total: 0 },
      화: { joining: 0, total: 0 },
      수: { joining: 0, total: 0 },
      목: { joining: 0, total: 0 },
      금: { joining: 0, total: 0 },
    };

  history.forEach(([date, counts]) => {
    totalJoining += counts.joining || 0;
    totalVotes += (counts.joining || 0) + (counts.notJoining || 0);
    const dayName = new Date(date).toLocaleDateString("ko-KR", {
      weekday: "short",
    });
    if (participationByDay[dayName]) {
      participationByDay[dayName].joining += counts.joining || 0;
      participationByDay[dayName].total +=
        (counts.joining || 0) + (counts.notJoining || 0);
    }
  });

  const averageParticipation =
    totalVotes > 0 ? (totalJoining / totalVotes) * 100 : 0;

  const mostPopularDay = Object.entries(participationByDay).reduce(
    (popular, [day, counts]) => {
      const percentage =
        counts.total > 0 ? (counts.joining / counts.total) * 100 : 0;
      if (percentage > popular.percentage) {
        return { day, percentage };
      }
      return popular;
    },
    { day: "N/A", percentage: 0 },
  );

  return {
    averageParticipation: Math.round(averageParticipation),
    mostPopularDay,
    dailyBreakdown,
  };
}
