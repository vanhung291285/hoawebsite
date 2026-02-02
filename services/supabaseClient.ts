
import { createClient } from '@supabase/supabase-js';

// Use process.env variables which are replaced by Vite at build time via define plugin in vite.config.ts
// @ts-ignore
const supabaseUrl = process.env.VITE_SUPABASE_URL;
// @ts-ignore
const supabaseKey = process.env.VITE_SUPABASE_KEY;

// Check if variables are set and not just default placeholders
const isUrlValid = supabaseUrl && supabaseUrl.length > 0 && !supabaseUrl.includes('placeholder') && !supabaseUrl.includes('YOUR_SUPABASE_URL');
const isKeyValid = supabaseKey && supabaseKey.length > 0 && !supabaseKey.includes('placeholder') && !supabaseKey.includes('YOUR_SUPABASE_KEY');

export const isSupabaseConfigured = isUrlValid && isKeyValid;

if (!isSupabaseConfigured) {
  console.warn("Supabase chưa được cấu hình đúng. Ứng dụng sẽ chạy ở chế độ Mock Data.");
}

// Fallback to placeholder to prevent client initialization error
const url = isUrlValid ? supabaseUrl : 'https://placeholder.supabase.co';
const key = isKeyValid ? supabaseKey : 'placeholder';

export const supabase = createClient(url, key);
