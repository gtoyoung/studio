export type Poll = {
  date: string; // ISO string
  joining: number;
  notJoining: number;
  id?: string; // document id from firestore
};

export type DailyParticipation = {
  day: string;
  joining: number;
  notJoining: number;
};

export type ReportData = {
  averageParticipation: number;
  mostPopularDay: {
    day: string;
    percentage: number;
  };
  dailyBreakdown: DailyParticipation[];
};

export type Vote = "joining" | "notJoining";

export type UserResponse = {
    id?: string;
    lunchPollId: string;
    userId: string;
    response: Vote;
    date: string;
};
