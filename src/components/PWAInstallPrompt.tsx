'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

type BrowserType = "chrome" | "firefox" | "safari" | "other";

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [browserType, setBrowserType] = useState<BrowserType>("other");

  const detectBrowser = (): BrowserType => {
    const ua = navigator.userAgent;

    if (/Chrome|CriOS/.test(ua) && !/Edg|OPR/.test(ua)) {
      return "chrome";
    }
    if (/Safari/.test(ua) && !/Chrome|CriOS|OPR/.test(ua)) {
      return "safari";
    }
    if (/Firefox|FxiOS/.test(ua)) {
      return "firefox";
    }
    return "other";
  };

  useEffect(() => {
    const browser = detectBrowser();
    setBrowserType(browser);

    // Check if app is already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      console.log("beforeinstallprompt event fired");
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    const handleAppInstalled = () => {
      console.log("PWA was installed");
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setShowPrompt(false);
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
  };

  // iOS Safari 또는 지원하지 않는 브라우저의 경우 수동 안내
  const isSafari = browserType === "safari";
  const isFirefox = browserType === "firefox";

  if (isInstalled) return null;

  // Safari의 경우 shouldShowManualPrompt 로직 추가
  if (isSafari) {
    return (
      <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 max-w-sm z-50 border border-gray-200">
        <h3 className="font-semibold text-lg mb-2">📱 홈 화면에 추가하기</h3>
        <p className="text-sm text-gray-600 mb-4">
          Safari의 공유 버튼을 탭한 후 "홈 화면에 추가"를 선택하면 점심 투표
          앱을 쉽게 이용할 수 있습니다.
        </p>
        <p className="text-xs text-gray-500 mb-4">
          1️⃣ 하단의 공유 버튼 (↗️) 탭<br />
          2️⃣ "홈 화면에 추가" 선택
          <br />
          3️⃣ "추가" 클릭
        </p>
        <Button onClick={handleDismiss} variant="outline" className="w-full">
          닫기
        </Button>
      </div>
    );
  }

  // Firefox의 경우
  if (isFirefox) {
    return (
      <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 max-w-sm z-50 border border-gray-200">
        <h3 className="font-semibold text-lg mb-2">📱 앱 설치</h3>
        <p className="text-sm text-gray-600 mb-4">
          점심 투표를 홈 화면에 설치하여 더 편하게 사용하세요.
        </p>
        {deferredPrompt ? (
          <div className="flex gap-2">
            <Button
              onClick={handleDismiss}
              variant="outline"
              className="flex-1"
            >
              나중에
            </Button>
            <Button onClick={handleInstall} className="flex-1">
              설치
            </Button>
          </div>
        ) : (
          <Button onClick={handleDismiss} variant="outline" className="w-full">
            닫기
          </Button>
        )}
      </div>
    );
  }

  // Chrome 및 기타 브라우저 (beforeinstallprompt 지원)
  if (!showPrompt || !deferredPrompt) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 max-w-sm z-50 border border-gray-200">
      <h3 className="font-semibold text-lg mb-2">📱 앱 설치</h3>
      <p className="text-sm text-gray-600 mb-4">
        점심 투표 앱을 홈 화면에 설치하여 더 편하게 사용하세요.
      </p>
      <div className="flex gap-2">
        <Button onClick={handleDismiss} variant="outline" className="flex-1">
          나중에
        </Button>
        <Button onClick={handleInstall} className="flex-1">
          설치
        </Button>
      </div>
    </div>
  );
}
