import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';

import { FileRow } from '@/components/file-row';
import { ThemedText } from '@/components/themed-text';
import { Button, EmptyState, ErrorText, Field, Screen } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { ApiError } from '@/lib/api/client';
import { vaultApi } from '@/lib/api/endpoints';
import { showFileActions, showFolderActions } from '@/lib/browser-actions';
import { useVault } from '@/lib/vault-context';

export default function VaultScreen() {
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
        <ThemedText type="subtitle" style={{ fontSize: 26, lineHeight: 32, marginBottom: Spacing.two }}>
          Secure vault
        </ThemedText>
        <ThemedText themeColor="textSecondary" style={{ marginBottom: Spacing.four }}>
          {mode === 'set'
            ? 'Create a PIN (at least 4 characters) to protect private files.'
            : 'Enter your vault PIN. It clears when the app backgrounds.'}
        </ThemedText>
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
      <View style={styles.toolbar}>
        <ThemedText type="smallBold">Vault unlocked</ThemedText>
        <Button title="Lock" variant="secondary" onPress={lock} />
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
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.three,
  },
});
