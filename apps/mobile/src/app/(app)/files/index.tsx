import { useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { FileRow } from '@/components/file-row';
import { ThemedText } from '@/components/themed-text';
import { Button, EmptyState, ErrorText, Screen } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { ApiError } from '@/lib/api/client';
import { filesApi, foldersApi } from '@/lib/api/endpoints';
import {
  createFolder,
  pickAndUpload,
  showFileActions,
  showFolderActions,
  toggleFileFavorite,
  toggleFolderFavorite,
} from '@/lib/browser-actions';
import { useVault } from '@/lib/vault-context';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'image', label: 'Images' },
  { key: 'pdf', label: 'PDFs' },
  { key: 'doc', label: 'Docs' },
] as const;

export default function FilesScreen() {
  const theme = useTheme();
  const { pin } = useVault();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]['key']>('all');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const foldersQuery = useQuery({
    queryKey: ['folders', 'root'],
    queryFn: () => foldersApi.list(),
  });

  const filesQuery = useQuery({
    queryKey: ['files', filter],
    queryFn: () => filesApi.list(filter === 'all' ? undefined : { type: filter }),
  });

  const rootFiles = useMemo(() => {
    const files = filesQuery.data ?? [];
    // Root view: only files without a folder; hide vault when possible
    return files.filter((f) => !f.folderId && !f.isVault);
  }, [filesQuery.data]);

  const folders = useMemo(
    () => (foldersQuery.data ?? []).filter((f) => !f.isVault),
    [foldersQuery.data],
  );

  const refresh = () => {
    void foldersQuery.refetch();
    void filesQuery.refetch();
    void queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    void queryClient.invalidateQueries({ queryKey: ['favorites'] });
  };

  const onUpload = async () => {
    setBusy(true);
    setError(null);
    try {
      await pickAndUpload(null);
      refresh();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Upload failed');
    } finally {
      setBusy(false);
    }
  };

  const onNewFolder = async () => {
    setBusy(true);
    setError(null);
    try {
      await createFolder(null);
      refresh();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Could not create folder');
    } finally {
      setBusy(false);
    }
  };

  const loading = foldersQuery.isLoading || filesQuery.isLoading;

  return (
    <Screen style={{ paddingTop: Spacing.two }}>
      <View style={styles.toolbar}>
        <Button title="Upload" onPress={onUpload} loading={busy} flex />
        <Button title="New folder" onPress={onNewFolder} variant="secondary" disabled={busy} flex />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filters}
        contentContainerStyle={{ gap: Spacing.two }}
      >
        {FILTERS.map((f) => (
          <Pressable
            key={f.key}
            onPress={() => setFilter(f.key)}
            style={[
              styles.chip,
              {
                backgroundColor:
                  filter === f.key ? '#1B6EF3' : theme.backgroundElement,
              },
            ]}
          >
            <ThemedText style={{ color: filter === f.key ? '#fff' : theme.text }} type="smallBold">
              {f.label}
            </ThemedText>
          </Pressable>
        ))}
      </ScrollView>

      <ErrorText message={error} />
      {loading ? <ActivityIndicator /> : null}

      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={foldersQuery.isRefetching || filesQuery.isRefetching}
            onRefresh={refresh}
          />
        }
        contentContainerStyle={{ paddingBottom: Spacing.six }}
      >
        {!folders.length && !rootFiles.length && !loading ? (
          <EmptyState title="Empty" subtitle="Upload files or create a folder" />
        ) : null}

        {filter === 'all'
          ? folders.map((folder) => (
              <FileRow
                key={folder._id}
                item={folder}
                kind="folder"
                onPress={() => router.push(`/files/${folder._id}`)}
                onLongPress={() => showFolderActions(folder, { onChanged: refresh, vaultPin: pin })}
                onToggleFavorite={async () => {
                  await toggleFolderFavorite(folder);
                  refresh();
                }}
              />
            ))
          : null}

        {rootFiles.map((file) => (
          <FileRow
            key={file._id}
            item={file}
            kind="file"
            onLongPress={() => showFileActions(file, { onChanged: refresh, vaultPin: pin })}
            onToggleFavorite={async () => {
              await toggleFileFavorite(file);
              refresh();
            }}
          />
        ))}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  toolbar: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginBottom: Spacing.three,
  },
  filters: {
    maxHeight: 40,
    marginBottom: Spacing.three,
  },
  chip: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
});
