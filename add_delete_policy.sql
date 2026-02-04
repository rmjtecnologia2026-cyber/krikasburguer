-- Adicionar política de DELETE para pedidos
-- Execute este script no SQL Editor do Supabase

-- Permitir que authenticated users deletem pedidos
CREATE POLICY "Authenticated users can delete orders"
ON orders FOR DELETE
TO authenticated
USING (true);

-- Permitir que authenticated users deletem itens de pedidos
CREATE POLICY "Authenticated users can delete order items"
ON order_items FOR DELETE
TO authenticated
USING (true);
