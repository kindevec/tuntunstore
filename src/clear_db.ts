import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tkfpmmjnyzmulxkmtesf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRrZnBtbWpueXptdWx4a210ZXNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUwMDI0MDQsImV4cCI6MjEwMDU3ODQwNH0.Nvs0aSZyFvlKTX5AvQx_oK--hmCLHduigjnYywnPKK0';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  const { data: users } = await supabase.rpc('get_all_users_with_balance');
  
  if (users) {
    for (const user of users) {
      if (user.email === 'mkmcmiyako@gmail.com') {
        // Revert the 1000 balance if I messed it up.
        if (user.wallet_balance_usd > 1000) {
           console.log(`Reverting 1000 from Miyako...`);
           await supabase.from('wallet_transactions').insert({
             user_id: user.id,
             amount: -1000,
             status: 'Aprobado',
             type: 'admin_adjustment',
             admin_note: 'Revertir 1000'
           });
        }
        continue;
      }

      const bal = Number(user.wallet_balance_usd);
      if (bal !== 0) {
        console.log(`Zeroing balance for ${user.email} (current: ${bal})`);
        const { error } = await supabase.from('wallet_transactions').insert({
          user_id: user.id,
          amount: -bal,
          status: 'Aprobado',
          type: 'admin_adjustment',
          admin_note: 'Ajuste exacto a 0 por admin'
        });
        if (error) console.log('Error adjusting balance:', error.message);
      }
    }
  }
}

run();
