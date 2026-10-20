import * as DocumentPicker from 'expo-document-picker';
import { File, Paths, UploadType } from 'expo-file-system';
import * as IntentLauncher from 'expo-intent-launcher';
import { router } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { Alert, Platform, Share } from 'react-native';

import { showActionSheet } from '@/components/action-sheet';
import { askForName } from '@/components/name-prompt';
import { ApiError } from '@/lib/api/client';
import { favoritesApi, filesApi, foldersApi, vaultApi } from '@/lib/api/endpoints';
import { getApiBaseUrl } from '@/lib/config';
import { loadTokens } from '@/lib/storage';
import type { ApiEnvelope, FileItem, FolderItem } from '@/lib/types';

/** Android Intent.FLAG_GRANT_READ_URI_PERMISSION — required for content:// handoff. */
const FLAG_GRANT_READ_URI_PERMISSION = 1;

const EXT_MIME: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  webp: 'image/webp',
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
};

/** Android pickers often omit mimeType or send image/jpg / octet-stream. */
function resolveUploadMime(mimeType: string | undefined | null, name: string): string {
  const normalized = mimeType === 'image/jpg' ? 'image/jpeg' : mimeType;
  if (normalized && normalized !== 'application/octet-stream') return normalized;
  const ext = name.split('.').pop()?.toLowerCase();
  return (ext && EXT_MIME[ext]) || normalized || 'application/octet-stream';
}

/** Sanitize display name for API / UI. */
function safeFileName(name: string): string {
  const cleaned = name.replace(/[/\\?%*:|"<>]/g, '_').trim();
  return cleaned || 'upload.bin';
}

/**
 * DocumentPicker cache URIs are readable by native File.upload, but not by
 * copyAsync/bytes() in Expo Go. Upload in place and send the real name as a form field.
 */
async function uploadFilesNative(
  assets: { uri: string; name: string; mimeType: string }[],
  folderId?: string | null,
): Promise<FileItem[]> {
  const url = `${getApiBaseUrl()}/api/files/upload`;
  const saved: FileItem[] = [];

  for (const asset of assets) {
    const { accessToken } = await loadTokens();
    const file = new File(asset.uri);
    const parameters: Record<string, string> = { name: asset.name };
    if (folderId) parameters.folderId = folderId;

    const result = await file.upload(url, {
      httpMethod: 'POST',
      uploadType: UploadType.MULTIPART,
      fieldName: 'file',
      mimeType: asset.mimeType,
      headers: {
        Accept: 'application/json',
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      parameters,
    });

    let json: ApiEnvelope<FileItem[]> | null = null;
    try {
      json = JSON.parse(result.body) as ApiEnvelope<FileItem[]>;
    } catch {
      json = null;
    }

    if (result.status >= 400 || json?.success === false) {
      throw new ApiError(json?.message ?? `Upload failed (${result.status})`, result.status, json);
    }
    if (json?.data?.length) saved.push(...json.data);
  }

  return saved;
}

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

  if (Platform.OS === 'web') {
    const formData = new FormData();
    for (const asset of result.assets) {
      const name = safeFileName(asset.name ?? 'upload.bin');
      if (asset.file) {
        formData.append('file', asset.file, name);
      } else {
        const res = await fetch(asset.uri);
        const blob = await res.blob();
        formData.append(
          'file',
          new Blob([await blob.arrayBuffer()], { type: resolveUploadMime(asset.mimeType, name) }),
          name,
        );
      }
    }
    if (folderId) formData.append('folderId', folderId);
    return filesApi.upload(formData);
  }

  return uploadFilesNative(
    result.assets.map((asset) => ({
      uri: asset.uri,
      name: safeFileName(asset.name ?? 'upload.bin'),
      mimeType: resolveUploadMime(asset.mimeType, asset.name ?? 'upload.bin'),
    })),
    folderId,
  );
}

function resolveMimeType(file: FileItem): string {
  return (
    file.mimeType ||
    EXT_MIME[file.name.split('.').pop()?.toLowerCase() ?? ''] ||
    'application/octet-stream'
  );
}

/** Download an authenticated file into the native cache (Android/iOS). */
export async function downloadNativeFile(
  file: FileItem,
  vaultPin?: string | null,
): Promise<File> {
  const { accessToken } = await loadTokens();
  const headers: Record<string, string> = {};
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
  if (vaultPin) headers['x-vault-pin'] = vaultPin;

  const destination = new File(Paths.cache, `${file._id}-${safeFileName(file.name)}`);
  return File.downloadFileAsync(
    `${getApiBaseUrl()}/api/files/${file._id}/download`,
    destination,
    { headers, idempotent: true },
  );
}

/** Download an authenticated file to a local URI (cache path or web blob URL). */
export async function downloadFileLocal(
  file: FileItem,
  vaultPin?: string | null,
): Promise<string> {
  if (Platform.OS === 'web') {
    const { blob } = await filesApi.download(file._id, vaultPin);
    return URL.createObjectURL(blob);
  }

  const downloaded = await downloadNativeFile(file, vaultPin);
  return downloaded.uri;
}

/**
 * Open with a compatible viewer app (Android ACTION_VIEW).
 * Falls back to the share sheet when no viewer is available.
 */
export async function openWithCompatibleApp(file: FileItem, vaultPin?: string | null) {
  const mimeType = resolveMimeType(file);

  if (Platform.OS === 'web') {
    const uri = await downloadFileLocal(file, vaultPin);
    globalThis.open?.(uri, '_blank', 'noopener,noreferrer');
    return;
  }

  const local = await downloadNativeFile(file, vaultPin);

  if (Platform.OS === 'android') {
    try {
      await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
        data: local.contentUri,
        type: mimeType,
        flags: FLAG_GRANT_READ_URI_PERMISSION,
      });
      return;
    } catch {
      // No installed viewer for this MIME type — fall through to share.
    }
  }

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(local.uri, { mimeType, dialogTitle: file.name });
    return;
  }

  await Share.share({ url: local.uri, title: file.name });
}

