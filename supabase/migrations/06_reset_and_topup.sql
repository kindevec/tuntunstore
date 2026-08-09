-- 06_reset_and_topup.sql

-- 1. Vaciar todos los códigos subidos actualmente para empezar de cero
TRUNCATE TABLE public.redemption_codes;

-- 2. Agregar $100 de saldo a la cuenta de mkmcmiyako
INSERT INTO public.wallet_transactions (user_id, amount, type, status)
SELECT id, 100, 'top_up', 'Aprobado'
FROM public.profiles
WHERE email ILIKE '%mkmcmiyako%' OR name ILIKE '%mkmcmiyako%';
