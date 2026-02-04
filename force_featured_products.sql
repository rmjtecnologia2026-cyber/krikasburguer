-- Definir os primeiros 5 produtos ativos como DESTAQUE
UPDATE products
SET is_featured = true
WHERE id IN (
  SELECT id FROM products 
  WHERE is_active = true 
  ORDER BY created_at DESC 
  LIMIT 5
);
