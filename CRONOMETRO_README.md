# ⏱️ Cronômetro de Pedidos - Instruções

## O que foi implementado?

Um cronômetro que mostra o tempo decorrido desde que o pedido foi aceito (botão "Aceitar" clicado).

### Recursos:
- ⏱️ Cronômetro em tempo real (atualiza a cada segundo)
- 🎨 Cores baseadas no tempo:
  - **Verde**: 0-14 minutos
  - **Amarelo**: 15-29 minutos  
  - **Vermelho**: 30+ minutos
- 💾 Tempo salvo no banco de dados
- 🔄 Sincronização em tempo real entre abas

## ⚠️ IMPORTANTE: Execute o Script SQL

Antes de testar, você PRECISA executar o script SQL no Supabase:

### Passo 1: Acessar Supabase
1. Acesse [supabase.com](https://supabase.com)
2. Entre no seu projeto
3. Vá em **SQL Editor**

### Passo 2: Executar o Script
1. Clique em **New Query**
2. Copie TODO o conteúdo do arquivo `add_accepted_at_field.sql`
3. Cole no editor
4. Clique em **Run** (ou Ctrl+Enter)

### Passo 3: Testar
1. Recarregue a página do admin
2. Faça um pedido de teste
3. Clique em "Aceitar"
4. O cronômetro deve aparecer e começar a contar! ⏱️

## Como funciona?

1. **Pedido novo**: Sem cronômetro
2. **Clicar em "Aceitar"**: 
   - Status muda para "em_preparo"
   - Campo `accepted_at` é salvo com timestamp atual
   - Cronômetro começa a contar
3. **Pedido em preparo/saiu para entrega**: Cronômetro continua contando
4. **Pedido finalizado**: Cronômetro para de aparecer

---
**Execute o script SQL agora para ativar o cronômetro!** ⏱️
