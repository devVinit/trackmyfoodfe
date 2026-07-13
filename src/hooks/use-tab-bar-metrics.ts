import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const TAB_BAR_HEIGHT = 68;
export const TAB_BAR_MIN_BOTTOM = 26;

export function useTabBarMetrics() {
  const insets = useSafeAreaInsets();
  const bottom = Math.max(TAB_BAR_MIN_BOTTOM, insets.bottom + 10);
  return {
    bottom,
    height: TAB_BAR_HEIGHT,
    clearance: bottom + TAB_BAR_HEIGHT,
  };
}
