-- ============================================================
-- 20_redemption_codes_summary.sql
-- KinDev S.A.S. - RPC optimizada para resumen agregado de códigos de canje
-- Proyecto: TunTunStore
-- Propósito: Reemplazar descarga de 5,900+ registros (~830 KB) por resumen agrupado (<1 KB)
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_redemption_codes_summary()
RETURNS TABLE (
  product_id TEXT,
  total BIGINT,
  available BIGINT,
  used BIGINT
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT 
    product_id::TEXT AS product_id,
    COUNT(*)::BIGINT AS total,
    COUNT(*) FILTER (WHERE is_used = false)::BIGINT AS available,
    COUNT(*) FILTER (WHERE is_used = true)::BIGINT AS used
  FROM public.redemption_codes
  WHERE product_id IS NOT NULL
  GROUP BY product_id;
$$;

GRANT EXECUTE ON FUNCTION public.get_redemption_codes_summary() TO anon, authenticated, service_role;
