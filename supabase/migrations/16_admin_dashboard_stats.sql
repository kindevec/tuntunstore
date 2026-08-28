-- Migration 16: Admin Dashboard Stats RPC Function
-- Calculates real, complete aggregations for Orders, Wallets, PayPhone and Users without limits.

CREATE OR REPLACE FUNCTION get_admin_dashboard_stats()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_total_orders BIGINT;
    v_total_sales_usd NUMERIC;
    v_total_diamonds BIGINT;
    v_pending_orders BIGINT;
    v_in_progress_orders BIGINT;
    v_completed_orders BIGINT;
    v_cancelled_orders BIGINT;
    v_total_users BIGINT;
    v_total_wallet_funds NUMERIC;
    v_pending_topups BIGINT;
    v_payphone_total_usd NUMERIC;
    v_payphone_count BIGINT;
BEGIN
    -- 1. Aggregations on Orders
    SELECT 
        COUNT(*),
        COALESCE(SUM(CASE WHEN status = 'Completado' THEN price_usd ELSE 0 END), 0),
        COALESCE(SUM(CASE WHEN status = 'Completado' THEN diamonds_total ELSE 0 END), 0),
        COUNT(CASE WHEN status = 'Pendiente' THEN 1 END),
        COUNT(CASE WHEN status = 'En proceso' THEN 1 END),
        COUNT(CASE WHEN status = 'Completado' THEN 1 END),
        COUNT(CASE WHEN status = 'Cancelado' THEN 1 END)
    INTO 
        v_total_orders,
        v_total_sales_usd,
        v_total_diamonds,
        v_pending_orders,
        v_in_progress_orders,
        v_completed_orders,
        v_cancelled_orders
    FROM orders;

    -- 2. Aggregations on Users & Wallets
    SELECT 
        COUNT(*),
        COALESCE(SUM(wallet_balance_usd), 0)
    INTO 
        v_total_users,
        v_total_wallet_funds
    FROM get_all_users_with_balance();

    -- 3. Pending Bank Top-ups
    SELECT COUNT(*)
    INTO v_pending_topups
    FROM wallet_transactions
    WHERE type = 'top_up' AND status = 'Pendiente';

    -- 4. Approved PayPhone Transactions
    SELECT 
        COALESCE(SUM(amount_cents) / 100.0, 0),
        COUNT(*)
    INTO 
        v_payphone_total_usd,
        v_payphone_count
    FROM payphone_transactions
    WHERE status = 'approved';

    -- 5. Return JSON payload
    RETURN jsonb_build_object(
        'total_orders', v_total_orders,
        'total_sales_usd', v_total_sales_usd,
        'total_diamonds_delivered', v_total_diamonds,
        'pending_orders', v_pending_orders,
        'in_progress_orders', v_in_progress_orders,
        'completed_orders', v_completed_orders,
        'cancelled_orders', v_cancelled_orders,
        'total_users', v_total_users,
        'total_wallet_funds', v_total_wallet_funds,
        'pending_topups', v_pending_topups,
        'payphone_total_usd', v_payphone_total_usd,
        'payphone_count', v_payphone_count
    );
END;
$$;

-- Grant execution permissions
GRANT EXECUTE ON FUNCTION get_admin_dashboard_stats() TO anon, authenticated, service_role;
