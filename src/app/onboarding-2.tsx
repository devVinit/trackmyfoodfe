import * as DocumentPicker from 'expo-document-picker';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { scanBcaReport } from '@/api/bca';
import { ApiError } from '@/api/auth';
import { AppBackground } from '@/components/ui/app-background';
import { GlassCard } from '@/components/ui/glass-card';
import { ProgressDots } from '@/components/ui/progress-dots';
import { ShimmerBar } from '@/components/ui/shimmer-bar';
import { TextButton } from '@/components/ui/text-button';
import { Brand } from '@/constants/theme';
import { useAppState } from '@/context/app-state';

function formatReportDate(isoDate: string) {
  return new Date(isoDate).toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  });
}

export default function OnboardingBcaUploadScreen() {
  const { user, applyBcaGoals, applyCalculatedGoals, addReport, showToast, advanceOnboarding } =
    useAppState();
  const [parsing, setParsing] = useState(false);

  async function handleUpload() {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['image/jpeg', 'image/png', 'application/pdf'],
    });
    if (result.canceled) return;
    const asset = result.assets[0];

    setParsing(true);
    try {
      const scan = await scanBcaReport(
        {
          uri: asset.uri,
          name: asset.name,
          mimeType: asset.mimeType ?? 'application/pdf',
          webFile: asset.file,
        },
        user.activity,
        user.gender,
      );
      applyBcaGoals({
        calories: scan.goals.calories,
        protein: scan.goals.protein_g,
        fat: scan.goals.fat_g,
        carbs: scan.goals.carbs_g,
        fiber: scan.goals.fiber_g,
      });
      addReport({
        date: formatReportDate(scan.report.report_date),
        weight: String(scan.report.weight_kg),
        fat: scan.report.body_fat_pct.toFixed(1),
        muscle: scan.report.muscle_mass_kg.toFixed(1),
        bmr: scan.report.bmr_kcal.toLocaleString('en-US'),
      });
      void advanceOnboarding(3);
      router.push('/onboarding-3');
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Could not read that file. Try again?';
      showToast(message);
    } finally {
      setParsing(false);
    }
  }

  function handleSkip() {
    applyCalculatedGoals();
    void advanceOnboarding(3);
    router.push('/onboarding-3');
  }

  return (
    <AppBackground>
      <View style={styles.container}>
        <ProgressDots total={4} current={2} />
        <Text style={styles.title}>Have a body scan?</Text>
        <Text style={styles.subtitle}>
          Upload a body composition report and AI will set your macro targets from it. Optional.
        </Text>

        {!parsing ? (
          <Pressable style={styles.uploadBox} onPress={handleUpload}>
            <View style={styles.uploadIconWrap}>
              <View style={styles.docIcon}>
                <View style={[styles.docLine, { top: 6 }]} />
                <View style={[styles.docLine, { top: 11 }]} />
                <View style={[styles.docLine, { top: 16, width: 7 }]} />
              </View>
            </View>
            <Text style={styles.uploadTitle}>Upload BCA report</Text>
            <Text style={styles.uploadHint}>JPEG, PNG or PDF</Text>
          </Pressable>
        ) : (
          <GlassCard style={styles.parsingCard}>
            <ShimmerBar width="100%" />
            <ShimmerBar width="75%" />
            <ShimmerBar width="88%" />
            <Text style={styles.parsingLabel}>Parsing your report with AI…</Text>
          </GlassCard>
        )}

        <TextButton onPress={handleSkip} color={Brand.textSecondary} bold={false} size={15.5} style={styles.skip}>
          Skip — calculate for me instead
        </TextButton>
      </View>
    </AppBackground>
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
  uploadBox: {
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: 'rgba(200,90,27,0.45)',
    borderRadius: 22,
    paddingVertical: 36,
    paddingHorizontal: 24,
    alignItems: 'center',
    gap: 12,
  },
  uploadIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: Brand.primaryTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  docIcon: {
    width: 22,
    height: 28,
    borderRadius: 4,
    borderWidth: 2.5,
    borderColor: Brand.primary,
  },
  docLine: {
    position: 'absolute',
    left: 3,
    width: 11,
    height: 2.5,
    backgroundColor: Brand.primary,
    borderRadius: 2,
  },
  uploadTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Brand.text,
  },
  uploadHint: {
    fontSize: 13.5,
    color: Brand.textSecondary,
  },
  parsingCard: {
    alignItems: 'center',
    gap: 16,
  },
  parsingLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: Brand.textSecondary,
    marginTop: 4,
  },
  skip: {
    marginTop: 'auto',
    alignSelf: 'center',
    padding: 14,
  },
});
