const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Ler .env.local manual
let envConfig = {};
try {
    const envPath = path.resolve(__dirname, '..', '.env.local');
    const envFile = fs.readFileSync(envPath, 'utf8');
    envFile.split('\n').forEach(line => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
            const key = match[1].trim();
            const value = match[2].trim().replace(/^["'](.*)["']$/, '$1');
            envConfig[key] = value;
        }
    });
} catch (e) { console.error(e); }

const supabaseUrl = envConfig.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = envConfig.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Faltam chaves do Supabase.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function resetAdmin() {
    const email = 'admin@krikas.com';
    const newPassword = 'admin123';

    console.log(`Buscando usuario ${email}...`);

    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();

    if (listError) {
        console.error('Erro ao listar:', listError);
        return;
    }

    const user = users.find(u => u.email === email);

    if (!user) {
        console.log('Usuário não encontrado. Criando...');
        const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
            email,
            password: newPassword,
            email_confirm: true,
            user_metadata: { role: 'admin' }
        });
        if (createError) console.error('Erro ao criar:', createError);
        else console.log('Criado com ID:', newUser.user.id);
        return;
    }

    console.log('Usuário encontrado:', user.id);
    console.log('Resetando senha e confirmando email...');

    const { data: updatedUser, error: updateError } = await supabase.auth.admin.updateUserById(
        user.id,
        {
            password: newPassword,
            email_confirm: true,
            user_metadata: { role: 'admin' }
        }
    );

    if (updateError) {
        console.error('Erro ao atualizar:', updateError);
    } else {
        console.log('Senha atualizada para:', newPassword);
        console.log('Email confirmado:', updatedUser.user.email_confirmed_at);
    }

    // Garantir profile
    const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
            id: user.id,
            role: 'admin',
            email: email
        });

    if (profileError) console.error('Erro no profile:', profileError);
    else console.log('Profile garantido como admin.');
}

resetAdmin();
