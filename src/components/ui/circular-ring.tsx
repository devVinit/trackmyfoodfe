import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { Brand } from '@/constants/theme';

const SIZE = 112;
const RADIUS = 52 * (SIZE / 120);
const STROKE = 11 * (SIZE / 120);
const CIRC = 2 * Math.PI * RADIUS;

export function CircularRing({ pct }: { pct: number }) {
  const clamped = Math.min(100, Math.max(0, pct));
  const dash = (CIRC * clamped) / 100;
  return (
    <View style={styles.wrap}>
      <Svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
        <Circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke="rgba(180,167,143,0.22)"
          strokeWidth={STROKE}
        />
        <Circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke={Brand.primary}
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${CIRC}`}
          transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
        />
      </Svg>
      <View style={styles.center}>
        <Text style={styles.pct}>{clamped}%</Text>
        <Text style={styles.label}>of goal</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: SIZE,
    height: SIZE,
  },
  center: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pct: {
    fontSize: 20,
    fontWeight: '800',
    color: Brand.text,
    letterSpacing: -0.5,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: Brand.textSecondary,
  },
});
