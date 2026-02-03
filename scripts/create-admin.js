const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Ler .env.local manualmente para evitar dependência de dotenv
let envConfig = {};
try {
    const envPath = path.resolve(__dirname, '..', '.env.local');
    const envFile = fs.readFileSync(envPath, 'utf8');
    envFile.split('\n').forEach(line => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
            const key = match[1].trim();
            const value = match[2].trim().replace(/^["'](.*)["']$/, '$1'); // remover aspas
            envConfig[key] = value;
        }
    });
} catch (e) {
    console.error('Erro ao ler .env.local', e);
}

const supabaseUrl = envConfig.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = envConfig.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Erro: Variáveis de ambiente faltando (NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY).');
    console.log('Conteúdo lido:', Object.keys(envConfig));
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createAdmin() {
    const email = 'admin@krikas.com';
    const password = 'admin123';

    console.log(`Criando usuário ${email}...`);

    // 1. Criar usuário no Auth
    const { data: user, error: createError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true
    });

    if (createError) {
        console.error('Erro ao criar usuário:', createError.message);
        // Se usuário já existe, tentar dar update no perfil
        if (createError.message.includes('already registered')) {
            console.log('Usuário já existe. Tentando atualizar permissão...');
            // Buscar ID do usuário (precisamos listar users - requires permission)
            const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
            const existingUser = users.find(u => u.email === email);
            if (existingUser) {
                await updateProfile(existingUser.id);
            }
            return;
        }
        return;
    }

    console.log('Usuário criado com sucesso:', user.user.id);
    await updateProfile(user.user.id);
}

async function updateProfile(userId) {
    console.log('Atualizando perfil para admin...');

    // Como temos o trigger, o perfil já deve ter sido criado como 'user'
    // Vamos forçar update
    const { error } = await supabase
        .from('profiles')
        .upsert({
            id: userId,
            role: 'admin',
            email: 'admin@krikas.com'
        })
        .select();

    if (error) {
        console.error('Erro ao atualizar perfil:', error.message);
    } else {
        console.log('Perfil atualizado para ADMIN com sucesso!');
    }
}

createAdmin();
