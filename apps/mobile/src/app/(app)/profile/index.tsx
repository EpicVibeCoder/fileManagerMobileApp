import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import {
  AlertCircleIcon,
  CheckCircleIcon,
  ChevronRightIcon,
  HardDriveIcon,
  LogoutIcon,
  ServerIcon,
  SettingsIcon,
  UserIcon,
} from '@/components/icons';
import { ThemedText } from '@/components/themed-text';
import { Button, Screen, formatBytes } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { healthApi } from '@/lib/api/endpoints';
import { useAuth } from '@/lib/auth-context';
import { getApiBaseUrl } from '@/lib/config';

const ACCENT = '#1B6EF3';

export default function ProfileScreen() {
  const theme = useTheme();
  const { user, logout } = useAuth();

  const health = useQuery({
    queryKey: ['health'],
    queryFn: () => healthApi.check(),
    refetchInterval: 60_000,
  });

  const nameSource = (user?.username || user?.email || '?').trim();
  const nameParts = nameSource.split(/[\s.@_-]+/).filter(Boolean);
  const initials =
    nameParts.length >= 2
      ? (nameParts[0][0] + nameParts[1][0]).toUpperCase()
      : nameSource.slice(0, 2).toUpperCase();

  const storagePct =
    user?.storageLimit && user.storageLimit > 0
      ? Math.min(100, Math.round(((user.storageUsed ?? 0) / user.storageLimit) * 100))
      : 0;

  const apiOnline = Boolean(health.data) && !health.isError;
  const apiLabel = health.data
    ? `${health.data.status} · DB ${health.data.database}`
    : health.isError
      ? 'Unreachable'
      : 'Checking…';

  return (
    <Screen style={{ paddingTop: Spacing.two }}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={[styles.hero, { backgroundColor: theme.backgroundElement }]}>
          <View style={styles.heroGlow} />
          <Pressable
            onPress={() => router.push('/profile/settings')}
            hitSlop={8}
            style={[styles.settingsBtn, { backgroundColor: theme.backgroundSelected }]}
            accessibilityRole="button"
            accessibilityLabel="Open settings"
          >
            <SettingsIcon size={20} color={theme.text} />
          </Pressable>
          <View style={[styles.avatar, { backgroundColor: ACCENT }]}>
            <ThemedText style={styles.avatarText}>{initials}</ThemedText>
            <View style={[styles.avatarBadge, { backgroundColor: theme.background }]}>
              <UserIcon size={14} color={ACCENT} />
            </View>
          </View>
          <ThemedText type="subtitle" style={styles.name}>
            {user?.username?.trim() || 'Your profile'}
          </ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.email}>
            {user?.email}
          </ThemedText>
        </View>

        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: theme.backgroundElement }]}>
            <View style={[styles.statIcon, { backgroundColor: theme.backgroundSelected }]}>
              <ServerIcon size={20} color={ACCENT} />
            </View>
            <ThemedText type="smallBold">API</ThemedText>
            <View style={styles.statusRow}>
              {apiOnline ? (
                <CheckCircleIcon size={14} color="#1A9B5C" />
              ) : (
                <AlertCircleIcon
                  size={14}
                  color={health.isError ? '#D94841' : theme.textSecondary}
                />
              )}
              <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
                {apiLabel}
              </ThemedText>
            </View>
            <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
              {getApiBaseUrl().replace(/^https?:\/\//, '')}
            </ThemedText>
          </View>

          <View style={[styles.statCard, { backgroundColor: theme.backgroundElement }]}>
            <View style={[styles.statIcon, { backgroundColor: theme.backgroundSelected }]}>
              <HardDriveIcon size={20} color={ACCENT} />
            </View>
            <ThemedText type="smallBold">Storage</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {formatBytes(user?.storageUsed)} / {formatBytes(user?.storageLimit)}
            </ThemedText>
            <View style={[styles.barTrack, { backgroundColor: theme.backgroundSelected }]}>
              <View style={[styles.barFill, { width: `${storagePct}%` }]} />
            </View>
            <ThemedText type="small" themeColor="textSecondary">
              {storagePct}% used
            </ThemedText>
          </View>
        </View>

        <Pressable
          onPress={() => router.push('/profile/settings')}
          style={({ pressed }) => [
            styles.settingsRow,
            {
              backgroundColor: pressed ? theme.backgroundSelected : theme.backgroundElement,
            },
          ]}
        >
          <View style={[styles.sectionIcon, { backgroundColor: theme.backgroundSelected }]}>
            <SettingsIcon size={18} color={ACCENT} />
          </View>
          <View style={{ flex: 1 }}>
            <ThemedText type="smallBold">Settings</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              Username and password
            </ThemedText>
          </View>
          <ChevronRightIcon size={18} color={theme.textSecondary} />
        </Pressable>

        <View style={[styles.signOutWrap, { backgroundColor: theme.backgroundElement }]}>
          <View style={styles.signOutRow}>
            <View style={[styles.sectionIcon, { backgroundColor: 'rgba(217,72,65,0.12)' }]}>
              <LogoutIcon size={18} color="#D94841" />
            </View>
            <View style={{ flex: 1 }}>
              <ThemedText type="smallBold">Sign out</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                End this session on this device
              </ThemedText>
            </View>
          </View>
          <Button title="Sign out" onPress={() => void logout()} variant="danger" />
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: Spacing.six,
    gap: Spacing.three,
  },
  hero: {
    alignItems: 'center',
    borderRadius: 20,
    paddingVertical: Spacing.five,
    paddingHorizontal: Spacing.three,
    overflow: 'hidden',
  },
  heroGlow: {
    position: 'absolute',
    top: -40,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(27,110,243,0.12)',
  },
  settingsBtn: {
    position: 'absolute',
    top: Spacing.three,
    right: Spacing.three,
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.three,
  },
  avatarText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '700',
  },
  avatarBadge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    fontSize: 26,
    lineHeight: 32,
    textAlign: 'center',
  },
  email: {
    marginTop: Spacing.one,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: Spacing.three,
    gap: Spacing.one,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.one,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  barTrack: {
    height: 6,
    borderRadius: 999,
    overflow: 'hidden',
    marginTop: Spacing.one,
  },
  barFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: ACCENT,
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderRadius: 16,
    padding: Spacing.three,
  },
  sectionIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signOutWrap: {
    borderRadius: 16,
    padding: Spacing.three,
    gap: Spacing.three,
  },
  signOutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
});
