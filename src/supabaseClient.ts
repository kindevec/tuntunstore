import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://tkfpmmjnyzmulxkmtesf.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRrZnBtbWpueXptdWx4a210ZXNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUwMDI0MDQsImV4cCI6MjEwMDU3ODQwNH0.Nvs0aSZyFvlKTX5AvQx_oK--hmCLHduigjnYywnPKK0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
