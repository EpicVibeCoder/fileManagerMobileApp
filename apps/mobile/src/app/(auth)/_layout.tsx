import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerShadowVisible: false,
        title: '',
      }}
    >
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="signup" options={{ title: 'Create account' }} />
      <Stack.Screen name="forgot-password" options={{ title: 'Forgot password' }} />
      <Stack.Screen name="verify-otp" options={{ title: 'Verify OTP' }} />
      <Stack.Screen name="reset-password" options={{ title: 'Reset password' }} />
    </Stack>
  );
}
