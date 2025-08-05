import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { AppColors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

interface ButtonProps {
  title: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'emergency' | 'success';
  size?: 'small' | 'medium' | 'large';
  icon?: string;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

export default function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  style,
  textStyle,
  fullWidth = false,
}: ButtonProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const getButtonStyle = () => {
    const baseStyle = [styles.button, styles[size]];
    
    if (fullWidth) {
      baseStyle.push(styles.fullWidth);
    }
    
    switch (variant) {
      case 'primary':
        return [...baseStyle, styles.primary];
      case 'secondary':
        return [...baseStyle, styles.secondary, { 
          backgroundColor: isDark ? AppColors.card.backgroundDark : AppColors.button.secondary 
        }];
      case 'outline':
        return [...baseStyle, styles.outline, { 
          borderColor: AppColors.button.primary,
          backgroundColor: isDark ? AppColors.backgroundDark : AppColors.background 
        }];
      case 'ghost':
        return [...baseStyle, styles.ghost];
      case 'danger':
        return [...baseStyle, styles.danger];
      case 'emergency':
        return [...baseStyle, styles.emergency];
      case 'success':
        return [...baseStyle, styles.success];
      default:
        return [...baseStyle, styles.primary];
    }
  };

  const getTextStyle = () => {
    const baseTextStyle = [styles.text, styles[`${size}Text`]];
    
    switch (variant) {
      case 'outline':
        return [...baseTextStyle, { color: AppColors.button.primary }];
      case 'ghost':
        return [...baseTextStyle, { color: AppColors.button.primary }];
      case 'secondary':
        return [...baseTextStyle, { color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimary }];
      default:
        return [...baseTextStyle, { color: 'white' }];
    }
  };

  const getGradientColors = () => {
    switch (variant) {
      case 'primary':
        return AppColors.gradients.primary;
      case 'emergency':
        return AppColors.gradients.emergency;
      case 'success':
        return AppColors.gradients.success;
      default:
        return [AppColors.button.primary, AppColors.button.primary];
    }
  };

  const getIconColor = () => {
    switch (variant) {
      case 'outline':
      case 'ghost':
        return AppColors.button.primary;
      case 'secondary':
        return isDark ? AppColors.textPrimaryDark : AppColors.textPrimary;
      default:
        return 'white';
    }
  };

  const shouldUseGradient = ['primary', 'emergency', 'success'].includes(variant);

  const ButtonContent = () => (
    <View style={[getButtonStyle(), style, (disabled || loading) && styles.disabled]}>
      {shouldUseGradient ? (
        <LinearGradient
          colors={getGradientColors() as [string, string]}
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <ButtonInnerContent />
        </LinearGradient>
      ) : (
        <ButtonInnerContent />
      )}
    </View>
  );

  const ButtonInnerContent = () => (
    <View style={styles.innerContent}>
      {loading ? (
        <ActivityIndicator 
          color={getIconColor()} 
          size="small" 
        />
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <Ionicons 
              name={icon as any} 
              size={size === 'small' ? 16 : size === 'large' ? 22 : 18} 
              color={getIconColor()} 
              style={styles.leftIcon}
            />
          )}
          
          <Text style={[getTextStyle(), textStyle]}>{title}</Text>
          
          {icon && iconPosition === 'right' && (
            <Ionicons 
              name={icon as any} 
              size={size === 'small' ? 16 : size === 'large' ? 22 : 18} 
              color={getIconColor()} 
              style={styles.rightIcon}
            />
          )}
        </>
      )}
    </View>
  );

  if (onPress && !disabled && !loading) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.85}
        style={styles.touchable}
      >
        <ButtonContent />
      </TouchableOpacity>
    );
  }

  return <ButtonContent />;
}

const styles = StyleSheet.create({
  touchable: {
    marginBottom: 8,
  },
  button: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: AppColors.card.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerContent: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  // Size variants
  small: {
    minHeight: 36,
  },
  medium: {
    minHeight: 48,
  },
  large: {
    minHeight: 56,
  },
  fullWidth: {
    width: '100%',
  },
  // Variant styles
  primary: {
    backgroundColor: AppColors.button.primary,
  },
  secondary: {
    backgroundColor: AppColors.button.secondary,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  danger: {
    backgroundColor: AppColors.button.danger,
  },
  emergency: {
    backgroundColor: AppColors.button.danger,
  },
  success: {
    backgroundColor: AppColors.button.success,
  },
  disabled: {
    opacity: 0.6,
  },
  // Text styles
  text: {
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  smallText: {
    fontSize: 14,
  },
  mediumText: {
    fontSize: 16,
  },
  largeText: {
    fontSize: 18,
  },
  // Icon styles
  leftIcon: {
    marginRight: 8,
  },
  rightIcon: {
    marginLeft: 8,
  },
});