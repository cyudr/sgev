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

const THEME_MODE_STORAGE_KEY = 'chargesg_theme_mode_v2';
const THEME_SESSION_KEY = 'chargesg_theme_session_override';

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
  const now = new Date();
  const currentHour = now.getHours();
  const isDay = currentHour >= 7 && currentHour < 19;
  const timeFormatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return `${timeFormatted} (${isDay ? 'Daytime · Light' : 'Nighttime · Dark'})`;
}

// Clean up legacy stuck key on module load
try {
  localStorage.removeItem('chargesg_theme_mode_pref');
} catch {
  // Ignore
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
    return 'auto'; // Default is always auto time-based
  });

  // Current effective theme: defaults to getTimeBasedTheme()
  const [theme, setThemeState] = useState<GreenTheme>(() => {
    try {
      const storedMode = localStorage.getItem(THEME_MODE_STORAGE_KEY);
      if (storedMode === 'light' || storedMode === 'dark') {
        return storedMode;
      }
      const sessionOverride = sessionStorage.getItem(THEME_SESSION_KEY);
      if (sessionOverride === 'light' || sessionOverride === 'dark') {
        return sessionOverride as GreenTheme;
      }
    } catch {
      // Fallback
    }
    // Default: light for daytime (7am to 7pm), dark for nighttime
    return getTimeBasedTheme();
  });

  const [timeDescription, setTimeDescription] = useState<string>(getTimeDescription);

  // Periodically detect time and auto-toggle theme when in 'auto' mode
  useEffect(() => {
    const checkTimeAndAutoToggle = () => {
      setTimeDescription(getTimeDescription());
      if (themeMode === 'auto') {
        // If no active session override exists, follow clock
        try {
          const hasSessionOverride = !!sessionStorage.getItem(THEME_SESSION_KEY);
          if (!hasSessionOverride) {
            const timeTheme = getTimeBasedTheme();
            setThemeState(timeTheme);
          }
        } catch {
          const timeTheme = getTimeBasedTheme();
          setThemeState(timeTheme);
        }
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
      sessionStorage.removeItem(THEME_SESSION_KEY);
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
    setThemeState(newTheme);
    try {
      sessionStorage.setItem(THEME_SESSION_KEY, newTheme);
    } catch {
      // Ignore
    }
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
