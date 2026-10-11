import { Tabs } from 'expo-router';

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
      <Tabs.Screen name="dashboard" options={{ title: 'Home', tabBarLabel: 'Home' }} />
      <Tabs.Screen name="files" options={{ title: 'Files', headerShown: false }} />
      <Tabs.Screen name="favorites" options={{ title: 'Favorites' }} />
      <Tabs.Screen name="calendar" options={{ title: 'Calendar' }} />
      <Tabs.Screen name="vault" options={{ title: 'Vault' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}
