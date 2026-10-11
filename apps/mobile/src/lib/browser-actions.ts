import * as DocumentPicker from 'expo-document-picker';
import { File, Paths } from 'expo-file-system';
import { Alert, Platform, Share } from 'react-native';

import { askForName } from '@/components/name-prompt';
import { ApiError } from '@/lib/api/client';
import { favoritesApi, filesApi, foldersApi, vaultApi } from '@/lib/api/endpoints';
import { getApiBaseUrl } from '@/lib/config';
import { loadTokens } from '@/lib/storage';
import type { FileItem, FolderItem } from '@/lib/types';

export async function pickAndUpload(folderId?: string | null) {
  const result = await DocumentPicker.getDocumentAsync({
    multiple: true,
    copyToCacheDirectory: true,
    type: [
      'image/*',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ],
  });
  if (result.canceled || !result.assets?.length) return null;

  const formData = new FormData();
  for (const asset of result.assets) {
    formData.append('file', {
      uri: asset.uri,
      name: asset.name ?? 'upload.bin',
      type: asset.mimeType ?? 'application/octet-stream',
    } as unknown as Blob);
  }
  if (folderId) formData.append('folderId', folderId);

  return filesApi.upload(formData);
}

export async function downloadAndShare(file: FileItem, vaultPin?: string | null) {
  if (Platform.OS === 'web') {
    const { blob, filename } = await filesApi.download(file._id, vaultPin);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename ?? file.name;
    a.click();
    URL.revokeObjectURL(url);
    return;
  }

  const { accessToken } = await loadTokens();
  const headers: Record<string, string> = {};
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
  if (vaultPin) headers['x-vault-pin'] = vaultPin;

  const destination = new File(Paths.cache, file.name);
  const downloaded = await File.downloadFileAsync(
    `${getApiBaseUrl()}/api/files/${file._id}/download`,
    destination,
    { headers, idempotent: true },
  );

  await Share.share({
    url: downloaded.uri,
    title: file.name,
  });
}

export async function createFolder(parentId?: string | null) {
  const name = await askForName('New folder name', 'New Folder');
  if (!name) return null;
  return foldersApi.create(name, parentId ?? undefined);
}

export async function renameFile(file: FileItem) {
  const name = await askForName('Rename file', file.name);
  if (!name) return null;
  return filesApi.rename(file._id, name);
}

export async function renameFolder(folder: FolderItem) {
  const name = await askForName('Rename folder', folder.name);
  if (!name) return null;
  return foldersApi.rename(folder._id, name);
}

export function confirmDelete(label: string): Promise<boolean> {
  if (Platform.OS === 'web') {
    return Promise.resolve(Boolean(globalThis.confirm?.(`Delete ${label}?`)));
  }
  return new Promise((resolve) => {
    Alert.alert('Delete', `Delete ${label}?`, [
      { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
      { text: 'Delete', style: 'destructive', onPress: () => resolve(true) },
    ]);
  });
}

export async function toggleFileFavorite(file: FileItem) {
  return file.isFavorite ? favoritesApi.removeFile(file._id) : favoritesApi.addFile(file._id);
}

export async function toggleFolderFavorite(folder: FolderItem) {
  return folder.isFavorite
    ? favoritesApi.removeFolder(folder._id)
    : favoritesApi.addFolder(folder._id);
}

function runAction(fn: () => Promise<unknown>, onChanged: () => void) {
  return async () => {
    try {
      await fn();
      onChanged();
    } catch (e) {
      Alert.alert('Error', e instanceof ApiError ? e.message : 'Action failed');
    }
  };
}

export function showFileActions(
  file: FileItem,
  opts: {
    onChanged: () => void;
    vaultPin?: string | null;
  },
) {
  Alert.alert(file.name, undefined, [
    {
      text: 'Download / Share',
      onPress: runAction(() => downloadAndShare(file, opts.vaultPin), opts.onChanged),
    },
    { text: 'Rename', onPress: runAction(() => renameFile(file), opts.onChanged) },
    {
      text: 'Duplicate',
      onPress: runAction(() => filesApi.duplicate(file._id), opts.onChanged),
    },
    {
      text: file.isFavorite ? 'Unfavorite' : 'Favorite',
      onPress: runAction(() => toggleFileFavorite(file), opts.onChanged),
    },
    {
      text: file.isVault ? 'Restore from vault' : 'Move to vault',
      onPress: runAction(async () => {
        if (file.isVault) {
          if (!opts.vaultPin) throw new ApiError('Unlock vault first', 401);
          await vaultApi.restoreFile(file._id, opts.vaultPin);
        } else {
          await vaultApi.moveFile(file._id);
        }
      }, opts.onChanged),
    },
    {
      text: 'Delete',
      style: 'destructive',
      onPress: runAction(async () => {
        if (!(await confirmDelete(file.name))) return;
        await filesApi.remove(file._id);
      }, opts.onChanged),
    },
    { text: 'Cancel', style: 'cancel' },
  ]);
}

export function showFolderActions(
  folder: FolderItem,
  opts: { onChanged: () => void; vaultPin?: string | null },
) {
  Alert.alert(folder.name, undefined, [
    { text: 'Rename', onPress: runAction(() => renameFolder(folder), opts.onChanged) },
    {
      text: folder.isFavorite ? 'Unfavorite' : 'Favorite',
      onPress: runAction(() => toggleFolderFavorite(folder), opts.onChanged),
    },
    {
      text: folder.isVault ? 'Restore from vault' : 'Move to vault',
      onPress: runAction(async () => {
        if (folder.isVault) {
          if (!opts.vaultPin) throw new ApiError('Unlock vault first', 401);
          await vaultApi.restoreFolder(folder._id, opts.vaultPin);
        } else {
          await vaultApi.moveFolder(folder._id);
        }
      }, opts.onChanged),
    },
    {
      text: 'Delete',
      style: 'destructive',
      onPress: runAction(async () => {
        if (!(await confirmDelete(folder.name))) return;
        await foldersApi.remove(folder._id);
      }, opts.onChanged),
    },
    { text: 'Cancel', style: 'cancel' },
  ]);
}
