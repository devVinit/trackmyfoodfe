import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { ActivityDropdown } from '@/components/ui/activity-dropdown';
import { AppBackground } from '@/components/ui/app-background';
import { GenderToggle } from '@/components/ui/gender-toggle';
import { LabeledField } from '@/components/ui/labeled-field';
import { PrimaryButton } from '@/components/ui/primary-button';
import { ProgressDots } from '@/components/ui/progress-dots';
import { Brand } from '@/constants/theme';
import { useAppState } from '@/context/app-state';

export default function OnboardingPersonalInfoScreen() {
  const { user, updateUser, saveProfile, advanceOnboarding } = useAppState();

  async function handleContinue() {
    try {
      await saveProfile();
    } catch {
      // Best-effort — see advanceOnboarding's rationale below; the fields
      // stay in local state either way, and the profile tab lets it be
      // re-saved later.
    }
    void advanceOnboarding(2);
    router.push('/onboarding-2');
  }

  return (
    <AppBackground>
      <ScrollView contentContainerStyle={styles.container}>
        <ProgressDots total={4} current={1} />
        <Text style={styles.title}>Tell us about you</Text>
        <Text style={styles.subtitle}>We use this to calculate your daily targets.</Text>

        <View style={styles.form}>
          <LabeledField label="Name" value={user.name} onChangeText={(v) => updateUser({ name: v })} />
          <View style={styles.row}>
            <LabeledField label="Age" value={user.age} onChangeText={(v) => updateUser({ age: v })} keyboardType="numeric" style={styles.flex} />
            <LabeledField label="Height cm" value={user.height} onChangeText={(v) => updateUser({ height: v })} keyboardType="numeric" style={styles.flex} />
            <LabeledField label="Weight kg" value={user.weight} onChangeText={(v) => updateUser({ weight: v })} keyboardType="numeric" style={styles.flex} />
          </View>
          <View style={styles.genderField}>
            <Text style={styles.genderLabel}>Gender</Text>
            <GenderToggle value={user.gender} onChange={(g) => updateUser({ gender: g })} />
          </View>
          <View style={styles.genderField}>
            <Text style={styles.genderLabel}>Activity level</Text>
            <ActivityDropdown value={user.activity} onChange={(a) => updateUser({ activity: a })} />
          </View>
        </View>

        <PrimaryButton onPress={handleContinue} style={styles.continue}>
          Continue
        </PrimaryButton>
      </ScrollView>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
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
  },
  form: {
    gap: 14,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  flex: {
    flex: 1,
  },
  genderField: {
    gap: 7,
  },
  genderLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Brand.textSecondary,
    paddingLeft: 4,
  },
  continue: {
    marginTop: 'auto',
  },
});
