import { supabase } from '../supabaseClient';

/**
 * Calcula el Hash SHA-256 de los bytes originales de un archivo en el navegador.
 * Es determinista, ultra-rapido y no depende del renderizado en canvas ni GPU.
 */
export const calculateFileHash = async (file: File): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
};

/**
 * Verifica si un hash de comprobante ya existe en la base de datos.
 * 1. Intenta primero via RPC 'check_receipt_hash_exists' (Global, sin exponer datos personales).
 * 2. Si la funcion RPC aun no esta creada en DB, hace fallback a select directo sobre wallet_transactions.
 */
export const checkReceiptDuplicate = async (hash: string): Promise<boolean> => {
  if (!hash || hash.trim().length === 0) return false;

  try {
    const { data: rpcCheck, error: rpcErr } = await supabase.rpc('check_receipt_hash_exists', {
      p_hash: hash,
    });
    if (!rpcErr && typeof rpcCheck === 'boolean') {
      return rpcCheck;
    }
  } catch {
    // Fallback silencioso si RPC no esta desplegada en BD
  }

  try {
    const { data: duplicateCheck } = await supabase
      .from('wallet_transactions')
      .select('id')
      .eq('receipt_hash', hash)
      .limit(1);

    return !!(duplicateCheck && duplicateCheck.length > 0);
  } catch (err) {
    console.warn('Error al verificar hash duplicado:', err);
    return false;
  }
};
