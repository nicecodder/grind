import React, { useEffect } from 'react';
import { StyleSheet, Text } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, runOnJS } from 'react-native-reanimated';
import { Theme } from './Theme';

interface XPPopupProps {
  amount: number;
  x: number;
  y: number;
  onComplete: () => void;
  isAchievement?: boolean;
}

export const XPPopup: React.FC<XPPopupProps> = ({ amount, x, y, onComplete, isAchievement = false }) => {
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(1);

  useEffect(() => {
    translateY.value = withTiming(-80, { duration: 1200 });
    opacity.value = withTiming(0, { duration: 1200 }, (finished) => {
      if (finished) {
        runOnJS(onComplete)();
      }
    });
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
      opacity: opacity.value,
    };
  });

  return (
    <Animated.View style={[styles.popup, { left: x - 40, top: y - 20 }, animatedStyle]}>
      <Text style={[styles.text, isAchievement && styles.achievementText]}>
        +{amount} XP
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  popup: {
    position: 'absolute',
    zIndex: 9999,
    pointerEvents: 'none',
    width: 120,
    alignItems: 'center',
  },
  text: {
    fontSize: 20,
    fontWeight: '900',
    color: Theme.colors.accentYellow,
    textShadowColor: 'rgba(235, 212, 91, 0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  achievementText: {
    color: Theme.colors.accentGreen,
    textShadowColor: 'rgba(0, 230, 118, 0.4)',
  },
});
export default XPPopup;
