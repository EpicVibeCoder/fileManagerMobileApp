import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { createElement, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { DocIcon, ImageIcon, PdfIcon } from '@/components/icons';
import { ThemedText } from '@/components/themed-text';
import { Button, ErrorText, Screen, formatBytes } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { ApiError } from '@/lib/api/client';
import { filesApi } from '@/lib/api/endpoints';
import { downloadAndShare, downloadFileLocal, openWithCompatibleApp } from '@/lib/browser-actions';
import { useVault } from '@/lib/vault-context';

const ACCENT = '#1B6EF3';

function isImageFile(type?: string, mimeType?: string, name?: string) {
  if (type === 'image' || mimeType?.startsWith('image/')) return true;
  const ext = name?.split('.').pop()?.toLowerCase();
  return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'heic', 'bmp'].includes(ext ?? '');
}

function isPdfFile(type?: string, mimeType?: string, name?: string) {
  if (type === 'pdf' || mimeType === 'application/pdf') return true;
  return name?.toLowerCase().endsWith('.pdf') ?? false;
}

export default function FilePreviewScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();
  const theme = useTheme();
  const { pin } = useVault();
  const [localUri, setLocalUri] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [opening, setOpening] = useState(false);

  const fileQuery = useQuery({
    queryKey: ['file', id],
    queryFn: () => filesApi.get(id),
    enabled: Boolean(id),
  });

  const file = fileQuery.data;

  useEffect(() => {
    navigation.setOptions({ title: file?.name ?? 'Preview' });
  }, [navigation, file?.name]);

  useEffect(() => {
    let cancelled = false;
    let objectUrl: string | null = null;

    async function load() {
      if (!file) return;
      setLoadError(null);
      setLocalUri(null);

      const vaultPin = file.isVault ? pin : null;
      if (file.isVault && !vaultPin) {
        setLoadError('Unlock the vault to open this file');
        return;
      }

      try {
        const uri = await downloadFileLocal(file, vaultPin);
        if (cancelled) {
          if (Platform.OS === 'web' && uri.startsWith('blob:')) URL.revokeObjectURL(uri);
          return;
        }
        if (Platform.OS === 'web' && uri.startsWith('blob:')) objectUrl = uri;
        setLocalUri(uri);
      } catch (e) {
        if (!cancelled) {
          setLoadError(
            e instanceof ApiError ? e.message : e instanceof Error ? e.message : 'Could not open file',
          );
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [file, pin]);

  const onOpenExternally = async () => {
    if (!file) return;
    setOpening(true);
    setLoadError(null);
    try {
      await openWithCompatibleApp(file, file.isVault ? pin : null);
    } catch (e) {
      setLoadError(
        e instanceof ApiError ? e.message : e instanceof Error ? e.message : 'Could not open file',
      );
    } finally {
      setOpening(false);
    }
  };

  const onShare = async () => {
    if (!file) return;
    setOpening(true);
    setLoadError(null);
    try {
      await downloadAndShare(file, file.isVault ? pin : null);
    } catch (e) {
      setLoadError(
        e instanceof ApiError ? e.message : e instanceof Error ? e.message : 'Could not share file',
      );
    } finally {
      setOpening(false);
    }
  };

  const showImage = file && isImageFile(file.type, file.mimeType, file.name);
  const showPdfWeb = Platform.OS === 'web' && file && isPdfFile(file.type, file.mimeType, file.name);
  const TypeIcon = showImage ? ImageIcon : isPdfFile(file?.type, file?.mimeType, file?.name)
    ? PdfIcon
    : DocIcon;

  return (
    <Screen style={{ paddingTop: Spacing.two }}>
      {fileQuery.isLoading ? <ActivityIndicator /> : null}
      {fileQuery.error ? (
        <ErrorText
          message={
            fileQuery.error instanceof ApiError
              ? fileQuery.error.message
              : 'Failed to load file'
          }
        />
      ) : null}
      <ErrorText message={loadError} />

      {file && !fileQuery.isLoading ? (
        <ScrollView contentContainerStyle={styles.content}>
          <View style={[styles.meta, { backgroundColor: theme.backgroundElement }]}>
            <View style={[styles.iconBadge, { backgroundColor: theme.backgroundSelected }]}>
              <TypeIcon size={28} color={ACCENT} />
            </View>
            <View style={styles.metaText}>
              <ThemedText type="smallBold" numberOfLines={2}>
                {file.name}
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {file.type ?? 'file'} · {formatBytes(file.size)}
              </ThemedText>
            </View>
          </View>

          {!localUri && !loadError ? <ActivityIndicator style={{ marginTop: Spacing.four }} /> : null}

          {localUri && showImage ? (
            <Image
              source={{ uri: localUri }}
              style={styles.image}
              contentFit="contain"
              transition={200}
            />
          ) : null}

          {localUri && showPdfWeb
            ? createElement('iframe', {
                title: file.name,
                src: localUri,
                style: { width: '100%', height: 480, border: 'none', borderRadius: 12 },
              })
            : null}

          {localUri && !showImage && !showPdfWeb ? (
            <View style={styles.openBlock}>
              <ThemedText themeColor="textSecondary" style={{ textAlign: 'center' }}>
                Preview is not available for this file type. Open it with a compatible app.
              </ThemedText>
              <Button title="Open with…" onPress={onOpenExternally} loading={opening} />
              <Button title="Share" onPress={onShare} loading={opening} variant="secondary" />
            </View>
          ) : null}

          {localUri && (showImage || showPdfWeb) ? (
            <View style={styles.openBlock}>
              <Button title="Open with…" onPress={onOpenExternally} loading={opening} />
              <Button title="Share" onPress={onShare} loading={opening} variant="secondary" />
            </View>
          ) : null}
        </ScrollView>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing.three,
    paddingBottom: Spacing.six,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    padding: Spacing.three,
    borderRadius: 14,
  },
  iconBadge: {
    width: 52,
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metaText: {
    flex: 1,
    gap: 4,
  },
  image: {
    width: '100%',
    height: 420,
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  openBlock: {
    gap: Spacing.three,
    paddingVertical: Spacing.four,
    alignItems: 'stretch',
  },
});
