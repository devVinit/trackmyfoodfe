import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';

import { ApiError } from '@/api/auth';
import { AppBackground } from '@/components/ui/app-background';
import { PrimaryButton } from '@/components/ui/primary-button';
import { TextButton } from '@/components/ui/text-button';
import { TextField } from '@/components/ui/text-field';
import { Brand } from '@/constants/theme';
import { useAppState } from '@/context/app-state';

export default function SignUpScreen() {
  const { signUp } = useAppState();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSignUp() {
    if (submitting) return;
    if (!email.trim() || !password) {
      setError('Enter your email and a password.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      await signUp(email.trim(), password, confirm);
      router.replace('/onboarding-1');
    } catch (e) {
      setError(
        e instanceof ApiError ? e.message : 'Something went wrong. Please try again.',
      );
    } finally {
      setSubmitting(false);
    }
  }

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
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <PrimaryButton onPress={handleSignUp} loading={submitting} style={styles.submit}>
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
  error: {
    fontSize: 13.5,
    color: Brand.danger,
    fontWeight: '600',
    paddingHorizontal: 4,
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
