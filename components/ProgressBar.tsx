import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Theme } from './Theme';

interface ProgressBarProps {
  progress: number; // 0 to 1
  category?: 'water' | 'gym' | 'study' | 'sleep' | 'steps' | 'rank' | 'default';
  style?: ViewStyle;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ progress, category = 'default', style }) => {
  const getBarColor = () => {
    switch (category) {
      case 'water':
        return '#ffffff'; // white fill on blue card
      case 'gym':
        return Theme.colors.accentGreen;
      case 'study':
        return Theme.colors.accentPurple;
      case 'sleep':
        return Theme.colors.accentCyan;
      case 'steps':
      case 'rank':
        return Theme.colors.accentYellow;
      default:
        return Theme.colors.accentYellow;
    }
  };

  const clampedProgress = Math.max(0, Math.min(1, progress));

  return (
    <View style={[styles.container, category === 'water' && styles.waterContainer, style]}>
      <View
        style={[
          styles.fill,
          {
            width: `${clampedProgress * 100}%`,
            backgroundColor: getBarColor(),
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 6,
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  waterContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  fill: {
    height: '100%',
    borderRadius: 3,
  },
});
export default ProgressBar;
