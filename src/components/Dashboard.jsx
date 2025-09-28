import React, { useState, useRef, useCallback } from 'react';
import { Home, BarChart3, Shield, Plus, User, Settings, LogOut, Moon, Sun, Keyboard, Upload } from 'lucide-react';
import CRUDAccueilTab from './tabs/CRUDAccueilTab';
import EnhancedAnalysesTab from './tabs/EnhancedAnalysesTab';
import EnhancedSecuriteTab from './tabs/EnhancedSecuriteTab';
import AddBookmarkModal from './AddBookmarkModal';
import ProfileModal from './ProfileModal';
import SettingsModal from './SettingsModal';
import AdvancedImportModal from './AdvancedImportModal';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { toast } from 'sonner';
import NotificationCenter from './notifications/NotificationCenter';
import { motion } from 'framer-motion';
import { showAdvancedToast } from './feedback/AdvancedFeedbackSystem';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('accueil');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [recentlyAdded, setRecentlyAdded] = useState(null);
  const { user, signOut } = useSupabaseAuth();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const searchInputRef = useRef(null);
  const accueilTabRef = useRef(null);

  const tabs = [
    {
      id: 'accueil',
      label: 'Accueil',
      icon: Home,
      component: CRUDAccueilTab
    },
    {
      id: 'analyses',
      label: 'Analyses',
      icon: BarChart3,
      component: EnhancedAnalysesTab
    },
    {
      id: 'securite',
      label: 'Sécurité',
      icon: Shield,
      component: EnhancedSecuriteTab
    }
  ];

  const handleSignOut = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
      await signOut();
    }
  };

  // Callback appelé quand un nouveau favori est ajouté
  const handleBookmarkAdded = useCallback((newBookmark) => {
    // Déclencher une mise à jour des données
    setRefreshTrigger(prev => prev + 1);

    // Stocker le favori récemment ajouté pour l'animation
    setRecentlyAdded(newBookmark);

    // Afficher une notification avec animation
    toast.success('Favori ajouté avec succès !', {
      duration: 4000,
      description: newBookmark.title,
      action: {
        label: 'Voir',
        onClick: () => {
          // Aller à l'onglet accueil si pas déjà actif
          if (activeTab !== 'accueil') {
            setActiveTab('accueil');
          }
          // Focus sur le favori ajouté
          if (accueilTabRef.current?.highlightBookmark) {
            accueilTabRef.current.highlightBookmark(newBookmark.id);
          }
        }
      }
    });

    // Nettoyer l'état après l'animation
    setTimeout(() => setRecentlyAdded(null), 3000);
  }, [activeTab]);

  // Fonction pour forcer le rafraîchissement des données
  const triggerRefresh = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  // Configuration des raccourcis clavier
  const { showShortcutsHelp } = useKeyboardShortcuts({
    switchTab: (tabId) => {
      setActiveTab(tabId);
      toast.success(`Onglet ${tabs.find(t => t.id === tabId)?.label || tabId} activé`);
    },
    addBookmark: () => {
      setIsAddModalOpen(true);
      setIsProfileMenuOpen(false);
    },
    focusSearch: () => {
      if (searchInputRef.current) {
        searchInputRef.current.focus();
        searchInputRef.current.select();
      }
    },
    toggleDarkMode: () => {
      toggleDarkMode();
    },
    closeModals: () => {
      setIsAddModalOpen(false);
      setIsProfileModalOpen(false);
      setIsSettingsModalOpen(false);
      setIsImportModalOpen(false);
      setIsProfileMenuOpen(false);
    },
    openImport: () => {
      setIsImportModalOpen(true);
      setIsProfileMenuOpen(false);
    }
  });

  const ActiveTabComponent = tabs.find(tab => tab.id === activeTab)?.component;

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo/Brand */}
            <button
              onClick={() => setActiveTab('accueil')}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-red-600 to-orange-600 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
                </svg>
              </div>
              <span className="font-bold text-lg text-foreground hidden sm:block">BookmarkApp</span>
              <span className="font-bold text-sm text-foreground sm:hidden">Bookmark</span>
            </button>

            {/* Actions */}
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Keyboard Shortcuts Help - Hidden on mobile */}
              <button
                onClick={showShortcutsHelp}
                className="hidden sm:flex p-2 rounded-lg hover:bg-accent transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-primary/50"
                title="Raccourcis clavier (Appuyez sur ?)"
                aria-label="Afficher les raccourcis clavier"
              >
                <Keyboard className="w-5 h-5 text-muted-foreground group-hover:text-foreground group-hover:scale-110 transition-all duration-200" />
              </button>

              {/* Add Bookmark Button */}
              <motion.button
                data-add-bookmark
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/25 transition-all duration-200 group relative overflow-hidden"
                title="Ajouter un favori (Ctrl+N)"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  className="absolute inset-0 bg-white/20"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: '100%' }}
                  transition={{ duration: 0.6 }}
                />
                <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-200 relative z-10" />
                <span className="hidden sm:inline relative z-10">Ajouter</span>
                {recentlyAdded && (
                  <motion.div
                    className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full"
                    initial={{ scale: 0 }}
                    animate={{ scale: [0, 1.2, 1] }}
                    exit={{ scale: 0 }}
                    transition={{ duration: 0.3 }}
                  />
                )}
              </motion.button>

              {/* Notification Center */}
              <NotificationCenter />

              {/* Dark Mode Toggle */}
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg hover:bg-accent transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-primary/50"
                title={`Basculer vers le mode ${isDarkMode ? 'clair' : 'sombre'} (Ctrl+Alt+D)`}
                aria-label={`Basculer vers le mode ${isDarkMode ? 'clair' : 'sombre'}`}
              >
                {isDarkMode ? (
                  <Sun className="w-5 h-5 text-foreground group-hover:rotate-12 group-hover:scale-110 transition-all duration-200" />
                ) : (
                  <Moon className="w-5 h-5 text-foreground group-hover:-rotate-12 group-hover:scale-110 transition-all duration-200" />
                )}
              </button>

              {/* Profile Menu */}
              <div className="relative">
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-accent transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-primary/50"
                  title="Menu profil"
                  aria-label="Ouvrir le menu profil"
                  aria-expanded={isProfileMenuOpen}
                  aria-haspopup="true"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center group-hover:scale-110 group-hover:shadow-lg transition-all duration-200">
                    <User className="w-4 h-4 text-white" />
                  </div>
                </button>

                {/* Profile Dropdown */}
                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-background border border-border rounded-lg shadow-lg py-1">
                    <div className="px-4 py-3 border-b border-border">
                      <p className="text-sm font-medium text-foreground">{user?.email}</p>
                    </div>

                    <button
                      onClick={() => {
                        setIsProfileModalOpen(true);
                        setIsProfileMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-accent flex items-center gap-2"
                    >
                      <User className="w-4 h-4" />
                      Profil
                    </button>

                    <button
                      onClick={() => {
                        setIsSettingsModalOpen(true);
                        setIsProfileMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-accent flex items-center gap-2"
                    >
                      <Settings className="w-4 h-4" />
                      Paramètres
                    </button>

                    <button
                      onClick={() => {
                        setIsImportModalOpen(true);
                        setIsProfileMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-accent flex items-center gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      Importer des favoris
                    </button>

                    <div className="border-t border-border my-1"></div>

                    <button
                      onClick={handleSignOut}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Déconnexion
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title & Description */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Gérez vos favoris et consultez vos statistiques</p>
        </div>

        {/* Embedded Tabs */}
        <div className="bg-card border border-border rounded-xl shadow-sm">
          {/* Tab Headers */}
          <div className="border-b border-border">
            <nav className="flex space-x-4 sm:space-x-8 px-4 sm:px-6 overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      flex items-center gap-2 py-4 border-b-2 font-medium text-sm transition-all duration-200 group relative whitespace-nowrap
                      ${isActive
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/50'
                      }
                    `}
                  >
                    <Icon className={`w-4 h-4 transition-all duration-200 ${
                      isActive ? 'scale-110' : 'group-hover:scale-105'
                    }`} />
                    <span className="hidden sm:inline">{tab.label}</span>

                    {/* Animation indicator */}
                    <div className={`absolute -bottom-0.5 left-0 right-0 h-0.5 bg-primary rounded-full transition-all duration-300 ${
                      isActive ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0'
                    }`} />
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-4 sm:p-6">
            {ActiveTabComponent && (
              <ActiveTabComponent
                ref={activeTab === 'accueil' ? accueilTabRef : undefined}
                searchInputRef={activeTab === 'accueil' ? searchInputRef : undefined}
                refreshTrigger={refreshTrigger}
                recentlyAdded={recentlyAdded}
                onRefresh={triggerRefresh}
              />
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-12 sm:mt-20 border-t border-border bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex flex-col items-center justify-center gap-4 text-center">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-gradient-to-br from-red-600 to-orange-600 rounded flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
                </svg>
              </div>
              <span className="font-semibold text-foreground">BookmarkApp</span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-sm text-muted-foreground">
              <span>© 2024 BookmarkApp</span>
              <a href="/help" className="hover:text-foreground transition-colors">Aide</a>
              <a href="/privacy" className="hover:text-foreground transition-colors">Confidentialité</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Add Bookmark Modal */}
      <AddBookmarkModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onBookmarkAdded={handleBookmarkAdded}
      />

      {/* Profile Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />

      {/* Import Modal */}
      <AdvancedImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportComplete={(count) => {
          triggerRefresh();
          showAdvancedToast('success', `${count} favoris importés !`, {
            description: 'Vos favoris ont été ajoutés avec succès.',
            duration: 4000
          });
        }}
      />

      {/* Click outside to close profile menu */}
      {isProfileMenuOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsProfileMenuOpen(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;