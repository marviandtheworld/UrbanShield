import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  themeMode: ThemeMode;
  isDark: boolean;
  setThemeMode: (mode: ThemeMode) => void;
  colors: {
    background: string;
    card: string;
    text: string;
    secondary: string;
    primary: string;
    surface: string;
    success: string;
    warning: string;
  };
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    // Return fallback values instead of throwing error
    return {
      themeMode: 'light' as ThemeMode,
      isDark: false,
      setThemeMode: () => {},
      colors: {
        background: '#ffffff',
        card: '#f8f9fa',
        text: '#000000',
        secondary: '#6c757d',
        primary: '#007bff',
        surface: '#ffffff',
        success: '#28a745',
        warning: '#ffc107'
      }
    };
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [themeMode, setThemeModeState] = useState<ThemeMode>('dark');
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    loadThemePreference();
  }, []);

  useEffect(() => {
    updateTheme();
  }, [themeMode]);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('themeMode');
      if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
        setThemeModeState(savedTheme as ThemeMode);
      }
    } catch (error) {
      console.error('Error loading theme preference:', error);
    }
  };

  const updateTheme = () => {
    if (themeMode === 'system') {
      // For now, default to dark mode for system
      // In a real app, you'd use Appearance.getColorScheme() from react-native
      setIsDark(true);
    } else {
      setIsDark(themeMode === 'dark');
    }
  };

  const setThemeMode = async (mode: ThemeMode) => {
    try {
      await AsyncStorage.setItem('themeMode', mode);
      setThemeModeState(mode);
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  const colors = {
    background: isDark ? '#000000' : '#ffffff',
    card: isDark ? '#1a1a1a' : '#f8f9fa',
    text: isDark ? '#ffffff' : '#000000',
    secondary: isDark ? '#a0a0a0' : '#6c757d',
    primary: '#007bff',
    surface: isDark ? '#2a2a2a' : '#ffffff',
    success: '#28a745',
    warning: '#ffc107'
  };

  return (
    <ThemeContext.Provider value={{ themeMode, isDark, setThemeMode, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};

