"use client";

import { useState, useTransition, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown, LoaderCircle, PartyPopper, Undo2, CalendarX } from "lucide-react";
import { recordVote, cancelVote } from "@/lib/data";
import type { Poll, Vote } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { useFirestore, useUser } from "@/firebase";

type UserVote = Vote | boolean | null;

export function PollCard({ initialPoll, userVote }: { initialPoll: Poll, userVote: UserVote }) {
  
  const getVoteFromStringOrBool = (vote: UserVote): Vote | null => {
    if (vote === null || vote === undefined) return null;
    if (typeof vote === 'boolean') {
      return vote ? 'joining' : 'notJoining';
    }
    return vote;
  }

  const [votedFor, setVotedFor] = useState<Vote | null>(getVoteFromStringOrBool(userVote));
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  
  useEffect(() => {
    setVotedFor(getVoteFromStringOrBool(userVote));
  }, [userVote]);

  const handleVote = (choice: Vote) => {
    if (!user || !firestore) {
        toast({
          variant: "destructive",
          title: "로그인이 필요합니다.",
          description: "투표를 하려면 로그인해주세요.",
        });
        return;
    }
    startTransition(async () => {
      try {
        await recordVote(firestore, user.uid, choice);
        toast({
          title: "투표 완료!",
          description: "참여해주셔서 감사합니다.",
        });
      } catch (error) {
        console.error("Vote Error:", error);
        toast({
          variant: "destructive",
          title: "죄송합니다!",
          description: "투표를 기록하는 중 문제가 발생했습니다.",
        });
      }
    });
  };

  const handleCancelVote = () => {
    if (!votedFor || !user || !firestore) return;
    startTransition(async () => {
      try {
        await cancelVote(firestore, user.uid, votedFor);
        toast({
          title: "투표가 취소되었습니다.",
          description: "다시 투표할 수 있습니다.",
        });
      } catch (error) {
        console.error("Cancel Vote Error:", error);
        toast({
          variant: "destructive",
          title: "죄송합니다!",
          description: "투표를 취소하는 중 문제가 발생했습니다.",
        });
      }
    });
  };

  const today = new Date(initialPoll.date);
  const dayOfWeek = today.getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  const formattedDate = today.toLocaleDateString("ko-KR", {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const hasVoted = votedFor !== null;
  const isLoading = isPending || isUserLoading;

  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="bg-card-foreground/5">
        <CardTitle className="text-2xl font-bold font-headline">오늘 점심 드시나요?</CardTitle>
        <CardDescription>{formattedDate}</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        {isWeekend ? (
           <div className="flex flex-col items-center justify-center text-center p-8 bg-muted/50 rounded-lg">
             <CalendarX className="w-16 h-16 text-muted-foreground mb-4" />
             <h3 className="text-xl font-bold">주말에는 투표할 수 없습니다.</h3>
             <p className="text-muted-foreground">월요일에 다시 확인해주세요!</p>
           </div>
        ) : hasVoted ? (
          <div className="flex flex-col items-center justify-center text-center p-8 bg-accent/20 rounded-lg">
            <PartyPopper className="w-16 h-16 text-accent mb-4" />
            <h3 className="text-xl font-bold">투표해주셔서 감사합니다!</h3>
            <p className="text-muted-foreground">
              '<span className="font-semibold text-accent">{votedFor === 'joining' ? "참석" : "불참"}</span>'에 투표하셨습니다.
            </p>
            <Button variant="ghost" onClick={handleCancelVote} disabled={isLoading} className="mt-4">
              {isLoading ? <LoaderCircle className="animate-spin" /> : <Undo2 className="mr-2 h-4 w-4" />}
              투표 취소
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Button
              size="lg"
              className="h-20 text-xl transform hover:scale-105 transition-transform duration-200 bg-green-500 hover:bg-green-600 text-white"
              onClick={() => handleVote('joining')}
              disabled={isLoading}
              aria-live="polite"
            >
              {isLoading ? <LoaderCircle className="animate-spin" /> : <ThumbsUp className="mr-3 h-8 w-8" />}
              참여
            </Button>
            <Button
              size="lg"
              variant="destructive"
              className="h-20 text-xl transform hover:scale-105 transition-transform duration-200 bg-red-500 hover:bg-red-600"
              onClick={() => handleVote('notJoining')}
              disabled={isLoading}
              aria-live="polite"
            >
              {isLoading ? <LoaderCircle className="animate-spin" /> : <ThumbsDown className="mr-3 h-8 w-8" />}
              미참여
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
