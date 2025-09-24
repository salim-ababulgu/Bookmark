import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
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
  Bell,
  Home,
  Search,
  Plus,
  Download,
  Upload
} from 'lucide-react';
import NotificationCenter from './NotificationCenter';
import { NewFeatureBadge } from './AnimatedComponents';

const AppLayout = ({ children, bookmarks = [], collections = [] }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', JSON.stringify(newMode));
    document.documentElement.classList.toggle('dark', newMode);
  };

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
      badge: 'NEW',
      description: 'Statistiques détaillées'
    },
    {
      name: 'Liens',
      path: '/dashboard?tab=links',
      icon: Shield,
      badge: 'NEW',
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
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Bookmark className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold text-foreground">BookmarkApp</span>
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
                <div key={item.path}>
                  {item.badge ? (
                    <NewFeatureBadge show={true}>
                      <button
                        onClick={() => handleNavigate(item.path)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                          isActive(item.path)
                            ? 'bg-primary text-primary-foreground'
                            : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                        }`}
                      >
                        <Icon className="w-5 h-5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium">{item.name}</div>
                          <div className="text-xs opacity-70">{item.description}</div>
                        </div>
                      </button>
                    </NewFeatureBadge>
                  ) : (
                    <button
                      onClick={() => handleNavigate(item.path)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                        isActive(item.path)
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                      }`}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium">{item.name}</div>
                        <div className="text-xs opacity-70">{item.description}</div>
                      </div>
                    </button>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Actions rapides */}
          <div className="p-4 border-t border-border space-y-2">
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
              <Plus className="w-4 h-4" />
              <span className="text-sm">Nouveau favori</span>
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
              <Search className="w-4 h-4" />
              <span className="text-sm">Rechercher</span>
            </button>
          </div>

          {/* User menu */}
          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                <span className="text-sm font-semibold text-primary">
                  {user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-foreground truncate">
                  {user?.displayName || 'Utilisateur'}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {user?.email}
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={toggleDarkMode}
                className="flex-1 p-2 rounded-md border border-input hover:bg-accent transition-colors"
                title={darkMode ? 'Mode clair' : 'Mode sombre'}
              >
                {darkMode ? <Sun className="w-4 h-4 mx-auto" /> : <Moon className="w-4 h-4 mx-auto" />}
              </button>

              <button
                onClick={handleLogout}
                className="flex-1 p-2 rounded-md border border-input hover:bg-destructive hover:text-destructive-foreground transition-colors"
                title="Déconnexion"
              >
                <LogOut className="w-4 h-4 mx-auto" />
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
        {/* Top bar mobile */}
        <header className="lg:hidden bg-card border-b border-border px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-md hover:bg-accent"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <NotificationCenter bookmarks={bookmarks} collections={collections} />
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-md hover:bg-accent"
              >
                {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;