require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createAdmin() {
    const email = 'admin@krikas.com';
    const password = 'admin123';

    console.log(`Checking if user ${email} exists...`);

    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();

    if (listError) {
        console.error('Error listing users:', listError);
        return;
    }

    const existingUser = users.find(u => u.email === email);

    let userId;

    if (existingUser) {
        console.log('User already exists. Updating password...');
        userId = existingUser.id;
        const { error: updateError } = await supabase.auth.admin.updateUserById(
            userId,
            { password: password, email_confirm: true }
        );
        if (updateError) {
            console.error('Error updating password:', updateError);
            return;
        }
        console.log('Password updated.');
    } else {
        console.log('Creating new admin user...');
        const { data, error: createError } = await supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true
        });

        if (createError) {
            console.error('Error creating user:', createError);
            return;
        }
        userId = data.user.id;
        console.log('User created.');
    }

    console.log('Updating profile role to admin...');

    // Wait a bit for trigger if new user (optional, but safer to just upsert)
    await new Promise(resolve => setTimeout(resolve, 1000));

    const { error: upsertError } = await supabase
        .from('profiles')
        .upsert({ id: userId, email: email, role: 'admin' });

    if (upsertError) {
        console.error('Error upserting profile:', upsertError);
    } else {
        console.log('Profile role updated to admin.');
    }

    console.log('Done.');
}

createAdmin();
