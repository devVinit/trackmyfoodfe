import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { Brand } from '@/constants/theme';

export function AppBackground({ children }: { children: ReactNode }) {
  return (
    <View style={styles.fill}>
      <LinearGradient
        colors={[Brand.bgGradientStart, Brand.bgGradientEnd]}
        style={StyleSheet.absoluteFill}
      />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
});
