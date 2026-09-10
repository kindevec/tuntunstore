// Utilidad para vibración háptica táctil en PWA móvil
export function triggerHaptic(type: 'light' | 'medium' | 'heavy' | 'success' | 'error' = 'light') {
  if (typeof window === 'undefined' || !('vibrate' in navigator)) return;

  try {
    switch (type) {
      case 'light':
        navigator.vibrate(12);
        break;
      case 'medium':
        navigator.vibrate(25);
        break;
      case 'heavy':
        navigator.vibrate(45);
        break;
      case 'success':
        navigator.vibrate([15, 60, 25]);
        break;
      case 'error':
        navigator.vibrate([30, 50, 30, 50, 40]);
        break;
    }
  } catch {
    // Ignorar si el navegador del usuario bloquea las vibraciones
  }
}
