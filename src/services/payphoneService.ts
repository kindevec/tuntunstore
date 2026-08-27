import { supabase } from '../supabaseClient';

declare global {
  interface Window {
    PPaymentButtonBox?: any;
    payphone?: any;
  }
}

export interface RenderPaymentBoxParams {
  containerId?: string;
  total: number;
  clientTransactionId: string;
  reference?: string;
  email?: string;
  phoneNumber?: string;
  documentId?: string;
  storeId?: string;
}

export interface PayPhoneConfirmResult {
  success: boolean;
  amount_usd?: number;
  authorization_code?: string;
  card_type?: string;
  last_four_digits?: string;
  error?: string;
  data?: any;
}

const DEFAULT_TOKEN = "QhXEetZ_0_2fx3pW5vgDRhTLovnxsXUNsfeS4C-Rn-rkrS8R9etvc9RZZHpnZnwpWLXb9nCaUMUJzHuzuHGWo6b7jOR8MpqZRa_5AA5W37ZVaPPP0kgHlgRavJzoJa7qHxEHYiy1dsfTItavocOkSv2ntf3E8_RmdsaZ5FkO-gBMdpz5lI84uKajbLvpNxgLLSYnn0nMuAJBFPjbrBlxzO2wogDqIctKDOdQh2yuz3hrsM57l167jlsp0Pf_yJYQuK_iw5ao3iSHAGTAbkCfi4kE8DT510X_wd1TUZPT3x4Aqovp53VOC7bI0l1W6Cg0YbdGtzVBs68vwu2djIu3X3W2Uxg";

export const getPayphoneToken = (): string => {
  return import.meta.env.VITE_PAYPHONE_TOKEN || DEFAULT_TOKEN;
};

export const payphoneService = {
  getPayphoneToken,

  /**
   * Asegura que el script de módulo y el archivo CSS de PayPhone Payment Box v2.0 estén cargados en el DOM.
   */
  ensureLoaded: (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (typeof window === 'undefined') return resolve(false);
      if (window.PPaymentButtonBox) return resolve(true);

      let script = document.querySelector('script[src*="payphone-payment-box.js"]');
      if (!script) {
        script = document.createElement('script');
        script.setAttribute('src', 'https://cdn.payphonetodoesposible.com/box/v2.0/payphone-payment-box.js');
        script.setAttribute('type', 'module');
        document.head.appendChild(script);
      }

      let link = document.querySelector('link[href*="payphone-payment-box.css"]');
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', 'stylesheet');
        link.setAttribute('href', 'https://cdn.payphonetodoesposible.com/box/v2.0/payphone-payment-box.css');
        document.head.appendChild(link);
      }

      let attempts = 0;
      const interval = setInterval(() => {
        attempts++;
        if (window.PPaymentButtonBox) {
          clearInterval(interval);
          resolve(true);
        } else if (attempts > 50) {
          clearInterval(interval);
          resolve(false);
        }
      }, 100);
    });
  },

  /**
   * Instancia e inyecta la Cajita Oficial de Pagos v2.0 dentro del contenedor del DOM indicado (ej. 'pp-button').
   */
  renderPaymentBox: ({
    containerId = 'pp-button',
    total,
    clientTransactionId,
    reference = 'Recarga TunTun Store',
    email,
    phoneNumber,
    documentId,
    storeId
  }: RenderPaymentBoxParams): boolean => {
    if (typeof window === 'undefined' || !window.PPaymentButtonBox) {
      console.warn('PPaymentButtonBox no está disponible en window.');
      return false;
    }

    const token = getPayphoneToken();
    const envStoreId = storeId || import.meta.env.VITE_PAYPHONE_STORE_ID;
    const amountInCents = Math.round(Number(total) * 100);

    try {
      const container = document.getElementById(containerId);
      if (container) container.innerHTML = '';

      const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';
      const responseUrl = `${currentOrigin}/`;
      const cancellationUrl = `${currentOrigin}/`;

      const config: any = {
        token,
        clientTransactionId: String(clientTransactionId),
        amount: amountInCents,
        amountWithoutTax: amountInCents,
        amountWithTax: 0,
        tax: 0,
        service: 0,
        tip: 0,
        currency: 'USD',
        reference: reference || 'Recarga TunTun Store',
        lang: 'es',
        defaultMethod: 'card',
        responseUrl,
        cancellationUrl,
        response_url: responseUrl,
        cancellation_url: cancellationUrl
      };

      if (envStoreId && envStoreId !== 'SdtrNjAN050mTKgMJTrAcQ') {
        config.storeId = envStoreId;
      }

      if (email) config.email = email;
      if (phoneNumber) config.phoneNumber = phoneNumber;
      if (documentId) {
        config.documentId = documentId;
        config.identificationType = 1; // 1: Cédula de Identidad
      }

      const ppb = new window.PPaymentButtonBox(config);
      ppb.render(containerId);
      return true;
    } catch (e) {
      console.error('Error renderizando PPaymentButtonBox:', e);
      return false;
    }
  },

  /**
   * Confirma la transacción con la API de PayPhone y asegura la acreditación en Supabase.
   */
  confirmarPago: async ({ id, clientTxId }: { id: string | number; clientTxId: string }): Promise<PayPhoneConfirmResult> => {
    try {
      // 1. Prioridad: Supabase Edge Function 'confirm-payment' (atómica, segura server-to-server)
      const { data, error: invokeError } = await supabase.functions.invoke('confirm-payment', {
        body: { id: Number(id), clientTransactionId: String(clientTxId) }
      });

      if (!invokeError && data?.success) {
        return {
          success: true,
          amount_usd: data.amount_usd,
          authorization_code: data.authorization_code,
          card_type: data.card_type,
          last_four_digits: data.last_four_digits,
          data
        };
      }

      // 2. Fallback: Proxy local o directo a la API de PayPhone
      const token = getPayphoneToken();
      let response: Response | null = null;
      
      const endpoints = [
        '/api/payphone/button/V2/Confirm',
        '/api/payphone/button/Confirm',
        'https://pay.payphonetodoesposible.com/api/button/Confirm'
      ];

      for (const endpoint of endpoints) {
        try {
          response = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              id: Number(id),
              clientTxId: String(clientTxId)
            })
          });
          if (response.ok) break;
        } catch (_) {
          // Continuar al siguiente endpoint de respaldo
        }
      }

      if (response && response.ok) {
        const directData = await response.json();
        const isApproved = directData.statusCode === 3 || directData.transactionStatus === 'Approved';
        
        if (isApproved) {
          await supabase.rpc('confirm_payphone_payment', {
            p_client_transaction_id: String(clientTxId),
            p_payphone_response: directData
          });
        }

        return {
          success: isApproved,
          amount_usd: directData.amount ? directData.amount / 100 : undefined,
          authorization_code: directData.authorizationCode,
          card_type: directData.cardType,
          last_four_digits: directData.lastDigits,
          data: directData
        };
      }

      const errMsg = invokeError?.message || 'No se pudo confirmar la transacción con PayPhone';
      return { success: false, error: errMsg };
    } catch (error: any) {
      console.error('Error confirmando pago PayPhone:', error);
      return { success: false, error: error.message || 'Error de comunicación con la pasarela' };
    }
  }
};
