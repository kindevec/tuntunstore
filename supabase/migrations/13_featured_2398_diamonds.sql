-- Migration 13: Set exact featured products (110, 572, 2398 DIAMANTES)
UPDATE public.products 
SET is_popular = false;

UPDATE public.products 
SET is_popular = true, badge_text = '$0.92 ⚡'
WHERE id = 'dia-110' OR name ILIKE '%110%';

UPDATE public.products 
SET is_popular = true, badge_text = 'MÁS VENDIDO 🔥'
WHERE id = 'dia-572' OR name ILIKE '%572%';

UPDATE public.products 
SET is_popular = true, badge_text = 'OFERTA DESTACADA 🔥' 
WHERE id = 'dia-2398' OR name ILIKE '%2398%';
