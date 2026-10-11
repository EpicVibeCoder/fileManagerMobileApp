import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button, ErrorText, Field, Screen, formatBytes } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { ApiError } from '@/lib/api/client';
import { authApi, healthApi } from '@/lib/api/endpoints';
import { useAuth } from '@/lib/auth-context';
import { getApiBaseUrl } from '@/lib/config';

export default function ProfileScreen() {
  const { user, logout, refreshUser } = useAuth();
  const [username, setUsername] = useState(user?.username ?? '');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const health = useQuery({
    queryKey: ['health'],
    queryFn: () => healthApi.check(),
    refetchInterval: 60_000,
  });

  const saveProfile = async () => {
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const { user: next } = await authApi.updateProfile(username.trim());
      await refreshUser(next);
      setMessage('Profile updated');
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Update failed');
    } finally {
      setBusy(false);
    }
  };

  const changePassword = async () => {
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      await authApi.changePassword(oldPassword, newPassword);
      setOldPassword('');
      setNewPassword('');
      setMessage('Password changed');
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Password change failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingBottom: Spacing.six }}>
        <ThemedText type="subtitle" style={{ fontSize: 26, lineHeight: 32 }}>
          Profile
        </ThemedText>
        <ThemedText themeColor="textSecondary" style={{ marginBottom: Spacing.four }}>
          {user?.email}
        </ThemedText>

        <View style={styles.block}>
          <ThemedText type="smallBold">API status</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {getApiBaseUrl()}
          </ThemedText>
          <ThemedText type="small">
            {health.data
              ? `${health.data.status} · DB ${health.data.database}`
              : health.isError
                ? 'Unreachable'
                : 'Checking…'}
          </ThemedText>
          {user?.storageLimit != null ? (
            <ThemedText type="small" themeColor="textSecondary">
              Storage {formatBytes(user.storageUsed)} / {formatBytes(user.storageLimit)}
            </ThemedText>
          ) : null}
        </View>

        <Field label="Username" value={username} onChangeText={setUsername} />
        <Button title="Save profile" onPress={saveProfile} loading={busy} />

        <View style={{ height: Spacing.four }} />
        <ThemedText type="smallBold" style={{ marginBottom: Spacing.two }}>
          Change password
        </ThemedText>
        <Field
          label="Current password"
          secureTextEntry
          value={oldPassword}
          onChangeText={setOldPassword}
        />
        <Field
          label="New password"
          secureTextEntry
          value={newPassword}
          onChangeText={setNewPassword}
        />
        <Button title="Update password" onPress={changePassword} loading={busy} variant="secondary" />

        <ErrorText message={error} />
        {message ? (
          <ThemedText type="small" style={{ color: '#1B6EF3', marginTop: Spacing.two }}>
            {message}
          </ThemedText>
        ) : null}

        <View style={{ height: Spacing.five }} />
        <Button title="Sign out" onPress={() => void logout()} variant="danger" />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  block: {
    gap: Spacing.one,
    marginBottom: Spacing.four,
  },
});
