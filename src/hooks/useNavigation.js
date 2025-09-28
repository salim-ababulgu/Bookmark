import { useState, useCallback } from 'react';

export const useNavigation = (initialSection = 'dashboard') => {
  const [currentSection, setCurrentSection] = useState(initialSection);
  const [searchQuery, setSearchQuery] = useState('');

  const handleNavigate = useCallback((section) => {
    setCurrentSection(section);
    // Ici vous pouvez ajouter la logique de navigation (react-router, etc.)
    console.log(`Navigation vers: ${section}`);
  }, []);

  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
    // Ici vous pouvez ajouter la logique de recherche
    console.log(`Recherche: ${query}`);
  }, []);

  return {
    currentSection,
    searchQuery,
    handleNavigate,
    handleSearch,
    setCurrentSection
  };
};