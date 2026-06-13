import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { Theme } from './Theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'filled' | 'outline' | 'danger';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'filled',
  disabled = false,
  loading = false,
  style,
  textStyle,
}) => {
  const getButtonStyle = () => {
    switch (variant) {
      case 'outline':
        return styles.outlineButton;
      case 'danger':
        return styles.dangerButton;
      default:
        return styles.filledButton;
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'outline':
        return styles.outlineText;
      case 'danger':
        return styles.dangerText;
      default:
        return styles.filledText;
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled || loading}
      style={[styles.button, getButtonStyle(), disabled && styles.disabledButton, style]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? Theme.colors.accentYellow : '#000'} size="small" />
      ) : (
        <Text style={[getTextStyle(), textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 48,
    borderRadius: Theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 20,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  filledButton: {
    backgroundColor: Theme.colors.accentYellow,
    borderColor: Theme.colors.accentYellow,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderColor: 'rgba(235, 212, 91, 0.3)',
  },
  dangerButton: {
    backgroundColor: 'rgba(234, 67, 53, 0.1)',
    borderColor: 'rgba(234, 67, 53, 0.3)',
  },
  disabledButton: {
    opacity: 0.5,
  },
  filledText: {
    color: '#0b0c0e',
    fontWeight: '800',
    fontSize: 14,
    letterSpacing: 0.3,
  },
  outlineText: {
    color: Theme.colors.accentYellow,
    fontWeight: '700',
    fontSize: 14,
    letterSpacing: 0.3,
  },
  dangerText: {
    color: Theme.colors.danger,
    fontWeight: '700',
    fontSize: 14,
    letterSpacing: 0.3,
  },
});
export default Button;
