import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  TextInput,
  View,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const ACCENT = '#1B6EF3';

export function Screen({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return (
    <ThemedView style={[styles.screen, style]}>
      {children}
    </ThemedView>
  );
}

export function Field({
  label,
  error,
  ...props
}: TextInputProps & { label: string; error?: string }) {
  const theme = useTheme();
  return (
    <View style={styles.field}>
      <ThemedText type="smallBold">{label}</ThemedText>
      <TextInput
        placeholderTextColor={theme.textSecondary}
        style={[
          styles.input,
          {
            color: theme.text,
            backgroundColor: theme.backgroundElement,
            borderColor: error ? '#D94841' : theme.backgroundSelected,
          },
        ]}
        {...props}
      />
      {error ? (
        <ThemedText type="small" style={styles.error}>
          {error}
        </ThemedText>
      ) : null}
    </View>
  );
}

export function Button({
  title,
  onPress,
  disabled,
  loading,
  variant = 'primary',
  flex = false,
}: {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
  flex?: boolean;
}) {
  const theme = useTheme();
  const backgroundColor =
    variant === 'primary' ? ACCENT : variant === 'danger' ? '#D94841' : theme.backgroundElement;
  const color = variant === 'secondary' ? theme.text : '#ffffff';

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.button,
        flex ? styles.buttonFlex : null,
        { backgroundColor, opacity: disabled || loading ? 0.5 : pressed ? 0.85 : 1 },
      ]}
    >
      {loading ? (
        <ActivityIndicator color={color} />
      ) : (
        <ThemedText style={{ color, fontWeight: '600' }}>{title}</ThemedText>
      )}
    </Pressable>
  );
}

export function EmptyState({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View style={styles.empty}>
      <ThemedText type="subtitle" style={{ fontSize: 22, lineHeight: 28 }}>
        {title}
      </ThemedText>
      {subtitle ? (
        <ThemedText themeColor="textSecondary" style={{ textAlign: 'center' }}>
          {subtitle}
        </ThemedText>
      ) : null}
    </View>
  );
}

export function ErrorText({ message }: { message?: string | null }) {
  if (!message) return null;
  return (
    <ThemedText type="small" style={styles.error}>
      {message}
    </ThemedText>
  );
}

export function formatBytes(bytes?: number) {
  if (bytes == null) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
  return `${(bytes / 1024 ** 3).toFixed(2)} GB`;
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: Spacing.three,
  },
  field: {
    gap: Spacing.one,
    marginBottom: Spacing.three,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: Spacing.three,
    paddingVertical: 12,
    fontSize: 16,
  },
  button: {
    minHeight: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.three,
  },
  buttonFlex: {
    flexGrow: 1,
    flexBasis: 0,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    padding: Spacing.four,
  },
  error: {
    color: '#D94841',
  },
});
