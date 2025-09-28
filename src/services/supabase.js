import { createClient } from '@supabase/supabase-js';

// Configuration Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Debug configuration
console.log('🚀 Supabase: Configuration chargée:', {
  hasUrl: !!supabaseUrl,
  hasAnonKey: !!supabaseAnonKey,
  url: supabaseUrl
});

// Vérifier que les variables sont définies
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('🚀 Supabase: Variables d\'environnement manquantes');
  throw new Error('Variables Supabase manquantes: VITE_SUPABASE_URL et/ou VITE_SUPABASE_ANON_KEY');
}

// Créer le client Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    // Configuration OAuth pour Google
    redirectTo: window.location.origin
  }
});

console.log('🚀 Supabase: Client initialisé');

export default supabase;