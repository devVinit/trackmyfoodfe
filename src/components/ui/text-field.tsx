import { useState } from 'react';
import { StyleSheet, TextInput, View, type KeyboardTypeOptions, type ViewStyle } from 'react-native';

import { Brand } from '@/constants/theme';

type Props = {
  value?: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  solid?: boolean;
  fontSize?: number;
  fontWeight?: '400' | '600' | '700' | '800';
  style?: ViewStyle;
};

export function TextField({
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType,
  autoCapitalize = 'none',
  solid,
  fontSize = 16,
  fontWeight = '400',
  style,
}: Props) {
  const [focused, setFocused] = useState(false);
  return (
    <View
      style={[
        styles.wrap,
        { backgroundColor: solid ? Brand.inputBgSolid : Brand.inputBg },
        { borderColor: focused ? Brand.primary : Brand.border },
        style,
      ]}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Brand.textMuted}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={[styles.input, { fontSize, fontWeight, color: Brand.text }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderWidth: 1,
    borderRadius: 15,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  input: {
    paddingVertical: 15,
  },
});
