import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';

import { FileRow } from '@/components/file-row';
import { ThemedText } from '@/components/themed-text';
import { EmptyState, ErrorText, Screen } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { ApiError } from '@/lib/api/client';
import { calendarApi } from '@/lib/api/endpoints';

function toIsoDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

export default function CalendarScreen() {
  const theme = useTheme();
  const [date, setDate] = useState(() => toIsoDate(new Date()));

  const query = useQuery({
    queryKey: ['calendar', date],
    queryFn: () => calendarApi.byDate(date),
  });

  const shift = (days: number) => {
    const d = new Date(`${date}T12:00:00`);
    d.setDate(d.getDate() + days);
    setDate(toIsoDate(d));
  };

  const files = useMemo(
    () => (query.data?.files ?? []).filter((f) => !f.isVault),
    [query.data?.files],
  );
  const folders = useMemo(
    () => (query.data?.folders ?? []).filter((f) => !f.isVault),
    [query.data?.folders],
  );

  return (
    <Screen style={{ paddingTop: Spacing.two }}>
      <View style={styles.nav}>
        <Pressable onPress={() => shift(-1)} style={[styles.navBtn, { backgroundColor: theme.backgroundElement }]}>
          <ThemedText>Prev</ThemedText>
        </Pressable>
        <ThemedText type="smallBold">{date}</ThemedText>
        <Pressable onPress={() => shift(1)} style={[styles.navBtn, { backgroundColor: theme.backgroundElement }]}>
          <ThemedText>Next</ThemedText>
        </Pressable>
      </View>
      <Pressable onPress={() => setDate(toIsoDate(new Date()))}>
        <ThemedText type="linkPrimary" style={{ textAlign: 'center', marginBottom: Spacing.three }}>
          Jump to today
        </ThemedText>
      </Pressable>

      {query.isLoading ? <ActivityIndicator /> : null}
      {query.error ? (
        <ErrorText
          message={query.error instanceof ApiError ? query.error.message : 'Failed to load'}
        />
      ) : null}

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={query.isRefetching} onRefresh={() => query.refetch()} />
        }
      >
        {!files.length && !folders.length && !query.isLoading ? (
          <EmptyState title="Nothing on this day" subtitle="Items appear by created date" />
        ) : null}
        {folders.map((folder) => (
          <FileRow
            key={folder._id}
            item={folder}
            kind="folder"
            onPress={() => router.push(`/files/${folder._id}`)}
          />
        ))}
        {files.map((file) => (
          <FileRow key={file._id} item={file} kind="file" />
        ))}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  nav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.two,
  },
  navBtn: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: 10,
  },
});
