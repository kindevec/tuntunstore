-- 01_wallet_refactor.sql

-- 1. Create Wallet Transactions Table
CREATE TABLE IF NOT EXISTS public.wallet_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount NUMERIC(10, 2) NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('top_up', 'purchase', 'refund', 'admin_adjustment')),
    status TEXT NOT NULL CHECK (status IN ('Pendiente', 'Aprobado', 'Rechazado')),
    receipt_url TEXT,
    admin_note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;

-- 2. RLS Policies for wallet_transactions
CREATE POLICY "Users can view own wallet transactions"
    ON public.wallet_transactions FOR SELECT
    USING (
        auth.uid() = user_id 
        OR 
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

CREATE POLICY "Users can insert pending top_ups"
    ON public.wallet_transactions FOR INSERT
    WITH CHECK (
        auth.uid() = user_id 
        AND type = 'top_up' 
        AND status = 'Pendiente'
        AND amount > 0
    );

CREATE POLICY "Admins can update wallet transactions"
    ON public.wallet_transactions FOR UPDATE
    USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

CREATE POLICY "Admins can insert any transaction"
    ON public.wallet_transactions FOR INSERT
    WITH CHECK (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- 3. Create Storage Bucket for Receipts
INSERT INTO storage.buckets (id, name, public) 
VALUES ('receipts', 'receipts', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users can upload receipts" 
    ON storage.objects FOR INSERT 
    WITH CHECK (
        bucket_id = 'receipts' 
        AND auth.role() = 'authenticated'
    );

CREATE POLICY "Anyone can view receipts" 
    ON storage.objects FOR SELECT 
    USING ( bucket_id = 'receipts' );

-- 4. Secure Functions for Wallet Balance and Purchasing

-- 4a. Get Wallet Balance securely
CREATE OR REPLACE FUNCTION public.get_wallet_balance(p_user_id UUID)
RETURNS NUMERIC AS $$
DECLARE
    total_balance NUMERIC;
BEGIN
    SELECT COALESCE(SUM(amount), 0) INTO total_balance
    FROM public.wallet_transactions
    WHERE user_id = p_user_id AND status = 'Aprobado';
    
    RETURN total_balance;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4b. Purchase with Wallet transaction atomically
CREATE OR REPLACE FUNCTION public.purchase_with_wallet_v2(
    p_player_id TEXT,
    p_player_tag TEXT,
    p_product_id TEXT,
    p_product_name_snapshot TEXT,
    p_diamonds_total INTEGER,
    p_price_usd NUMERIC
) RETURNS JSON AS $$
DECLARE
    v_user_id UUID;
    v_current_balance NUMERIC;
    v_new_order_id UUID;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    -- Lock the user's transactions implicitly by calculating balance inside a transaction
    v_current_balance := public.get_wallet_balance(v_user_id);

    IF v_current_balance < p_price_usd THEN
        RAISE EXCEPTION 'Saldo insuficiente en la billetera virtual.';
    END IF;

    -- 1. Insert Wallet Debit Transaction
    INSERT INTO public.wallet_transactions (user_id, amount, type, status)
    VALUES (v_user_id, -p_price_usd, 'purchase', 'Aprobado');

    -- 2. Insert Order
    INSERT INTO public.orders (
        user_id, player_id, player_tag, product_id, product_name_snapshot, 
        diamonds_total, price_usd, status, payment_method, is_wallet_top_up
    ) VALUES (
        v_user_id, p_player_id, p_player_tag, p_product_id, p_product_name_snapshot,
        p_diamonds_total, p_price_usd, 'Pendiente', 'wallet_balance', false
    ) RETURNING id INTO v_new_order_id;

    -- 3. Insert Order History
    INSERT INTO public.order_status_history (order_id, status, note)
    VALUES (v_new_order_id, 'Pendiente', 'Pedido pagado exitosamente con saldo de Billetera Virtual.');

    RETURN json_build_object('success', true, 'order_id', v_new_order_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4c. Get all users with computed balance for Admin
CREATE OR REPLACE FUNCTION public.get_all_users_with_balance()
RETURNS TABLE (
    id UUID,
    name TEXT,
    email TEXT,
    avatar_url TEXT,
    role TEXT,
    player_id_default TEXT,
    gamer_tag TEXT,
    phone TEXT,
    preferred_bank TEXT,
    wallet_balance_usd NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id, p.name, p.email, p.avatar_url, p.role, 
        p.player_id_default, p.gamer_tag, p.phone, p.preferred_bank,
        COALESCE(SUM(wt.amount), 0) AS wallet_balance_usd
    FROM public.profiles p
    LEFT JOIN public.wallet_transactions wt ON p.id = wt.user_id AND wt.status = 'Aprobado'
    GROUP BY p.id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Remove mutable balance from profiles
-- Warning: This will destroy existing balances if not backed up!
ALTER TABLE public.profiles DROP COLUMN IF EXISTS wallet_balance_usd;
