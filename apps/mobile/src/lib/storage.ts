import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const ACCESS_KEY = 'fm_access_token';
const REFRESH_KEY = 'fm_refresh_token';
const USER_KEY = 'fm_user';

async function setItem(key: string, value: string) {
  if (Platform.OS === 'web') {
    globalThis.localStorage?.setItem(key, value);
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

async function getItem(key: string) {
  if (Platform.OS === 'web') {
    return globalThis.localStorage?.getItem(key) ?? null;
  }
  return SecureStore.getItemAsync(key);
}

async function deleteItem(key: string) {
  if (Platform.OS === 'web') {
    globalThis.localStorage?.removeItem(key);
    return;
  }
  await SecureStore.deleteItemAsync(key);
}

export async function saveTokens(accessToken: string, refreshToken: string) {
  await setItem(ACCESS_KEY, accessToken);
  await setItem(REFRESH_KEY, refreshToken);
}

export async function loadTokens() {
  const [accessToken, refreshToken] = await Promise.all([getItem(ACCESS_KEY), getItem(REFRESH_KEY)]);
  return { accessToken, refreshToken };
}

export async function clearTokens() {
  await Promise.all([deleteItem(ACCESS_KEY), deleteItem(REFRESH_KEY), deleteItem(USER_KEY)]);
}

export async function saveUserJson(userJson: string) {
  await setItem(USER_KEY, userJson);
}

export async function loadUserJson() {
  return getItem(USER_KEY);
}
