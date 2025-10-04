/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
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
    // Additional colors for better UI
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
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    primary: '#ef4444',
    secondary: '#6b7280',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
