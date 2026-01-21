'use client';

import { UtensilsCrossed, LogIn, LogOut } from 'lucide-react';
import { useUser, useFirebase, initiateGoogleSignIn, signOutUser } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from './ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"


export function Header() {
  const { auth } = useFirebase();
  const { user, isUserLoading } = useUser();

  const handleSignIn = () => {
    if (auth) {
      initiateGoogleSignIn(auth);
    }
  };

  const handleSignOut = () => {
    if (auth) {
      signOutUser(auth);
    }
  };


  return (
    <header className="flex flex-col sm:flex-row items-center justify-between w-full max-w-4xl pt-8 pb-12">
      <div className="flex items-center text-center sm:text-left">
        <UtensilsCrossed className="w-12 h-12 mb-4 sm:mb-0 sm:mr-6 text-primary" />
        <div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground font-headline">
            점심 투표
          </h1>
          <p className="mt-1 text-lg text-muted-foreground">오늘의 점심 여부를 알려주세요.</p>
        </div>
      </div>
      <div className="mt-4 sm:mt-0">
        {isUserLoading ? (
            <div className="flex items-center gap-2">
                <Skeleton className="h-10 w-10 rounded-full" />
                <Skeleton className="h-6 w-24" />
            </div>
        ) : user ? (
            <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 rounded-full p-1 pr-2 sm:pr-4">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.photoURL ?? ''} alt={user.displayName ?? 'User'} />
                  <AvatarFallback>{user.displayName?.charAt(0) ?? 'U'}</AvatarFallback>
                </Avatar>
                <span className="hidden sm:inline font-medium">{user.displayName}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user.displayName}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>로그아웃</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button onClick={handleSignIn}>
            <LogIn className="mr-2 h-4 w-4" />
            Google로 로그인
          </Button>
        )}
      </div>
    </header>
  );
}
