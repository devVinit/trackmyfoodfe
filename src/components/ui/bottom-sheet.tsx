import { BlurView } from 'expo-blur';
import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = {
  children: ReactNode;
  onClose: () => void;
  maxHeightPct?: number;
  scroll?: boolean;
};

export function BottomSheet({ children, onClose, maxHeightPct = 0.82, scroll = true }: Props) {
  const insets = useSafeAreaInsets();
  const Content = scroll ? ScrollView : View;
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(1, { duration: 280 });
  }, [progress]);

  const panelStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: (1 - progress.value) * 400 }],
  }));

  return (
    <View style={StyleSheet.absoluteFill}>
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose}>
        <BlurView intensity={25} tint="dark" style={StyleSheet.absoluteFill} />
      </Pressable>
      <Animated.View
        style={[
          styles.panel,
          { maxHeight: `${maxHeightPct * 100}%`, paddingBottom: Math.max(28, insets.bottom + 16) },
          panelStyle,
        ]}>
        <Content showsVerticalScrollIndicator={false}>
          <View style={styles.handle} />
          {children}
        </Content>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(248,242,231,0.97)',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 22,
    paddingTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -12 },
    shadowOpacity: 0.25,
    shadowRadius: 40,
    elevation: 10,
  },
  handle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(180,167,143,0.5)',
    alignSelf: 'center',
    marginBottom: 16,
  },
});
