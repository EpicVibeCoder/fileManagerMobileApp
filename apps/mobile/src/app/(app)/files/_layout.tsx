import { Stack } from 'expo-router';

import { useTheme } from '@/hooks/use-theme';

export default function FilesLayout() {
  const theme = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShadowVisible: false,
        headerStyle: { backgroundColor: theme.background },
        headerTintColor: theme.text,
        contentStyle: { backgroundColor: theme.background },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Files' }} />
      <Stack.Screen name="preview/[id]" options={{ title: 'Preview' }} />
      <Stack.Screen name="[folderId]" options={{ title: 'Folder' }} />
    </Stack>
  );
}
