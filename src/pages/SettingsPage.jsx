// SettingsPage - Version simplifiée post-migration Supabase
import React, { useState } from 'react';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { toast } from 'sonner';
import { Settings, Shield, Database, Trash2, Bell, Palette, Moon, Sun, User } from 'lucide-react';
import NotificationDemo from '../components/NotificationDemo';
import ColorPicker from '../components/ColorPicker';
import UserAvatar from '../components/UserAvatar';

const SettingsPage = () => {
  const { user, logout } = useSupabaseAuth();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState('appearance');

  const handleLogout = async () => {
    setLoading(true);
    const result = await logout();

    if (result.success) {
      toast.success('Déconnexion réussie');
    } else {
      toast.error('Erreur lors de la déconnexion');
    }
    setLoading(false);
  };

  const handleDeleteAccount = () => {
    toast.info('Fonctionnalité en cours de développement');
    // TODO: Implémenter la suppression du compte avec Supabase
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Chargement...</h2>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        </div>
      </div>
    );
  }

  const sections = [
    { id: 'appearance', label: 'Apparence', icon: Palette },
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Sécurité', icon: Shield },
    { id: 'data', label: 'Données', icon: Database }
  ];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Settings className="w-8 h-8" />
            Paramètres
          </h1>
          <p className="text-muted-foreground mt-2">
            Gérez les paramètres de votre compte et de l'application
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-lg border border-border p-4 space-y-2">
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200 ${
                      activeSection === section.id
                        ? 'bg-primary text-primary-foreground shadow-md'
                        : 'hover:bg-accent text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {section.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeSection === 'appearance' && (
              <div className="bg-card rounded-lg border border-border p-6 space-y-6">
                <div className="border-b border-border pb-4">
                  <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                    <Palette className="w-5 h-5" />
                    Apparence
                  </h2>
                  <p className="text-muted-foreground mt-1">
                    Personnalisez l'apparence de l'application
                  </p>
                </div>

                {/* Mode sombre */}
                <div className="space-y-3">
                  <label className="flex items-center justify-between p-4 bg-muted/50 rounded-lg cursor-pointer group">
                    <div className="flex items-center gap-3">
                      {isDarkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                      <div>
                        <p className="font-medium text-foreground">Mode sombre</p>
                        <p className="text-sm text-muted-foreground">
                          Basculer entre le thème clair et sombre
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={toggleDarkMode}
                      className={`relative w-12 h-6 rounded-full transition-colors duration-200 focus:ring-2 focus:ring-primary/20 focus:outline-none ${
                        isDarkMode ? 'bg-primary' : 'bg-muted-foreground/30'
                      }`}
                    >
                      <div
                        className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${
                          isDarkMode ? 'translate-x-6' : 'translate-x-0.5'
                        }`}
                      />
                    </button>
                  </label>
                </div>

                {/* Sélecteur de couleur */}
                <div className="space-y-3">
                  <ColorPicker />
                </div>
              </div>
            )}

            {activeSection === 'profile' && (
              <div className="bg-card rounded-lg border border-border p-6 space-y-6">
                <div className="border-b border-border pb-4">
                  <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Profil
                  </h2>
                  <p className="text-muted-foreground mt-1">
                    Gérez les informations de votre profil
                  </p>
                </div>

                {/* Avatar */}
                <div className="space-y-4">
                  <div className="flex items-center gap-6">
                    <UserAvatar size="xl" editable={true} />
                    <div>
                      <h3 className="font-medium text-foreground">Photo de profil</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Choisissez une image ou utilisez votre Gravatar
                      </p>
                    </div>
                  </div>
                </div>

                {/* Informations utilisateur */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Email</label>
                    <input
                      type="email"
                      value={user.email}
                      disabled
                      className="w-full px-3 py-2 border border-input rounded-lg bg-muted/50 text-muted-foreground cursor-not-allowed"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Créé le</label>
                    <input
                      type="text"
                      value={new Date(user.created_at).toLocaleDateString('fr-FR')}
                      disabled
                      className="w-full px-3 py-2 border border-input rounded-lg bg-muted/50 text-muted-foreground cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'notifications' && (
              <div className="bg-card rounded-lg border border-border p-6 space-y-6">
                <div className="border-b border-border pb-4">
                  <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                    <Bell className="w-5 h-5" />
                    Notifications
                  </h2>
                  <p className="text-muted-foreground mt-1">
                    Configurez vos préférences de notification
                  </p>
                </div>

                <NotificationDemo />
              </div>
            )}

            {activeSection === 'security' && (
              <div className="bg-card rounded-lg border border-border p-6 space-y-6">
                <div className="border-b border-border pb-4">
                  <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Sécurité
                  </h2>
                  <p className="text-muted-foreground mt-1">
                    Gérez la sécurité de votre compte
                  </p>
                </div>

                <div className="space-y-4">
                  <button
                    onClick={handleLogout}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors disabled:opacity-50 focus:ring-2 focus:ring-orange-500/20 focus:outline-none"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                      'Se déconnecter'
                    )}
                  </button>

                  <button
                    onClick={handleDeleteAccount}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors focus:ring-2 focus:ring-red-500/20 focus:outline-none"
                  >
                    <Trash2 className="w-4 h-4" />
                    Supprimer le compte
                  </button>
                </div>
              </div>
            )}

            {activeSection === 'data' && (
              <div className="bg-card rounded-lg border border-border p-6 space-y-6">
                <div className="border-b border-border pb-4">
                  <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                    <Database className="w-5 h-5" />
                    Gestion des données
                  </h2>
                  <p className="text-muted-foreground mt-1">
                    Importez, exportez et gérez vos données
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border border-border rounded-lg">
                    <h3 className="font-medium text-foreground mb-2">Sauvegarde</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Exportez toutes vos données
                    </p>
                    <button className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                      Exporter
                    </button>
                  </div>

                  <div className="p-4 border border-border rounded-lg">
                    <h3 className="font-medium text-foreground mb-2">Restauration</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Importez vos données
                    </p>
                    <button className="w-full px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors">
                      Importer
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;