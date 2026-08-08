import { API_BASE_URL } from '@/constants/config';

import { parseError, request } from './auth';
import { loadTokens } from './token-storage';

export type BcaScanFile = {
  uri: string;
  name: string;
  mimeType: string;
  // On web, expo-document-picker gives us a real File — the native
  // {uri, name, type} shape only works with RN's fetch shim, not
  // the browser's FormData.
  webFile?: File;
};

export type BcaScanResult = {
  report: {
    id: number;
    report_date: string;
    weight_kg: number;
    body_fat_pct: number;
    muscle_mass_kg: number;
    bmr_kcal: number;
  };
  goals: {
    calories: number;
    protein_g: number;
    fat_g: number;
    carbs_g: number;
    fiber_g: number;
  };
};

export async function scanBcaReport(
  file: BcaScanFile,
  activityLevel: string,
  gender: string,
): Promise<BcaScanResult> {
  const tokens = await loadTokens();
  if (!tokens) throw new Error('Not signed in');

  const form = new FormData();
  if (file.webFile) {
    form.append('file', file.webFile, file.name);
  } else {
    // RN's FormData accepts this {uri, name, type} shape for file parts — it
    // isn't a real Blob, hence the cast.
    form.append('file', { uri: file.uri, name: file.name, type: file.mimeType } as unknown as Blob);
  }
  form.append('activity_level', activityLevel);
  form.append('gender', gender);

  // No Content-Type header here — fetch sets the multipart boundary itself
  // when given a FormData body; forcing one breaks the boundary.
  const res = await fetch(`${API_BASE_URL}/bca-reports/scan`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokens.accessToken}` },
    body: form,
  });

  if (!res.ok) throw await parseError(res);
  return (await res.json()) as BcaScanResult;
}

export type BcaReportListItem = {
  id: number;
  report_date: string;
  weight_kg: number;
  body_fat_pct: number;
  muscle_mass_kg: number;
  bmr_kcal: number;
};

export type BcaReanalyseResult = {
  report: BcaReportListItem;
  goals: BcaScanResult['goals'];
};

export async function listBcaReports(): Promise<BcaReportListItem[]> {
  return request<BcaReportListItem[]>('/bca-reports', { method: 'GET', auth: true });
}

export async function reanalyseBcaReport(id: number): Promise<BcaReanalyseResult> {
  return request<BcaReanalyseResult>(`/bca-reports/${id}/reanalyse`, {
    method: 'POST',
    auth: true,
  });
}
