import { Link, router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button, ErrorText, Field, Screen } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { ApiError } from '@/lib/api/client';
import { healthApi } from '@/lib/api/endpoints';
import { useAuth } from '@/lib/auth-context';
import { getApiBaseUrl } from '@/lib/config';

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [apiStatus, setApiStatus] = useState<string>('Checking API…');

  useEffect(() => {
    healthApi
      .check()
      .then((h) => setApiStatus(`API ${h.status} · DB ${h.database}`))
      .catch(() => setApiStatus(`API unreachable (${getApiBaseUrl()})`));
  }, []);

  const onSubmit = async () => {
    setError(null);
    setLoading(true);
    try {
      await login(email.trim(), password);
      router.replace('/dashboard');
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.hero}>
            <ThemedText type="subtitle">File Manager</ThemedText>
            <ThemedText themeColor="textSecondary">Sign in to your storage</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {apiStatus}
            </ThemedText>
          </View>

          <Field
            label="Email"
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
            value={email}
            onChangeText={setEmail}
          />
          <Field
            label="Password"
            secureTextEntry
            autoComplete="password"
            value={password}
            onChangeText={setPassword}
          />
          <ErrorText message={error} />
          <Button title="Sign in" onPress={onSubmit} loading={loading} disabled={!email || !password} />

          <View style={{ height: Spacing.two }} />
          <Button
            title="Continue with Google"
            variant="secondary"
            onPress={() => {
              void WebBrowser.openBrowserAsync(`${getApiBaseUrl()}/api/auth/google`);
            }}
          />

          <View style={styles.links}>
            <Link href="/signup">
              <ThemedText type="linkPrimary">Create account</ThemedText>
            </Link>
            <Link href="/forgot-password">
              <ThemedText type="linkPrimary">Forgot password?</ThemedText>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    gap: Spacing.one,
    paddingVertical: Spacing.five,
  },
  hero: {
    gap: Spacing.one,
    marginBottom: Spacing.four,
  },
  links: {
    marginTop: Spacing.three,
    gap: Spacing.two,
    alignItems: 'center',
  },
});
