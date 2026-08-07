import React, { createContext, useContext, useEffect, useState } from 'react';

export const THEMES = [
  { id: 'senal', label: 'Señal', hint: 'Azul-celeste · blanco · negro' },
  { id: 'bitacora', label: 'Bitácora', hint: 'Grafito oscuro · ámbar' },
  { id: 'cuaderno', label: 'Cuaderno', hint: 'Papel · tinta azul' },
];

const STORAGE_KEY = 'aitel-theme';
const DEFAULT_THEME = 'senal';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme debe ser usado dentro de ThemeProvider');
  }
  return context;
};

const getInitialTheme = () => {
  if (typeof window === 'undefined') return DEFAULT_THEME;
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return THEMES.some((t) => t.id === stored) ? stored : DEFAULT_THEME;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    window.localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const value = { theme, setTheme, themes: THEMES };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
