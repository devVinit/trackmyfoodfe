import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Brand } from '@/constants/theme';
import type { Gender } from '@/context/app-state';

type Props = {
  value: Gender;
  onChange: (g: Gender) => void;
  compact?: boolean;
};

export function GenderToggle({ value, onChange, compact }: Props) {
  return (
    <View style={styles.track}>
      <Segment label="Male" active={value === 'male'} onPress={() => onChange('male')} compact={compact} />
      <Segment label="Female" active={value === 'female'} onPress={() => onChange('female')} compact={compact} />
    </View>
  );
}

function Segment({ label, active, onPress, compact }: { label: string; active: boolean; onPress: () => void; compact?: boolean }) {
  return (
    <Pressable onPress={onPress} style={[styles.segment, compact && styles.segmentCompact, active && styles.segmentActive]}>
      <Text style={[styles.segmentText, compact && styles.segmentTextCompact, { color: active ? '#fff' : Brand.textSecondary }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.55)',
    borderWidth: 1,
    borderColor: 'rgba(180,167,143,0.3)',
    borderRadius: 16,
    padding: 5,
  },
  segment: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  segmentCompact: {
    paddingVertical: 11,
  },
  segmentActive: {
    backgroundColor: Brand.primary,
    shadowColor: Brand.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 2,
  },
  segmentText: {
    fontSize: 15,
    fontWeight: '700',
  },
  segmentTextCompact: {
    fontSize: 14.5,
  },
});
