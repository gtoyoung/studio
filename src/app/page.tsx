'use client';

import { useEffect, useState } from 'react';
import { Header } from '@/components/header';
import { PollCard } from '@/components/poll-card';
import { StatsCard } from '@/components/stats-card';
import { ReportsCard } from '@/components/reports-card';
import { getTodaysPollRef, getHistoricalData, getUserResponseForTodayRef } from '@/lib/data';
import { useFirebase, useUser, useDoc, useMemoFirebase } from '@/firebase';
import type { Poll, ReportData, UserResponse } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function Home() {
  const { firestore } = useFirebase();
  const { user, isUserLoading } = useUser();
  const [reports, setReports] = useState<ReportData | null>(null);

  // --- Real-time data fetching ---

  // Memoize the ref to prevent re-renders from useDoc
  const pollRef = useMemoFirebase(() => firestore ? getTodaysPollRef(firestore) : null, [firestore]);
  
  // Fetch today's poll data in real-time
  const { data: pollData, isLoading: isPollLoading } = useDoc<{joining: number, notJoining: number}>(pollRef);

  // Memoize the ref for the user's response
  const userResponseRef = useMemoFirebase(() => 
    firestore && user ? getUserResponseForTodayRef(firestore, user.uid) : null, 
    [firestore, user]
  );
  
  // Fetch user's vote for today in real-time
  const { data: userResponse, isLoading: isUserResponseLoading } = useDoc<UserResponse>(userResponseRef);

  // --- One-time data fetching for historical reports ---
  useEffect(() => {
    if (firestore) {
      getHistoricalData(firestore).then(setReports);
    }
  }, [firestore]);
  
  const poll: Poll = {
    date: pollRef ? new Date(pollRef.id).toISOString() : new Date().toISOString(),
    joining: pollData?.joining ?? 0,
    notJoining: pollData?.notJoining ?? 0,
  };
  
  const isLoading = isPollLoading || isUserResponseLoading || isUserLoading || !reports;

  return (
    <div className="flex flex-col items-center min-h-screen bg-background p-4 sm:p-6 md:p-8">
      <Header />
      <main className="w-full max-w-4xl mx-auto flex flex-col gap-8">
        {isLoading ? (
            <Skeleton className="h-[250px] w-full" />
        ) : (
            <PollCard
                initialPoll={poll}
                userVote={userResponse?.response ?? null}
            />
        )}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2">
            {isLoading ? <Skeleton className="h-[380px] w-full" /> : <StatsCard poll={poll} />}
          </div>
          <div className="lg:col-span-3">
            {isLoading || !reports ? <Skeleton className="h-[380px] w-full" /> : <ReportsCard reports={reports} />}
          </div>
        </div>
      </main>
      <footer className="w-full max-w-4xl py-8 mt-8 text-center text-muted-foreground text-sm">
        <p>메이크잇 점심 참여 여부를 확인</p>
      </footer>
    </div>
  );
}
