import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

import { ThemedText } from '@/components/themed-text';
import { Button, ErrorText, Field, Screen } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { ApiError } from '@/lib/api/client';
import { authApi } from '@/lib/api/endpoints';

export default function VerifyOtpScreen() {
  const params = useLocalSearchParams<{ email?: string; otp?: string }>();
  const [email, setEmail] = useState(params.email ?? '');
  const [otp, setOtp] = useState(params.otp ?? '');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    setError(null);
    setLoading(true);
    try {
      const { resetToken } = await authApi.verifyOtp(email.trim(), otp.trim());
      router.replace({
        pathname: '/reset-password',
        params: { token: resetToken },
      });
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <ThemedText themeColor="textSecondary" style={{ marginBottom: Spacing.three }}>
        Enter the 6-digit OTP sent to your email.
      </ThemedText>
      <Field label="Email" autoCapitalize="none" value={email} onChangeText={setEmail} />
      <Field
        label="OTP"
        keyboardType="number-pad"
        maxLength={6}
        value={otp}
        onChangeText={setOtp}
      />
      <ErrorText message={error} />
      <Button title="Verify" onPress={onSubmit} loading={loading} disabled={otp.length !== 6} />
    </Screen>
  );
}
