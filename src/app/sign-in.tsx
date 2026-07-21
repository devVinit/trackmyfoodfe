import { LinearGradient } from 'expo-linear-gradient';
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

export default function SignInScreen() {
  const { signIn } = useAppState();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSignIn() {
    if (submitting) return;
    if (!email.trim() || !password) {
      setError('Enter your email and password.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      await signIn(email.trim(), password);
      router.replace('/(tabs)/home');
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
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}>
        <View style={styles.container}>
          <View style={styles.header}>
            <LinearGradient colors={[Brand.primaryLight, Brand.primaryDark]} style={styles.mark}>
              <View style={styles.markStrap} />
              <View style={styles.markBody} />
            </LinearGradient>
            <Text style={styles.title}>TrackMyFood</Text>
            <Text style={styles.subtitle}>Point. Shoot. Track your macros.</Text>
          </View>

          <View style={styles.form}>
            <TextField value={email} onChangeText={setEmail} placeholder="Email" keyboardType="email-address" />
            <TextField value={password} onChangeText={setPassword} placeholder="Password" secureTextEntry />
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <PrimaryButton onPress={handleSignIn} loading={submitting} style={styles.submit}>
              Sign In
            </PrimaryButton>
          </View>

          <View style={styles.forgotRow}>
            <TextButton onPress={() => router.push('/forgot-password')}>Forgot password?</TextButton>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>New here?</Text>
            <TextButton onPress={() => router.push('/sign-up')} size={15}>
              Create account
            </TextButton>
          </View>
        </View>
      </KeyboardAvoidingView>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 26,
    paddingTop: 110,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    gap: 14,
    marginBottom: 40,
  },
  mark: {
    width: 68,
    height: 68,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Brand.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 4,
  },
  markStrap: {
    position: 'absolute',
    top: 16,
    width: 34,
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.95)',
  },
  markBody: {
    width: 34,
    height: 17,
    borderRadius: 17,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    backgroundColor: 'rgba(255,255,255,0.95)',
    marginTop: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
    color: Brand.text,
  },
  subtitle: {
    fontSize: 15,
    color: Brand.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
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
  forgotRow: {
    alignItems: 'center',
    marginTop: 16,
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
