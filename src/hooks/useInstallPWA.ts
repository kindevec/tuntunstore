import { useState, useEffect, useCallback, useRef } from 'react';
import { getInitialBrowserDetection, checkIsBraveAsync, BrowserDetectionResult } from '../utils/browserDetection';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
  prompt(): Promise<void>;
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}

export interface UseInstallPWAReturn {
  /** Whether the install prompt is available (Android/Chrome) */
  canInstall: boolean;
  /** Whether the app is already installed */
  isInstalled: boolean;
  /** Whether the device is iOS (needs manual install instructions) */
  isIOS: boolean;
  /** Whether the device is Android */
  isAndroid: boolean;
  /** Whether the device is any mobile device */
  isMobile: boolean;
  /** Detailed browser information (Chrome, Brave, Firefox, Edge, etc.) */
  browserInfo: BrowserDetectionResult;
  /** Whether to show the install UI (respects dismissal cooldown) */
  shouldShowPrompt: boolean;
  /** Trigger the native install prompt (Android/Chrome only) */
  installApp: () => Promise<'accepted' | 'dismissed' | 'unavailable'>;
  /** Dismiss the prompt (stores timestamp for cooldown) */
  dismissPrompt: () => void;
}

const DISMISS_STORAGE_KEY = 'tuntun_pwa_dismiss_timestamp';
const DISMISS_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const FIRST_VISIT_KEY = 'tuntun_pwa_first_visit';

// Global reference to capture the event if it fires before React components mount
let globalDeferredPrompt: BeforeInstallPromptEvent | null = null;

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e: BeforeInstallPromptEvent) => {
    e.preventDefault();
    globalDeferredPrompt = e;
  });
}

export function useInstallPWA(): UseInstallPWAReturn {
  const deferredPromptRef = useRef<BeforeInstallPromptEvent | null>(globalDeferredPrompt);
  const [canInstall, setCanInstall] = useState<boolean>(() => !!globalDeferredPrompt);
  const [isInstalled, setIsInstalled] = useState(false);
  const [browserInfo, setBrowserInfo] = useState<BrowserDetectionResult>(getInitialBrowserDetection);

  // Asynchronously refine Brave browser detection
  useEffect(() => {
    checkIsBraveAsync().then((isBrave) => {
      if (isBrave) {
        setBrowserInfo((prev) => ({
          ...prev,
          browser: 'brave',
          displayName: 'Brave Browser',
          isBrave: true,
          isChrome: false,
          isWebAPKSupported: false,
        }));
      }
    });
  }, []);

  // Device detection
  const isIOS = typeof navigator !== 'undefined' && /iphone|ipad|ipod/i.test(navigator.userAgent) && !(window as any).MSStream;
  const isAndroid = typeof navigator !== 'undefined' && /android/i.test(navigator.userAgent);
  const isMobile = isIOS || isAndroid || (typeof navigator !== 'undefined' && /mobile|tablet/i.test(navigator.userAgent));

  // Check if already installed (standalone mode)
  const checkInstalled = useCallback(() => {
    if (typeof window === 'undefined') return false;
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isIOSStandalone = (navigator as any).standalone === true;
    const urlParams = new URLSearchParams(window.location.search);
    const isSourcePWA = urlParams.get('source') === 'pwa';
    return isStandalone || isIOSStandalone || isSourcePWA;
  }, []);

  // Track first visit
  useEffect(() => {
    if (!localStorage.getItem(FIRST_VISIT_KEY)) {
      localStorage.setItem(FIRST_VISIT_KEY, Date.now().toString());
    }
  }, []);

  useEffect(() => {
    setIsInstalled(checkInstalled());

    if (globalDeferredPrompt) {
      deferredPromptRef.current = globalDeferredPrompt;
      setCanInstall(true);
    }

    const handleBeforeInstall = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      globalDeferredPrompt = e;
      deferredPromptRef.current = e;
      setCanInstall(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setCanInstall(false);
      deferredPromptRef.current = null;
      globalDeferredPrompt = null;
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [checkInstalled]);

  const installApp = useCallback(async (): Promise<'accepted' | 'dismissed' | 'unavailable'> => {
    const promptEvent = deferredPromptRef.current || globalDeferredPrompt;
    if (!promptEvent) return 'unavailable';
    
    await promptEvent.prompt();
    const { outcome } = await promptEvent.userChoice;
    
    if (outcome === 'accepted') {
      deferredPromptRef.current = null;
      globalDeferredPrompt = null;
      setCanInstall(false);
    }
    
    return outcome;
  }, []);

  const dismissPrompt = useCallback(() => {
    setCanInstall(false);
  }, []);

  // Available on mobile or if browser supports native prompt
  const shouldShowPrompt = !isInstalled && (canInstall || isMobile);

  return {
    canInstall,
    isInstalled,
    isIOS,
    isAndroid,
    isMobile,
    browserInfo,
    shouldShowPrompt,
    installApp,
    dismissPrompt,
  };
}

export default useInstallPWA;
