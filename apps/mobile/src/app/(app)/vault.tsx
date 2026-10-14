import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

import { FileRow } from '@/components/file-row';
import { LockIcon, ShieldIcon, VaultIcon } from '@/components/icons';
import { ThemedText } from '@/components/themed-text';
import { Button, EmptyState, ErrorText, Field, Screen } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { ApiError } from '@/lib/api/client';
import { vaultApi } from '@/lib/api/endpoints';
import { showFileActions, showFolderActions } from '@/lib/browser-actions';
import { useVault } from '@/lib/vault-context';

const ACCENT = '#1B6EF3';

export default function VaultScreen() {
  const theme = useTheme();
  const { pin, isUnlocked, unlock, lock } = useVault();
  const [inputPin, setInputPin] = useState('');
  const [mode, setMode] = useState<'unlock' | 'set'>('unlock');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const query = useQuery({
    queryKey: ['vault', pin],
    queryFn: () => vaultApi.list(pin!),
    enabled: Boolean(pin),
  });

  const onUnlock = async () => {
    setBusy(true);
    setError(null);
    try {
      if (mode === 'set') {
        await vaultApi.setPin(inputPin);
      } else {
        await vaultApi.verifyPin(inputPin);
      }
      unlock(inputPin);
      setInputPin('');
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'Vault error';
      setError(msg);
      if (msg.toLowerCase().includes('not set')) setMode('set');
    } finally {
      setBusy(false);
    }
  };

  if (!isUnlocked || !pin) {
    return (
      <Screen>
        <View style={[styles.lockHero, { backgroundColor: theme.backgroundElement }]}>
          <View style={[styles.lockBadge, { backgroundColor: theme.backgroundSelected }]}>
            <VaultIcon size={32} color={ACCENT} />
          </View>
          <ThemedText type="subtitle" style={{ fontSize: 26, lineHeight: 32 }}>
            Secure vault
          </ThemedText>
          <ThemedText themeColor="textSecondary" style={{ textAlign: 'center' }}>
            {mode === 'set'
              ? 'Create a PIN (at least 4 characters) to protect private files.'
              : 'Enter your vault PIN. It clears when the app backgrounds.'}
          </ThemedText>
        </View>
        <Field
          label="PIN"
          secureTextEntry
          keyboardType="number-pad"
          value={inputPin}
          onChangeText={setInputPin}
        />
        <ErrorText message={error} />
        <Button
          title={mode === 'set' ? 'Set PIN' : 'Unlock'}
          onPress={onUnlock}
          loading={busy}
          disabled={inputPin.length < 4}
          icon={
            mode === 'set' ? (
              <ShieldIcon size={18} color="#fff" />
            ) : (
              <LockIcon size={18} color="#fff" />
            )
          }
        />
        <View style={{ height: Spacing.three }} />
        <Button
          title={mode === 'set' ? 'I already have a PIN' : 'Set / update PIN'}
          variant="secondary"
          onPress={() => setMode(mode === 'set' ? 'unlock' : 'set')}
        />
      </Screen>
    );
  }

  const files = query.data?.files ?? [];
  const folders = query.data?.folders ?? [];

  return (
    <Screen style={{ paddingTop: Spacing.two }}>
      <View style={[styles.toolbar, { backgroundColor: theme.backgroundElement }]}>
        <View style={styles.toolbarLeft}>
          <View style={[styles.smallBadge, { backgroundColor: theme.backgroundSelected }]}>
            <VaultIcon size={18} color={ACCENT} />
          </View>
          <ThemedText type="smallBold">Vault unlocked</ThemedText>
        </View>
        <Button
          title="Lock"
          variant="secondary"
          onPress={lock}
          icon={<LockIcon size={16} color={theme.text} />}
        />
      </View>
      {query.isLoading ? <ActivityIndicator /> : null}
      {query.error ? (
        <ErrorText
          message={query.error instanceof ApiError ? query.error.message : 'Failed to load vault'}
        />
      ) : null}
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={query.isRefetching} onRefresh={() => query.refetch()} />
        }
      >
        {!files.length && !folders.length && !query.isLoading ? (
          <EmptyState
            title="Vault is empty"
            subtitle="Long-press a file in Files and choose Move to vault"
            icon={<VaultIcon size={28} color={ACCENT} />}
          />
        ) : null}
        {folders.map((folder) => (
          <FileRow
            key={folder._id}
            item={folder}
            kind="folder"
            onPress={() => router.push(`/files/${folder._id}`)}
            onLongPress={() =>
              showFolderActions(folder, {
                vaultPin: pin,
                onChanged: () => void query.refetch(),
              })
            }
          />
        ))}
        {files.map((file) => (
          <FileRow
            key={file._id}
            item={file}
            kind="file"
            onLongPress={() =>
              showFileActions(file, {
                vaultPin: pin,
                onChanged: () => void query.refetch(),
              })
            }
          />
        ))}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  lockHero: {
    alignItems: 'center',
    borderRadius: 20,
    padding: Spacing.four,
    gap: Spacing.two,
    marginBottom: Spacing.four,
  },
  lockBadge: {
    width: 72,
    height: 72,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.two,
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.three,
    borderRadius: 14,
    padding: Spacing.two,
    paddingLeft: Spacing.three,
  },
  toolbarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  smallBadge: {
    width: 32,
    height: 32,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
