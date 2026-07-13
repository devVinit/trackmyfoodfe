import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';

import { AppBackground } from '@/components/ui/app-background';
import { PrimaryButton } from '@/components/ui/primary-button';
import { TextButton } from '@/components/ui/text-button';
import { TextField } from '@/components/ui/text-field';
import { Brand } from '@/constants/theme';

export default function SignUpScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  return (
    <AppBackground>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <View style={styles.container}>
          <Text style={styles.title}>Create account</Text>
          <Text style={styles.subtitle}>Start tracking in under a minute.</Text>

          <View style={styles.form}>
            <TextField value={email} onChangeText={setEmail} placeholder="Email" keyboardType="email-address" />
            <TextField value={password} onChangeText={setPassword} placeholder="Password" secureTextEntry />
            <TextField value={confirm} onChangeText={setConfirm} placeholder="Confirm password" secureTextEntry />
            <PrimaryButton onPress={() => router.push('/onboarding-1')} style={styles.submit}>
              Continue
            </PrimaryButton>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account?</Text>
            <TextButton onPress={() => router.replace('/sign-in')} size={15}>
              Sign in
            </TextButton>
          </View>
        </View>
      </KeyboardAvoidingView>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: {
    flex: 1,
    paddingHorizontal: 26,
    paddingTop: 90,
    paddingBottom: 40,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 6,
    color: Brand.text,
  },
  subtitle: {
    fontSize: 15,
    color: Brand.textSecondary,
    marginBottom: 28,
  },
  form: {
    gap: 12,
  },
  submit: {
    marginTop: 6,
  },
  footer: {
    marginTop: 'auto',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  footerText: {
    fontSize: 15,
    color: Brand.textSecondary,
  },
});
