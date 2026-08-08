import { CameraView, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

import { ApiError } from '@/api/auth';
import { scanFoodPhoto, type ScannedFoodItem } from '@/api/food-logs';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { PillChip } from '@/components/ui/pill-chip';
import { PrimaryButton } from '@/components/ui/primary-button';
import { TextField } from '@/components/ui/text-field';
import { Brand } from '@/constants/theme';
import { useAppState, type Meal } from '@/context/app-state';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type CamState = 'idle' | 'analyzing' | 'result';

const MEALS: Meal[] = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

type ScanForm = {
  name: string;
  serving: string;
  calories: string;
  protein: string;
  fat: string;
  carbs: string;
  fiber: string;
  meal: Meal;
};

const EMPTY_SCAN: ScanForm = {
  name: '',
  serving: '',
  calories: '',
  protein: '',
  fat: '',
  carbs: '',
  fiber: '',
  meal: 'Lunch',
};

function defaultMealForNow(): Meal {
  const hour = new Date().getHours();
  if (hour < 11) return 'Breakfast';
  if (hour < 16) return 'Lunch';
  if (hour < 19) return 'Snack';
  return 'Dinner';
}

export default function ScanScreen() {
  const insets = useSafeAreaInsets();
  const { addLogEntry, showToast } = useAppState();
  const [permission, requestPermission] = useCameraPermissions();
  const [state, setState] = useState<CamState>('idle');
  const [cameraReady, setCameraReady] = useState(false);
  const [scan, setScan] = useState<ScanForm>(EMPTY_SCAN);
  const [items, setItems] = useState<ScannedFoodItem[]>([]);
  const [photoKey, setPhotoKey] = useState<string | undefined>(undefined);
  const cameraRef = useRef<CameraView>(null);

  useEffect(() => {
    if (!permission) requestPermission();
  }, [permission, requestPermission]);

  function close() {
    router.back();
  }

  async function shoot() {
    if (!cameraRef.current || !cameraReady) return;
    setState('analyzing');
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.6 });
      if (!photo) throw new Error('capture-failed');
      const result = await scanFoodPhoto({ uri: photo.uri, format: photo.format });
      setScan({
        name: result.name,
        serving: String(result.serving_g),
        calories: String(result.calories),
        protein: String(result.protein_g),
        fat: String(result.fat_g),
        carbs: String(result.carbs_g),
        fiber: String(result.fiber_g),
        meal: defaultMealForNow(),
      });
      setItems(result.items);
      setPhotoKey(result.photo_key);
      setState('result');
      if (result.unmatched_warning) showToast(result.unmatched_warning);
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Could not analyze that photo. Try again?');
      setState('idle');
    }
  }

  async function logFood() {
    const cal = parseInt(scan.calories, 10) || 0;
    try {
      await addLogEntry({
        name: scan.name || 'Meal',
        meal: scan.meal,
        time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
        cal,
        p: parseInt(scan.protein, 10) || 0,
        f: parseInt(scan.fat, 10) || 0,
        c: parseInt(scan.carbs, 10) || 0,
        fi: parseInt(scan.fiber, 10) || 0,
        photoKey,
      });
      showToast(`Logged · +${cal} kcal`);
      router.back();
    } catch {
      // addLogEntry already surfaced an error toast — stay on this screen so
      // the user can retry without re-entering everything.
    }
  }

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text style={styles.headerTitle}>Scan your meal</Text>
        <Pressable style={styles.closeButton} onPress={close}>
          <Text style={styles.closeGlyph}>✕</Text>
        </Pressable>
      </View>

      <View style={styles.viewfinder}>
        {permission?.granted ? (
          <CameraView
            ref={cameraRef}
            style={StyleSheet.absoluteFill}
            facing="back"
            onCameraReady={() => setCameraReady(true)}
          />
        ) : (
          <View style={styles.viewfinderPlaceholder}>
            <Text style={styles.viewfinderPlaceholderText}>
              {permission?.canAskAgain === false ? 'Camera access denied' : 'Requesting camera…'}
            </Text>
          </View>
        )}
        <Corner style={styles.cornerTL} />
        <Corner style={styles.cornerTR} />
        <Corner style={styles.cornerBL} />
        <Corner style={styles.cornerBR} />
        {state === 'analyzing' ? <ScanLine /> : null}
      </View>

      {state === 'idle' ? (
        <View style={styles.idleControls}>
          <Text style={styles.idleHint}>Center your plate in the frame</Text>
          <Pressable
            style={[styles.shutter, !cameraReady && styles.shutterDisabled]}
            onPress={shoot}
            disabled={!cameraReady}
            accessibilityRole="button"
            accessibilityLabel="Capture photo">
            <View style={styles.shutterInner} />
          </Pressable>
        </View>
      ) : null}

      {state === 'analyzing' ? (
        <View style={styles.analyzingControls}>
          <Text style={styles.analyzingTitle}>Analyzing with AI…</Text>
          <Text style={styles.analyzingSubtitle}>Identifying food and portion sizes</Text>
        </View>
      ) : null}

      {state === 'result' ? (
        <BottomSheet onClose={close} maxHeightPct={0.78}>
          <TextField
            value={scan.name}
            onChangeText={(v) => setScan((s) => ({ ...s, name: v }))}
            fontSize={21}
            fontWeight="800"
            style={styles.resultNameField}
          />

          {items.length > 0 ? (
            <View style={styles.itemsList}>
              {items.map((item, i) => (
                <View key={`${item.name}-${i}`} style={styles.itemRow}>
                  <Text style={styles.itemName} numberOfLines={1}>
                    {item.name} · {item.estimated_weight_g}g
                  </Text>
                  {item.matched ? (
                    <Text style={styles.itemConfidence}>{Math.round(item.confidence * 100)}% confident</Text>
                  ) : (
                    <Text style={styles.itemUnmatched}>no nutrition data</Text>
                  )}
                </View>
              ))}
            </View>
          ) : null}

          <View style={styles.mealChipsRow}>
            {MEALS.map((meal) => (
              <PillChip key={meal} label={meal} active={scan.meal === meal} onPress={() => setScan((s) => ({ ...s, meal }))} />
            ))}
          </View>

          <View style={styles.macroGrid}>
            <MacroField label="Serving g" labelColor={Brand.textSecondary} value={scan.serving} onChangeText={(v) => setScan((s) => ({ ...s, serving: v }))} />
            <MacroField label="Calories" labelColor={Brand.textSecondary} value={scan.calories} onChangeText={(v) => setScan((s) => ({ ...s, calories: v }))} />
            <MacroField label="Protein g" labelColor={Brand.protein} value={scan.protein} onChangeText={(v) => setScan((s) => ({ ...s, protein: v }))} />
            <MacroField label="Fat g" labelColor={Brand.fat} value={scan.fat} onChangeText={(v) => setScan((s) => ({ ...s, fat: v }))} />
            <MacroField label="Carbs g" labelColor={Brand.carbs} value={scan.carbs} onChangeText={(v) => setScan((s) => ({ ...s, carbs: v }))} />
            <MacroField label="Fiber g" labelColor={Brand.fiber} value={scan.fiber} onChangeText={(v) => setScan((s) => ({ ...s, fiber: v }))} />
          </View>

          <Text style={styles.resultFootnote}>AI estimate — adjust anything before logging.</Text>

          <View style={styles.resultButtonRow}>
            <PrimaryButton variant="neutral" flex={1} onPress={close}>
              Cancel
            </PrimaryButton>
            <PrimaryButton flex={2} onPress={logFood}>
              Log it
            </PrimaryButton>
          </View>
        </BottomSheet>
      ) : null}
    </View>
  );
}

