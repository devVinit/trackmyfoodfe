import { BlurView } from 'expo-blur';
import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

export function CenterDialog({ children, onClose }: { children: ReactNode; onClose: () => void }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(1, { duration: 220 });
  }, [progress]);

  const cardStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ scale: 0.85 + progress.value * 0.15 }],
  }));

  return (
    <View style={styles.wrap}>
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose}>
        <BlurView intensity={25} tint="dark" style={StyleSheet.absoluteFill} />
      </Pressable>
      <Animated.View style={[styles.card, cardStyle]}>{children}</Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  card: {
    width: '100%',
    maxWidth: 300,
    backgroundColor: 'rgba(248,242,231,0.98)',
    borderRadius: 24,
    padding: 26,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 50,
    elevation: 12,
  },
});
