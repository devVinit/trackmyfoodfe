/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#000000',
    background: '#ffffff',
    backgroundElement: '#F0F0F3',
    backgroundSelected: '#E0E1E6',
    textSecondary: '#60646C',
  },
  dark: {
    text: '#ffffff',
    background: '#000000',
    backgroundElement: '#212225',
    backgroundSelected: '#2E3135',
    textSecondary: '#B0B4BA',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

/** TrackMyFood brand palette — warm cream/orange, used for all product screens (single theme, no dark mode). */
export const Brand = {
  primary: '#E8722A',
  primaryDark: '#D9631C',
  primaryLight: '#EF8340',
  primaryTint: 'rgba(232,114,42,0.12)',
  primaryTintStrong: 'rgba(232,114,42,0.2)',
  accent: '#C85A1B',
  bgGradientStart: '#F8F2E7',
  bgGradientEnd: '#F1E6D2',
  bgOuterStart: '#F7F2E9',
  bgOuterEnd: '#E9DEC9',
  text: '#2B2318',
  textSecondary: '#8B7E6A',
  textMuted: '#B4A78F',
  border: 'rgba(180,167,143,0.35)',
  borderLight: 'rgba(180,167,143,0.22)',
  cardBg: 'rgba(255,255,255,0.62)',
  cardBorder: 'rgba(255,255,255,0.75)',
  inputBg: 'rgba(255,255,255,0.72)',
  inputBgSolid: 'rgba(255,255,255,0.85)',
  shadow: 'rgba(101,78,45,0.10)',
  protein: '#E8722A',
  fat: '#D4A03C',
  carbs: '#C05B45',
  fiber: '#8A9A4B',
  success: '#8A9A4B',
  successTint: 'rgba(138,154,75,0.14)',
  danger: '#C0392B',
  dangerDark: '#A93226',
  dangerTint: 'rgba(192,57,43,0.10)',
  warnTint: 'rgba(212,160,60,0.16)',
  warnText: '#B0822A',
  inactive: '#A79A82',
} as const;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

