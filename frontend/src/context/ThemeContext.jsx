import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);

export const THEMES = [
  {
    id: 'light',
    name: 'Riviera Luxury',
    category: 'Light',
    icon: '☀️',
    description: 'Pure white, soft ivory & emerald green',
    accentColor: '#047857',
    bgColor: '#F8FAF7'
  },
  {
    id: 'sand',
    name: 'Aman Sand & Linen',
    category: 'Resort',
    icon: '🏖️',
    description: 'Soft ivory, natural linen & emerald green',
    accentColor: '#047857',
    bgColor: '#F8FAF7'
  },
  {
    id: 'emerald',
    name: 'Tropical Palm',
    category: 'Nature',
    icon: '🌴',
    description: 'Crisp porcelain white & lush emerald green',
    accentColor: '#047857',
    bgColor: '#F8FAF7'
  },
  {
    id: 'sunset',
    name: 'Sunset Terracotta',
    category: 'Sunset',
    icon: '🌅',
    description: 'Bright white, soft ivory & deep emerald',
    accentColor: '#047857',
    bgColor: '#F8FAF7'
  }
];

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('dc_theme');
    // If previously saved as navy or aurora, reset to clean light
    if (!saved || saved === 'navy' || saved === 'aurora') {
      return 'light';
    }
    return saved;
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.classList.remove('theme-light', 'theme-sand', 'theme-emerald', 'theme-sunset', 'theme-navy', 'theme-aurora');
    document.documentElement.classList.add(`theme-${theme}`);
    localStorage.setItem('dc_theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
