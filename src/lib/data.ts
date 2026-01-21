import type { Poll, ReportData, DailyParticipation, Vote } from "./types";

// NOTE: This is a mock in-memory data store.
// In a real application, you would use a database like Firestore.
// The data is seeded for demonstration purposes.

const today = new Date();
const todayStr = today.toLocaleDateString("en-CA"); // YYYY-MM-DD

let pollData: Record<string, { joining: number; notJoining: number }> = {
  [todayStr]: { joining: 8, notJoining: 3 },
};

// Seed some historical data for the last 7 days
for (let i = 1; i <= 7; i++) {
  const date = new Date();
  date.setDate(today.getDate() - i);
  const dateStr = date.toLocaleDateString("en-CA");
  pollData[dateStr] = {
    joining: Math.floor(Math.random() * 15) + 5,
    notJoining: Math.floor(Math.random() * 5) + 1,
  };
}

export async function getTodaysPoll(): Promise<Poll> {
  // Simulate async call
  await new Promise((resolve) => setTimeout(resolve, 50));
  
  if (!pollData[todayStr]) {
    pollData[todayStr] = { joining: 0, notJoining: 0 };
  }

  return {
    date: today.toISOString(),
    ...pollData[todayStr],
  };
}

export async function recordVote(choice: Vote): Promise<void> {
  // Simulate async database write
  await new Promise((resolve) => setTimeout(resolve, 100));
  
  if (!pollData[todayStr]) {
    pollData[todayStr] = { joining: 0, notJoining: 0 };
  }
  
  pollData[todayStr][choice]++;
}

export async function cancelVote(choice: Vote): Promise<void> {
  // Simulate async database write
  await new Promise((resolve) => setTimeout(resolve, 100));

  if (!pollData[todayStr]) {
    return;
  }
  
  if (pollData[todayStr][choice] > 0) {
    pollData[todayStr][choice]--;
  }
}

export async function getHistoricalData(): Promise<ReportData> {
  // Simulate async data processing
  await new Promise((resolve) => setTimeout(resolve, 100));

  const history = Object.entries(pollData)
    .filter(([date]) => date !== todayStr)
    .sort(([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime());

  const dailyBreakdown: DailyParticipation[] = history.map(([date, counts]) => {
    const dayName = new Date(date).toLocaleDateString("ko-KR", { weekday: "short" });
    return { day: dayName, ...counts };
  });

  let totalJoining = 0;
  let totalVotes = 0;
  const participationByDay: Record<string, { joining: number; total: number }> = {
    '일': { joining: 0, total: 0 },
    '월': { joining: 0, total: 0 },
    '화': { joining: 0, total: 0 },
    '수': { joining: 0, total: 0 },
    '목': { joining: 0, total: 0 },
    '금': { joining: 0, total: 0 },
    '토': { joining: 0, total: 0 },
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
