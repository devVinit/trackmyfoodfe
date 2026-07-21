/**
 * Base URL of the TrackMyFood backend, including the `/api/v1` prefix.
 *
 * Defaults to the dev machine's LAN IP so physical devices on the same Wi-Fi
 * can reach it. Override per-environment with the `EXPO_PUBLIC_API_URL` env var
 * (inlined at build time by Expo) — e.g. `localhost` for web/simulator, or
 * `10.0.2.2` for the Android emulator.
 */
export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ?? 'http://192.168.0.120:8000/api/v1';
