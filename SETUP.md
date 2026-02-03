# 🚀 Sistema de Delivery - Guia de Configuração

## 📋 Pré-requisitos

- Node.js 18+ instalado
- Conta no Supabase (gratuita)
- Conta na Vercel (gratuita)

## 🗄️ Configuração do Supabase

### 1. Criar Projeto no Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Crie uma nova conta ou faça login
3. Clique em "New Project"
4. Preencha os dados:
   - Nome do projeto
   - Senha do banco de dados (guarde essa senha!)
   - Região (escolha a mais próxima do Brasil)

### 2. Executar o Schema SQL

1. No painel do Supabase, vá em **SQL Editor**
2. Clique em "New Query"
3. Copie todo o conteúdo do arquivo `supabase-schema.sql`
4. Cole no editor e clique em "Run"
5. Aguarde a execução completar

### 3. Habilitar Realtime

1. Vá em **Database** → **Replication**
2. Encontre a tabela `orders`
3. Ative o toggle para habilitar Realtime

### 4. Criar Usuário Admin

1. Vá em **Authentication** → **Users**
2. Clique em "Add User"
3. Escolha "Create new user"
4. Preencha:
   - Email: seu@email.com
   - Password: sua senha segura
   - Confirme a senha
5. Clique em "Create User"

### 5. Obter Chaves da API

1. Vá em **Project Settings** → **API**
2. Copie as seguintes informações:
   - **Project URL**: `https://seu-projeto.supabase.co`
   - **anon public**: `eyJhbGc...`
   - **service_role**: `eyJhbGc...` (⚠️ Mantenha em segredo!)

## 🔧 Configuração Local

### 1. Instalar Dependências

```bash
npm install
```

### 2. Configurar Variáveis de Ambiente

O arquivo `.env.local` já está configurado com suas credenciais:

```env
NEXT_PUBLIC_SUPABASE_URL=https://sbuqebykrqbsmawnxrus.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon
SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role
```

### 3. Executar Localmente

```bash
npm run dev
```

Acesse:
- **Site do cliente**: http://localhost:3000
- **Admin**: http://localhost:3000/admin/login

## 📦 Adicionar Produtos (Inicial)

### Via Supabase Dashboard

1. Vá em **Table Editor** → **products**
2. Clique em "Insert" → "Insert row"
3. Preencha os campos:
   - **name**: Nome do produto
   - **description**: Descrição
   - **price**: Preço (ex: 29.90)
   - **image_url**: URL da imagem
   - **category_id**: ID da categoria (copie da tabela categories)
   - **is_featured**: true/false
   - **is_active**: true

### Categorias Padrão

O sistema já vem com 4 categorias:
- Pizzas
- Lanches
- Bebidas
- Sobremesas

## 🎨 Adicionar Banners

1. Vá em **Table Editor** → **banners**
2. Clique em "Insert" → "Insert row"
3. Preencha:
   - **title**: Título do banner
   - **description**: Descrição
   - **image_url**: URL da imagem (1200x500px recomendado)
   - **is_active**: true
   - **order**: 1, 2, 3... (ordem de exibição)

## 🚀 Deploy na Vercel

### 1. Preparar Repositório Git

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/seu-usuario/seu-repo.git
git push -u origin main
```

### 2. Deploy na Vercel

1. Acesse [vercel.com](https://vercel.com)
2. Faça login com GitHub
3. Clique em "New Project"
4. Importe seu repositório
5. Configure as variáveis de ambiente:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
6. Clique em "Deploy"

### 3. Configurar Domínio (Opcional)

1. Vá em **Settings** → **Domains**
2. Adicione seu domínio personalizado
3. Siga as instruções para configurar DNS

## 🔔 Configurar Som de Notificação

O sistema toca um som quando um novo pedido chega. Para adicionar o arquivo de som:

1. Crie a pasta `public/sounds/`
2. Adicione um arquivo MP3 chamado `notification.mp3`
3. Você pode usar qualquer som de notificação curto (1-2 segundos)

## ✅ Checklist Pós-Deploy

- [ ] Site do cliente acessível
- [ ] Admin acessível e login funcionando
- [ ] Produtos aparecendo na home
- [ ] Banner funcionando
- [ ] Carrinho funcionando
- [ ] Finalização de pedido salvando no banco
- [ ] Pedidos aparecendo no admin em tempo real
- [ ] Som de notificação funcionando
- [ ] Alteração de status de pedidos funcionando

## 🆘 Problemas Comuns

### Erro de autenticação no admin

- Verifique se criou o usuário no Supabase Auth
- Confirme que as variáveis de ambiente estão corretas

### Produtos não aparecem

- Verifique se `is_active` está como `true`
- Confirme que os produtos têm uma categoria válida

### Realtime não funciona

- Verifique se habilitou Realtime para a tabela `orders`
- Confirme que executou o SQL: `ALTER PUBLICATION supabase_realtime ADD TABLE orders;`

### Som não toca

- Adicione o arquivo `notification.mp3` em `public/sounds/`
- Alguns navegadores bloqueiam áudio automático - clique na página primeiro

## 📞 Suporte

Para dúvidas ou problemas, consulte:
- [Documentação do Next.js](https://nextjs.org/docs)
- [Documentação do Supabase](https://supabase.com/docs)
- [Documentação da Vercel](https://vercel.com/docs)
