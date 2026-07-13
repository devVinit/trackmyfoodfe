import { useEffect } from 'react';
import { StyleSheet, type DimensionValue } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

import { Brand } from '@/constants/theme';

export function ShimmerBar({ width }: { width: DimensionValue }) {
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    opacity.value = withRepeat(withTiming(1, { duration: 600 }), -1, true);
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return <Animated.View style={[styles.bar, { width }, animatedStyle]} />;
}

const styles = StyleSheet.create({
  bar: {
    height: 14,
    borderRadius: 7,
    backgroundColor: Brand.primaryTint,
  },
});
