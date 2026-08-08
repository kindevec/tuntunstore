-- 05_fix_realtime.sql

-- Supabase Realtime por defecto solo envía las columnas modificadas en un evento UPDATE.
-- Para que el Frontend pueda saber de quién es la orden (leyendo user_id) cuando el Trigger la actualiza,
-- necesitamos configurar la tabla para que envíe la fila completa siempre.

ALTER TABLE public.orders REPLICA IDENTITY FULL;
ALTER TABLE public.wallet_transactions REPLICA IDENTITY FULL;