/** Share / save the file (share sheet — not the same as “Open with”). */
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

  const local = await downloadNativeFile(file, vaultPin);
  const mimeType = resolveMimeType(file);

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(local.uri, { mimeType, dialogTitle: file.name });
    return;
  }

  await Share.share({ url: local.uri, title: file.name });
}

/** Navigate to the in-app preview / open screen for an uploaded file. */
export function openUploadedFile(file: FileItem) {
  router.push(`/files/preview/${file._id}`);
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
  showActionSheet(file.name, [
    {
      label: 'Download / Share',
      onPress: runAction(() => downloadAndShare(file, opts.vaultPin), opts.onChanged),
    },
    { label: 'Rename', onPress: runAction(() => renameFile(file), opts.onChanged) },
    {
      label: 'Duplicate',
      onPress: runAction(() => filesApi.duplicate(file._id), opts.onChanged),
    },
    {
      label: file.isFavorite ? 'Unfavorite' : 'Favorite',
      onPress: runAction(() => toggleFileFavorite(file), opts.onChanged),
    },
    {
      label: file.isVault ? 'Restore from vault' : 'Move to vault',
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
      label: 'Delete',
      destructive: true,
      onPress: runAction(async () => {
        if (!(await confirmDelete(file.name))) return;
        await filesApi.remove(file._id);
      }, opts.onChanged),
    },
    { label: 'Cancel', cancel: true },
  ]);
}

export function showFolderActions(
  folder: FolderItem,
  opts: { onChanged: () => void; vaultPin?: string | null },
) {
  showActionSheet(folder.name, [
    { label: 'Rename', onPress: runAction(() => renameFolder(folder), opts.onChanged) },
    {
      label: folder.isFavorite ? 'Unfavorite' : 'Favorite',
      onPress: runAction(() => toggleFolderFavorite(folder), opts.onChanged),
    },
    {
      label: folder.isVault ? 'Restore from vault' : 'Move to vault',
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
      label: 'Delete',
      destructive: true,
      onPress: runAction(async () => {
        if (!(await confirmDelete(folder.name))) return;
        await foldersApi.remove(folder._id);
      }, opts.onChanged),
    },
    { label: 'Cancel', cancel: true },
  ]);
}
