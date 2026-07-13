import { Pressable, StyleSheet, Text, type TextStyle } from 'react-native';

import { Brand } from '@/constants/theme';

type Props = {
  children: string;
  onPress?: () => void;
  color?: string;
  bold?: boolean;
  size?: number;
  style?: TextStyle;
};

export function TextButton({ children, onPress, color = Brand.accent, bold = true, size = 15, style }: Props) {
  return (
    <Pressable onPress={onPress} hitSlop={8}>
      {({ pressed }) => (
        <Text style={[styles.text, { color, fontSize: size, fontWeight: bold ? '700' : '600', opacity: pressed ? 0.6 : 1 }, style]}>
          {children}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  text: {},
});
