import { StyleSheet, Text, View } from 'react-native';

import { Brand } from '@/constants/theme';

export function MacroBar({ label, value, goal, color }: { label: string; value: number; goal: number; color: string }) {
  const pct = Math.min(100, Math.round((value / (goal || 1)) * 100));
  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>
          <Text style={styles.valueStrong}>{value}</Text> / {goal} g
        </Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${pct}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 6,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  label: {
    fontSize: 14.5,
    fontWeight: '700',
    color: Brand.text,
  },
  value: {
    fontSize: 13,
    color: Brand.textSecondary,
    fontWeight: '600',
  },
  valueStrong: {
    fontWeight: '800',
    color: Brand.text,
  },
  track: {
    height: 9,
    borderRadius: 5,
    backgroundColor: Brand.borderLight,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 5,
  },
});
