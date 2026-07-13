import { StyleSheet, Text, View, type ViewStyle } from 'react-native';

import { Brand } from '@/constants/theme';
import { TextField } from '@/components/ui/text-field';

type Props = {
  label: string;
  labelColor?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  keyboardType?: 'default' | 'numeric';
  solid?: boolean;
  fontSize?: number;
  fontWeight?: '400' | '600' | '700' | '800';
  style?: ViewStyle;
};

export function LabeledField({ label, labelColor = Brand.textSecondary, value, onChangeText, keyboardType, solid, fontSize, fontWeight, style }: Props) {
  return (
    <View style={[styles.wrap, style]}>
      <Text style={[styles.label, { color: labelColor }]}>{label}</Text>
      <TextField value={value} onChangeText={onChangeText} keyboardType={keyboardType} solid={solid} fontSize={fontSize} fontWeight={fontWeight} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 7,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    paddingLeft: 4,
  },
});
