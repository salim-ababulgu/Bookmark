import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';
import { toast } from 'sonner';
import NotificationBell from './NotificationBell';
import ModularNavigation from './ModularNavigation';
import { useNavigation } from '../hooks/useNavigation';
import { useDarkMode } from '../hooks/useDarkMode';
import {
  Bookmark,
  BarChart3,
  Shield,
  User,
  Settings,
  Menu,
  X,
  LogOut,
  Moon,
  Sun,
  Home,
  Search,
  Plus,
  Download,
  Upload,
  ChevronDown
} from 'lucide-react';

const AppLayout = ({ children }) => {
  const { user, logout, userName, userEmail } = useSupabaseAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef(null);
  // Hook pour le dark mode
  const { darkMode, toggleDarkMode } = useDarkMode();

  // Fermer le dropdown profil quand on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Hook pour la navigation modulaire
  const { currentSection, handleNavigate: handleModularNavigate, handleSearch } = useNavigation();

  const handleLogout = async () => {
    try {
      const result = await logout();
      if (result.success) {
        toast.success('Déconnexion réussie');
        navigate('/');
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      console.error('Erreur déconnexion:', error);
      toast.error('Erreur lors de la déconnexion');
    }
  };

  const navigation = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: Home,
      description: 'Vue d\'ensemble'
    },
    {
      name: 'Analytics',
      path: '/dashboard?tab=analytics',
      icon: BarChart3,
      description: 'Statistiques détaillées'
    },
    {
      name: 'Liens',
      path: '/dashboard?tab=links',
      icon: Shield,
      description: 'Vérificateur de liens'
    },
    {
      name: 'Profil',
      path: '/profile',
      icon: User,
      description: 'Mon profil'
    },
    {
      name: 'Paramètres',
      path: '/settings',
      icon: Settings,
      description: 'Configuration'
    }
  ];

  const isActive = (path) => {
    if (path.includes('?tab=')) {
      const [basePath, params] = path.split('?');
      const urlParams = new URLSearchParams(location.search);
      const tabParam = urlParams.get('tab');
      const expectedTab = new URLSearchParams(params).get('tab');
      return location.pathname === basePath && tabParam === expectedTab;
    }
    return location.pathname === path;
  };

  const handleNavigate = (path) => {
    if (path.includes('?tab=')) {
      const [basePath, params] = path.split('?');
      navigate(`${basePath}?${params}`);
    } else {
      navigate(path);
    }
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-sidebar border-r border-border transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Bookmark className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold text-sidebar-foreground">BookmarkApp</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 rounded-md hover:bg-accent"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.path}
                  onClick={() => handleNavigate(item.path)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors focus-ring ${
                    isActive(item.path)
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-sidebar-foreground hover-effect'
                  }`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-xs opacity-70">{item.description}</div>
                  </div>
                </button>
              );
            })}
          </nav>

          {/* Actions rapides - SIDEBAR NETTOYÉ */}
          <div className="p-4 border-t border-border space-y-2">
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-muted-foreground hover:text-sidebar-foreground hover-effect transition-colors">
              <Plus className="w-4 h-4" />
              <span className="text-sm">Nouveau favori</span>
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-muted-foreground hover:text-sidebar-foreground hover-effect transition-colors">
              <Search className="w-4 h-4" />
              <span className="text-sm">Rechercher</span>
            </button>

            {/* Actions supplémentaires pour desktop */}
            <div className="pt-2 border-t border-border/50 space-y-1">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-muted-foreground hover:text-destructive hover-effect transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm">Déconnexion</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay pour mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* NAVBAR (Top bar) - mobile ET desktop avec profil utilisateur */}
        <header className="bg-header border-b border-border px-4 py-3">
          <div className="flex items-center justify-between">
            {/* LEFT: Menu burger (mobile) + Logo (desktop) */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md hover-effect focus-ring text-header-foreground"
              >
                <Menu className="w-5 h-5" />
              </button>

              {/* Logo visible sur desktop quand sidebar fermé */}
              <div className="hidden lg:flex items-center gap-3">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Bookmark className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="text-lg font-bold text-header-foreground">BookmarkApp</span>
              </div>
            </div>

            {/* RIGHT: Profil + Notifications + Dark Mode */}
            <div className="flex items-center gap-3">
              {/* PROFIL UTILISATEUR avec dropdown */}
              <div ref={profileDropdownRef} className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover-effect transition-colors focus-ring text-header-foreground"
                  title="Profil utilisateur"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {userName?.charAt(0) || userEmail?.charAt(0) || 'U'}
                  </div>
                  <span className="hidden sm:block text-sm font-medium">
                    {userName?.split(' ')[0] || userEmail?.split('@')[0] || 'Utilisateur'}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${profileDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* DROPDOWN MENU PROFIL */}
                {profileDropdownOpen && (
                  <div className="absolute top-full right-0 mt-2 w-64 bg-card border border-border rounded-lg shadow-lg z-50">
                    {/* Info utilisateur */}
                    <div className="p-4 border-b border-border">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center text-white font-medium">
                          {userName?.charAt(0) || userEmail?.charAt(0) || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground truncate">{userName || 'Utilisateur'}</p>
                          <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
                        </div>
                      </div>
                    </div>

                    {/* Menu items */}
                    <div className="py-2">
                      <button
                        onClick={() => {
                          handleNavigate('/profile');
                          setProfileDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-accent transition-colors flex items-center gap-3"
                      >
                        <User className="w-4 h-4" />
                        Mon profil
                      </button>
                      <button
                        onClick={() => {
                          handleNavigate('/settings');
                          setProfileDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-accent transition-colors flex items-center gap-3"
                      >
                        <Settings className="w-4 h-4" />
                        Paramètres
                      </button>
                      <hr className="my-2 border-border" />
                      <button
                        onClick={() => {
                          handleLogout();
                          setProfileDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors flex items-center gap-3"
                      >
                        <LogOut className="w-4 h-4" />
                        Se déconnecter
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* NOTIFICATION BELL */}
              <NotificationBell />

              {/* DARK MODE TOGGLE */}
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-md hover-effect focus-ring text-header-foreground transition-transform hover:scale-105"
                title={`Basculer vers le mode ${darkMode ? 'clair' : 'sombre'}`}
              >
                {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 pb-24">
          {children}
        </main>
      </div>

      {/* Navigation flottante */}
      <ModularNavigation
        currentSection={currentSection}
        onNavigate={(section) => {
          handleModularNavigate(section);
          // Map sections to actual routes
          const sectionRoutes = {
            dashboard: '/dashboard',
            analytics: '/dashboard?tab=analytics',
            links: '/dashboard?tab=links',
            profile: '/profile',
            settings: '/settings',
            favorites: '/bookmarks'
          };
          if (sectionRoutes[section]) {
            handleNavigate(sectionRoutes[section]);
          }
        }}
        onSearch={handleSearch}
      />
    </div>
  );
};

export default AppLayout;