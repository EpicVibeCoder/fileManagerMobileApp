import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { FileRow } from '@/components/file-row';
import {
  ChevronRightIcon,
  ClockIcon,
  HardDriveIcon,
  fileTypeIcon,
} from '@/components/icons';
import { ThemedText } from '@/components/themed-text';
import { EmptyState, ErrorText, Screen, formatBytes } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { ApiError } from '@/lib/api/client';
import { dashboardApi } from '@/lib/api/endpoints';
import { useAuth } from '@/lib/auth-context';

const ACCENT = '#1B6EF3';

export default function DashboardScreen() {
  const { user } = useAuth();
  const theme = useTheme();
  const query = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => dashboardApi.get(),
  });

  const storage = query.data?.storage;
  const pct = storage?.usedPercentage ?? 0;

  return (
    <Screen style={{ paddingTop: Spacing.two }}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={query.isRefetching} onRefresh={() => query.refetch()} />
        }
        contentContainerStyle={{ paddingBottom: Spacing.six }}
      >
        <ThemedText type="subtitle" style={{ fontSize: 28, lineHeight: 34 }}>
          Hello{user?.username ? `, ${user.username}` : ''}
        </ThemedText>
        <ThemedText themeColor="textSecondary" style={{ marginBottom: Spacing.four }}>
          {user?.email}
        </ThemedText>

        {query.isLoading ? <ActivityIndicator /> : null}
        {query.error ? (
          <ErrorText
            message={query.error instanceof ApiError ? query.error.message : 'Failed to load'}
          />
        ) : null}

        {storage ? (
          <View style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
            <View style={styles.cardHeader}>
              <View style={[styles.iconBadge, { backgroundColor: theme.backgroundSelected }]}>
                <HardDriveIcon size={18} color={ACCENT} />
              </View>
              <ThemedText type="smallBold">Storage</ThemedText>
            </View>
            <ThemedText>
              {formatBytes(storage.used)} / {formatBytes(storage.limit)}
            </ThemedText>
            <View style={[styles.barTrack, { backgroundColor: theme.backgroundSelected }]}>
              <View
                style={[
                  styles.barFill,
                  { width: `${Math.min(pct, 100)}%`, backgroundColor: ACCENT },
                ]}
              />
            </View>
            <ThemedText type="small" themeColor="textSecondary">
              {pct}% used
            </ThemedText>
          </View>
        ) : null}

        {query.data?.fileStats?.length ? (
          <View style={styles.section}>
            <ThemedText type="smallBold">By type</ThemedText>
            {query.data.fileStats.map((stat) => {
              const TypeIcon = fileTypeIcon(stat._id ?? stat.type);
              return (
                <View
                  key={String(stat._id ?? stat.type)}
                  style={[styles.statRow, { backgroundColor: theme.backgroundElement }]}
                >
                  <View style={styles.statLeft}>
                    <View style={[styles.iconBadge, { backgroundColor: theme.backgroundSelected }]}>
                      <TypeIcon size={18} color={ACCENT} />
                    </View>
                    <ThemedText>{stat._id ?? stat.type}</ThemedText>
                  </View>
                  <ThemedText themeColor="textSecondary">
                    {stat.count} · {formatBytes(stat.totalSize)}
                  </ThemedText>
                </View>
              );
            })}
          </View>
        ) : null}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.statLeft}>
              <ClockIcon size={18} color={ACCENT} />
              <ThemedText type="smallBold">Recent</ThemedText>
            </View>
            <Pressable
              onPress={() => router.push('/files')}
              style={styles.browseLink}
            >
              <ThemedText type="linkPrimary">Browse</ThemedText>
              <ChevronRightIcon size={16} color="#3c87f7" />
            </Pressable>
          </View>
          {!query.data?.recentItems?.length ? (
            <EmptyState
              title="No recent items"
              subtitle="Upload a file to get started"
              icon={<HardDriveIcon size={28} color={ACCENT} />}
            />
          ) : (
            query.data.recentItems.map((item) => {
              const kind = item.category === 'folder' ? 'folder' : 'file';
              return (
                <FileRow
                  key={`${kind}-${item._id}`}
                  item={item}
                  kind={kind}
                  onPress={() => {
                    if (kind === 'folder') router.push(`/files/${item._id}`);
                  }}
                />
              );
            })
          )}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    padding: Spacing.three,
    gap: Spacing.two,
    marginBottom: Spacing.four,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  iconBadge: {
    width: 32,
    height: 32,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  barTrack: {
    height: 8,
    borderRadius: 999,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
  },
  section: {
    marginBottom: Spacing.four,
    gap: Spacing.two,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  browseLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.two,
    borderRadius: 12,
  },
  statLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
});
