import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Brand } from '@/constants/theme';

type Props = {
  name: string;
  time: string;
  meal: string;
  cal: number;
  p: number;
  f: number;
  c: number;
  fi: number;
  gradient: readonly [string, string];
  onPress?: () => void;
};

export function LogEntryRow({ name, time, meal, cal, p, f, c, fi, gradient, onPress }: Props) {
  const Wrapper = onPress ? Pressable : View;
  return (
    <Wrapper onPress={onPress} style={styles.row}>
      <LinearGradient colors={gradient} style={styles.thumb}>
        <View style={styles.thumbDot} />
      </LinearGradient>
      <View style={styles.body}>
        <View style={styles.topLine}>
          <Text style={styles.name} numberOfLines={1}>
            {name}
          </Text>
          <Text style={styles.time}>{time}</Text>
        </View>
        <View style={styles.metaLine}>
          <View style={styles.mealChip}>
            <Text style={styles.mealChipText}>{meal}</Text>
          </View>
          <Text style={styles.cal}>{cal} kcal</Text>
        </View>
        <Text style={styles.summary}>
          P {p}g · F {f}g · C {c}g · Fi {fi}g
        </Text>
      </View>
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  row: {
    backgroundColor: Brand.cardBg,
    borderWidth: 1,
    borderColor: Brand.cardBorder,
    borderRadius: 18,
    padding: 12,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    shadowColor: Brand.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 14,
    elevation: 2,
  },
  thumb: {
    width: 54,
    height: 54,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.55)',
  },
  body: {
    flex: 1,
    gap: 3,
    minWidth: 0,
  },
  topLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    gap: 8,
  },
  name: {
    fontSize: 15.5,
    fontWeight: '700',
    color: Brand.text,
    flexShrink: 1,
  },
  time: {
    fontSize: 12,
    color: Brand.textMuted,
    fontWeight: '600',
  },
  metaLine: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  mealChip: {
    backgroundColor: Brand.primaryTint,
    borderRadius: 100,
    paddingVertical: 2,
    paddingHorizontal: 8,
  },
  mealChipText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: Brand.accent,
  },
  cal: {
    fontSize: 12.5,
    color: Brand.textSecondary,
    fontWeight: '600',
  },
  summary: {
    fontSize: 12,
    color: Brand.textMuted,
    fontWeight: '600',
  },
});
