-- Adicionar campo para rastrear quando o pedido foi aceito
-- Execute este script no SQL Editor do Supabase

-- Adicionar coluna accepted_at (quando o pedido foi aceito/iniciado preparo)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS accepted_at TIMESTAMP WITH TIME ZONE;

-- Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_orders_accepted_at ON orders(accepted_at);
