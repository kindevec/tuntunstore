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

    const { amount_usd, user_id, app_url } = await req.json();

    if (!amount_usd || typeof amount_usd !== 'number' || amount_usd < 1 || amount_usd > 500) {
      return new Response(JSON.stringify({ error: 'Monto inválido (debe ser entre 1 y 500 USD)' }), { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Obtener usuario autenticado
    const token = authHeader.replace('Bearer ', '');
    let activeUserId = user_id;

    const { data: { user } } = await supabaseAdmin.auth.getUser(token);
    if (user?.id) {
      activeUserId = user.id;
    }

    if (!activeUserId) {
      // Si no viene en el token ni en el body, buscar si hay usuarios en profiles
      const { data: firstProfile } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .limit(1)
        .single();
      activeUserId = firstProfile?.id;
    }

    if (!activeUserId) {
      return new Response(JSON.stringify({ error: 'Usuario no identificado' }), { 
        status: 401, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    // Comprobar si el usuario está bloqueado
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('is_blocked')
      .eq('id', activeUserId)
      .single();

    if (profile?.is_blocked) {
      return new Response(JSON.stringify({ error: 'Tu cuenta se encuentra inhabilitada para recargas' }), { 
        status: 403, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    const clientTransactionId = crypto.randomUUID();
    const amountCents = Math.round(amount_usd * 100);

    // Insertar registro inicial en payphone_transactions
    const { error: insertError } = await supabaseAdmin
      .from('payphone_transactions')
      .insert({
        user_id: activeUserId,
        client_transaction_id: clientTransactionId,
        amount_cents: amountCents,
        amount_without_tax_cents: amountCents,
        status: 'pending'
      });

    if (insertError) {
      console.error('Database insert error:', insertError);
      return new Response(JSON.stringify({ error: 'Error al registrar la transacción en la base de datos' }), { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    // Preparar llamada a PayPhone Prepare
    const payphoneToken = (Deno.env.get('PAYPHONE_TOKEN') ?? '').trim();
    const payphoneStoreId = Deno.env.get('PAYPHONE_STORE_ID');
    const finalAppUrl = app_url || Deno.env.get('APP_URL') || 'http://localhost:3000';

    const payphonePayload = {
      amount: amountCents,
      amountWithoutTax: amountCents,
      amountWithTax: 0,
      tax: 0,
      service: 0,
      tip: 0,
      currency: 'USD',
      clientTransactionId: clientTransactionId,
      reference: 'Recarga TunTun Store',
      responseUrl: `${finalAppUrl}/#payphone/confirm`,
      cancellationUrl: `${finalAppUrl}/#wallet`,
      timeZone: -5,
      ...(payphoneStoreId ? { storeId: payphoneStoreId } : {})
    };

    const payphoneRes = await fetch('https://pay.payphonetodoesposible.com/api/button/Prepare', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${payphoneToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payphonePayload)
    });

    const payphoneData = await payphoneRes.json();

    if (!payphoneRes.ok) {
      console.error('PayPhone Prepare Error:', payphoneData);
      return new Response(JSON.stringify({ 
        error: payphoneData?.message || 'Error al comunicarse con la pasarela de PayPhone',
        details: payphoneData
      }), { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    const paymentUrl = payphoneData.payWithCard || payphoneData.paymentUrl || payphoneData.payWithPayPhone;
    const transactionId = payphoneData.paymentId ? String(payphoneData.paymentId) : payphoneData.transactionId ? String(payphoneData.transactionId) : null;

    if (!paymentUrl) {
      console.error('PayPhone missing payment URL:', payphoneData);
      return new Response(JSON.stringify({ error: 'No se obtuvo la URL de pago de PayPhone' }), { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    // Actualizar con respuesta de prepare
    await supabaseAdmin
      .from('payphone_transactions')
      .update({
        prepare_response: payphoneData,
        payment_url: paymentUrl,
        payphone_transaction_id: transactionId,
        status: 'prepared'
      })
      .eq('client_transaction_id', clientTransactionId);

    return new Response(JSON.stringify({
      success: true,
      payment_url: paymentUrl,
      client_transaction_id: clientTransactionId
    }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });

  } catch (error: any) {
    console.error('Internal Server Error:', error);
    return new Response(JSON.stringify({ error: error?.message || 'Error interno del servidor' }), { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
});
