import { Platform } from 'react-native';

import { API_BASE_URL } from '@/constants/config';

import { parseError, request } from './auth';
import { loadTokens } from './token-storage';

export type MealTypeApi = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export type FoodLogEntryApi = {
  id: number;
  name: string;
  meal_type: MealTypeApi;
  calories: number;
  protein_g: number;
  fat_g: number;
  carbs_g: number;
  fiber_g: number;
  logged_at: string;
  /** Presigned, time-limited S3 URL — null when the entry has no photo. */
  photo_url: string | null;
};

export type FoodLogEntryCreate = {
  name: string;
  meal_type: MealTypeApi;
  calories: number;
  protein_g?: number;
  fat_g?: number;
  carbs_g?: number;
  fiber_g?: number;
  /** From a prior scanFoodPhoto() response — ties the entry to its photo. */
  photo_key?: string;
};

export type DailyTotalApi = {
  log_date: string;
  calories: number;
  protein_g: number;
  fat_g: number;
  carbs_g: number;
  fiber_g: number;
};

/** `date` as an ISO `YYYY-MM-DD` string; omit for today (server-side default). */
export async function listFoodLogs(date?: string): Promise<FoodLogEntryApi[]> {
  const qs = date ? `?date=${date}` : '';
  return request<FoodLogEntryApi[]>(`/food-logs${qs}`, { method: 'GET', auth: true });
}

export async function createFoodLog(entry: FoodLogEntryCreate): Promise<FoodLogEntryApi> {
  return request<FoodLogEntryApi>('/food-logs', {
    method: 'POST',
    auth: true,
    body: JSON.stringify(entry),
  });
}

export async function deleteFoodLog(id: number): Promise<void> {
  await request<void>(`/food-logs/${id}`, { method: 'DELETE', auth: true });
}

/** Per-day macro totals, most recent first — only days with entries are returned. */
export async function getDailyTotals(days = 30): Promise<DailyTotalApi[]> {
  return request<DailyTotalApi[]>(`/food-logs/daily-totals?days=${days}`, {
    method: 'GET',
    auth: true,
  });
}

export type FoodScanPhoto = {
  uri: string;
  format: 'jpg' | 'png';
};

/**
 * One food item as identified in the photo. Nutrition here always comes from
 * a database lookup by name/alias (see backend `_score_items`) — the AI only
 * ever supplies `name`, `estimated_weight_g`, and `confidence`; a `matched:
 * false` item carries zero macros rather than a guessed value.
 */
export type ScannedFoodItem = {
  name: string;
  matched_name: string | null;
  estimated_weight_g: number;
  /** Claude's confidence in the identification + portion estimate, 0-1. */
  confidence: number;
  matched: boolean;
  calories: number;
  protein_g: number;
  fat_g: number;
  carbs_g: number;
  fiber_g: number;
};

export type FoodScanResult = {
  photo_key: string;
  name: string;
  serving_g: number;
  calories: number;
  protein_g: number;
  fat_g: number;
  carbs_g: number;
  fiber_g: number;
  items: ScannedFoodItem[];
  /** Set when one or more items had no nutrition-database match. */
  unmatched_warning: string | null;
};

/** Uploads a captured meal photo; the backend identifies items and looks up their nutrition. */
export async function scanFoodPhoto(photo: FoodScanPhoto): Promise<FoodScanResult> {
  const tokens = await loadTokens();
  if (!tokens) throw new Error('Not signed in');

  const contentType = photo.format === 'png' ? 'image/png' : 'image/jpeg';
  const filename = `meal.${photo.format}`;

  const form = new FormData();
  if (Platform.OS === 'web') {
    // On web, CameraView gives us a data: URI — fetch() understands those
    // and hands back a real Blob to attach to the FormData part.
    const dataUriRes = await fetch(photo.uri);
    const blob = await dataUriRes.blob();
    form.append('file', blob, filename);
  } else {
    // RN's FormData accepts this {uri, name, type} shape for file parts — it
    // isn't a real Blob, hence the cast.
    form.append('file', { uri: photo.uri, name: filename, type: contentType } as unknown as Blob);
  }

  // No Content-Type header here — fetch sets the multipart boundary itself
  // when given a FormData body; forcing one breaks the boundary.
  const res = await fetch(`${API_BASE_URL}/food-logs/scan`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokens.accessToken}` },
    body: form,
  });

  if (!res.ok) throw await parseError(res);
  return (await res.json()) as FoodScanResult;
}
