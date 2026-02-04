-- Script alternativo para corrigir exclusão de pedidos
-- Execute este script no SQL Editor do Supabase

-- OPÇÃO 1: Recriar a foreign key com CASCADE
-- Isso permite que ao deletar um pedido, os itens sejam deletados automaticamente

DO $$ 
BEGIN
    -- Tentar remover a constraint antiga
    ALTER TABLE order_items DROP CONSTRAINT IF EXISTS order_items_order_id_fkey;
    
    -- Adicionar nova constraint com CASCADE
    ALTER TABLE order_items
    ADD CONSTRAINT order_items_order_id_fkey 
    FOREIGN KEY (order_id) 
    REFERENCES orders(id) 
    ON DELETE CASCADE;
    
    RAISE NOTICE 'Foreign key recriada com CASCADE!';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Erro ao recriar foreign key: %', SQLERRM;
END $$;

-- OPÇÃO 2: Criar políticas RLS para DELETE (se não existirem)

DO $$ 
BEGIN
    -- Política para orders
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'orders' 
        AND policyname = 'Authenticated users can delete orders'
    ) THEN
        CREATE POLICY "Authenticated users can delete orders"
        ON orders FOR DELETE
        TO authenticated
        USING (true);
        RAISE NOTICE 'Política de DELETE criada para orders!';
    ELSE
        RAISE NOTICE 'Política de DELETE já existe para orders';
    END IF;
END $$;

DO $$ 
BEGIN
    -- Política para order_items
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'order_items' 
        AND policyname = 'Authenticated users can delete order items'
    ) THEN
        CREATE POLICY "Authenticated users can delete order items"
        ON order_items FOR DELETE
        TO authenticated
        USING (true);
        RAISE NOTICE 'Política de DELETE criada para order_items!';
    ELSE
        RAISE NOTICE 'Política de DELETE já existe para order_items';
    END IF;
END $$;

-- Verificar se RLS está habilitado
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Mensagem final
DO $$ 
BEGIN
    RAISE NOTICE '✅ Script executado com sucesso! Tente excluir um pedido agora.';
END $$;
