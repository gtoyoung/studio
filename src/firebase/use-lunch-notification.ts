'use client';

import { useEffect } from 'react';
import { useUser } from './use-user';
import { useFirestore } from './client-provider';
import { doc, getDoc } from 'firebase/firestore';

/**
 * 특정 시간(11:30)에 알림을 보내는 클라이언트 기반 훅
 * Cloud Functions 없이 작동합니다.
 */
export const useLunchNotification = () => {
  const { user } = useUser();
  const firestore = useFirestore();

  useEffect(() => {
    if (!user?.uid || !firestore) return;

    const checkAndSendNotification = async () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();

      // ✅ 11:30에만 실행 (정확한 시간 확인)
      if (!(hours === 13 && minutes >= 45 && minutes < 50)) {
        return;
      }

      // 오늘 이미 알림을 보냈는지 확인
      const today = now.toLocaleDateString('ko-KR');
      
      try {
        const userDoc = await getDoc(doc(firestore, 'users', user.uid));
        const userData = userDoc.data();
        const lastNotificationDate = userData?.lastNotificationDate;

        // 오늘 이미 알림을 보냈으면 스킵
        if (lastNotificationDate === today) {
          console.log('[useLunchNotification] ℹ️ Already notified today');
          return;
        }

        // 알림 권한이 있으면 알림 표시
        if (Notification.permission === 'granted') {
          const notification = new Notification('🍽️ 점심 투표 시간입니다', {
            body: '오늘 점심 같이 드시나요?',
            icon: '/icon-192.svg',
            badge: '/icon-192.svg',
            tag: 'lunch-vote-notification',
            requireInteraction: false,
          });

          notification.onclick = () => {
            window.focus();
            notification.close();
          };

          // Firestore에 마지막 알림 날짜 저장
          const { updateDoc } = await import('firebase/firestore');
          await updateDoc(doc(firestore, 'users', user.uid), {
            lastNotificationDate: today,
          });
          
          console.log('[useLunchNotification] ✅ Notification sent at 11:30 AM');
        } else {
          console.warn('[useLunchNotification] ❌ Notification permission not granted');
        }
      } catch (error) {
        console.error('[useLunchNotification] Error checking notification:', error);
      }
    };

    // ✅ 5분마다 체크 (CPU 효율적) - 11:30에 5분 이내 실행됨
    const interval = setInterval(checkAndSendNotification, 5 * 60 * 1000);

    // 컴포넌트 마운트 시 즉시 한 번 체크
    checkAndSendNotification();

    console.log('[useLunchNotification] ✅ Lunch notification hook initialized (checks every 5 minutes)');

    return () => clearInterval(interval);
  }, [user?.uid, firestore]);
};
