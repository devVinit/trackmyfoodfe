import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

/**
 * Cross-platform persistence for the auth token pair.
 *
 * Native (iOS/Android) uses the OS keychain/keystore via expo-secure-store,
 * which isn't available on web — there we fall back to `localStorage`, guarded
 * so it degrades to an in-memory no-op during SSR / static web export where
 * `window` is absent.
 */

const ACCESS_KEY = 'tmf_access_token';
const REFRESH_KEY = 'tmf_refresh_token';

const isWeb = Platform.OS === 'web';

function webStorage(): Storage | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage;
}

async function getItem(key: string): Promise<string | null> {
  if (isWeb) return webStorage()?.getItem(key) ?? null;
  return SecureStore.getItemAsync(key);
}

async function setItem(key: string, value: string): Promise<void> {
  if (isWeb) {
    webStorage()?.setItem(key, value);
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

async function deleteItem(key: string): Promise<void> {
  if (isWeb) {
    webStorage()?.removeItem(key);
    return;
  }
  await SecureStore.deleteItemAsync(key);
}

export type StoredTokens = {
  accessToken: string;
  refreshToken: string;
};

export async function loadTokens(): Promise<StoredTokens | null> {
  const [accessToken, refreshToken] = await Promise.all([
    getItem(ACCESS_KEY),
    getItem(REFRESH_KEY),
  ]);
  if (!accessToken || !refreshToken) return null;
  return { accessToken, refreshToken };
}

export async function saveTokens(tokens: StoredTokens): Promise<void> {
  await Promise.all([
    setItem(ACCESS_KEY, tokens.accessToken),
    setItem(REFRESH_KEY, tokens.refreshToken),
  ]);
}

export async function clearTokens(): Promise<void> {
  await Promise.all([deleteItem(ACCESS_KEY), deleteItem(REFRESH_KEY)]);
}
