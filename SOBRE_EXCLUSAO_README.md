# ❓ Sobre Exclusão de Pedidos

## Importante: O Sistema NÃO Deleta Pedidos

O sistema atual **não possui função de exclusão de pedidos**. Isso é intencional para manter o histórico completo.

### O que o sistema faz:
- ✅ **Cancelar pedidos**: Muda o status para "cancelado" com motivo
- ✅ **Manter histórico**: Todos os pedidos ficam salvos
- ✅ **Filtrar por data**: Pedidos antigos não aparecem no Kanban

### Por que não deletar?
1. **Histórico financeiro**: Precisa dos dados para relatórios
2. **Auditoria**: Rastreabilidade de todas as operações
3. **Estatísticas**: Cálculos de ticket médio, total de vendas, etc.

## Se Você REALMENTE Precisa Deletar

### Opção 1: Pelo Supabase (Recomendado)
1. Acesse [supabase.com](https://supabase.com)
2. Vá em **Table Editor**
3. Selecione a tabela `orders`
4. Encontre o pedido
5. Clique nos 3 pontinhos → **Delete row**

### Opção 2: Executar Script SQL
Execute `fix_delete_orders_v2.sql` no SQL Editor primeiro, depois:

```sql
-- Deletar um pedido específico (substitua o ID)
DELETE FROM orders WHERE id = 'ID_DO_PEDIDO_AQUI';

-- Os order_items serão deletados automaticamente (CASCADE)
```

### Opção 3: Adicionar Botão de Delete no Admin (Não Recomendado)

Se você REALMENTE quer um botão de delete no admin, me avise que eu implemento. Mas **não é recomendado** porque:
- ❌ Perde dados financeiros
- ❌ Perde histórico
- ❌ Pode causar problemas em relatórios

## Recomendação

**Use o sistema de CANCELAR** ao invés de deletar:
1. Pedidos cancelados não contam no total financeiro
2. Ficam marcados no histórico
3. Você pode ver o motivo do cancelamento
4. Mantém a integridade dos dados

---

**Se você está vendo erro ao tentar deletar, é porque o sistema não tem essa função implementada. Isso é proposital!** ✅

Se mesmo assim você quer implementar delete, me avise que eu adiciono essa funcionalidade.
