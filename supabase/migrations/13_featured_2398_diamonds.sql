-- Migration 13: Replace 341 DIAMANTES with 2398 DIAMANTES in featured offers
UPDATE public.products 
SET is_popular = false 
WHERE id = 'dia-341' OR name ILIKE '%341%';

UPDATE public.products 
SET is_popular = true, badge_text = 'OFERTA DESTACADA 🔥' 
WHERE id = 'dia-2398' OR name ILIKE '%2398%';
