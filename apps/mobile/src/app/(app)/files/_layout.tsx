import { Stack } from 'expo-router';

export default function FilesLayout() {
  return (
    <Stack
      screenOptions={{
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Files' }} />
      <Stack.Screen name="[folderId]" options={{ title: 'Folder' }} />
    </Stack>
  );
}
