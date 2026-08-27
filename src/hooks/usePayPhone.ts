import { useState, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { payphoneService, RenderPaymentBoxParams, PayPhoneConfirmResult } from '../services/payphoneService';

export type { PayPhoneConfirmResult };

export const usePayPhone = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Prepara y registra una transacción en payphone_transactions antes de renderizar la cajita
   */
  const prepareTransaction = useCallback(async (userId: string, amountUsd: number, clientTransactionId: string) => {
    try {
      const amountCents = Math.round(amountUsd * 100);
      const { error: insertError } = await supabase
        .from('payphone_transactions')
        .insert({
          user_id: userId,
          client_transaction_id: clientTransactionId,
          amount_cents: amountCents,
          amount_without_tax_cents: amountCents,
          status: 'pending'
        });

      if (insertError) {
        console.warn('Advertencia registrando transacción inicial:', insertError);
      }
    } catch (e) {
      console.warn('Error en prepareTransaction:', e);
    }
  }, []);

  /**
   * Renderiza la Cajita Oficial de Pagos v2.0 directamente en el DOM
   */
  const renderPaymentBox = useCallback(async (params: RenderPaymentBoxParams): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await payphoneService.ensureLoaded();
      const success = payphoneService.renderPaymentBox(params);
      return success;
    } catch (err: any) {
      console.error('Error renderizando cajita PayPhone:', err);
      setError(err.message || 'Error al inicializar la pasarela');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Confirma la transacción con la API de PayPhone y acredita saldo atómicamente en Supabase
   */
  const confirmPayment = useCallback(async (id: string | number, clientTransactionId: string): Promise<PayPhoneConfirmResult> => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await payphoneService.confirmarPago({
        id: Number(id),
        clientTxId: String(clientTransactionId)
      });

      if (!result.success) {
        setError(result.error || 'Error al confirmar la transacción');
      }

      return result;
    } catch (err: any) {
      console.error('Error confirming PayPhone payment:', err);
      const errMsg = err.message || 'Error al confirmar el pago con PayPhone';
      setError(errMsg);
      return { success: false, error: errMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    setError,
    prepareTransaction,
    renderPaymentBox,
    confirmPayment,
    ensureLoaded: payphoneService.ensureLoaded
  };
};
