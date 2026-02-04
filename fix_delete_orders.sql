-- Corrigir exclusão de pedidos com CASCADE
-- Execute este script no SQL Editor do Supabase

-- 1. Primeiro, remover a constraint antiga se existir e recriar com CASCADE
ALTER TABLE order_items 
DROP CONSTRAINT IF EXISTS order_items_order_id_fkey;

ALTER TABLE order_items
ADD CONSTRAINT order_items_order_id_fkey 
FOREIGN KEY (order_id) 
REFERENCES orders(id) 
ON DELETE CASCADE;

-- 2. Remover políticas antigas de DELETE se existirem
DROP POLICY IF EXISTS "Authenticated users can delete orders" ON orders;
DROP POLICY IF EXISTS "Authenticated users can delete order items" ON order_items;

-- 3. Criar novas políticas de DELETE
CREATE POLICY "Authenticated users can delete orders"
ON orders FOR DELETE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete order items"
ON order_items FOR DELETE
TO authenticated
USING (true);
