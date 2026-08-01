/**
 * Root URL of the TrackMyFood backend server (no `/api/v1` — that's appended
 * below), taken from the `EXPO_PUBLIC_API_URL` env var (inlined at build time
 * by Expo) or defaulting to the dev machine's LAN IP so physical devices on
 * the same Wi-Fi can reach it. Override per-environment — e.g. `localhost`
 * for web/simulator, or `10.0.2.2` for the Android emulator.
 */
const API_ROOT_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://192.168.0.120:8000/';

/** Base URL for all API calls, including the `/api/v1` prefix. */
export const API_BASE_URL = `${API_ROOT_URL.replace(/\/+$/, '')}/api/v1`;
