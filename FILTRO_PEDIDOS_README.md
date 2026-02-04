# 🗑️ Correção: Exclusão de Pedidos + Filtro de Pedidos do Dia

## O que foi implementado?

### 1. 📋 **Histórico com Acordeon**
- Pedidos agrupados por data em acordeon expansível
- Clique na data para expandir/recolher os pedidos
- Visual mais limpo e organizado
- Indicador visual (▶) que gira ao expandir

### 2. 📅 **Filtro de Pedidos do Dia no Kanban**
- **Gestor de Pedidos** agora mostra APENAS pedidos de hoje
- Pedidos de dias anteriores vão automaticamente para o **Histórico**
- Aviso visual informando que está exibindo apenas pedidos de hoje
- A cada novo dia, o Kanban começa limpo!

### 3. 🗑️ **Correção: Exclusão de Pedidos**
Adicionada política RLS para permitir deletar pedidos.

## ⚠️ IMPORTANTE: Execute o Script SQL

Para permitir a exclusão de pedidos, execute o script:

### Passo 1: Acessar Supabase
1. Acesse [supabase.com](https://supabase.com)
2. Entre no seu projeto
3. Vá em **SQL Editor**

### Passo 2: Executar Script
1. Clique em **New Query**
2. Copie TODO o conteúdo do arquivo `add_delete_policy.sql`
3. Cole no editor
4. Clique em **Run** (ou Ctrl+Enter)

### Passo 3: Testar
1. Recarregue a página do admin
2. Tente excluir um pedido
3. Deve funcionar sem erros! ✅

## Como Funciona Agora?

### Gestor de Pedidos (Kanban)
- ✅ Mostra APENAS pedidos de **hoje**
- ✅ Pedidos de ontem/dias anteriores NÃO aparecem
- ✅ A cada novo dia, começa limpo
- ✅ Aviso visual: "📅 Exibindo apenas pedidos de hoje"

### Histórico
- ✅ Mostra TODOS os pedidos finalizados/cancelados
- ✅ Agrupados por data em acordeon
- ✅ Clique na data para ver os pedidos
- ✅ Total do dia calculado automaticamente

### Fluxo de Trabalho
1. **Novo pedido** → Aparece no Kanban (se for de hoje)
2. **Processar pedido** → Move pelas colunas do Kanban
3. **Finalizar/Cancelar** → Vai para o Histórico
4. **Próximo dia** → Kanban limpo, pedidos antigos no Histórico

---
**Execute o script SQL agora para ativar a exclusão de pedidos!** 🗑️
