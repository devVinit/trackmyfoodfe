import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';

import { ApiError } from '@/api/auth';
import { AppBackground } from '@/components/ui/app-background';
import { GlassCard } from '@/components/ui/glass-card';
import { PrimaryButton } from '@/components/ui/primary-button';
import { TextButton } from '@/components/ui/text-button';
import { TextField } from '@/components/ui/text-field';
import { Brand } from '@/constants/theme';
import { useAppState } from '@/context/app-state';

export default function ForgotPasswordScreen() {
  const { requestPasswordReset } = useAppState();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSend() {
    if (submitting) return;
    if (!email.trim()) {
      setError('Enter your email.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      await requestPasswordReset(email.trim());
      setSent(true);
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
          <Text style={styles.title}>Reset password</Text>
          <Text style={styles.subtitle}>Enter your email and we&rsquo;ll send you a reset link.</Text>

          {!sent ? (
            <View style={styles.form}>
              <TextField value={email} onChangeText={setEmail} placeholder="Email" keyboardType="email-address" />
              {error ? <Text style={styles.error}>{error}</Text> : null}
              <PrimaryButton onPress={handleSend} loading={submitting} style={styles.submit}>
                Send reset link
              </PrimaryButton>
            </View>
          ) : (
            <GlassCard style={styles.confirmCard}>
              <View style={styles.checkBadge}>
                <Text style={styles.checkGlyph}>✓</Text>
              </View>
              <Text style={styles.confirmTitle}>Check your inbox</Text>
              <Text style={styles.confirmBody}>We sent a reset link to your email. It expires in 30 minutes.</Text>
            </GlassCard>
          )}

          <View style={styles.backRow}>
            <TextButton onPress={() => router.replace('/sign-in')}>Back to sign in</TextButton>
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
    lineHeight: 21,
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
  confirmCard: {
    alignItems: 'center',
    gap: 10,
  },
  checkBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(138,154,75,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkGlyph: {
    color: Brand.success,
    fontSize: 20,
    fontWeight: '800',
  },
  confirmTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Brand.text,
  },
  confirmBody: {
    fontSize: 14,
    color: Brand.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  backRow: {
    alignItems: 'center',
    marginTop: 24,
  },
});
