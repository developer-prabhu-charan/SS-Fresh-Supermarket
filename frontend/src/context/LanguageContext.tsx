/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define the type for the context value
interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: string) => string;
}

// Create the context
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Define translations
const translations: { [key: string]: { [lang: string]: string } } = {
  search: {
    en: 'Search...',
    te: 'వెతుకు...'
  },
  home: {
    en: 'Home',
    te: 'హోమ్'
  },
  products: {
    en: 'Products',
    te: 'ఉత్పత్తులు'
  },
  about: {
    en: 'About',
    te: 'గురించి'
  },
  orders: {
    en: 'Orders',
    te: 'ఆర్డర్లు'
  },
  darkMode: {
    en: 'Dark Mode',
    te: 'డార్క్ మోడ్'
  },
  lightMode: {
    en: 'Light Mode',
    te: 'లైట్ మోడ్'
  }
};

// Create the provider component
export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState('en');

  const t = (key: string): string => {
    return translations[key]?.[language] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Create a custom hook to use the context
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
