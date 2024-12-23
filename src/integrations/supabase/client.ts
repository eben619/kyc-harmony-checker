import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://prxsatafqwmkujdvdqqk.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InByeHNhdGFmcXdta3VqZHZkcXFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQyOTY4NDIsImV4cCI6MjA0OTg3Mjg0Mn0.2gKcUMatYRrkKNfarImuMJvvmogocCzxXpe6SzJH-SU";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});