import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { AppColors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

interface CardProps {
  title?: string;
  subtitle?: string;
  children?: React.ReactNode;
  onPress?: () => void;
  variant?: 'default' | 'gradient' | 'emergency' | 'feature' | 'outline' | 'glass';
  icon?: string;
  iconColor?: string;
  style?: ViewStyle;
  titleStyle?: TextStyle;
  subtitleStyle?: TextStyle;
  disabled?: boolean;
  badge?: string;
  badgeColor?: string;
  elevation?: number;
  loading?: boolean;
}

export default function Card({
  title,
  subtitle,
  children,
  onPress,
  variant = 'default',
  icon,
  iconColor,
  style,
  titleStyle,
  subtitleStyle,
  disabled = false,
  badge,
  badgeColor,
  elevation = 4,
  loading = false,
}: CardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const getCardStyle = () => {
    const baseStyle = [styles.card];
    
    switch (variant) {
      case 'gradient':
        return [...baseStyle, styles.gradientCard];
      case 'emergency':
        return [...baseStyle, styles.emergencyCard];
      case 'feature':
        return [...baseStyle, styles.featureCard, { backgroundColor: isDark ? AppColors.card.backgroundDark : AppColors.card.background }];
      case 'outline':
        return [...baseStyle, styles.outlineCard, { 
          backgroundColor: isDark ? AppColors.backgroundDark : AppColors.background,
          borderColor: isDark ? AppColors.card.borderDark : AppColors.card.border 
        }];
      case 'glass':
        return [...baseStyle, styles.glassCard];
      default:
        return [...baseStyle, styles.defaultCard, { 
          backgroundColor: isDark ? AppColors.card.backgroundDark : AppColors.card.background,
          borderColor: isDark ? AppColors.card.borderDark : AppColors.card.border 
        }];
    }
  };

  const getGradientColors = () => {
    switch (variant) {
      case 'gradient':
        return AppColors.gradients.primary;
      case 'emergency':
        return AppColors.gradients.emergency;
      case 'glass':
        return isDark ? ['rgba(30, 41, 59, 0.8)', 'rgba(51, 65, 85, 0.8)'] : ['rgba(255, 255, 255, 0.8)', 'rgba(248, 250, 252, 0.8)'];
      default:
        return [AppColors.card.background, AppColors.card.background];
    }
  };

  const getTextColor = () => {
    if (variant === 'gradient' || variant === 'emergency') {
      return AppColors.textPrimaryDark;
    }
    return isDark ? AppColors.textPrimaryDark : AppColors.textPrimary;
  };

  const getSubtitleColor = () => {
    if (variant === 'gradient' || variant === 'emergency') {
      return 'rgba(255, 255, 255, 0.8)';
    }
    return AppColors.textSecondary;
  };

  const shouldUseGradient = ['gradient', 'emergency', 'glass'].includes(variant);

  const CardContent = () => (
    <View style={[
      getCardStyle(), 
      style, 
      (disabled || loading) && styles.disabled,
      { elevation: disabled ? 0 : elevation }
    ]}>
      {shouldUseGradient ? (
        <LinearGradient
          colors={getGradientColors() as [string, string]}
          style={styles.gradientContainer}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <CardInnerContent />
        </LinearGradient>
      ) : (
        <CardInnerContent />
      )}
    </View>
  );

  const CardInnerContent = () => (
    <>
      {/* Badge */}
      {badge && (
        <View style={[styles.badge, { backgroundColor: badgeColor || AppColors.primary }]}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      )}

      {/* Header */}
      {(title || icon) && (
        <View style={styles.header}>
          {icon && (
            <View style={[
              styles.iconContainer, 
              { backgroundColor: iconColor ? `${iconColor}20` : `${AppColors.primary}20` }
            ]}>
              <Ionicons 
                name={icon as any} 
                size={variant === 'feature' ? 28 : 24} 
                color={iconColor || AppColors.primary} 
              />
            </View>
          )}
          
          {(title || subtitle) && (
            <View style={styles.titleContainer}>
              {title && (
                <Text style={[
                  styles.title, 
                  titleStyle,
                  { color: getTextColor() }
                ]}>
                  {title}
                </Text>
              )}
              {subtitle && (
                <Text style={[
                  styles.subtitle, 
                  subtitleStyle,
                  { color: getSubtitleColor() }
                ]}>
                  {subtitle}
                </Text>
              )}
            </View>
          )}
        </View>
      )}

      {/* Content */}
      {children && (
        <View style={styles.content}>
          {children}
        </View>
      )}
    </>
  );

  if (onPress && !disabled) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.85}
        style={styles.touchable}
      >
        <CardContent />
      </TouchableOpacity>
    );
  }

  return <CardContent />;
}

const styles = StyleSheet.create({
  touchable: {
    marginBottom: 12,
  },
  card: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  gradientContainer: {
    padding: 20,
  },
  defaultCard: {
    padding: 20,
    borderWidth: 1,
    shadowColor: AppColors.card.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  gradientCard: {
    shadowColor: AppColors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  emergencyCard: {
    shadowColor: AppColors.emergency,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  featureCard: {
    padding: 20,
    borderWidth: 1,
    shadowColor: AppColors.card.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    alignItems: 'center',
  },
  outlineCard: {
    padding: 20,
    borderWidth: 2,
    shadowColor: AppColors.card.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  glassCard: {
    shadowColor: AppColors.card.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  disabled: {
    opacity: 0.6,
  },
  badge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 1,
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.8,
  },
  content: {
    flex: 1,
  },
});