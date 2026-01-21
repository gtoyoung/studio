import { UtensilsCrossed } from 'lucide-react';

export function Header() {
  return (
    <header className="flex flex-col sm:flex-row items-center justify-center w-full max-w-4xl pt-8 pb-12 text-center sm:text-left">
      <UtensilsCrossed className="w-12 h-12 mb-4 sm:mb-0 sm:mr-6 text-primary" />
      <div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground font-headline">
          점심 투표
        </h1>
        <p className="mt-1 text-lg text-muted-foreground">오늘의 점심, 간단하게 결정하세요.</p>
      </div>
    </header>
  );
}
