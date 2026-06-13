import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { Theme } from './Theme';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  variant?: 'default' | 'glow' | 'water' | 'orange' | 'green' | 'purple' | 'cyan';
}

export const Card: React.FC<CardProps> = ({ children, style, variant = 'default' }) => {
  const getVariantStyle = () => {
    switch (variant) {
      case 'glow':
        return {
          borderColor: Theme.colors.accentYellow,
          shadowColor: Theme.colors.accentYellow,
          shadowOpacity: 0.15,
          shadowRadius: 10,
        };
      case 'water':
        return {
          backgroundColor: '#1557bf',
          borderColor: '#2979ff',
          shadowColor: '#2979ff',
          shadowOpacity: 0.3,
          shadowRadius: 12,
        };
      case 'orange':
        return {
          backgroundColor: 'rgba(255, 112, 67, 0.03)',
          borderColor: 'rgba(255, 112, 67, 0.2)',
          shadowColor: Theme.colors.accentOrange,
          shadowOpacity: 0.1,
          shadowRadius: 8,
        };
      case 'green':
        return {
          borderColor: Theme.colors.accentGreen,
          shadowColor: Theme.colors.accentGreen,
          shadowOpacity: 0.1,
          shadowRadius: 8,
        };
      case 'purple':
        return {
          borderColor: Theme.colors.accentPurple,
          shadowColor: Theme.colors.accentPurple,
          shadowOpacity: 0.1,
          shadowRadius: 8,
        };
      case 'cyan':
        return {
          borderColor: Theme.colors.accentCyan,
          shadowColor: Theme.colors.accentCyan,
          shadowOpacity: 0.1,
          shadowRadius: 8,
        };
      default:
        return {};
    }
  };

  return (
    <View style={[styles.card, getVariantStyle(), style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Theme.colors.bgCard,
    borderRadius: Theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
});
export default Card;
