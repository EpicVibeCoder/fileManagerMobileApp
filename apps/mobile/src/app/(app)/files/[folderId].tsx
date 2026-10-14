import { useQuery } from '@tanstack/react-query';
import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

import { FileRow } from '@/components/file-row';
import { FolderIcon, FolderPlusIcon, UploadIcon } from '@/components/icons';
import { Button, EmptyState, ErrorText, Screen } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { ApiError } from '@/lib/api/client';
import { foldersApi } from '@/lib/api/endpoints';
import {
  createFolder,
  pickAndUpload,
  showFileActions,
  showFolderActions,
  toggleFileFavorite,
  toggleFolderFavorite,
} from '@/lib/browser-actions';
import { useVault } from '@/lib/vault-context';

const ACCENT = '#1B6EF3';

export default function FolderScreen() {
  const { folderId } = useLocalSearchParams<{ folderId: string }>();
  const navigation = useNavigation();
  const theme = useTheme();
  const { pin } = useVault();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const query = useQuery({
    queryKey: ['folder', folderId],
    queryFn: () => foldersApi.contents(folderId),
    enabled: Boolean(folderId),
  });

  useEffect(() => {
    navigation.setOptions({ title: query.data?.folder?.name ?? 'Folder' });
  }, [navigation, query.data?.folder?.name]);

  const refresh = () => void query.refetch();
  const data = query.data;
  const folders = (data?.subfolders ?? []).filter((f) => !f.isVault);
  const files = (data?.files ?? []).filter((f) => !f.isVault);

  return (
    <Screen style={{ paddingTop: Spacing.two }}>
      <View style={styles.toolbar}>
        <Button
          title="Upload"
          loading={busy}
          flex
          icon={<UploadIcon size={18} color="#fff" />}
          onPress={async () => {
            setBusy(true);
            setError(null);
            try {
              await pickAndUpload(folderId);
              refresh();
            } catch (e) {
              setError(
                e instanceof ApiError
                  ? e.message
                  : e instanceof Error
                    ? e.message
                    : 'Upload failed',
              );
            } finally {
              setBusy(false);
            }
          }}
        />
        <Button
          title="Subfolder"
          variant="secondary"
          disabled={busy}
          flex
          icon={<FolderPlusIcon size={18} color={theme.text} />}
          onPress={async () => {
            setBusy(true);
            try {
              await createFolder(folderId);
              refresh();
            } catch (e) {
              setError(e instanceof ApiError ? e.message : 'Failed');
            } finally {
              setBusy(false);
            }
          }}
        />
      </View>
      <ErrorText message={error} />
      {query.isLoading ? <ActivityIndicator /> : null}
      <ScrollView
        refreshControl={<RefreshControl refreshing={query.isRefetching} onRefresh={refresh} />}
      >
        {!folders.length && !files.length && !query.isLoading ? (
          <EmptyState
            title="Empty folder"
            subtitle="Upload files or add a subfolder"
            icon={<FolderIcon size={28} color={ACCENT} />}
          />
        ) : null}
        {folders.map((folder) => (
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
        ))}
        {files.map((file) => (
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
});
