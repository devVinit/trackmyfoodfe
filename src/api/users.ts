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
