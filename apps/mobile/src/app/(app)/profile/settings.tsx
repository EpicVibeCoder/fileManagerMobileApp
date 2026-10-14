import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { CheckCircleIcon, LockIcon, ShieldIcon, UserIcon } from '@/components/icons';
import { ThemedText } from '@/components/themed-text';
import { Button, ErrorText, Field, Screen } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { ApiError } from '@/lib/api/client';
import { authApi } from '@/lib/api/endpoints';
import { useAuth } from '@/lib/auth-context';

const ACCENT = '#1B6EF3';

export default function SettingsScreen() {
  const theme = useTheme();
  const { user, refreshUser } = useAuth();
  const [username, setUsername] = useState(user?.username ?? '');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

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
    <Screen style={{ paddingTop: Spacing.two }}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={[styles.section, { backgroundColor: theme.backgroundElement }]}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIcon, { backgroundColor: theme.backgroundSelected }]}>
              <UserIcon size={18} color={ACCENT} />
            </View>
            <View style={{ flex: 1 }}>
              <ThemedText type="smallBold">Account</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                Update how your name appears
              </ThemedText>
            </View>
          </View>
          <Field label="Username" value={username} onChangeText={setUsername} />
          <Button
            title="Save profile"
            onPress={saveProfile}
            loading={busy}
            icon={<UserIcon size={18} color="#fff" />}
          />
        </View>

        <View style={[styles.section, { backgroundColor: theme.backgroundElement }]}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIcon, { backgroundColor: theme.backgroundSelected }]}>
              <ShieldIcon size={18} color={ACCENT} />
            </View>
            <View style={{ flex: 1 }}>
              <ThemedText type="smallBold">Security</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                Change your password
              </ThemedText>
            </View>
            <LockIcon size={18} color={theme.textSecondary} />
          </View>
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
          <Button
            title="Update password"
            onPress={changePassword}
            loading={busy}
            icon={<LockIcon size={18} color="#fff" />}
          />
        </View>

        <ErrorText message={error} />
        {message ? (
          <View style={styles.messageRow}>
            <CheckCircleIcon size={16} color={ACCENT} />
            <ThemedText type="small" style={{ color: ACCENT }}>
              {message}
            </ThemedText>
          </View>
        ) : null}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: Spacing.six,
    gap: Spacing.three,
  },
  section: {
    borderRadius: 16,
    padding: Spacing.three,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginBottom: Spacing.three,
  },
  sectionIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
});
