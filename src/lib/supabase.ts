import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://egyvolruecjtmazwmqzn.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVneXZvbHJ1ZWNqdG1hendtcXpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYwNDU4NzksImV4cCI6MjEwMTYyMTg3OX0.hyu4Z7UsYWFpKIZutQhYaCDrHA9UMbmJPPv2rZJ6b28';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
export default supabase;
