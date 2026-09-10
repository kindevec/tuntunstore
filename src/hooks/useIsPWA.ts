import { useState, useEffect } from 'react';

/**
 * Hook that detects if the app is running as an installed PWA
 * (standalone mode) vs in a regular browser tab.
 * 
 * Checks multiple signals:
 * 1. CSS media query: (display-mode: standalone)
 * 2. iOS Safari legacy: navigator.standalone
 * 3. URL parameter: ?source=pwa (set in manifest start_url)
 * 4. Listens for dynamic display mode changes
 */
export function useIsPWA(): boolean {
  const [isPWA, setIsPWA] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return checkIsPWA();
  });

  useEffect(() => {
    // Listen for display mode changes (e.g., user installs while using)
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      setIsPWA(e.matches || checkIsPWA());
    };

    mediaQuery.addEventListener('change', handleChange);

    // Also listen for the appinstalled event
    const handleAppInstalled = () => {
      // Small delay to let the display mode update
      setTimeout(() => setIsPWA(checkIsPWA()), 500);
    };
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  return isPWA;
}

function checkIsPWA(): boolean {
  // 1. Standard CSS Display Mode Media Query
  const isDisplayStandalone = window.matchMedia('(display-mode: standalone)').matches;
  const isDisplayFullscreen = window.matchMedia('(display-mode: fullscreen)').matches;
  const isDisplayMinimalUI = window.matchMedia('(display-mode: minimal-ui)').matches;

  // 2. Legacy iOS Safari proprietary property
  const isIOSStandalone = (navigator as any).standalone === true;

  // 3. URL launch query parameter (start_url: "/?source=pwa")
  const urlParams = new URLSearchParams(window.location.search);
  const isSourcePWA = urlParams.get('source') === 'pwa';

  // 4. Android TWA referrer
  const isTWA = document.referrer.startsWith('android-app://');

  return isDisplayStandalone || isDisplayFullscreen || isDisplayMinimalUI || isIOSStandalone || isSourcePWA || isTWA;
}

export default useIsPWA;
