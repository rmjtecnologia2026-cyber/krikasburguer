-- Adicionar coluna de número sequencial aos pedidos

-- 1. Criar a sequence se não existir
CREATE SEQUENCE IF NOT EXISTS orders_order_number_seq;

-- 2. Adicionar a coluna order_number se não existir
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS order_number BIGINT DEFAULT nextval('orders_order_number_seq');

-- 3. Atualizar os pedidos existentes que estão com NULL (para garantir sequência)
-- Isso vai numerar os antigos sequencialmente baseados na data de criação
WITH numbered_orders AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at ASC) as rn
  FROM orders
  WHERE order_number IS NULL
)
UPDATE orders 
SET order_number = numbered_orders.rn
FROM numbered_orders
WHERE orders.id = numbered_orders.id;

-- 4. Ajustar a sequence para o próximo valor correto
-- Pega o maior valor atual e soma 1
SELECT setval('orders_order_number_seq', COALESCE((SELECT MAX(order_number) FROM orders), 0) + 1, false);

-- Tornar a coluna única (opcional, mas bom)
-- ALTER TABLE orders ADD CONSTRAINT orders_order_number_key UNIQUE (order_number);
