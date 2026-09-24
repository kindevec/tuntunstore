/**
 * 📋 Utilidad Universal de Copiado al Portapapeles
 * 
 * Soporta:
 * 1. navigator.clipboard (HTTPS o localhost en navegadores modernos)
 * 2. document.execCommand fallback (Para enlaces locales HTTP tipo http://192.168.x.x:3000
 *    donde navigator.clipboard es bloqueado por las políticas de seguridad del navegador móvil)
 */
export async function copyTextToClipboard(text: string): Promise<boolean> {
  if (!text) return false;

  // 1. Intento primario: navigator.clipboard en entornos seguros (HTTPS / localhost)
  if (typeof navigator !== 'undefined' && navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.warn('navigator.clipboard falló, recurriendo al fallback execCommand:', err);
    }
  }

  // 2. Fallback universal para HTTP local (IP de red local tipo 192.168.x.x) o WebViews móviles
  try {
    const span = document.createElement('span');
    span.textContent = text;
    span.style.whiteSpace = 'pre';
    span.style.position = 'fixed';
    span.style.top = '0';
    span.style.left = '0';
    span.style.opacity = '0';
    span.style.pointerEvents = 'none';
    (span.style as any).webkitUserSelect = 'auto';
    span.style.userSelect = 'all';

    document.body.appendChild(span);

    const selection = window.getSelection();
    const range = document.createRange();
    if (selection) {
      selection.removeAllRanges();
      range.selectNode(span);
      selection.addRange(range);
    }

    let successful = false;
    try {
      successful = document.execCommand('copy');
    } finally {
      if (selection) {
        selection.removeAllRanges();
      }
      document.body.removeChild(span);
    }

    if (successful) return true;
  } catch (spanErr) {
    console.warn('Fallback span falló, intentando con textarea:', spanErr);
  }

  // 3. Último recurso con textarea
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.opacity = '0';
    textArea.style.pointerEvents = 'none';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch (textAreaErr) {
    console.error('Fallo al copiar texto al portapapeles:', textAreaErr);
    return false;
  }
}
