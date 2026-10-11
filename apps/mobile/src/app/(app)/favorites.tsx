import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { ActivityIndicator, RefreshControl, ScrollView } from 'react-native';

import { FileRow } from '@/components/file-row';
import { EmptyState, ErrorText, Screen } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { ApiError } from '@/lib/api/client';
import { favoritesApi } from '@/lib/api/endpoints';
import { toggleFileFavorite, toggleFolderFavorite } from '@/lib/browser-actions';

export default function FavoritesScreen() {
  const query = useQuery({
    queryKey: ['favorites'],
    queryFn: () => favoritesApi.list(),
  });

  const files = query.data?.files ?? [];
  const folders = query.data?.folders ?? [];

  return (
    <Screen style={{ paddingTop: Spacing.two }}>
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
          <EmptyState title="No favorites" subtitle="Star files or folders from the Files tab" />
        ) : null}
        {folders.map((folder) => (
          <FileRow
            key={folder._id}
            item={folder}
            kind="folder"
            onPress={() => router.push(`/files/${folder._id}`)}
            onToggleFavorite={async () => {
              await toggleFolderFavorite(folder);
              void query.refetch();
            }}
          />
        ))}
        {files.map((file) => (
          <FileRow
            key={file._id}
            item={file}
            kind="file"
            onToggleFavorite={async () => {
              await toggleFileFavorite(file);
              void query.refetch();
            }}
          />
        ))}
      </ScrollView>
    </Screen>
  );
}
