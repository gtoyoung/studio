"use client";

import { useState, useTransition, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown, LoaderCircle, PartyPopper } from "lucide-react";
import { submitVote, type Vote } from "@/app/actions";
import type { Poll } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

const getVotedState = (): Vote | null => {
  if (typeof window === "undefined") return null;
  const today = new Date().toLocaleDateString();
  const storedVote = localStorage.getItem("lunchPollVote");
  if (storedVote) {
    const { date, choice } = JSON.parse(storedVote);
    if (date === today) {
      return choice;
    }
  }
  return null;
};

const setVotedState = (choice: Vote) => {
  if (typeof window === "undefined") return;
  const today = new Date().toLocaleDateString();
  localStorage.setItem("lunchPollVote", JSON.stringify({ date: today, choice }));
};

export function PollCard({ initialPoll }: { initialPoll: Poll }) {
  const [votedFor, setVotedFor] = useState<Vote | null>(null);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  useEffect(() => {
    setVotedFor(getVotedState());
  }, []);
  
  const handleVote = (choice: Vote) => {
    startTransition(async () => {
      const result = await submitVote(choice);
      if (result.success) {
        setVotedFor(choice);
        setVotedState(choice);
        toast({
          title: "Vote submitted!",
          description: "Thanks for participating.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Oops!",
          description: result.error || "Something went wrong.",
        });
      }
    });
  };

  const today = new Date(initialPoll.date);
  const formattedDate = today.toLocaleDateString("en-US", {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const hasVoted = votedFor !== null;
  const isLoading = isPending;

  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="bg-card-foreground/5">
        <CardTitle className="text-2xl font-bold font-headline">Will you be joining for lunch?</CardTitle>
        <CardDescription>{formattedDate}</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        {hasVoted ? (
          <div className="flex flex-col items-center justify-center text-center p-8 bg-accent/20 rounded-lg">
            <PartyPopper className="w-16 h-16 text-accent mb-4" />
            <h3 className="text-xl font-bold">Thanks for voting!</h3>
            <p className="text-muted-foreground">You voted <span className="font-semibold text-accent">{votedFor === 'joining' ? "Yes" : "No"}</span>.</p>
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
              I'm in!
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
              Next time
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
