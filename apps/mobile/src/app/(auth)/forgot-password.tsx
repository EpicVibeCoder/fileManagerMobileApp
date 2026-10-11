import { router } from 'expo-router';
import { useState } from 'react';

import { ThemedText } from '@/components/themed-text';
import { Button, ErrorText, Field, Screen } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { ApiError } from '@/lib/api/client';
import { authApi } from '@/lib/api/endpoints';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    setError(null);
    setInfo(null);
    setLoading(true);
    try {
      const data = await authApi.forgotPassword(email.trim());
      const otpHint = data && 'otp' in data && data.otp ? ` Dev OTP: ${data.otp}` : '';
      setInfo(`If the email exists, an OTP was sent.${otpHint}`);
      router.push({ pathname: '/verify-otp', params: { email: email.trim(), otp: data?.otp ?? '' } });
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <ThemedText themeColor="textSecondary" style={{ marginBottom: Spacing.three }}>
        Enter your email to receive a one-time password.
      </ThemedText>
      <Field
        label="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <ErrorText message={error} />
      {info ? <ThemedText type="small">{info}</ThemedText> : null}
      <Button title="Send OTP" onPress={onSubmit} loading={loading} disabled={!email} />
    </Screen>
  );
}
