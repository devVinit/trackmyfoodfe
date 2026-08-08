import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import { BottomSheet } from '@/components/ui/bottom-sheet';
import { PrimaryButton } from '@/components/ui/primary-button';
import { Brand } from '@/constants/theme';
import { useAppState } from '@/context/app-state';

export default function FoodDetailScreen() {
  const { todayLog, removeLogEntry, showToast } = useAppState();
  const { id } = useLocalSearchParams<{ id: string }>();
  const entry = todayLog.find((e) => e.id === id);

  function close() {
    router.back();
  }

  useEffect(() => {
    if (!entry) close();
  }, [entry]);

  if (!entry) {
    return null;
  }

  const entryId = entry.id;
  async function handleRemove() {
    try {
      await removeLogEntry(entryId);
      showToast('Removed from log');
      close();
    } catch {
      // removeLogEntry already surfaced an error toast — stay open so the
      // user can retry.
    }
  }

  return (
    <BottomSheet onClose={close} scroll={false}>
      {entry.photoUrl ? (
        <Image source={{ uri: entry.photoUrl }} style={styles.photo} resizeMode="cover" />
      ) : (
        <LinearGradient colors={entry.gradient} style={styles.photo}>
          <Text style={styles.photoLabel}>food photo</Text>
        </LinearGradient>
      )}

      <View style={styles.headerRow}>
        <Text style={styles.name} numberOfLines={1}>
          {entry.name}
        </Text>
        <Text style={styles.time}>{entry.time}</Text>
      </View>
      <View style={styles.metaRow}>
        <View style={styles.mealChip}>
          <Text style={styles.mealChipText}>{entry.meal}</Text>
        </View>
        <Text style={styles.cal}>{entry.cal} kcal</Text>
      </View>

      <View style={styles.macroGrid}>
        <MacroTile value={entry.p} label="protein" bg="rgba(232,114,42,0.10)" color={Brand.protein} />
        <MacroTile value={entry.f} label="fat" bg="rgba(212,160,60,0.12)" color={Brand.fat} />
        <MacroTile value={entry.c} label="carbs" bg="rgba(192,91,69,0.10)" color={Brand.carbs} />
        <MacroTile value={entry.fi} label="fiber" bg="rgba(138,154,75,0.12)" color={Brand.fiber} />
      </View>

      <View style={styles.buttonRow}>
        <PrimaryButton variant="dangerTint" flex={1} onPress={handleRemove}>
          Remove
        </PrimaryButton>
        <PrimaryButton flex={2} onPress={close}>
          Done
        </PrimaryButton>
      </View>
    </BottomSheet>
  );
}

function MacroTile({ value, label, bg, color }: { value: number; label: string; bg: string; color: string }) {
  return (
    <View style={[styles.macroTile, { backgroundColor: bg }]}>
      <Text style={[styles.macroTileValue, { color }]}>{value}g</Text>
      <Text style={styles.macroTileLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  photo: {
    height: 160,
    borderRadius: 20,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoLabel: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 11.5,
    backgroundColor: 'rgba(0,0,0,0.25)',
    paddingVertical: 5,
    paddingHorizontal: 11,
    borderRadius: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    gap: 10,
    marginBottom: 8,
  },
  name: {
    fontSize: 21,
    fontWeight: '800',
    color: Brand.text,
    flexShrink: 1,
  },
  time: {
    fontSize: 12.5,
    color: Brand.textMuted,
    fontWeight: '600',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 18,
  },
  mealChip: {
    backgroundColor: Brand.primaryTint,
    borderRadius: 100,
    paddingVertical: 3,
    paddingHorizontal: 9,
  },
  mealChipText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: Brand.accent,
  },
  cal: {
    fontSize: 13.5,
    color: Brand.textSecondary,
    fontWeight: '700',
  },
  macroGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  macroTile: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 6,
    alignItems: 'center',
    gap: 2,
  },
  macroTileValue: {
    fontSize: 17,
    fontWeight: '800',
  },
  macroTileLabel: {
    fontSize: 10.5,
    fontWeight: '700',
    color: Brand.textSecondary,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },
});
