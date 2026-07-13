import type { ReactNode } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';

import { Brand } from '@/constants/theme';

export function GlassCard({ children, style }: { children: ReactNode; style?: ViewStyle | ViewStyle[] }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Brand.cardBg,
    borderWidth: 1,
    borderColor: Brand.cardBorder,
    borderRadius: 24,
    padding: 20,
    shadowColor: Brand.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 3,
  },
});
