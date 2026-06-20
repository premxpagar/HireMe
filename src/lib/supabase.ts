import { createClient } from '@supabase/supabase-js';

export const getSupabaseConfig = () => {
  const url = localStorage.getItem('hireme_supabase_url') || import.meta.env.VITE_SUPABASE_URL || '';
  const key = localStorage.getItem('hireme_supabase_anon_key') || import.meta.env.VITE_SUPABASE_ANON_KEY || '';
  return { url, key };
};

const { url, key } = getSupabaseConfig();

// Initial client instance
export const supabase = createClient(
  url || 'https://placeholder.supabase.co',
  key || 'placeholder'
);

// We export a mutable reference that can be re-initialized when settings change
export let activeSupabase = supabase;

export const isSupabaseConfigured = () => {
  const { url, key } = getSupabaseConfig();
  return !!url && !!key && url !== 'https://placeholder.supabase.co';
};

export const reinitSupabase = (newUrl: string, newKey: string) => {
  activeSupabase = createClient(newUrl, newKey);
};
