/**
 * Professional color system for CyberSaathi mobile app
 * Designed for optimal user experience and accessibility
 */

const tintColorLight = '#0ea5e9';
const tintColorDark = '#0ea5e9';

export const Colors = {
  light: {
    text: '#0f172a',
    background: '#ffffff',
    tint: tintColorLight,
    icon: '#64748b',
    tabIconDefault: '#64748b',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ffffff',
    background: '#0f172a',
    tint: tintColorDark,
    icon: '#94a3b8',
    tabIconDefault: '#64748b',
    tabIconSelected: tintColorDark,
  },
};

// Extended color palette for professional design
export const AppColors = {
  // Primary colors
  primary: '#0ea5e9',
  primaryLight: '#38bdf8',
  primaryDark: '#0284c7',
  
  // Secondary colors
  secondary: '#8b5cf6',
  secondaryLight: '#a78bfa',
  secondaryDark: '#7c3aed',
  
  // Background colors
  background: '#f8fafc',
  backgroundDark: '#0f172a',
  surface: '#ffffff',
  surfaceDark: '#1e293b',
  surfaceLight: '#f1f5f9',
  
  // Text colors
  textPrimary: '#0f172a',
  textPrimaryDark: '#ffffff',
  textSecondary: '#64748b',
  textTertiary: '#94a3b8',
  
  // Status colors
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
  
  // Emergency colors
  emergency: '#dc2626',
  emergencyLight: '#ef4444',
  
  // Gradient colors
  gradients: {
    primary: ['#0ea5e9', '#0284c7'],
    secondary: ['#8b5cf6', '#7c3aed'],
    emergency: ['#dc2626', '#b91c1c'],
    surface: ['#f8fafc', '#e2e8f0'],
    dark: ['#0f172a', '#1e293b'],
    success: ['#10b981', '#059669'],
    warning: ['#f59e0b', '#d97706'],
  },
  
  // Chat colors
  chat: {
    userBubble: '#0ea5e9',
    botBubble: '#ffffff',
    botBubbleDark: '#1e293b',
    typingIndicator: '#64748b',
    inputBackground: '#ffffff',
    inputBackgroundDark: '#334155',
    inputBorder: '#e2e8f0',
    inputBorderDark: '#475569',
  },
  
  // Card colors
  card: {
    background: '#ffffff',
    backgroundDark: '#1e293b',
    border: '#e2e8f0',
    borderDark: '#334155',
    shadow: 'rgba(0, 0, 0, 0.1)',
    shadowDark: 'rgba(0, 0, 0, 0.3)',
  },
  
  // Button colors
  button: {
    primary: '#0ea5e9',
    secondary: '#64748b',
    danger: '#dc2626',
    disabled: '#94a3b8',
    success: '#10b981',
  },
  
  // Border colors
  border: {
    light: '#e2e8f0',
    medium: '#cbd5e1',
    dark: '#94a3b8',
  },
};