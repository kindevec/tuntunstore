const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://tkfpmmjnyzmulxkmtesf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRrZnBtbWpueXptdWx4a210ZXNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUwMDI0MDQsImV4cCI6MjEwMDU3ODQwNH0.Nvs0aSZyFvlKTX5AvQx_oK--hmCLHduigjnYywnPKK0';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function debug() {
  console.log("Fetching ALL orders...");
  const { data: orders, error: oError } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);
    
  if (oError) {
    console.error("Orders Error:", oError);
  } else {
    console.log("ALL Orders:", orders);
  }
}

debug();
