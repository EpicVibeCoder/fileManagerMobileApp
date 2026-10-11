import { Link, router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button, ErrorText, Field, Screen } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { ApiError } from '@/lib/api/client';
import { useAuth } from '@/lib/auth-context';

export default function SignupScreen() {
  const { signup } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    setError(null);
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await signup(email.trim(), password, confirmPassword);
      router.replace('/dashboard');
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <ThemedText themeColor="textSecondary" style={{ marginBottom: Spacing.three }}>
          By creating an account you accept the terms of use.
        </ThemedText>
        <Field
          label="Email"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <Field label="Password" secureTextEntry value={password} onChangeText={setPassword} />
        <Field
          label="Confirm password"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
        <ErrorText message={error} />
        <Button title="Create account" onPress={onSubmit} loading={loading} />
        <View style={styles.links}>
          <Link href="/login">
            <ThemedText type="linkPrimary">Already have an account?</ThemedText>
          </Link>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingVertical: Spacing.two },
  links: { marginTop: Spacing.three, alignItems: 'center' },
});
