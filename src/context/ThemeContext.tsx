import React, { createContext, useContext, useState, useEffect } from 'react';

export type GreenTheme = 'light' | 'dark';
export type ThemeMode = 'auto' | 'light' | 'dark';

interface ThemeContextType {
  theme: GreenTheme;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  setTheme: (theme: GreenTheme) => void;
  toggleTheme: () => void;
  isDark: boolean;
  isAuto: boolean;
  timeDescription: string;
}

const THEME_MODE_STORAGE_KEY = 'chargesg_theme_mode_pref';

/**
 * Computes whether it is currently daytime or nighttime.
 * Daytime: 7:00 AM (07:00) to 6:59 PM (18:59) -> 'light'
 * Nighttime: 7:00 PM (19:00) to 6:59 AM (06:59) -> 'dark'
 */
export function getTimeBasedTheme(): GreenTheme {
  const currentHour = new Date().getHours();
  return currentHour >= 7 && currentHour < 19 ? 'light' : 'dark';
}

export function getTimeDescription(): string {
  const currentHour = new Date().getHours();
  const isDay = currentHour >= 7 && currentHour < 19;
  const timeFormatted = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return `${timeFormatted} (${isDay ? 'Daytime · Light' : 'Nighttime · Dark'})`;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: getTimeBasedTheme(),
  themeMode: 'auto',
  setThemeMode: () => {},
  setTheme: () => {},
  toggleTheme: () => {},
  isDark: getTimeBasedTheme() === 'dark',
  isAuto: true,
  timeDescription: '',
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Stored mode preference: 'auto' (default), 'light', or 'dark'
  const [themeMode, setThemeModeState] = useState<ThemeMode>(() => {
    try {
      const stored = localStorage.getItem(THEME_MODE_STORAGE_KEY);
      if (stored === 'light' || stored === 'dark' || stored === 'auto') {
        return stored as ThemeMode;
      }
    } catch {
      // Fallback
    }
    return 'auto'; // Default is auto time-based
  });

  // Current effective theme
  const [theme, setThemeState] = useState<GreenTheme>(() => {
    try {
      const stored = localStorage.getItem(THEME_MODE_STORAGE_KEY);
      if (stored === 'light' || stored === 'dark') {
        return stored;
      }
    } catch {
      // Fallback
    }
    return getTimeBasedTheme();
  });

  const [timeDescription, setTimeDescription] = useState<string>(getTimeDescription);

  // Periodically detect time and auto-toggle theme
  useEffect(() => {
    const checkTimeAndAutoToggle = () => {
      setTimeDescription(getTimeDescription());
      if (themeMode === 'auto') {
        const timeTheme = getTimeBasedTheme();
        setThemeState((prev) => {
          if (prev !== timeTheme) {
            return timeTheme;
          }
          return prev;
        });
      }
    };

    // Run immediately
    checkTimeAndAutoToggle();

    // Check every 10 seconds to respond swiftly at the 7:00 AM/PM boundary
    const interval = setInterval(checkTimeAndAutoToggle, 10000);
    return () => clearInterval(interval);
  }, [themeMode]);

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    try {
      localStorage.setItem(THEME_MODE_STORAGE_KEY, mode);
    } catch {
      // Ignore
    }
    if (mode === 'auto') {
      setThemeState(getTimeBasedTheme());
    } else {
      setThemeState(mode);
    }
  };

  const setTheme = (newTheme: GreenTheme) => {
    setThemeMode(newTheme);
  };

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
  };

  // Sync to HTML element for Tailwind dark mode
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    if (theme === 'dark') {
      root.classList.add('dark');
      document.body?.classList.add('dark');
    } else {
      root.classList.remove('dark');
      document.body?.classList.remove('dark');
    }
  }, [theme]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        themeMode,
        setThemeMode,
        setTheme,
        toggleTheme,
        isDark: theme === 'dark',
        isAuto: themeMode === 'auto',
        timeDescription,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useGreenTheme = () => useContext(ThemeContext);
