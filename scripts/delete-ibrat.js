import { supabaseAdmin } from '../lib/supabase.js';

const sb = supabaseAdmin();
if (!sb) {
  console.error('Could not initialize Supabase admin');
  process.exit(1);
}

async function deleteDailyibrat() {
  const { data, error } = await sb
    .from('articles')
    .delete()
    .eq('source_name', 'عبرت')
    .select('count');

  if (error) {
    console.error('Delete error:', error.message);
    process.exit(1);
  }

  console.log('Deleted dailyibrat articles successfully');
  if (data && data.length) console.log('Deleted count:', data[0]?.count || 'unknown');
}

deleteDailyibrat();
