import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { AppColors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

const { width: screenWidth } = Dimensions.get('window');

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();

  // Calculate responsive dimensions
  const isSmallScreen = screenWidth < 375;
  const iconSize = {
    active: isSmallScreen ? 24 : 26,
    inactive: isSmallScreen ? 22 : 24,
  };

  // Platform-specific calculations
  const tabBarHeight = Platform.select({
    ios: 64 + insets.bottom, // Base height + safe area
    android: 64,
  });

  const tabBarPaddingBottom = Platform.select({
    ios: Math.max(insets.bottom - 10, 8), // Account for safe area but don't go below 8
    android: 8,
  });

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: AppColors.primary,
        tabBarInactiveTintColor: AppColors.textTertiary,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: {
          backgroundColor: isDark ? AppColors.surfaceDark : AppColors.surface,
          borderTopColor: isDark ? AppColors.card.borderDark : AppColors.card.border,
          borderTopWidth: 1,
          paddingTop: Platform.select({ ios: 12, android: 8 }),
          paddingBottom: tabBarPaddingBottom,
          paddingHorizontal: Platform.select({ ios: 8, android: 12 }),
          height: tabBarHeight,
          
          // Shadow styling
          ...Platform.select({
            ios: {
              shadowColor: AppColors.card.shadow,
              shadowOffset: { width: 0, height: -2 },
              shadowOpacity: isDark ? 0.3 : 0.1,
              shadowRadius: 8,
            },
            android: {
              elevation: 8,
            },
          }),
          
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
        },
        tabBarLabelStyle: {
          fontSize: isSmallScreen ? 10 : 12,
          fontWeight: Platform.select({ ios: '600', android: '500' }),
          marginTop: Platform.select({ ios: 4, android: 2 }),
          marginBottom: Platform.select({ ios: 0, android: 2 }),
          includeFontPadding: false, // Android specific - removes extra padding
        },
        tabBarIconStyle: {
          marginTop: Platform.select({ ios: 2, android: 4 }),
          marginBottom: Platform.select({ ios: 2, android: 0 }),
        },
        
        // Ensure proper layout on different screen sizes
        tabBarItemStyle: {
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 4,
          minHeight: Platform.select({ ios: 48, android: 48 }),
        },
        
        // Hide tab bar on keyboard for all platforms
        tabBarHideOnKeyboard: true,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol 
              size={focused ? iconSize.active : iconSize.inactive} 
              name="house.fill" 
              color={color} 
            />
          ),
          tabBarAccessibilityLabel: 'Home Tab',
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Chat',
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol 
              size={focused ? iconSize.active : iconSize.inactive} 
              name="message.fill" 
              color={color} 
            />
          ),
          tabBarAccessibilityLabel: 'Chat Tab',
        }}
      />
      <Tabs.Screen
        name="news"
        options={{
          title: 'News',
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol 
              size={focused ? iconSize.active : iconSize.inactive} 
              name="newspaper.fill" 
              color={color} 
            />
          ),
          tabBarAccessibilityLabel: 'News Tab',
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: 'More',
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol 
              size={focused ? iconSize.active : iconSize.inactive} 
              name="ellipsis.circle.fill" 
              color={color} 
            />
          ),
          tabBarAccessibilityLabel: 'More Tab',
        }}
      />
    </Tabs>
  );
}