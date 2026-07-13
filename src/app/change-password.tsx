import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { BottomSheet } from '@/components/ui/bottom-sheet';
import { PrimaryButton } from '@/components/ui/primary-button';
import { TextField } from '@/components/ui/text-field';
import { Brand } from '@/constants/theme';
import { useAppState } from '@/context/app-state';

export default function ChangePasswordScreen() {
  const { showToast } = useAppState();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');

  function close() {
    router.back();
  }

  function save() {
    close();
    showToast('Password updated');
  }

  return (
    <BottomSheet onClose={close} scroll={false}>
      <Text style={styles.title}>Change password</Text>
      <View style={styles.form}>
        <TextField value={current} onChangeText={setCurrent} placeholder="Current password" secureTextEntry />
        <TextField value={next} onChangeText={setNext} placeholder="New password" secureTextEntry />
        <TextField value={confirm} onChangeText={setConfirm} placeholder="Confirm new password" secureTextEntry />
        <PrimaryButton onPress={save} style={styles.submit}>
          Update password
        </PrimaryButton>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 21,
    fontWeight: '800',
    marginBottom: 18,
    color: Brand.text,
  },
  form: {
    gap: 11,
  },
  submit: {
    marginTop: 6,
  },
});
