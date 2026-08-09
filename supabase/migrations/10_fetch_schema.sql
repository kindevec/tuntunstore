-- 10_fetch_schema.sql
CREATE OR REPLACE FUNCTION public.fetch_schema_info()
RETURNS JSON AS $$
DECLARE
    v_orders_id_type TEXT;
    v_history_id_type TEXT;
BEGIN
    SELECT data_type INTO v_orders_id_type
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'id';

    SELECT data_type INTO v_history_id_type
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'order_status_history' AND column_name = 'order_id';

    RETURN json_build_object(
        'orders_id_type', v_orders_id_type,
        'history_order_id_type', v_history_id_type
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
