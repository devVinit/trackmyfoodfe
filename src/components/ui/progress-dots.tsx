import { StyleSheet, View } from 'react-native';

import { Brand } from '@/constants/theme';

export function ProgressDots({ total, current }: { total: number; current: number }) {
  return (
    <View style={styles.row}>
      {Array.from({ length: total }).map((_, i) => (
        <View key={i} style={[styles.dot, { backgroundColor: i < current ? Brand.primary : Brand.borderLight }]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 26,
  },
  dot: {
    width: 26,
    height: 6,
    borderRadius: 3,
  },
});
