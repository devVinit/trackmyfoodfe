import { Pressable, StyleSheet, Text } from 'react-native';

import { Brand } from '@/constants/theme';

export function PillChip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, { backgroundColor: active ? Brand.primary : 'rgba(180,167,143,0.16)' }]}>
      <Text style={[styles.label, { color: active ? '#fff' : Brand.textSecondary }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderRadius: 100,
    paddingVertical: 9,
    paddingHorizontal: 16,
  },
  label: {
    fontSize: 13.5,
    fontWeight: '700',
  },
});
