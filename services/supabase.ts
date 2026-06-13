import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// Supabase Connection Details (from .env)
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://ivkzdbdfzsqojkrtmjgm.supabase.co';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_9w_1rYlQgmEBmxVT5zS1_A_L6yfqkOz';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
