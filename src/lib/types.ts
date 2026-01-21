export type Poll = {
  date: string;
  joining: number;
  notJoining: number;
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