function Corner({ style }: { style: object }) {
  return <View style={[styles.corner, style]} />;
}

function ScanLine() {
  const top = useSharedValue(8);
  useEffect(() => {
    top.value = withRepeat(withTiming(88, { duration: 1000 }), -1, true);
  }, [top]);
  const animatedStyle = useAnimatedStyle(() => ({ top: `${top.value}%` }));
  return <Animated.View style={[styles.scanLine, animatedStyle]} />;
}

function MacroField({
  label,
  labelColor,
  value,
  onChangeText,
}: {
  label: string;
  labelColor: string;
  value: string;
  onChangeText: (v: string) => void;
}) {
  return (
    <View style={styles.macroField}>
      <Text style={[styles.macroFieldLabel, { color: labelColor }]}>{label}</Text>
      <TextField value={value} onChangeText={onChangeText} keyboardType="numeric" fontSize={15} fontWeight="700" style={styles.macroFieldInput} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#181008',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingBottom: 10,
  },
  headerTitle: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 17,
    fontWeight: '700',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeGlyph: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 15,
    fontWeight: '700',
  },
  viewfinder: {
    flex: 1,
    margin: 22,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#2A2013',
  },
  viewfinderPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewfinderPlaceholderText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
    fontFamily: 'ui-monospace',
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  corner: {
    position: 'absolute',
    width: 34,
    height: 34,
    borderColor: 'rgba(255,255,255,0.8)',
  },
  cornerTL: { top: 16, left: 16, borderTopWidth: 3, borderLeftWidth: 3, borderTopLeftRadius: 10 },
  cornerTR: { top: 16, right: 16, borderTopWidth: 3, borderRightWidth: 3, borderTopRightRadius: 10 },
  cornerBL: { bottom: 16, left: 16, borderBottomWidth: 3, borderLeftWidth: 3, borderBottomLeftRadius: 10 },
  cornerBR: { bottom: 16, right: 16, borderBottomWidth: 3, borderRightWidth: 3, borderBottomRightRadius: 10 },
  scanLine: {
    position: 'absolute',
    left: '8%',
    right: '8%',
    height: 3,
    borderRadius: 2,
    backgroundColor: Brand.primaryLight,
    shadowColor: Brand.primaryLight,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 16,
  },
  idleControls: {
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 22,
    paddingBottom: 46,
    paddingTop: 10,
  },
  idleHint: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 13.5,
    fontWeight: '600',
  },
  shutter: {
    width: 74,
    height: 74,
    borderRadius: 37,
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterDisabled: {
    opacity: 0.4,
  },
  shutterInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#fff',
  },
  analyzingControls: {
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 22,
    paddingBottom: 56,
    paddingTop: 10,
  },
  analyzingTitle: {
    color: Brand.primaryLight,
    fontSize: 15,
    fontWeight: '700',
  },
  analyzingSubtitle: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 13,
    fontWeight: '600',
  },
  resultNameField: {
    borderWidth: 0,
    backgroundColor: 'transparent',
    paddingHorizontal: 0,
    marginBottom: 10,
  },
  itemsList: {
    gap: 6,
    marginBottom: 16,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  itemName: {
    flex: 1,
    fontSize: 13.5,
    fontWeight: '600',
    color: Brand.text,
  },
  itemConfidence: {
    fontSize: 11.5,
    fontWeight: '700',
    color: Brand.success,
  },
  itemUnmatched: {
    fontSize: 11.5,
    fontWeight: '700',
    color: Brand.danger,
  },
  mealChipsRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  macroGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 9,
    marginBottom: 10,
  },
  macroField: {
    flexBasis: '31%',
    flexGrow: 1,
    gap: 5,
  },
  macroFieldLabel: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  macroFieldInput: {
    backgroundColor: '#fff',
  },
  resultFootnote: {
    fontSize: 12,
    color: Brand.textMuted,
    lineHeight: 18,
    marginBottom: 16,
  },
  resultButtonRow: {
    flexDirection: 'row',
    gap: 10,
  },
});
