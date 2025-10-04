import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';

export default function TabLayout() {
  const { isDark } = useTheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[isDark ? 'dark' : 'light'].tint,
        tabBarInactiveTintColor: Colors[isDark ? 'dark' : 'light'].tabIconDefault,
        tabBarStyle: {
          backgroundColor: Colors[isDark ? 'dark' : 'light'].background,
          borderTopColor: Colors[isDark ? 'dark' : 'light'].border,
        },
        headerShown: false,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'UrbanShield',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="shield.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}
