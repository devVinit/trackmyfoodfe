import { router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { BottomSheet } from '@/components/ui/bottom-sheet';
import { PrimaryButton } from '@/components/ui/primary-button';
import { LogEntryRow } from '@/components/log-entry-row';
import { Brand } from '@/constants/theme';
import { historyDayMeals, useAppState } from '@/context/app-state';
import { formatNumber } from '@/utils/format';

export default function DayDetailScreen() {
  const { history, goals } = useAppState();
  const { index } = useLocalSearchParams<{ index: string }>();
  const dayIndex = Number(index);
  const day = history[dayIndex];

  function close() {
    router.back();
  }

  useEffect(() => {
    if (!day) close();
  }, [day]);

  if (!day) {
    return null;
  }

  const meals = historyDayMeals(day, dayIndex);

  return (
    <BottomSheet onClose={close}>
      <View style={styles.headerRow}>
        <Text style={styles.date}>{day.date}</Text>
        <Text style={styles.calLine}>
          <Text style={styles.calStrong}>{formatNumber(day.cal)}</Text> / {formatNumber(goals.calories)} kcal
        </Text>
      </View>
      <Text style={styles.caption}>What you ate that day</Text>

      <View style={styles.list}>
        {meals.map((meal, i) => (
          <LogEntryRow
            key={i}
            name={meal.name}
            time={meal.time}
            meal={meal.meal}
            cal={meal.cal}
            p={meal.p}
            f={meal.f}
            c={meal.c}
            fi={meal.fi}
            gradient={meal.gradient}
          />
        ))}
      </View>

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
  list: {
    gap: 10,
    marginBottom: 20,
  },
});
