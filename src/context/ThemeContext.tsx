import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { ThemeName } from '../config';

interface ThemeContextType {
  theme: ThemeName;
  toggle: () => void;
  setTheme: (t: ThemeName) => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);
const STORAGE_KEY = 'chase-travel-theme';

function initialTheme(): ThemeName {
  // The dark-mode switch is hidden; always start in light so a theme saved
  // before the switch was removed can't leave anyone stuck in dark.
  return 'light';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeName>(initialTheme);

  // Reflect the theme on <html> so the host-app CSS variables switch.
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const setTheme = (t: ThemeName) => setThemeState(t);
  const toggle = () => setThemeState((t) => (t === 'dark' ? 'light' : 'dark'));

  return (
    <ThemeContext.Provider value={{ theme, toggle, setTheme }}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
