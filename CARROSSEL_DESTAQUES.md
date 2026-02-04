# ⭐ Carrossel de Destaques

Se o carrossel de destaques não está aparecendo na página inicial, é muito provável que **nenhum produto esteja marcado como "Destaque"** no banco de dados.

## 🛠️ Como Resolver

### Opção 1: Pelo Painel Admin (Manual)
1. Acesse o Painel Admin (`/admin/dashboard`).
2. Vá em **Produtos**.
3. Edite os produtos que você quer destacar.
4. Marque a caixa **"Destaque"** (ou ícone de estrela) e salve.
5. Marque pelo menos 5 produtos para testar o carrossel.

### Opção 2: Forçar via Banco de Dados (Rápido)
Se você quer encher o carrossel rapidamente para testar:

1. Acesse o [Supabase Dashboard](https://supabase.com/dashboard).
2. Vá em **SQL Editor**.
3. Copie o conteúdo do arquivo `force_featured_products.sql`.
4. Clique em **Run**.

Isso vai pegar os 5 produtos mais recentes e marcá-los como destaque automaticamente.
