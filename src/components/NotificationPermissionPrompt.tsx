'use client';

import { useEffect, useState } from 'react';
import { useMessaging } from '@/firebase/use-messaging';
import { Button } from '@/components/ui/button';
import { Bell, BellOff } from 'lucide-react';

export function NotificationPermissionPrompt() {
  const { isSupported, notificationPermission, requestPermission } = useMessaging();
  const [showPrompt, setShowPrompt] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);

  useEffect(() => {
    if (isSupported && notificationPermission === 'default') {
      setShowPrompt(true);
    }
  }, [isSupported, notificationPermission]);

  const handleRequestPermission = async () => {
    setIsRequesting(true);
    const granted = await requestPermission();
    if (granted) {
      setShowPrompt(false);
    }
    setIsRequesting(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
  };

  if (!showPrompt || !isSupported) return null;

  return (
    <div className="fixed top-4 left-4 right-4 bg-white rounded-lg shadow-lg p-4 max-w-md z-50 border border-blue-200 md:left-auto md:right-4">
      <div className="flex items-start gap-3">
        <Bell className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="font-semibold text-sm mb-1">알림 설정</h3>
          <p className="text-xs text-gray-600 mb-3">
            점심 투표 시간을 놓치지 않도록 알림을 받아보세요.
          </p>
          <div className="flex gap-2">
            <Button
              onClick={handleDismiss}
              variant="outline"
              size="sm"
              className="flex-1 text-xs"
              disabled={isRequesting}
            >
              나중에
            </Button>
            <Button
              onClick={handleRequestPermission}
              size="sm"
              className="flex-1 text-xs"
              disabled={isRequesting}
            >
              {isRequesting ? '처리 중...' : '알림 받기'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
