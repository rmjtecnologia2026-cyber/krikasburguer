# 🗑️ FIX: Erro ao Excluir Pedidos - SOLUÇÃO DEFINITIVA

## Problema
Ao tentar excluir um pedido, ocorre erro porque os `order_items` (itens do pedido) têm uma foreign key para `orders`.

## Solução
Configurar a foreign key com **CASCADE DELETE**, para que ao deletar um pedido, seus itens sejam deletados automaticamente.

## ⚠️ EXECUTE ESTE SCRIPT AGORA

### Passo 1: Acessar Supabase
1. Acesse [supabase.com](https://supabase.com)
2. Entre no seu projeto
3. Vá em **SQL Editor**

### Passo 2: Executar Script
1. Clique em **New Query**
2. Copie **TODO** o conteúdo do arquivo `fix_delete_orders.sql`
3. Cole no editor
4. Clique em **Run** (ou Ctrl+Enter)

### Passo 3: Verificar
O script vai:
1. ✅ Remover a constraint antiga da foreign key
2. ✅ Recriar com **ON DELETE CASCADE**
3. ✅ Criar políticas RLS para permitir DELETE

### Passo 4: Testar
1. Recarregue a página do admin
2. Tente excluir um pedido
3. Deve funcionar sem erros! ✅

## O que o CASCADE faz?

Quando você deleta um pedido:
- ❌ **Antes**: Erro porque os itens ainda existem
- ✅ **Depois**: Itens são deletados automaticamente junto com o pedido

## Importante
Este script é **seguro** e **não deleta dados**. Ele apenas reconfigura como as tabelas se relacionam.

---
**Execute o script `fix_delete_orders.sql` AGORA para resolver o erro!** 🗑️
