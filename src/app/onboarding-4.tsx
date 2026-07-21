import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppBackground } from '@/components/ui/app-background';
import { PrimaryButton } from '@/components/ui/primary-button';
import { ProgressDots } from '@/components/ui/progress-dots';
import { TextButton } from '@/components/ui/text-button';
import { Brand } from '@/constants/theme';
import { useAppState, type HealthProvider } from '@/context/app-state';

export default function OnboardingHealthSyncScreen() {
  const { healthProvider, setHealthProvider, showToast } = useAppState();

  function toggle(provider: HealthProvider) {
    setHealthProvider(healthProvider === provider ? null : provider);
  }

  function finish() {
    if (healthProvider) {
      showToast(`Synced with ${healthProvider === 'apple' ? 'Apple Health' : 'Health Connect'}`);
    }
    router.replace('/(tabs)/home');
  }

  function skip() {
    setHealthProvider(null);
    router.replace('/(tabs)/home');
  }

  return (
    <AppBackground>
      <View style={styles.container}>
        <ProgressDots total={4} current={4} />
        <Text style={styles.title}>Sync your activity</Text>
        <Text style={styles.subtitle}>
          Connect your health app to see net calories — consumed minus burned. Optional.
        </Text>

        <View style={styles.list}>
          <HealthOption
            title="Apple Health"
            subtitle="iOS · active + resting energy"
            dotColor="#E85D75"
            active={healthProvider === 'apple'}
            onPress={() => toggle('apple')}
          />
          <HealthOption
            title="Google Health Connect"
            subtitle="Android · active + resting energy"
            dotColor="#4C8BF5"
            active={healthProvider === 'google'}
            onPress={() => toggle('google')}
          />
        </View>

        <Text style={styles.footnote}>
          The app works fully without syncing — you&rsquo;ll see calories consumed only.
        </Text>

        <PrimaryButton onPress={finish} style={styles.startButton}>
          Start tracking
        </PrimaryButton>
        <TextButton onPress={skip} color={Brand.textSecondary} bold={false} size={15} style={styles.skip}>
          Skip for now
        </TextButton>
      </View>
    </AppBackground>
  );
}

function HealthOption({
  title,
  subtitle,
  dotColor,
  active,
  onPress,
}: {
  title: string;
  subtitle: string;
  dotColor: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.option, active && styles.optionActive]}>
      <View style={styles.optionIcon}>
        <View style={[styles.optionDot, { backgroundColor: dotColor }]} />
      </View>
      <View style={styles.optionText}>
        <Text style={styles.optionTitle}>{title}</Text>
        <Text style={styles.optionSubtitle}>{subtitle}</Text>
      </View>
      <Text style={[styles.optionStatus, { color: active ? Brand.success : Brand.textMuted }]}>
        {active ? 'Connected ✓' : 'Tap to connect'}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 26,
    paddingTop: 84,
    paddingBottom: 36,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 6,
    color: Brand.text,
  },
  subtitle: {
    fontSize: 15,
    color: Brand.textSecondary,
    marginBottom: 26,
    lineHeight: 21,
  },
  list: {
    gap: 12,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: 'rgba(255,255,255,0.62)',
    borderWidth: 1,
    borderColor: Brand.cardBorder,
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 18,
    shadowColor: Brand.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 14,
    elevation: 2,
  },
  optionActive: {
    borderWidth: 2,
    borderColor: Brand.primary,
  },
  optionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#654E2D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 2,
  },
  optionDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
  },
  optionText: {
    flex: 1,
    gap: 2,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Brand.text,
  },
  optionSubtitle: {
    fontSize: 12.5,
    fontWeight: '600',
    color: Brand.textSecondary,
  },
  optionStatus: {
    fontSize: 12,
    fontWeight: '700',
  },
  footnote: {
    fontSize: 13,
    color: Brand.textMuted,
    marginTop: 16,
    lineHeight: 19,
    textAlign: 'center',
  },
  startButton: {
    marginTop: 'auto',
  },
  skip: {
    alignSelf: 'center',
    marginTop: 10,
    padding: 8,
  },
});
