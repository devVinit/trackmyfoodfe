import { request } from './auth';

export type OnboardingStatus = {
  is_onboarded: boolean;
  onboarding_step: number;
};

export async function setOnboardingStep(step: number): Promise<OnboardingStatus> {
  return request<OnboardingStatus>('/users/onboarding-step', {
    method: 'PATCH',
    auth: true,
    body: JSON.stringify({ step }),
  });
}

export async function completeOnboarding(): Promise<OnboardingStatus> {
  return request<OnboardingStatus>('/users/onboarding-complete', {
    method: 'POST',
    auth: true,
  });
}

export type ProfileGender = 'male' | 'female';
export type ProfileActivityLevel = 'sedentary' | 'light' | 'moderate' | 'very';
export type ProfileHealthProvider = 'apple' | 'google';

export type UserProfileApi = {
  name: string | null;
  age: number | null;
  height_cm: number | null;
  weight_kg: number | null;
  gender: ProfileGender | null;
  activity_level: ProfileActivityLevel | null;
  health_provider: ProfileHealthProvider | null;
};

/** Partial patch — only fields present in the object are updated server-side. */
export type UserProfileUpdate = Partial<UserProfileApi>;

export async function getProfile(): Promise<UserProfileApi> {
  return request<UserProfileApi>('/users/profile', { method: 'GET', auth: true });
}

export async function updateProfile(patch: UserProfileUpdate): Promise<UserProfileApi> {
  return request<UserProfileApi>('/users/profile', {
    method: 'PATCH',
    auth: true,
    body: JSON.stringify(patch),
  });
}

export type GoalsApi = {
  calories: number;
  protein_g: number;
  fat_g: number;
  carbs_g: number;
  fiber_g: number;
  goals_source: 'calc' | 'bca';
};

export type GoalsUpdate = {
  calories: number;
  protein_g: number;
  fat_g: number;
  carbs_g: number;
  fiber_g: number;
};

export async function getGoals(): Promise<GoalsApi> {
  return request<GoalsApi>('/users/goals', { method: 'GET', auth: true });
}

export async function updateGoals(goals: GoalsUpdate): Promise<GoalsApi> {
  return request<GoalsApi>('/users/goals', {
    method: 'PUT',
    auth: true,
    body: JSON.stringify(goals),
  });
}

export async function deleteAccount(): Promise<void> {
  await request<void>('/users/me', { method: 'DELETE', auth: true });
}
