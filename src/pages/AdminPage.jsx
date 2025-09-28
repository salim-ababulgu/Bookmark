// AdminPage - Informations de debug et administration
import React from 'react';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';
import { supabase } from '../services/supabase';
import { Shield, Database, User, Code, Server, Eye } from 'lucide-react';

const AdminPage = () => {
  const { user, session, userEmail, userName, userMetadata, appMetadata } = useSupabaseAuth();

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Accès refusé</h2>
          <p className="text-muted-foreground">Vous devez être connecté pour accéder à cette page.</p>
        </div>
      </div>
    );
  }

  const systemInfo = {
    environment: {
      nodeEnv: process.env.NODE_ENV || 'development',
      supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
      hasSupabaseKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
      buildTime: new Date().toISOString(),
      userAgent: navigator.userAgent,
      location: window.location.href,
      projectPath: 'C:\\Users\\salim\\Documents\\project_bookmark'
    },
    supabase: {
      connected: !!supabase,
      hasSession: !!session,
      sessionExpiry: session?.expires_at ? new Date(session.expires_at * 1000).toISOString() : null,
      provider: session?.user?.app_metadata?.provider || 'email'
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Shield className="w-8 h-8 text-red-500" />
            Administration
          </h1>
          <p className="text-muted-foreground mt-2">
            Informations système et debugging (environnement de développement)
          </p>
        </div>

        {/* Warning */}
        <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-8">
          <div className="flex items-start gap-3">
            <div className="text-red-600 dark:text-red-400 text-xl">⚠️</div>
            <div>
              <h3 className="font-semibold text-red-900 dark:text-red-100">
                Page d'administration
              </h3>
              <p className="text-red-700 dark:text-red-200 text-sm mt-1">
                Cette page contient des informations sensibles et ne doit être accessible qu'en développement.
                En production, cette page devrait être protégée ou supprimée.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Information */}
          <div className="bg-card rounded-lg border">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <User className="w-5 h-5" />
                Informations utilisateur
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-2">Données Supabase User:</h4>
                  <pre className="text-xs bg-muted/50 rounded-md p-3 overflow-auto">
                    {JSON.stringify({
                      id: user?.id,
                      email: user?.email,
                      phone: user?.phone,
                      email_confirmed_at: user?.email_confirmed_at,
                      created_at: user?.created_at,
                      updated_at: user?.updated_at,
                      role: user?.role
                    }, null, 2)}
                  </pre>
                </div>

                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-2">User Metadata:</h4>
                  <pre className="text-xs bg-muted/50 rounded-md p-3 overflow-auto">
                    {JSON.stringify(userMetadata, null, 2)}
                  </pre>
                </div>

                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-2">App Metadata:</h4>
                  <pre className="text-xs bg-muted/50 rounded-md p-3 overflow-auto">
                    {JSON.stringify(appMetadata, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          </div>

          {/* Session Information */}
          <div className="bg-card rounded-lg border">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Session & Auth
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-2">Session complète:</h4>
                  <pre className="text-xs bg-muted/50 rounded-md p-3 overflow-auto max-h-64">
                    {JSON.stringify(session, null, 2)}
                  </pre>
                </div>

                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-2">Tokens:</h4>
                  <div className="space-y-2 text-xs">
                    <div className="bg-muted/50 rounded-md p-2">
                      <strong>Access Token (tronqué):</strong><br/>
                      {session?.access_token ?
                        session.access_token.substring(0, 50) + '...' :
                        'Non disponible'
                      }
                    </div>
                    <div className="bg-muted/50 rounded-md p-2">
                      <strong>Refresh Token (tronqué):</strong><br/>
                      {session?.refresh_token ?
                        session.refresh_token.substring(0, 50) + '...' :
                        'Non disponible'
                      }
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* System Information */}
          <div className="bg-card rounded-lg border">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Server className="w-5 h-5" />
                Informations système
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-2">Environnement:</h4>
                  <pre className="text-xs bg-muted/50 rounded-md p-3 overflow-auto">
                    {JSON.stringify(systemInfo.environment, null, 2)}
                  </pre>
                </div>

                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-2">État Supabase:</h4>
                  <pre className="text-xs bg-muted/50 rounded-md p-3 overflow-auto">
                    {JSON.stringify(systemInfo.supabase, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          </div>

          {/* Database Schema Info */}
          <div className="bg-card rounded-lg border">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Database className="w-5 h-5" />
                Base de données
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-2">Tables à créer:</h4>
                  <div className="text-xs space-y-2">
                    <div className="bg-muted/50 rounded-md p-2">
                      <strong>bookmarks</strong><br/>
                      → id, user_id, title, url, description, tags[], created_at
                    </div>
                    <div className="bg-muted/50 rounded-md p-2">
                      <strong>collections</strong><br/>
                      → id, user_id, name, description, color, created_at
                    </div>
                    <div className="bg-muted/50 rounded-md p-2">
                      <strong>user_settings</strong><br/>
                      → user_id, theme, language, preferences, updated_at
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-2">SQL Schema:</h4>
                  <pre className="text-xs bg-muted/50 rounded-md p-3 overflow-auto max-h-32">
{`-- Enable RLS
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only see their own bookmarks"
ON bookmarks FOR ALL USING (auth.uid() = user_id);`}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions d'administration */}
        <div className="mt-8 bg-card rounded-lg border p-6">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <Code className="w-5 h-5" />
            Actions d'administration
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="p-3 border rounded-md hover:bg-muted transition-colors text-left">
              <div className="font-medium">Vider le cache</div>
              <div className="text-sm text-muted-foreground">localStorage & sessionStorage</div>
            </button>
            <button className="p-3 border rounded-md hover:bg-muted transition-colors text-left">
              <div className="font-medium">Rafraîchir session</div>
              <div className="text-sm text-muted-foreground">Renouveler les tokens</div>
            </button>
            <button className="p-3 border border-destructive rounded-md hover:bg-destructive/10 transition-colors text-left">
              <div className="font-medium text-destructive">Forcer déconnexion</div>
              <div className="text-sm text-muted-foreground">Nettoyer toute la session</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;