import { Header } from '@/components/header';
import { PollCard } from '@/components/poll-card';
import { StatsCard } from '@/components/stats-card';
import { ReportsCard } from '@/components/reports-card';
import { getTodaysPoll, getHistoricalData } from '@/lib/data';

export default async function Home() {
  const poll = await getTodaysPoll();
  const reports = await getHistoricalData();

  return (
    <div className="flex flex-col items-center min-h-screen bg-background p-4 sm:p-6 md:p-8">
      <Header />
      <main className="w-full max-w-4xl mx-auto flex flex-col gap-8">
        <PollCard initialPoll={poll} />
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2">
            <StatsCard poll={poll} />
          </div>
          <div className="lg:col-span-3">
            <ReportsCard reports={reports} />
          </div>
        </div>
      </main>
      <footer className="w-full max-w-4xl py-8 mt-8 text-center text-muted-foreground text-sm">
        <p>Made with ❤️ for lunch enthusiasts.</p>
      </footer>
    </div>
  );
}
