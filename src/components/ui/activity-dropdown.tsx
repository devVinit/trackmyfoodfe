import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { CenterDialog } from '@/components/ui/center-dialog';
import { Brand } from '@/constants/theme';
import type { ActivityLevel } from '@/context/app-state';

const OPTIONS: { value: ActivityLevel; label: string }[] = [
  { value: 'sedentary', label: 'Sedentary (desk job, little exercise)' },
  { value: 'light', label: 'Lightly active (1–3 days/week)' },
  { value: 'moderate', label: 'Moderately active (3–5 days/week)' },
  { value: 'very', label: 'Very active (6–7 days/week)' },
];

const LABELS = Object.fromEntries(OPTIONS.map((o) => [o.value, o.label])) as Record<
  ActivityLevel,
  string
>;

export function activityLabel(value: ActivityLevel): string {
  return LABELS[value];
}

type Props = {
  value: ActivityLevel;
  onChange: (value: ActivityLevel) => void;
};

export function ActivityDropdown({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);

  function select(next: ActivityLevel) {
    onChange(next);
    setOpen(false);
  }

  return (
    <>
      <Pressable style={styles.field} onPress={() => setOpen(true)}>
        <Text style={styles.value} numberOfLines={1}>
          {LABELS[value]}
        </Text>
        <View style={styles.chevron} />
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <CenterDialog onClose={() => setOpen(false)}>
          <Text style={styles.menuTitle}>Activity level</Text>
          <View style={styles.menu}>
            {OPTIONS.map((option) => {
              const active = option.value === value;
              return (
                <Pressable
                  key={option.value}
                  style={[styles.option, active && styles.optionActive]}
                  onPress={() => select(option.value)}>
                  <Text style={[styles.optionText, active && styles.optionTextActive]}>
                    {option.label}
                  </Text>
                  {active ? <Text style={styles.check}>✓</Text> : null}
                </Pressable>
              );
            })}
          </View>
        </CenterDialog>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Brand.inputBg,
    borderWidth: 1,
    borderColor: Brand.border,
    borderRadius: 15,
    paddingVertical: 14,
    paddingLeft: 16,
    paddingRight: 16,
  },
  value: {
    flex: 1,
    fontSize: 15.5,
    color: Brand.text,
  },
  chevron: {
    width: 8,
    height: 8,
    borderRightWidth: 2.5,
    borderBottomWidth: 2.5,
    borderColor: Brand.textSecondary,
    transform: [{ rotate: '45deg' }],
    marginLeft: 10,
    marginTop: -4,
  },
  menuTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: Brand.text,
    marginBottom: 4,
  },
  menu: {
    gap: 8,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(255,255,255,0.55)',
    borderWidth: 1,
    borderColor: Brand.border,
    borderRadius: 14,
    paddingVertical: 13,
    paddingHorizontal: 15,
  },
  optionActive: {
    backgroundColor: Brand.primaryTint,
    borderColor: Brand.primary,
  },
  optionText: {
    flex: 1,
    fontSize: 14.5,
    fontWeight: '600',
    color: Brand.text,
  },
  optionTextActive: {
    color: Brand.accent,
    fontWeight: '700',
  },
  check: {
    fontSize: 15,
    fontWeight: '800',
    color: Brand.accent,
  },
});
