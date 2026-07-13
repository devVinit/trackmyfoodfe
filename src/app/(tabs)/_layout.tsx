import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Tabs, TabList, TabSlot, TabTrigger, type TabTriggerSlotProps } from 'expo-router/ui';
import { forwardRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Brand } from '@/constants/theme';
import { useTabBarMetrics } from '@/hooks/use-tab-bar-metrics';

export default function TabsLayout() {
  return (
    <View style={styles.tabsRoot}>
      <Tabs>
        <TabSlot style={styles.slot} />
        <TabList asChild>
          <GlassTabBar>
            <TabTrigger name="home" href="/home" asChild>
              <TabButton label="Home" icon="home" />
            </TabTrigger>
            <TabTrigger name="history" href="/history" asChild>
              <TabButton label="History" icon="history" />
            </TabTrigger>
            <TabTrigger name="profile" href="/profile" asChild>
              <TabButton label="Profile" icon="profile" />
            </TabTrigger>
          </GlassTabBar>
        </TabList>
      </Tabs>
    </View>
  );
}

function GlassTabBar({ children }: { children: React.ReactNode }) {
  const { bottom } = useTabBarMetrics();
  return (
    <View style={[styles.barWrap, { bottom }]}>
      <View style={styles.barClip}>
        <BlurView intensity={40} tint="light" style={StyleSheet.absoluteFill} />
        <LinearGradient
          colors={['rgba(255,255,255,0.52)', 'rgba(255,251,243,0.34)']}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.barBorder} />
      </View>
      <View style={styles.barContent}>{children}</View>
    </View>
  );
}

type IconName = 'home' | 'history' | 'profile';

type TabButtonProps = TabTriggerSlotProps & {
  label: string;
  icon: IconName;
};

const TabButton = forwardRef<View, TabButtonProps>(({ label, icon, isFocused, ...props }, ref) => {
  const color = isFocused ? Brand.primary : Brand.inactive;
  return (
    <Pressable ref={ref} {...props} style={styles.tabButton}>
      {isFocused ? (
        <LinearGradient
          colors={['rgba(255,255,255,0.95)', 'rgba(255,255,255,0.6)']}
          style={StyleSheet.absoluteFill}
        />
      ) : null}
      <TabIcon icon={icon} color={color} />
      <Text style={[styles.tabLabel, { color }]}>{label}</Text>
    </Pressable>
  );
});
TabButton.displayName = 'TabButton';

function TabIcon({ icon, color }: { icon: IconName; color: string }) {
  if (icon === 'home') {
    return (
      <View style={styles.homeIcon}>
        <View style={[styles.homeRoof, { borderColor: color }]}>
          <View style={[styles.homePeak, { borderColor: color }]} />
        </View>
      </View>
    );
  }
  if (icon === 'history') {
    return (
      <View style={styles.historyIcon}>
        <View style={[styles.historyBar, { height: 9, backgroundColor: color }]} />
        <View style={[styles.historyBar, { height: 16, backgroundColor: color }]} />
        <View style={[styles.historyBar, { height: 12, backgroundColor: color }]} />
      </View>
    );
  }
  return (
    <View style={styles.profileIcon}>
      <View style={[styles.profileHead, { borderColor: color }]} />
      <View style={[styles.profileBody, { borderColor: color }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  tabsRoot: {
    flex: 1,
  },
  slot: {
    flex: 1,
  },
  barWrap: {
    position: 'absolute',
    left: 16,
    right: 16,
    height: 68,
    borderRadius: 34,
    shadowColor: Brand.text,
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.24,
    shadowRadius: 34,
    elevation: 8,
  },
  barClip: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 34,
    overflow: 'hidden',
  },
  barBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 34,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.72)',
  },
  barContent: {
    flex: 1,
    flexDirection: 'row',
    padding: 7,
    gap: 4,
  },
  tabButton: {
    flex: 1,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    overflow: 'hidden',
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '700',
  },
  homeIcon: {
    width: 20,
    height: 18,
  },
  homeRoof: {
    width: 20,
    height: 18,
    borderWidth: 2.5,
    borderTopWidth: 0,
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
  },
  homePeak: {
    position: 'absolute',
    top: -9,
    left: -3,
    width: 11,
    height: 11,
    borderTopWidth: 2.5,
    borderLeftWidth: 2.5,
    borderTopLeftRadius: 3,
    transform: [{ rotate: '45deg' }],
  },
  historyIcon: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2.5,
    height: 18,
  },
  historyBar: {
    width: 4.5,
    borderRadius: 2,
  },
  profileIcon: {
    alignItems: 'center',
    gap: 1,
  },
  profileHead: {
    width: 9,
    height: 9,
    borderRadius: 5,
    borderWidth: 2.5,
  },
  profileBody: {
    width: 17,
    height: 8,
    borderTopLeftRadius: 9,
    borderTopRightRadius: 9,
    borderWidth: 2.5,
    borderBottomWidth: 0,
  },
});
