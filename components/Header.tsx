import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { AppColors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

interface HeaderProps {
  title: string;
  subtitle?: string;
  leftIcon?: string;
  rightIcon?: string;
  onLeftPress?: () => void;
  onRightPress?: () => void;
  showEmergency?: boolean;
  onEmergencyPress?: () => void;
  variant?: 'default' | 'chat' | 'news' | 'more';
  transparent?: boolean;
}

export default function Header({
  title,
  subtitle,
  leftIcon,
  rightIcon,
  onLeftPress,
  onRightPress,
  showEmergency = false,
  onEmergencyPress,
  variant = 'default',
  transparent = false,
}: HeaderProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const getHeaderColors = () => {
    if (transparent) {
      return ['transparent', 'transparent'];
    }
    
    switch (variant) {
      case 'chat':
        return isDark ? AppColors.gradients.dark : AppColors.gradients.primary;
      case 'news':
        return isDark ? AppColors.gradients.dark : AppColors.gradients.secondary;
      case 'more':
        return isDark ? AppColors.gradients.dark : AppColors.gradients.surface;
      default:
        return isDark ? AppColors.gradients.dark : AppColors.gradients.primary;
    }
  };

  const getTextColor = () => {
    return transparent || isDark ? AppColors.textPrimaryDark : AppColors.textPrimary;
  };

  const getLeftIcon = () => {
    if (leftIcon) return leftIcon;
    switch (variant) {
      case 'chat':
        return 'chatbubble-ellipses';
      case 'news':
        return 'newspaper';
      case 'more':
        return 'menu';
      default:
        return 'shield-checkmark';
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: getHeaderColors()[0] }]}>
      <LinearGradient
        colors={getHeaderColors() as [string, string]}
        style={styles.container}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <StatusBar 
          barStyle={isDark || !transparent ? "light-content" : "dark-content"} 
          backgroundColor="transparent" 
          translucent 
        />
        
        <View style={styles.content}>
          {/* Left Section */}
          <View style={styles.leftSection}>
            <View style={[styles.iconContainer, { backgroundColor: `${getTextColor()}20` }]}>
              <Ionicons name={getLeftIcon() as any} size={24} color={getTextColor()} />
            </View>
            
            <View style={styles.titleContainer}>
              <Text style={[styles.title, { color: getTextColor() }]}>{title}</Text>
              {subtitle && (
                <Text style={[styles.subtitle, { color: `${getTextColor()}80` }]}>
                  {subtitle}
                </Text>
              )}
            </View>
          </View>

          {/* Right Section */}
          <View style={styles.rightSection}>
            {showEmergency && (
              <TouchableOpacity
                style={styles.emergencyButton}
                onPress={onEmergencyPress}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={AppColors.gradients.emergency as [string, string]}
                  style={styles.emergencyGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Ionicons name="warning" size={16} color="white" />
                  <Text style={styles.emergencyText}>1930</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
            
            {onRightPress && rightIcon && (
              <TouchableOpacity
                style={[styles.iconButton, { backgroundColor: `${getTextColor()}20` }]}
                onPress={onRightPress}
                activeOpacity={0.7}
              >
                <Ionicons name={rightIcon as any} size={20} color={getTextColor()} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: AppColors.primary,
  },
  container: {
    paddingBottom: 16,
    paddingHorizontal: 20,
    shadowColor: AppColors.card.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 56,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 2,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '500',
    opacity: 0.8,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  emergencyButton: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: AppColors.emergency,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  emergencyGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
  },
  emergencyText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '700',
  },
});