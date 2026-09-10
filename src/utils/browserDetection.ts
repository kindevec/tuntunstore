export type SupportedBrowser = 'chrome' | 'brave' | 'firefox' | 'opera' | 'edge' | 'samsung' | 'safari' | 'other';

export interface BrowserDetectionResult {
  browser: SupportedBrowser;
  displayName: string;
  isChrome: boolean;
  isBrave: boolean;
  isFirefox: boolean;
  isSamsung: boolean;
  isEdge: boolean;
  isOpera: boolean;
  isSafari: boolean;
  isAndroid: boolean;
  isIOS: boolean;
  /** True if the browser supports Google/Samsung WebAPK minting without shortcut badges */
  isWebAPKSupported: boolean;
  openInChromeIntentUrl: string;
}

export const getInitialBrowserDetection = (): BrowserDetectionResult => {
  if (typeof navigator === 'undefined') {
    return {
      browser: 'other',
      displayName: 'Navegador Web',
      isChrome: false,
      isBrave: false,
      isFirefox: false,
      isSamsung: false,
      isEdge: false,
      isOpera: false,
      isSafari: false,
      isAndroid: false,
      isIOS: false,
      isWebAPKSupported: false,
      openInChromeIntentUrl: '',
    };
  }

  const ua = navigator.userAgent;
  const isAndroid = /android/i.test(ua);
  const isIOS = /iphone|ipad|ipod/i.test(ua) && !(window as any).MSStream;

  const isSamsung = /SamsungBrowser/i.test(ua);
  const isEdge = /EdgA|Edg\//i.test(ua);
  const isOpera = /OPR|Opera/i.test(ua);
  const isFirefox = /Firefox|FxiOS/i.test(ua);
  const isSafari = /Safari/i.test(ua) && !/Chrome|CriOS/i.test(ua);
  const hasChromeInUA = /Chrome|CriOS/i.test(ua);

  let browser: SupportedBrowser = 'other';
  let displayName = 'Navegador Web';

  // Support ?test_browser=brave|chrome|firefox for local testing
  const urlParamBrowser = typeof window !== 'undefined' 
    ? new URLSearchParams(window.location.search).get('test_browser')?.toLowerCase() 
    : null;

  if (urlParamBrowser === 'brave') {
    browser = 'brave';
    displayName = 'Brave Browser';
  } else if (urlParamBrowser === 'chrome') {
    browser = 'chrome';
    displayName = 'Google Chrome';
  } else if (urlParamBrowser === 'firefox') {
    browser = 'firefox';
    displayName = 'Mozilla Firefox';
  } else if (isSamsung) {
    browser = 'samsung';
    displayName = 'Samsung Internet';
  } else if (isEdge) {
    browser = 'edge';
    displayName = 'Microsoft Edge';
  } else if (isOpera) {
    browser = 'opera';
    displayName = 'Opera';
  } else if (isFirefox) {
    browser = 'firefox';
    displayName = 'Mozilla Firefox';
  } else if (isSafari) {
    browser = 'safari';
    displayName = 'Apple Safari';
  } else if (hasChromeInUA) {
    browser = 'chrome';
    displayName = 'Google Chrome';
  }

  const isWebAPKSupported = isAndroid && (browser === 'chrome' || browser === 'samsung' || browser === 'edge');

  const loc = typeof window !== 'undefined' ? window.location : null;
  const openInChromeIntentUrl = loc
    ? `intent://${loc.host}${loc.pathname}${loc.search}#Intent;scheme=https;package=com.android.chrome;end`
    : '';

  return {
    browser,
    displayName,
    isChrome: browser === 'chrome',
    isBrave: false,
    isFirefox,
    isSamsung,
    isEdge,
    isOpera,
    isSafari,
    isAndroid,
    isIOS,
    isWebAPKSupported,
    openInChromeIntentUrl,
  };
};

export const checkIsBraveAsync = async (): Promise<boolean> => {
  if (typeof navigator === 'undefined') return false;
  const nav = navigator as any;
  if (nav.brave && typeof nav.brave.isBrave === 'function') {
    try {
      return (await nav.brave.isBrave()) === true;
    } catch {
      return false;
    }
  }
  return false;
};
