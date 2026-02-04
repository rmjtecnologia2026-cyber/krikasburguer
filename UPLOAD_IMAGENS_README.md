# 📸 Upload de Imagens de Produtos - Instruções

## O que foi implementado?

Sistema de upload de imagens para produtos usando Supabase Storage ao invés de URLs externas.

### Recursos:
- 📤 Upload direto de imagens
- 🖼️ Preview em tempo real
- 🗑️ Botão para remover imagem
- ✅ Validação de tipo (apenas imagens)
- ✅ Validação de tamanho (máx 5MB)
- 🔄 Indicador de progresso durante upload
- 🎨 Interface moderna e intuitiva

## ⚠️ IMPORTANTE: Configure o Supabase Storage

Antes de usar o upload de imagens, você PRECISA criar o bucket no Supabase:

### Passo 1: Acessar Supabase
1. Acesse [supabase.com](https://supabase.com)
2. Entre no seu projeto
3. Vá em **Storage** no menu lateral

### Passo 2: Criar Bucket
**OPÇÃO A - Pela Interface (Recomendado):**
1. Clique em **New Bucket**
2. Nome: `products`
3. Marque **Public bucket** ✅
4. Clique em **Create bucket**

**OPÇÃO B - Por SQL:**
1. Vá em **SQL Editor**
2. Clique em **New Query**
3. Copie TODO o conteúdo do arquivo `create_products_storage.sql`
4. Cole no editor
5. Clique em **Run** (ou Ctrl+Enter)

### Passo 3: Configurar Políticas (se usou Opção A)
Se você criou o bucket pela interface, precisa adicionar as políticas:

1. No Storage, clique no bucket `products`
2. Vá na aba **Policies**
3. Clique em **New Policy**
4. Crie as seguintes políticas:

**Política 1 - Upload (INSERT):**
- Nome: `Authenticated users can upload product images`
- Allowed operation: `INSERT`
- Target roles: `authenticated`
- USING expression: `bucket_id = 'products'`

**Política 2 - Visualização (SELECT):**
- Nome: `Public can view product images`
- Allowed operation: `SELECT`
- Target roles: `public`
- USING expression: `bucket_id = 'products'`

**Política 3 - Deletar (DELETE):**
- Nome: `Authenticated users can delete product images`
- Allowed operation: `DELETE`
- Target roles: `authenticated`
- USING expression: `bucket_id = 'products'`

### Passo 4: Testar
1. Recarregue a página do admin
2. Vá em **Produtos** → **Novo Produto** ou edite um existente
3. Clique em **Escolher arquivo** e selecione uma imagem
4. A imagem deve fazer upload e aparecer o preview! 📸

## Como funciona?

1. **Selecionar imagem**: Clique no campo de arquivo
2. **Upload automático**: A imagem é enviada para o Supabase Storage
3. **Preview**: Visualização instantânea da imagem
4. **Salvar**: Ao salvar o produto, a URL da imagem é salva no banco

## Validações

- ✅ Apenas arquivos de imagem (jpg, png, gif, webp, etc)
- ✅ Tamanho máximo: 5MB
- ✅ Nome único gerado automaticamente
- ✅ Imagens antigas são deletadas ao remover

---
**Execute a configuração do Storage agora para ativar o upload de imagens!** 📸
