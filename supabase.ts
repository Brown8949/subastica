
import { createClient } from '@supabase/supabase-js';

// Configuración oficial del entorno Subas-tica
const supabaseUrl = 'https://mfdobugdrqxnblfhmyjg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1mZG9idWdkcnF4bmJsZmhteWpnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYzNzY3NTEsImV4cCI6MjA4MTk1Mjc1MX0.9S5AnLPLic5i_wSHe6zyZ8XgYQafSRNE0SNay2fyjJA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
