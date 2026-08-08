import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { BottomSheet } from '@/components/ui/bottom-sheet';
import { PrimaryButton } from '@/components/ui/primary-button';
import { LogEntryRow } from '@/components/log-entry-row';
import { Brand } from '@/constants/theme';
import { useAppState, type LogEntry } from '@/context/app-state';
import { formatNumber } from '@/utils/format';

export default function DayDetailScreen() {
  const { history, goals, loadDayEntries } = useAppState();
  const { date } = useLocalSearchParams<{ date: string }>();
  const day = history.find((d) => d.isoDate === date);

  const [meals, setMeals] = useState<LogEntry[] | null>(null);

  function close() {
    router.back();
  }

  useEffect(() => {
    if (!day || !date) return;
    let cancelled = false;
    setMeals(null);
    loadDayEntries(date)
      .then((entries) => {
        if (!cancelled) setMeals(entries);
      })
      .catch(() => {
        if (!cancelled) setMeals([]);
      });
    return () => {
      cancelled = true;
    };
  }, [date, day, loadDayEntries]);

  useEffect(() => {
    if (!day) close();
  }, [day]);

  if (!day) {
    return null;
  }

  return (
    <BottomSheet onClose={close}>
      <View style={styles.headerRow}>
        <Text style={styles.date}>{day.date}</Text>
        <Text style={styles.calLine}>
          <Text style={styles.calStrong}>{formatNumber(day.cal)}</Text> / {formatNumber(goals.calories)} kcal
        </Text>
      </View>
      <Text style={styles.caption}>What you ate that day</Text>

      {meals === null ? (
        <View style={styles.loading}>
          <ActivityIndicator color={Brand.primary} />
        </View>
      ) : (
        <View style={styles.list}>
          {meals.map((meal) => (
            <LogEntryRow
              key={meal.id}
              name={meal.name}
              time={meal.time}
              meal={meal.meal}
              cal={meal.cal}
              p={meal.p}
              f={meal.f}
              c={meal.c}
              fi={meal.fi}
              gradient={meal.gradient}
              photoUrl={meal.photoUrl}
            />
          ))}
        </View>
      )}

      <PrimaryButton onPress={close}>Done</PrimaryButton>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    gap: 10,
    marginBottom: 4,
  },
  date: {
    fontSize: 21,
    fontWeight: '800',
    color: Brand.text,
  },
  calLine: {
    fontSize: 13.5,
    color: Brand.textSecondary,
    fontWeight: '700',
  },
  calStrong: {
    color: Brand.primary,
    fontWeight: '800',
  },
  caption: {
    fontSize: 13,
    color: Brand.textSecondary,
    fontWeight: '600',
    marginBottom: 16,
  },
  loading: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  list: {
    gap: 10,
    marginBottom: 20,
  },
});
