# 🔢 Numeração de Pedidos

Para que os pedidos tenham números sequenciais (Ex: Nº 1, Nº 2), é necessário criar uma sequência no banco de dados.

## 🛠️ Como Configurar

1. Acesse o [Supabase Dashboard](https://supabase.com/dashboard)
2. Vá em **SQL Editor**
3. Copie o conteúdo do arquivo `add_order_number.sql`
4. Cole no editor e clique em **Run**

## 📝 O que o script faz:
- ✅ Cria uma sequência numérica
- ✅ Adiciona a coluna `order_number` na tabela `orders`
- ✅ Numera automaticamente todos os pedidos antigos (baseado na data de criação)
- ✅ Configura para que novos pedidos sigam a sequência correta

## ⚠️ Atenção
Se você **resetar** o banco de dados, precisará rodar este script novamente.
