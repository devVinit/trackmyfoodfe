import { StyleSheet, Text } from 'react-native';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppState } from '@/context/app-state';

export function Toast() {
  const { toast } = useAppState();
  const insets = useSafeAreaInsets();

  if (!toast) return null;

  return (
    <Animated.View
      entering={FadeInUp.duration(200)}
      exiting={FadeOutUp.duration(200)}
      pointerEvents="none"
      style={[styles.wrap, { top: insets.top + 20 }]}>
      <Text style={styles.text}>{toast}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 200,
  },
  text: {
    backgroundColor: 'rgba(43,35,24,0.92)',
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    paddingVertical: 11,
    paddingHorizontal: 20,
    borderRadius: 100,
    overflow: 'hidden',
  },
});
