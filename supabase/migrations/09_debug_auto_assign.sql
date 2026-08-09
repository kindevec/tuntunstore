-- 09_debug_auto_assign.sql

-- Esta funcin simula la bsqueda del trigger y devuelve qu encontr
CREATE OR REPLACE FUNCTION public.debug_find_pending_order(p_product_id TEXT)
RETURNS JSON AS $$
DECLARE
    v_order_id TEXT;
    v_order_status TEXT;
    v_order_code TEXT;
    v_result JSON;
BEGIN
    SELECT id, status, redemption_code 
    INTO v_order_id, v_order_status, v_order_code
    FROM public.orders
    WHERE product_id = p_product_id
      AND status IN ('Pendiente', 'En proceso')
      AND (redemption_code IS NULL OR redemption_code = '')
    ORDER BY created_at ASC
    LIMIT 1;
    
    IF v_order_id IS NOT NULL THEN
        v_result := json_build_object(
            'found', true,
            'order_id', v_order_id,
            'status', v_order_status,
            'redemption_code', v_order_code
        );
    ELSE
        -- Si no encontr, vamos a ver qu rdenes HAY para ese producto para entender por qu fall
        v_result := json_build_object(
            'found', false,
            'message', 'No pending orders found for this product. Check total orders for this product below.',
            'all_orders_for_product', (
                SELECT json_agg(json_build_object('id', id, 'status', status, 'redemption_code', redemption_code))
                FROM public.orders
                WHERE product_id = p_product_id
            )
        );
    END IF;
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
