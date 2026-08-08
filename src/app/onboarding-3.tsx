import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { GlassCard } from '@/components/ui/glass-card';
import { AppBackground } from '@/components/ui/app-background';
import { LabeledField } from '@/components/ui/labeled-field';
import { PrimaryButton } from '@/components/ui/primary-button';
import { ProgressDots } from '@/components/ui/progress-dots';
import { Brand } from '@/constants/theme';
import { useAppState, type ActivityLevel, type Goals } from '@/context/app-state';

function parseGoalNumber(text: string) {
  const v = parseInt(text.replace(/[^0-9]/g, ''), 10);
  return Number.isNaN(v) ? 0 : v;
}

const ACTIVITY_SHORT_LABELS: Record<ActivityLevel, string> = {
  sedentary: 'sedentary',
  light: 'lightly active',
  moderate: 'moderately active',
  very: 'very active',
};

export default function OnboardingConfirmGoalsScreen() {
  const { goals, setGoals, saveGoals, goalsSource, user, advanceOnboarding } = useAppState();

  function setField(key: keyof Goals) {
    return (text: string) => setGoals({ ...goals, [key]: parseGoalNumber(text) });
  }

  async function handleContinue() {
    try {
      await saveGoals();
    } catch {
      // Best-effort — same rationale as advanceOnboarding: the goals stay in
      // local state either way, and the profile tab lets them be re-saved.
    }
    void advanceOnboarding(4);
    router.push('/onboarding-4');
  }

  const sourceLabel =
    goalsSource === 'bca'
      ? 'Parsed by AI from your BCA report'
      : `Calculated · Mifflin-St Jeor · ${ACTIVITY_SHORT_LABELS[user.activity]}`;

  return (
    <AppBackground>
      <ScrollView contentContainerStyle={styles.container}>
        <ProgressDots total={4} current={3} />
        <Text style={styles.title}>Your daily targets</Text>
        <View style={styles.sourceChip}>
          <Text style={styles.sourceChipText}>{sourceLabel}</Text>
        </View>

        <GlassCard style={styles.card}>
          <LabeledField
            label="Calories / day"
            value={String(goals.calories)}
            onChangeText={setField('calories')}
            keyboardType="numeric"
            solid
            fontSize={22}
            fontWeight="800"
          />
          <View style={styles.grid}>
            <LabeledField label="Protein g" labelColor={Brand.protein} value={String(goals.protein)} onChangeText={setField('protein')} keyboardType="numeric" solid fontSize={17} fontWeight="700" style={styles.gridItem} />
            <LabeledField label="Fat g" labelColor={Brand.fat} value={String(goals.fat)} onChangeText={setField('fat')} keyboardType="numeric" solid fontSize={17} fontWeight="700" style={styles.gridItem} />
            <LabeledField label="Carbs g" labelColor={Brand.carbs} value={String(goals.carbs)} onChangeText={setField('carbs')} keyboardType="numeric" solid fontSize={17} fontWeight="700" style={styles.gridItem} />
            <LabeledField label="Fiber g" labelColor={Brand.fiber} value={String(goals.fiber)} onChangeText={setField('fiber')} keyboardType="numeric" solid fontSize={17} fontWeight="700" style={styles.gridItem} />
          </View>
        </GlassCard>

        <Text style={styles.footnote}>You can change these anytime from your profile.</Text>

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
    marginBottom: 8,
    color: Brand.text,
  },
  sourceChip: {
    alignSelf: 'flex-start',
    backgroundColor: Brand.primaryTint,
    borderRadius: 100,
    paddingVertical: 5,
    paddingHorizontal: 11,
    marginBottom: 22,
  },
  sourceChipText: {
    color: Brand.accent,
    fontSize: 12.5,
    fontWeight: '700',
  },
  card: {
    gap: 14,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  gridItem: {
    flexBasis: '47%',
    flexGrow: 1,
  },
  footnote: {
    fontSize: 13,
    color: Brand.textMuted,
    marginTop: 14,
    lineHeight: 19,
    textAlign: 'center',
  },
  continue: {
    marginTop: 'auto',
  },
});
