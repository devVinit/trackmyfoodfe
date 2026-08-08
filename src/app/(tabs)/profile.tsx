import * as DocumentPicker from 'expo-document-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { ApiError } from '@/api/auth';
import { scanBcaReport } from '@/api/bca';
import { AppBackground } from '@/components/ui/app-background';
import { CenterDialog } from '@/components/ui/center-dialog';
import { GenderToggle } from '@/components/ui/gender-toggle';
import { GlassCard } from '@/components/ui/glass-card';
import { LabeledField } from '@/components/ui/labeled-field';
import { PrimaryButton } from '@/components/ui/primary-button';
import { TextField } from '@/components/ui/text-field';
import { Brand } from '@/constants/theme';
import { goalsFromApi, reportFromApi, useAppState, type Goals } from '@/context/app-state';
import { useTabBarMetrics } from '@/hooks/use-tab-bar-metrics';
import { initialsOf } from '@/utils/format';

function parseGoalNumber(text: string) {
  const v = parseInt(text.replace(/[^0-9]/g, ''), 10);
  return Number.isNaN(v) ? 0 : v;
}

export default function ProfileScreen() {
  const {
    user,
    updateUser,
    saveProfile,
    goals,
    setGoals,
    saveGoals,
    applyBcaGoals,
    reports,
    addReport,
    reanalysingIndex,
    reanalyseReport,
    showToast,
    logout,
    deleteAccount,
  } = useAppState();
  const [editingProfile, setEditingProfile] = useState(false);
  const [editingGoals, setEditingGoals] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingGoals, setSavingGoals] = useState(false);
  const [uploadingReport, setUploadingReport] = useState(false);
  const tabBar = useTabBarMetrics();

  function setGoalField(key: keyof Goals) {
    return (text: string) => setGoals({ ...goals, [key]: parseGoalNumber(text) });
  }

  async function handleSaveProfile() {
    setSavingProfile(true);
    try {
      await saveProfile();
      setEditingProfile(false);
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Could not save profile');
    } finally {
      setSavingProfile(false);
    }
  }

  async function toggleEditingGoals() {
    if (!editingGoals) {
      setEditingGoals(true);
      return;
    }
    setSavingGoals(true);
    try {
      await saveGoals();
      setEditingGoals(false);
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Could not save goals');
    } finally {
      setSavingGoals(false);
    }
  }

  async function uploadReport() {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['image/jpeg', 'image/png', 'application/pdf'],
    });
    if (result.canceled) return;
    const asset = result.assets[0];

    setUploadingReport(true);
    try {
      const scan = await scanBcaReport(
        { uri: asset.uri, name: asset.name, mimeType: asset.mimeType ?? 'application/pdf', webFile: asset.file },
        user.activity,
        user.gender,
      );
      addReport(reportFromApi(scan.report));
      applyBcaGoals(goalsFromApi(scan.goals));
      showToast('Report parsed by AI');
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Could not read that file. Try again?');
    } finally {
      setUploadingReport(false);
    }
  }

  function handleLogout() {
    logout();
    router.replace('/sign-in');
  }

  async function handleDeleteConfirm() {
    setShowDelete(false);
    await deleteAccount();
    showToast('Account deleted');
    router.replace('/sign-in');
  }

  return (
    <AppBackground>
      <ScrollView contentContainerStyle={[styles.container, { paddingBottom: tabBar.clearance + 24 }]}>
        <Text style={styles.title}>Profile</Text>

        <GlassCard style={styles.card}>
          {!editingProfile ? (
            <View style={styles.profileRow}>
              <LinearGradient colors={[Brand.primaryLight, Brand.primaryDark]} style={styles.avatar}>
                <Text style={styles.avatarText}>{initialsOf(user.name)}</Text>
              </LinearGradient>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{user.name}</Text>
                <Text style={styles.profileSummary}>
                  {user.age} yrs · {user.height} cm · {user.weight} kg · {user.gender === 'male' ? 'Male' : 'Female'}
                </Text>
              </View>
              <Pressable style={styles.editPill} onPress={() => setEditingProfile(true)}>
                <Text style={styles.editPillText}>Edit</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.editForm}>
              <TextField value={user.name} onChangeText={(v) => updateUser({ name: v })} solid />
              <View style={styles.row3}>
                <TextField value={user.age} onChangeText={(v) => updateUser({ age: v })} keyboardType="numeric" solid style={styles.flex} />
                <TextField value={user.height} onChangeText={(v) => updateUser({ height: v })} keyboardType="numeric" solid style={styles.flex} />
                <TextField value={user.weight} onChangeText={(v) => updateUser({ weight: v })} keyboardType="numeric" solid style={styles.flex} />
              </View>
              <GenderToggle value={user.gender} onChange={(g) => updateUser({ gender: g })} compact />
              <PrimaryButton onPress={handleSaveProfile} loading={savingProfile}>
                Save changes
              </PrimaryButton>
            </View>
          )}
        </GlassCard>

        <GlassCard style={styles.card}>
          <View style={styles.goalsHeader}>
            <Text style={styles.sectionLabel}>Daily goals</Text>
            <Pressable
              style={editingGoals ? styles.donePill : styles.editPill}
              onPress={toggleEditingGoals}
              disabled={savingGoals}>
              <Text style={editingGoals ? styles.donePillText : styles.editPillText}>
                {savingGoals ? 'Saving…' : editingGoals ? 'Done' : 'Edit'}
              </Text>
            </Pressable>
          </View>

          {!editingGoals ? (
            <View style={styles.goalsGrid}>
              <GoalStat value={goals.calories} label="kcal" />
              <GoalStat value={goals.protein} label="protein" color={Brand.protein} />
              <GoalStat value={goals.fat} label="fat" color={Brand.fat} />
              <GoalStat value={goals.carbs} label="carbs" color={Brand.carbs} />
              <GoalStat value={goals.fiber} label="fiber" color={Brand.fiber} />
            </View>
          ) : (
            <View style={styles.goalsEditGrid}>
              <LabeledField label="Calories" value={String(goals.calories)} onChangeText={setGoalField('calories')} keyboardType="numeric" solid fontWeight="700" style={styles.goalsFullWidth} />
              <LabeledField label="Protein g" labelColor={Brand.protein} value={String(goals.protein)} onChangeText={setGoalField('protein')} keyboardType="numeric" solid fontWeight="700" style={styles.goalsHalf} />
              <LabeledField label="Fat g" labelColor={Brand.fat} value={String(goals.fat)} onChangeText={setGoalField('fat')} keyboardType="numeric" solid fontWeight="700" style={styles.goalsHalf} />
              <LabeledField label="Carbs g" labelColor={Brand.carbs} value={String(goals.carbs)} onChangeText={setGoalField('carbs')} keyboardType="numeric" solid fontWeight="700" style={styles.goalsHalf} />
              <LabeledField label="Fiber g" labelColor={Brand.fiber} value={String(goals.fiber)} onChangeText={setGoalField('fiber')} keyboardType="numeric" solid fontWeight="700" style={styles.goalsHalf} />
            </View>
          )}
        </GlassCard>

        <View style={styles.reportsHeader}>
          <Text style={styles.logTitle}>BCA reports</Text>
          <Pressable style={styles.uploadPill} onPress={uploadReport} disabled={uploadingReport}>
            <Text style={styles.uploadPillText}>{uploadingReport ? 'Parsing with AI…' : '+ Upload new'}</Text>
          </Pressable>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.reportsScroll}>
          {reports.map((r, i) => (
            <View key={r.id} style={styles.reportCard}>
              <View style={styles.reportTop}>
                <Text style={styles.reportDate}>{r.date}</Text>
                <View style={styles.parsedChip}>
                  <Text style={styles.parsedChipText}>Parsed</Text>
                </View>
              </View>
              <View style={styles.reportGrid}>
                <ReportStat value={`${r.weight}`} label="weight kg" />
                <ReportStat value={`${r.fat}%`} label="body fat" />
                <ReportStat value={`${r.muscle}`} label="muscle kg" />
                <ReportStat value={`${r.bmr}`} label="BMR kcal" />
              </View>
              <Pressable style={styles.reanalyseButton} onPress={() => reanalyseReport(i)} disabled={reanalysingIndex !== null}>
                <Text style={styles.reanalyseText}>
                  {reanalysingIndex === i ? 'Analysing with AI…' : 'Re-analyse with AI'}
                </Text>
              </Pressable>
            </View>
          ))}
        </ScrollView>

        <GlassCard style={[styles.card, styles.settingsCard]}>
          <Pressable style={styles.settingsRow} onPress={() => router.push('/change-password')}>
            <Text style={styles.settingsRowText}>Change password</Text>
            <Text style={styles.chevron}>›</Text>
          </Pressable>
          <Pressable style={[styles.settingsRow, styles.settingsRowLast]} onPress={() => setShowDelete(true)}>
            <Text style={styles.settingsRowDanger}>Delete account</Text>
            <Text style={styles.chevron}>›</Text>
          </Pressable>
        </GlassCard>

        <Pressable style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Log out</Text>
        </Pressable>
      </ScrollView>

      <Modal visible={showDelete} transparent animationType="fade" onRequestClose={() => setShowDelete(false)}>
        <CenterDialog onClose={() => setShowDelete(false)}>
          <Text style={styles.dialogTitle}>Delete account?</Text>
          <Text style={styles.dialogBody}>Are you sure? All your data will be permanently erased. This action cannot be undone.</Text>
          <View style={styles.dialogRow}>
            <PrimaryButton variant="neutral" flex={1} onPress={() => setShowDelete(false)}>
              Cancel
            </PrimaryButton>
            <PrimaryButton variant="danger" flex={1} onPress={handleDeleteConfirm}>
              Delete
            </PrimaryButton>
          </View>
        </CenterDialog>
      </Modal>
    </AppBackground>
  );
}

