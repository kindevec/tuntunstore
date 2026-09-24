import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { status: 200, headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Falta Authorization header' }), { 
        status: 401, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    const { id, clientTransactionId } = await req.json();

    if (!id || !clientTransactionId) {
      return new Response(JSON.stringify({ error: 'Faltan parámetros id o clientTransactionId' }), { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const DEFAULT_PAYPHONE_TOKEN = "QhXEetZ_0_2fx3pW5vgDRhTLovnxsXUNsfeS4C-Rn-rkrS8R9etvc9RZZHpnZnwpWLXb9nCaUMUJzHuzuHGWo6b7jOR8MpqZRa_5AA5W37ZVaPPP0kgHlgRavJzoJa7qHxEHYiy1dsfTItavocOkSv2ntf3E8_RmdsaZ5FkO-gBMdpz5lI84uKajbLvpNxgLLSYnn0nMuAJBFPjbrBlxzO2wogDqIctKDOdQh2yuz3hrsM57l167jlsp0Pf_yJYQuK_iw5ao3iSHAGTAbkCfi4kE8DT510X_wd1TUZPT3x4Aqovp53VOC7bI0l1W6Cg0YbdGtzVBs68vwu2djIu3X3W2Uxg";
    const payphoneToken = (Deno.env.get('PAYPHONE_TOKEN') || DEFAULT_PAYPHONE_TOKEN).trim();

    // Confirmar con PayPhone
    const confirmRes = await fetch('https://pay.payphonetodoesposible.com/api/button/Confirm', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${payphoneToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        id: isNaN(Number(id)) ? id : Number(id), 
        clientTxId: clientTransactionId 
      })
    });

    const confirmData = await confirmRes.json();

    // Llamar a RPC de Supabase para manejar actualización atómica de saldo
    const { data: rpcData, error: rpcError } = await supabaseAdmin.rpc('confirm_payphone_payment', {
      p_client_transaction_id: clientTransactionId,
      p_payphone_response: confirmData
    });

    if (rpcError) {
      console.error('RPC Error in confirm_payphone_payment:', rpcError);
      return new Response(JSON.stringify({ error: 'Error procesando la acreditación en la base de datos' }), { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    const responsePayload = {
      ...rpcData,
      amount_usd: rpcData?.amount_usd ?? (confirmData?.amount ? confirmData.amount / 100 : undefined),
      authorization_code: confirmData?.authorizationCode || rpcData?.authorization_code,
      card_type: confirmData?.cardType || rpcData?.card_type || 'Tarjeta',
      last_four_digits: confirmData?.lastDigits || rpcData?.last_four_digits || '••••',
      transaction_id: confirmData?.transactionId || id,
      error: rpcData?.error || confirmData?.message
    };

    return new Response(JSON.stringify(responsePayload), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });

  } catch (error: any) {
    console.error('Catch Error in confirm-payment:', error);
    return new Response(JSON.stringify({ error: error?.message || 'Error interno del servidor' }), { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
});
