import React, { useState } from 'react';
import { Search, X, BarChart3, Link, Heart } from 'lucide-react';

const ModularNavigation = ({ onNavigate, onSearch, currentSection = 'dashboard' }) => {
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  // Toggle search mode
  const handleSearchButtonClick = () => {
    setIsSearchActive(!isSearchActive);
    if (isSearchActive) {
      setSearchValue('');
      onSearch?.('');
    }
  };

  // Cancel search
  const handleCancelClick = () => {
    setIsSearchActive(false);
    setSearchValue('');
    onSearch?.('');
  };

  // Handle search input
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchValue(value);
    onSearch?.(value);
  };

  // Handle navigation to sections
  const handleSectionClick = (section) => {
    onNavigate?.(section);
  };

  const navigationItems = [
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'links', label: 'Liens', icon: Link },
    { id: 'favorites', label: 'Favoris', icon: Heart }
  ];


  return (
    <div className="fixed bottom-4 left-4 right-4 z-40 transition-all duration-300">
      <div className="bg-card/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl max-w-5xl mx-auto ring-1 ring-border/20">
        <div className="flex items-center justify-between h-14 sm:h-16 px-4 sm:px-6">

          {/* LEFT SECTION - TAB NAVIGATION */}
          <div className="flex items-center space-x-1 sm:space-x-2">
            {/* Main Tab Buttons - always visible except in search mode */}
            <div className={`
              flex items-center space-x-1 transition-all duration-300 ease-in-out overflow-hidden
              ${isSearchActive ? 'opacity-0 pointer-events-none max-w-0' : 'opacity-100 max-w-4xl'}
            `}>
              {/* Dashboard Tab */}
              <button
                onClick={() => handleSectionClick('dashboard')}
                className={`
                  flex items-center px-2 sm:px-3 py-2 rounded-lg font-medium transition-all duration-200 text-sm whitespace-nowrap
                  ${currentSection === 'dashboard'
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : 'text-muted-foreground hover:text-foreground hover-effect'
                  }
                `}
              >
                <div className="w-2 h-2 rounded-full bg-primary mr-1.5"></div>
                <span className="hidden sm:inline">Dashboard</span>
              </button>

              {/* Other Navigation Tabs */}
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSectionClick(item.id)}
                    className={`
                      flex items-center px-2 sm:px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                      whitespace-nowrap
                      ${currentSection === item.id
                        ? 'bg-primary/10 text-primary border border-primary/20'
                        : 'text-muted-foreground hover:text-foreground hover-effect'
                      }
                    `}
                  >
                    <Icon className="w-4 h-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* RIGHT SECTION - SEARCH et boutons d'onglets */}
          <div className="flex items-center space-x-3">
            {/* Quick Actions - visible when not in search mode */}
            {!isSearchActive && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleSectionClick('bookmarks')}
                  className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover-effect transition-colors focus-ring"
                  title="Mes favoris"
                >
                  <Heart className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleSectionClick('analytics')}
                  className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover-effect transition-colors focus-ring"
                  title="Analytics"
                >
                  <BarChart3 className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* Search Bar - Different states based on search active */}
            <div className={`
              relative transition-all duration-300 ease-in-out
              ${isSearchActive ? 'w-48 sm:w-72 lg:w-80' : 'w-10'}
            `}>
              {isSearchActive ? (
                // Condition 2: Active search with cancel button
                <div className="flex items-center w-full">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <input
                      type="text"
                      value={searchValue}
                      onChange={handleSearchChange}
                      placeholder="Rechercher dans vos favoris..."
                      className="w-full pl-10 pr-4 py-2 border border-input rounded-lg
                               bg-background text-foreground placeholder:text-muted-foreground
                               focus-ring"
                      autoFocus
                    />
                  </div>
                  <button
                    onClick={handleCancelClick}
                    className="ml-3 p-2 text-muted-foreground hover:text-foreground hover-effect transition-colors focus-ring rounded-md"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                // Small search button (compact mode)
                <button
                  onClick={handleSearchButtonClick}
                  className="w-10 h-10 flex items-center justify-center rounded-lg
                           text-muted-foreground hover:text-foreground
                           hover-effect transition-all duration-200 focus-ring"
                  title="Rechercher dans vos favoris"
                >
                  <Search className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Subtle animation indicator */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-primary/80 transform origin-left transition-transform duration-300 rounded-b-2xl"
             style={{
               transform: isSearchActive ? 'scaleX(0.8)' : 'scaleX(1)'
             }}
        />
      </div>
    </div>
  );
};

export default ModularNavigation;