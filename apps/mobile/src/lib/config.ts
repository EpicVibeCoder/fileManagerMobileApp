import { Platform } from 'react-native';

const fromEnv = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, '');

/** Default API base URL for local development across platforms. */
export function getApiBaseUrl(): string {
  if (fromEnv) return fromEnv;
  if (Platform.OS === 'android') return 'http://10.0.2.2:8080';
  return 'http://localhost:8080';
}
