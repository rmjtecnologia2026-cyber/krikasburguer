# 🔧 FIX URGENTE - Políticas de Pedidos

## Problema Identificado
Os pedidos estão voltando para "novo" ao atualizar a página porque **faltam políticas RLS de UPDATE** na tabela `orders`.

## Solução

### Passo 1: Acessar o Supabase
1. Acesse [supabase.com](https://supabase.com)
2. Entre no seu projeto
3. Vá em **SQL Editor**

### Passo 2: Executar o Script
1. Clique em **New Query**
2. Copie TODO o conteúdo do arquivo `fix_orders_policies.sql`
3. Cole no editor
4. Clique em **Run** (ou pressione Ctrl+Enter)

### Passo 3: Verificar
Após executar, você verá uma tabela mostrando todas as políticas criadas. Deve aparecer:
- ✅ Admin pode ler todos pedidos
- ✅ Admin pode atualizar pedidos
- ✅ Admin pode ler itens dos pedidos

### Passo 4: Testar
1. Recarregue a página do admin no navegador
2. Mude o status de um pedido
3. Atualize a página (F5)
4. O status deve permanecer! ✅

## O que foi corrigido?
- Adicionadas políticas de **SELECT** para admin ler pedidos
- Adicionadas políticas de **UPDATE** para admin atualizar status
- Adicionadas políticas de **SELECT** para admin ler itens dos pedidos

---
**IMPORTANTE:** Execute este script AGORA no Supabase para o sistema funcionar corretamente!
