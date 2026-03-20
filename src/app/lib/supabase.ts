import { createClient, SupabaseClient } from "@supabase/supabase-js";

let _supabase: SupabaseClient | null = null;

export function getSupabase() {
  if (!_supabase) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) {
      console.error("Supabase env vars missing! URL:", !!url, "KEY:", !!key);
      // Return a dummy client that won't crash
      _supabase = createClient("https://placeholder.supabase.co", "placeholder");
    } else {
      _supabase = createClient(url, key);
    }
  }
  return _supabase;
}