function GoalStat({ value, label, color = Brand.text }: { value: number; label: string; color?: string }) {
  return (
    <View style={styles.goalStat}>
      <Text style={[styles.goalStatValue, { color }]}>{value}</Text>
      <Text style={styles.goalStatLabel}>{label}</Text>
    </View>
  );
}

function ReportStat({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.reportStat}>
      <Text style={styles.reportStatValue}>{value}</Text>
      <Text style={styles.reportStatLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 74,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 18,
    color: Brand.text,
  },
  card: {
    marginBottom: 14,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 21,
    fontWeight: '800',
  },
  profileInfo: {
    flex: 1,
    gap: 3,
    minWidth: 0,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '800',
    color: Brand.text,
  },
  profileSummary: {
    fontSize: 13.5,
    color: Brand.textSecondary,
    fontWeight: '600',
  },
  editPill: {
    backgroundColor: Brand.primaryTint,
    borderRadius: 100,
    paddingVertical: 9,
    paddingHorizontal: 15,
  },
  editPillText: {
    color: Brand.accent,
    fontSize: 13.5,
    fontWeight: '700',
  },
  donePill: {
    backgroundColor: Brand.primary,
    borderRadius: 100,
    paddingVertical: 7,
    paddingHorizontal: 15,
  },
  donePillText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  editForm: {
    gap: 12,
  },
  row3: {
    flexDirection: 'row',
    gap: 10,
  },
  flex: {
    flex: 1,
  },
  goalsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Brand.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  goalsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  goalStat: {
    alignItems: 'center',
    gap: 2,
  },
  goalStatValue: {
    fontSize: 17,
    fontWeight: '800',
  },
  goalStatLabel: {
    fontSize: 10.5,
    fontWeight: '700',
    color: Brand.textSecondary,
  },
  goalsEditGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  goalsFullWidth: {
    flexBasis: '100%',
  },
  goalsHalf: {
    flexBasis: '47%',
    flexGrow: 1,
  },
  reportsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  logTitle: {
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: -0.3,
    color: Brand.text,
  },
  uploadPill: {
    backgroundColor: Brand.primaryTint,
    borderRadius: 100,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  uploadPillText: {
    color: Brand.accent,
    fontSize: 13,
    fontWeight: '700',
  },
  reportsScroll: {
    gap: 10,
    paddingBottom: 6,
    marginBottom: 22,
  },
  reportCard: {
    width: 196,
    backgroundColor: Brand.cardBg,
    borderWidth: 1,
    borderColor: Brand.cardBorder,
    borderRadius: 20,
    padding: 16,
    gap: 10,
    shadowColor: Brand.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 14,
    elevation: 2,
  },
  reportTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reportDate: {
    fontSize: 13,
    fontWeight: '800',
    color: Brand.text,
  },
  parsedChip: {
    backgroundColor: Brand.successTint,
    borderRadius: 100,
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  parsedChipText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: Brand.success,
  },
  reportGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  reportStat: {
    flexBasis: '47%',
    gap: 1,
  },
  reportStatValue: {
    fontSize: 15,
    fontWeight: '800',
    color: Brand.text,
  },
  reportStatLabel: {
    fontSize: 10.5,
    fontWeight: '600',
    color: Brand.textSecondary,
  },
  reanalyseButton: {
    backgroundColor: Brand.primaryTint,
    borderRadius: 12,
    paddingVertical: 9,
    alignItems: 'center',
  },
  reanalyseText: {
    fontSize: 12,
    fontWeight: '700',
    color: Brand.accent,
  },
  settingsCard: {
    padding: 0,
    overflow: 'hidden',
  },
  settingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 17,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: Brand.borderLight,
  },
  settingsRowLast: {
    borderBottomWidth: 0,
  },
  settingsRowText: {
    fontSize: 16,
    fontWeight: '600',
    color: Brand.text,
  },
  settingsRowDanger: {
    fontSize: 16,
    fontWeight: '600',
    color: Brand.danger,
  },
  chevron: {
    fontSize: 18,
    color: Brand.textMuted,
  },
  logoutButton: {
    marginTop: 14,
    backgroundColor: 'rgba(255,255,255,0.55)',
    borderWidth: 1,
    borderColor: Brand.border,
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: 'center',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '700',
    color: Brand.textSecondary,
  },
  dialogTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: Brand.text,
  },
  dialogBody: {
    fontSize: 14.5,
    color: Brand.textSecondary,
    lineHeight: 20,
  },
  dialogRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
});
