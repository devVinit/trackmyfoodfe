import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, type ViewStyle } from 'react-native';

import { Brand } from '@/constants/theme';

type Variant = 'primary' | 'danger' | 'dangerTint' | 'neutral' | 'ghost';

type Props = {
  children: ReactNode;
  onPress?: () => void;
  variant?: Variant;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle | ViewStyle[];
  flex?: number;
};

const VARIANT_BG: Record<Variant, string> = {
  primary: Brand.primary,
  danger: Brand.danger,
  dangerTint: Brand.dangerTint,
  neutral: 'rgba(180,167,143,0.18)',
  ghost: 'transparent',
};

const VARIANT_PRESSED_BG: Record<Variant, string> = {
  primary: Brand.primaryDark,
  danger: Brand.dangerDark,
  dangerTint: 'rgba(192,57,43,0.18)',
  neutral: 'rgba(180,167,143,0.3)',
  ghost: 'rgba(180,167,143,0.1)',
};

const VARIANT_TEXT: Record<Variant, string> = {
  primary: '#fff',
  danger: '#fff',
  dangerTint: Brand.danger,
  neutral: Brand.text,
  ghost: Brand.textSecondary,
};

export function PrimaryButton({ children, onPress, variant = 'primary', disabled, loading, style, flex }: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor: pressed ? VARIANT_PRESSED_BG[variant] : VARIANT_BG[variant] },
        variant === 'primary' && styles.shadow,
        flex !== undefined && { flex },
        (disabled || loading) && styles.disabled,
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={VARIANT_TEXT[variant]} />
      ) : (
        <Text style={[styles.text, { color: VARIANT_TEXT[variant] }]}>{children}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shadow: {
    shadowColor: Brand.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 4,
  },
  text: {
    fontSize: 17,
    fontWeight: '700',
  },
  disabled: {
    opacity: 0.6,
  },
});
