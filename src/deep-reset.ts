import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

async function deepReset() {
  const envPath = path.resolve('.env.local');
  const envContent = fs.readFileSync(envPath, 'utf8');
  const env: Record<string, string> = {};
  envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) env[key.trim()] = value.trim();
  });

  const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  console.log('--- Deep Reset Started ---');

  const tables = ['sale_items', 'sales', 'products', 'categories'];
  
  for (const table of tables) {
    const { count } = await supabase.from(table).select('*', { count: 'exact', head: true });
    console.log(`Table ${table} has ${count || 0} items.`);
    
    if (count && count > 0) {
      console.log(`Deleting ${count} items from ${table}...`);
      const { error: delErr } = await supabase.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000');
      if (delErr) console.error(`Error deleting from ${table}:`, delErr);
      else console.log(`Successfully cleared ${table}.`);
    }
  }

  console.log('--- Deep Reset Finished ---');
}

deepReset();
