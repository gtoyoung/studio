'use client';

import { useEffect, useState } from 'react';
import { Header } from '@/components/header';
import { PollCard } from '@/components/poll-card';
import { StatsCard } from '@/components/stats-card';
import { ReportsCard } from '@/components/reports-card';
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import {
  getTodaysPollRef,
  getHistoricalData,
  getUserResponseForTodayRef,
} from "@/lib/data";
import { useUser, useDoc, useFirestore } from "@/firebase";
import type { Poll, ReportData, UserResponse } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const [reports, setReports] = useState<ReportData | null>(null);

  const pollPath = getTodaysPollRef(firestore).path;
  const { data: pollData, loading: isPollLoading } = useDoc<{
    joining: number;
    notJoining: number;
  }>(pollPath);

  const userResponsePath = user
    ? getUserResponseForTodayRef(firestore, user.uid).path
    : null;
  const { data: userResponse, loading: isUserResponseLoading } =
    useDoc<UserResponse>(userResponsePath ?? "");

  useEffect(() => {
    if (firestore) {
      getHistoricalData(firestore).then(setReports);
    }
  }, [firestore]);

  const poll: Poll = {
    date: new Date().toISOString(),
    joining: pollData?.joining ?? 0,
    notJoining: pollData?.notJoining ?? 0,
  };

  const isLoading =
    isPollLoading || isUserResponseLoading || isUserLoading || !reports;

  return (
    <div className="flex flex-col items-center min-h-screen bg-background p-4 sm:p-6 md:p-8">
      <Header />
      <PWAInstallPrompt />
      <main className="w-full max-w-4xl mx-auto flex flex-col gap-8">
        {!user?.isAdmin &&
          (isLoading ? (
            <Skeleton className="h-[250px] w-full" />
          ) : (
            <PollCard
              initialPoll={poll}
              userVote={userResponse?.response ?? null}
            />
          ))}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2">
            {isLoading ? (
              <Skeleton className="h-[380px] w-full" />
            ) : (
              <StatsCard poll={poll} />
            )}
          </div>
          <div className="lg:col-span-3">
            {isLoading || !reports ? (
              <Skeleton className="h-[380px] w-full" />
            ) : (
              <ReportsCard reports={reports} />
            )}
          </div>
        </div>
      </main>
      <footer className="w-full max-w-4xl py-8 mt-8 text-center text-muted-foreground text-sm">
        <p>메이크잇 점심 참여 여부를 확인</p>
      </footer>
    </div>
  );
}
