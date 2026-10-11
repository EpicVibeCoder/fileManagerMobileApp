import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

import { ThemedText } from '@/components/themed-text';
import { Button, ErrorText, Field, Screen } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { ApiError } from '@/lib/api/client';
import { authApi } from '@/lib/api/endpoints';

export default function ResetPasswordScreen() {
  const { token } = useLocalSearchParams<{ token?: string }>();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    setError(null);
    if (!token) {
      setError('Missing reset token');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await authApi.resetPassword(token, password);
      router.replace('/login');
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <ThemedText themeColor="textSecondary" style={{ marginBottom: Spacing.three }}>
        Choose a new password (min 6 characters).
      </ThemedText>
      <Field label="New password" secureTextEntry value={password} onChangeText={setPassword} />
      <Field label="Confirm password" secureTextEntry value={confirm} onChangeText={setConfirm} />
      <ErrorText message={error} />
      <Button title="Reset password" onPress={onSubmit} loading={loading} />
    </Screen>
  );
}
