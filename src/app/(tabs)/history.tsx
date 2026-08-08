import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppBackground } from '@/components/ui/app-background';
import { Brand } from '@/constants/theme';
import { useAppState } from '@/context/app-state';
import { useTabBarMetrics } from '@/hooks/use-tab-bar-metrics';
import { formatNumber } from '@/utils/format';

export default function HistoryScreen() {
  const { history, goals } = useAppState();
  const tabBar = useTabBarMetrics();

  return (
    <AppBackground>
      <ScrollView contentContainerStyle={[styles.container, { paddingBottom: tabBar.clearance + 24 }]}>
        <Text style={styles.title}>History</Text>
        <Text style={styles.subtitle}>Your last days at a glance</Text>

        {history.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No days logged yet</Text>
            <Text style={styles.emptyBody}>Once you log a few meals, your daily totals will show up here.</Text>
          </View>
        ) : null}

        <View style={styles.list}>
          {history.map((day) => {
            const ratio = day.cal / (goals.calories || 1);
            const over = ratio > 1.03;
            const under = ratio < 0.85;
            const pct = Math.min(100, Math.round(ratio * 100));
            const status = over ? 'Over' : under ? 'Under' : 'On target';
            const chipBg = over ? Brand.dangerTint : under ? Brand.warnTint : Brand.successTint;
            const chipColor = over ? Brand.danger : under ? Brand.warnText : Brand.success;
            const barColor = over ? Brand.danger : Brand.primary;

            return (
              <Pressable
                key={day.isoDate}
                onPress={() => router.push({ pathname: '/day-detail', params: { date: day.isoDate } })}
                style={styles.card}>
                <View style={styles.cardTop}>
                  <Text style={styles.cardDate}>{day.date}</Text>
                  <View style={[styles.statusChip, { backgroundColor: chipBg }]}>
                    <Text style={[styles.statusChipText, { color: chipColor }]}>{status}</Text>
                  </View>
                </View>
                <View style={styles.cardMid}>
                  <Text style={styles.cardCal}>
                    <Text style={styles.cardCalStrong}>{formatNumber(day.cal)}</Text> / {formatNumber(goals.calories)} kcal
                  </Text>
                  <Text style={styles.cardPct}>{pct}%</Text>
                </View>
                <View style={styles.track}>
                  <View style={[styles.fill, { width: `${pct}%`, backgroundColor: barColor }]} />
                </View>
                <Text style={styles.summary}>
                  P {day.p} · F {day.f} · C {day.c} · Fi {day.fi}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 74,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 4,
    color: Brand.text,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Brand.textSecondary,
    marginBottom: 18,
  },
  emptyState: {
    backgroundColor: 'rgba(255,255,255,0.45)',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: 'rgba(180,167,143,0.45)',
    borderRadius: 20,
    paddingVertical: 34,
    paddingHorizontal: 24,
    alignItems: 'center',
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Brand.textSecondary,
  },
  emptyBody: {
    fontSize: 13.5,
    color: Brand.textMuted,
    textAlign: 'center',
    lineHeight: 19,
  },
  list: {
    gap: 10,
  },
  card: {
    backgroundColor: Brand.cardBg,
    borderWidth: 1,
    borderColor: Brand.cardBorder,
    borderRadius: 20,
    padding: 16,
    gap: 10,
    shadowColor: Brand.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 14,
    elevation: 2,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardDate: {
    fontSize: 15,
    fontWeight: '800',
    color: Brand.text,
  },
  statusChip: {
    borderRadius: 100,
    paddingVertical: 3,
    paddingHorizontal: 9,
  },
  statusChipText: {
    fontSize: 11,
    fontWeight: '700',
  },
  cardMid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  cardCal: {
    fontSize: 14,
    color: Brand.textSecondary,
    fontWeight: '600',
  },
  cardCalStrong: {
    fontWeight: '800',
    color: Brand.text,
  },
  cardPct: {
    fontSize: 12,
    color: Brand.textMuted,
    fontWeight: '700',
  },
  track: {
    height: 8,
    borderRadius: 4,
    backgroundColor: Brand.borderLight,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 4,
  },
  summary: {
    fontSize: 12,
    color: Brand.textSecondary,
    fontWeight: '600',
  },
});
