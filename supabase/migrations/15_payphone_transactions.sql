-- Migration 15: PayPhone Transactions

CREATE TABLE payphone_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) NOT NULL,
    payphone_transaction_id BIGINT,
    client_transaction_id TEXT NOT NULL UNIQUE,
    amount_cents INTEGER NOT NULL,
    amount_without_tax_cents INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','prepared','confirmed','approved','failed','cancelled','reversed')),
    prepare_response JSONB,
    confirm_response JSONB,
    wallet_transaction_id UUID REFERENCES wallet_transactions(id),
    payment_url TEXT,
    authorization_code TEXT,
    card_type TEXT,
    last_four_digits TEXT,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS policies
ALTER TABLE payphone_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Los usuarios pueden ver sus propias transacciones"
    ON payphone_transactions FOR SELECT
    USING (auth.uid() = user_id);

-- Service role puede hacer todo
CREATE POLICY "Service role todo"
    ON payphone_transactions FOR ALL
    USING (true)
    WITH CHECK (true);

-- Indexes
CREATE INDEX idx_payphone_tx_user_id ON payphone_transactions(user_id);
CREATE INDEX idx_payphone_tx_status ON payphone_transactions(status);
CREATE INDEX idx_payphone_tx_client_tx_id ON payphone_transactions(client_transaction_id);

-- Trigger para updated_at (asume que existe la función moddatetime)
-- Si no existe, usamos una propia o dejamos que manejen. Asumiremos que pueden no tener moddatetime activado en su db si no lo mencionan. 
-- Así que haré una función básica:
CREATE OR REPLACE FUNCTION update_payphone_tx_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at_payphone_transactions
    BEFORE UPDATE ON payphone_transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_payphone_tx_updated_at();

-- Function: confirm_payphone_payment
CREATE OR REPLACE FUNCTION confirm_payphone_payment(p_client_transaction_id TEXT, p_payphone_response JSONB)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_tx RECORD;
    v_wallet_tx_id UUID;
    v_status TEXT;
    v_amount_usd NUMERIC;
    v_auth_code TEXT;
    v_card_type TEXT;
    v_last_four TEXT;
    v_status_code INTEGER;
    v_transaction_status TEXT;
BEGIN
    -- 1. Select the payphone_transaction FOR UPDATE (lock)
    SELECT * INTO v_tx
    FROM payphone_transactions
    WHERE client_transaction_id = p_client_transaction_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Transacción no encontrada');
    END IF;

    -- 2. If already approved
    IF v_tx.status = 'approved' THEN
        RETURN jsonb_build_object('success', true, 'already_processed', true);
    END IF;

    -- 3. If status not in (pending, prepared)
    IF v_tx.status NOT IN ('pending', 'prepared', 'confirmed') THEN
        RETURN jsonb_build_object('success', false, 'error', 'Estado de transacción inválido para confirmación');
    END IF;

    -- 4. Checks if PayPhone response shows Approved (statusCode = 3 or transactionStatus = 'Approved')
    v_status_code := (p_payphone_response->>'statusCode')::INTEGER;
    v_transaction_status := p_payphone_response->>'transactionStatus';
    
    IF v_status_code = 3 OR v_transaction_status = 'Approved' THEN
        v_status := 'approved';
        v_amount_usd := v_tx.amount_cents / 100.0;
        v_auth_code := p_payphone_response->>'authorizationCode';
        v_card_type := p_payphone_response->>'cardType';
        v_last_four := p_payphone_response->>'lastDigits';
        
        -- 5. INSERT into wallet_transactions
        INSERT INTO wallet_transactions (user_id, amount, type, status, admin_note)
        VALUES (v_tx.user_id, v_amount_usd, 'top_up', 'Aprobado', 'PayPhone Auth: ' || COALESCE(v_auth_code, 'N/A'))
        RETURNING id INTO v_wallet_tx_id;
        
        -- 6. UPDATE payphone_transactions
        UPDATE payphone_transactions
        SET status = 'approved',
            confirm_response = p_payphone_response,
            wallet_transaction_id = v_wallet_tx_id,
            authorization_code = v_auth_code,
            card_type = v_card_type,
            last_four_digits = v_last_four,
            updated_at = now()
        WHERE id = v_tx.id;
        
        -- 7. Returns success
        RETURN jsonb_build_object('success', true, 'wallet_transaction_id', v_wallet_tx_id, 'amount_usd', v_amount_usd);
    ELSE
        -- 8. If not approved: marks as 'failed'
        UPDATE payphone_transactions
        SET status = 'failed',
            confirm_response = p_payphone_response,
            error_message = COALESCE(p_payphone_response->>'message', 'Pago no aprobado'),
            updated_at = now()
        WHERE id = v_tx.id;
        
        RETURN jsonb_build_object('success', false, 'error', 'Pago no aprobado', 'status_code', v_status_code);
    END IF;
END;
$$;

-- Permisos de ejecución de la función
GRANT EXECUTE ON FUNCTION confirm_payphone_payment(TEXT, JSONB) TO anon, authenticated, service_role;

