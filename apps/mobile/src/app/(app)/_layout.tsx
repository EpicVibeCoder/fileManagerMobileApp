import { Tabs } from 'expo-router';

import {
  CalendarIcon,
  FilesIcon,
  HomeIcon,
  StarIcon,
  UserIcon,
  VaultIcon,
} from '@/components/icons';
import { useTheme } from '@/hooks/use-theme';

export default function AppTabsLayout() {
  const theme = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShadowVisible: false,
        tabBarActiveTintColor: '#1B6EF3',
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.background,
          borderTopColor: theme.backgroundSelected,
        },
        headerStyle: { backgroundColor: theme.background },
        headerTintColor: theme.text,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Home',
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => (
            <HomeIcon color={String(color)} size={size ?? 22} />
          ),
        }}
      />
      <Tabs.Screen
        name="files"
        options={{
          title: 'Files',
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <FilesIcon color={String(color)} size={size ?? 22} />
          ),
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: 'Favorites',
          tabBarIcon: ({ color, size }) => (
            <StarIcon color={String(color)} size={size ?? 22} />
          ),
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: 'Calendar',
          tabBarIcon: ({ color, size }) => (
            <CalendarIcon color={String(color)} size={size ?? 22} />
          ),
        }}
      />
      <Tabs.Screen
        name="vault"
        options={{
          title: 'Vault',
          tabBarIcon: ({ color, size }) => (
            <VaultIcon color={String(color)} size={size ?? 22} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <UserIcon color={String(color)} size={size ?? 22} />
          ),
        }}
      />
    </Tabs>
  );
}
