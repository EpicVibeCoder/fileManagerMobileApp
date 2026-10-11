import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { formatBytes } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { FileItem, FolderItem } from '@/lib/types';

type Props = {
  item: FileItem | FolderItem;
  kind: 'file' | 'folder';
  onPress?: () => void;
  onLongPress?: () => void;
  onToggleFavorite?: () => void;
  trailing?: React.ReactNode;
};

export function FileRow({ item, kind, onPress, onLongPress, onToggleFavorite, trailing }: Props) {
  const theme = useTheme();
  const isFile = kind === 'file';
  const file = item as FileItem;

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={({ pressed }) => [
        styles.row,
        {
          backgroundColor: pressed ? theme.backgroundSelected : theme.backgroundElement,
        },
      ]}
    >
      <View style={[styles.icon, { backgroundColor: theme.backgroundSelected }]}>
        <ThemedText type="smallBold">{kind === 'folder' ? 'DIR' : 'FILE'}</ThemedText>
      </View>
      <View style={styles.meta}>
        <ThemedText numberOfLines={1}>{item.name}</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {isFile
            ? `${file.type ?? 'file'} · ${formatBytes(file.size)}`
            : 'Folder'}
          {item.isVault ? ' · vault' : ''}
        </ThemedText>
      </View>
      {onToggleFavorite ? (
        <Pressable onPress={onToggleFavorite} hitSlop={12} style={styles.fav}>
          <ThemedText>{item.isFavorite ? '★' : '☆'}</ThemedText>
        </Pressable>
      ) : null}
      {trailing}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    padding: Spacing.two,
    borderRadius: 12,
    marginBottom: Spacing.two,
  },
  icon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  meta: {
    flex: 1,
    gap: 2,
  },
  fav: {
    paddingHorizontal: Spacing.one,
  },
});
