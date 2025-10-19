import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';

// Import Colors with fallback
let Colors;
try {
  Colors = require('../constants/theme').Colors;
} catch (error) {
  console.warn('Failed to import Colors, using fallback:', error);
  Colors = {
    light: {
      text: '#1f2937',
      background: '#ffffff',
      surface: '#f9fafb',
      card: '#ffffff',
      border: '#e5e7eb',
      tint: '#dc2626',
      icon: '#6b7280',
      tabIconDefault: '#6b7280',
      tabIconSelected: '#dc2626',
      primary: '#dc2626',
      secondary: '#6b7280',
      success: '#059669',
      warning: '#d97706',
      error: '#dc2626',
      info: '#2563eb',
      textSecondary: '#6b7280',
      textMuted: '#9ca3af',
      backgroundSecondary: '#f3f4f6',
      backgroundTertiary: '#e5e7eb',
      accent: '#fef2f2',
      accentBorder: '#fecaca',
    },
    dark: {
      text: '#ECEDEE',
      background: '#000000',
      surface: '#0a0a0a',
      card: '#1a1a1a',
      border: '#262626',
      tint: '#fff',
      icon: '#9BA1A6',
      tabIconDefault: '#9BA1A6',
      tabIconSelected: '#fff',
      primary: '#ef4444',
      secondary: '#6b7280',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
      textSecondary: '#9BA1A6',
      textMuted: '#737373',
      backgroundSecondary: '#1a1a1a',
      backgroundTertiary: '#262626',
      accent: '#1a1a1a',
      accentBorder: '#262626',
    }
  };
}

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  themeMode: ThemeMode;
  isDark: boolean;
  setThemeMode: (mode: ThemeMode) => void;
  colors: typeof Colors.light;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
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
      // Skip AsyncStorage on web if not available
      if (Platform.OS === 'web' && typeof window === 'undefined') {
        return;
      }

      const savedTheme = await AsyncStorage.getItem('themeMode');
      if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
        setThemeModeState(savedTheme as ThemeMode);
      }
    } catch (error) {
      console.error('Error loading theme preference:', error);
      // Fallback to default theme on error
      setThemeModeState('dark');
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
      // Skip AsyncStorage on web if not available
      if (Platform.OS === 'web' && typeof window === 'undefined') {
        setThemeModeState(mode);
        return;
      }

      await AsyncStorage.setItem('themeMode', mode);
      setThemeModeState(mode);
    } catch (error) {
      console.error('Error saving theme preference:', error);
      // Still update the state even if storage fails
      setThemeModeState(mode);
    }
  };

  const colors = Colors[isDark ? 'dark' : 'light'];

  return (
    <ThemeContext.Provider value={{ themeMode, isDark, setThemeMode, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};

