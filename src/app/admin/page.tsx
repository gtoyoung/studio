'use client';

import { useUser } from '@/firebase';
import { useEffect, useState } from 'react';
import {
  collection, getDocs, doc, setDoc, deleteDoc, 
  collectionGroup, query, where, runTransaction, Firestore
} from 'firebase/firestore';
import { useFirestore } from '@/firebase/client-provider';
import { Button } from '@/components/ui/button';

// Basic user data structure
interface UserData {
  uid: string;
  email: string;
  nickname: string;
  isAdmin: Boolean;
}

// Standardized vote type
type Vote = 'joining' | 'notJoining';

// Combined user data with their voting status
interface UserWithVote extends UserData {
  vote: Vote | null;
}

// Helper to get today's date in YYYY-MM-DD format
const getTodayDateString = () => {
  const today = new Date();
  return today.toLocaleDateString("ko-KR"); // YYYY-MM-DD
};

export default function AdminPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const [users, setUsers] = useState<UserWithVote[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!firestore || isUserLoading) {
      if (!isUserLoading) setIsLoading(false);
      return;
    }

    if (!user?.isAdmin) {
      setIsLoading(false);
      return;
    }

    async function fetchData() {
      setIsLoading(true);
      
      const usersCollection = collection(firestore, 'users');
      const userSnapshot = await getDocs(usersCollection);
      const userList = userSnapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      } as UserData));

      const today = getTodayDateString();
      const responsesQuery = query(
          collectionGroup(firestore, 'responses'), 
          where('date', '==', today)
      );
      const responseSnapshot = await getDocs(responsesQuery);
      const votes = new Map<string, Vote>();
      responseSnapshot.forEach(doc => {
        const data = doc.data();
        if (data.userId) {
            votes.set(data.userId, data.response as Vote);
        }
      });

      const combinedUsers = userList.map(u => ({
        ...u,
        vote: votes.get(u.uid) || null,
      })).filter(u => !u.isAdmin);

      setUsers(combinedUsers);
      setIsLoading(false);
    }

    fetchData();
  }, [firestore, user, isUserLoading]);

  const handleUpdateVote = async (uid: string, decision: Vote) => {
    if (!firestore) return;
    const today = getTodayDateString();
    // Correctly point to the 'lunch_polls' collection for aggregation
    const pollRef = doc(firestore, 'lunch_polls', today);
    const responseRef = doc(firestore, 'users', uid, 'responses', today);

    try {
      await runTransaction(firestore, async (transaction) => {
        const pollDoc = await transaction.get(pollRef);
        const userResponseDoc = await transaction.get(responseRef);

        const previousVote = userResponseDoc.exists() ? userResponseDoc.data().response as Vote : null;

        if (previousVote === decision) return; // No change

        const userToUpdate = users.find(u => u.uid === uid);
        transaction.set(responseRef, {
          response: decision,
          userId: uid,
          date: today,
          lunchPollId: today,
          nickname: userToUpdate?.nickname || 'Unknown',
          email: userToUpdate?.email || 'Unknown',
        }, { merge: true });

        const joiningIncrement = decision === 'joining' ? 1 : 0;
        const notJoiningIncrement = decision === 'notJoining' ? 1 : 0;
        
        const joiningDecrement = previousVote === 'joining' ? 1 : 0;
        const notJoiningDecrement = previousVote === 'notJoining' ? 1 : 0;

        if (pollDoc.exists()) {
          const currentJoining = pollDoc.data().joining || 0;
          const currentNotJoining = pollDoc.data().notJoining || 0;
          transaction.update(pollRef, {
            joining: currentJoining + joiningIncrement - joiningDecrement,
            notJoining: currentNotJoining + notJoiningIncrement - notJoiningDecrement,
          });
        } else {
          transaction.set(pollRef, {
            joining: joiningIncrement,
            notJoining: notJoiningIncrement,
          });
        }
      });

      setUsers(currentUsers =>
        currentUsers.map(u => (u.uid === uid ? { ...u, vote: decision } : u))
      );
    } catch (error) {
      console.error("Failed to update vote:", error);
    }
  };
  
  const handleCancelVote = async (uid: string) => {
    if (!firestore) return;
    const today = getTodayDateString();
    // Correctly point to the 'lunch_polls' collection for aggregation
    const pollRef = doc(firestore, 'lunch_polls', today);
    const responseRef = doc(firestore, 'users', uid, 'responses', today);

    try {
      await runTransaction(firestore, async (transaction) => {
        const pollDoc = await transaction.get(pollRef);
        const userResponseDoc = await transaction.get(responseRef);

        if (!userResponseDoc.exists()) return;

        const previousVote = userResponseDoc.data().response as Vote;

        transaction.delete(responseRef);

        if (pollDoc.exists()) {
          if (previousVote === 'joining') {
            const currentJoining = pollDoc.data().joining || 0;
            transaction.update(pollRef, { joining: Math.max(0, currentJoining - 1) });
          } else if (previousVote === 'notJoining') {
            const currentNotJoining = pollDoc.data().notJoining || 0;
            transaction.update(pollRef, { notJoining: Math.max(0, currentNotJoining - 1) });
          }
        }
      });

      setUsers(currentUsers =>
        currentUsers.map(u => (u.uid === uid ? { ...u, vote: null } : u))
      );
    } catch (error) {
      console.error("Failed to cancel vote:", error);
    }
  };

  if (isUserLoading || isLoading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (!user?.isAdmin) {
    return <div className="flex justify-center items-center min-h-screen">Access Denied.</div>;
  }

  const getVoteStatus = (vote: Vote | null) => {
    if (vote === 'joining') {
      return (
        <span className="relative inline-block px-3 py-1 font-semibold text-green-900 leading-tight">
          <span aria-hidden className="absolute inset-0 bg-green-200 opacity-50 rounded-full"></span>
          <span className="relative">참여</span>
        </span>
      );
    } else if (vote === 'notJoining') {
      return (
        <span className="relative inline-block px-3 py-1 font-semibold text-red-900 leading-tight">
          <span aria-hidden className="absolute inset-0 bg-red-200 opacity-50 rounded-full"></span>
          <span className="relative">불참</span>
        </span>
      );
    } else {
      return (
        <span className="relative inline-block px-3 py-1 font-semibold text-gray-700 leading-tight">
          <span aria-hidden className="absolute inset-0 bg-gray-200 opacity-50 rounded-full"></span>
          <span className="relative">미투표</span>
        </span>
      );
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">관리자 페이지</h1>
      <div className="bg-white shadow-md rounded-lg overflow-x-auto">
        <table className="min-w-full leading-normal">
          <thead>
            <tr>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">닉네임</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">이메일</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">오늘의 투표 여부</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">투표 조작</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.uid}>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  <p className="text-gray-900 whitespace-no-wrap">{u.nickname}</p>
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  <p className="text-gray-900 whitespace-no-wrap">{u.email}</p>
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  {getVoteStatus(u.vote)}
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleUpdateVote(u.uid, 'joining')} disabled={u.vote === 'joining'}>참여</Button>
                        <Button size="sm" variant="outline" onClick={() => handleUpdateVote(u.uid, 'notJoining')} disabled={u.vote === 'notJoining'}>불참</Button>
                        <Button size="sm" variant="ghost" onClick={() => handleCancelVote(u.uid)} disabled={!u.vote}>취소</Button>
                    </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
