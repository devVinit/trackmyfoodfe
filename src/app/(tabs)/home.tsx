import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { AppBackground } from '@/components/ui/app-background';
import { CircularRing } from '@/components/ui/circular-ring';
import { GlassCard } from '@/components/ui/glass-card';
import { MacroBar } from '@/components/ui/macro-bar';
import { LogEntryRow } from '@/components/log-entry-row';
import { Brand } from '@/constants/theme';
import { useAppState } from '@/context/app-state';
import { useTabBarMetrics } from '@/hooks/use-tab-bar-metrics';
import { formatNumber, formatSignedNumber } from '@/utils/format';

export default function HomeScreen() {
  const { user, goals, todayLog, healthProvider } = useAppState();
  const tabBar = useTabBarMetrics();

  const now = new Date();
  const todayLabel = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const hour = now.getHours();
  const greetingPrefix = hour < 12 ? 'Good morning, ' : hour < 18 ? 'Good afternoon, ' : 'Good evening, ';
  const greeting = greetingPrefix + (user.name || 'there').split(' ')[0];

  const consumed = todayLog.reduce((t, e) => t + e.cal, 0);
  const ringPct = Math.min(100, Math.round((consumed / (goals.calories || 1)) * 100));
  const totals = todayLog.reduce(
    (t, e) => ({ p: t.p + e.p, f: t.f + e.f, c: t.c + e.c, fi: t.fi + e.fi }),
    { p: 0, f: 0, c: 0, fi: 0 },
  );

  const active = 428;
  const resting = 1512;
  const burned = active + resting;
  const net = consumed - burned;
  const healthSourceLabel = healthProvider === 'google' ? 'Health Connect' : 'Apple Health';

  return (
    <AppBackground>
      <ScrollView contentContainerStyle={[styles.container, { paddingBottom: tabBar.clearance + 24 }]}>
        <View style={styles.header}>
          <Text style={styles.dateLabel}>{todayLabel}</Text>
          <Text style={styles.greeting}>{greeting}</Text>
        </View>

        <GlassCard style={styles.heroCard}>
          <CircularRing pct={ringPct} />
          <View style={styles.heroBody}>
            <Text style={styles.heroLabel}>Calories</Text>
            <Text style={styles.heroValue}>
              <Text style={styles.heroValueStrong}>{formatNumber(consumed)}</Text>
              <Text style={styles.heroValueMuted}> / {formatNumber(goals.calories)}</Text>
            </Text>
            <Text style={styles.heroSub}>kcal consumed</Text>
            {healthProvider ? (
              <View style={styles.healthRow}>
                <Text style={styles.healthText}>
                  Burned <Text style={styles.healthStrong}>{formatNumber(burned)}</Text> kcal · {healthSourceLabel}
                </Text>
                <Text style={styles.healthText}>
                  Net <Text style={styles.healthNet}>{formatSignedNumber(net)}</Text> kcal
                </Text>
              </View>
            ) : null}
          </View>
        </GlassCard>

        <GlassCard style={styles.macrosCard}>
          <Text style={styles.sectionLabel}>Macros</Text>
          <MacroBar label="Protein" value={totals.p} goal={goals.protein} color={Brand.protein} />
          <MacroBar label="Fat" value={totals.f} goal={goals.fat} color={Brand.fat} />
          <MacroBar label="Carbs" value={totals.c} goal={goals.carbs} color={Brand.carbs} />
          <MacroBar label="Fiber" value={totals.fi} goal={goals.fiber} color={Brand.fiber} />
        </GlassCard>

        <View style={styles.logHeader}>
          <Text style={styles.logTitle}>Today&rsquo;s log</Text>
          <Text style={styles.logCount}>
            {todayLog.length} {todayLog.length === 1 ? 'entry' : 'entries'}
          </Text>
        </View>

        {todayLog.length > 0 ? (
          <View style={styles.logList}>
            {todayLog.map((entry) => (
              <LogEntryRow
                key={entry.id}
                name={entry.name}
                time={entry.time}
                meal={entry.meal}
                cal={entry.cal}
                p={entry.p}
                f={entry.f}
                c={entry.c}
                fi={entry.fi}
                gradient={entry.gradient}
                onPress={() => router.push({ pathname: '/food-detail', params: { id: entry.id } })}
              />
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Nothing logged yet</Text>
            <Text style={styles.emptyBody}>Snap a photo of your meal to log it in seconds.</Text>
          </View>
        )}
      </ScrollView>

      <Pressable
        onPress={() => router.push('/scan')}
        accessibilityRole="button"
        accessibilityLabel="Scan a meal"
        style={[styles.fab, { bottom: tabBar.clearance + 16 }]}>
        <LinearGradient colors={[Brand.primaryLight, Brand.primaryDark]} style={styles.fabGradient}>
          <View style={styles.fabIcon}>
            <View style={styles.fabIconLens} />
            <View style={styles.fabIconFlash} />
          </View>
        </LinearGradient>
      </Pressable>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 74,
  },
  header: {
    gap: 2,
    marginBottom: 18,
  },
  dateLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Brand.textSecondary,
  },
  greeting: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
    color: Brand.text,
  },
  heroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
    marginBottom: 14,
  },
  heroBody: {
    flex: 1,
    gap: 5,
    minWidth: 0,
  },
  heroLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Brand.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  heroValue: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
    lineHeight: 30,
  },
  heroValueStrong: {
    color: Brand.primary,
  },
  heroValueMuted: {
    color: Brand.textMuted,
    fontWeight: '600',
  },
  heroSub: {
    fontSize: 13,
    color: Brand.textSecondary,
    fontWeight: '600',
  },
  healthRow: {
    gap: 2,
    marginTop: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Brand.borderLight,
  },
  healthText: {
    fontSize: 12.5,
    color: Brand.textSecondary,
  },
  healthStrong: {
    fontWeight: '700',
    color: Brand.text,
  },
  healthNet: {
    fontWeight: '800',
    color: Brand.success,
  },
  macrosCard: {
    gap: 15,
    marginBottom: 22,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Brand.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  logTitle: {
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: -0.3,
    color: Brand.text,
  },
  logCount: {
    fontSize: 13,
    fontWeight: '600',
    color: Brand.textSecondary,
  },
  logList: {
    gap: 10,
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
  fab: {
    position: 'absolute',
    right: 20,
    width: 62,
    height: 62,
    borderRadius: 31,
    shadowColor: Brand.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.45,
    shadowRadius: 26,
    elevation: 6,
  },
  fabGradient: {
    flex: 1,
    borderRadius: 31,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabIcon: {
    width: 26,
    height: 20,
    borderRadius: 6,
    borderWidth: 2.5,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabIconLens: {
    width: 9,
    height: 9,
    borderRadius: 5,
    borderWidth: 2.5,
    borderColor: '#fff',
  },
  fabIconFlash: {
    position: 'absolute',
    top: -6,
    left: 6,
    width: 9,
    height: 4,
    backgroundColor: '#fff',
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
});
