import { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type PromptRequest = {
  title: string;
  initial: string;
  resolve: (value: string | null) => void;
};

let openPrompt: ((req: Omit<PromptRequest, 'resolve'> & { resolve: PromptRequest['resolve'] }) => void) | null =
  null;

export function askForName(title: string, initial: string): Promise<string | null> {
  return new Promise((resolve) => {
    if (!openPrompt) {
      resolve(null);
      return;
    }
    openPrompt({ title, initial, resolve });
  });
}

export function NamePromptHost() {
  const theme = useTheme();
  const [req, setReq] = useState<PromptRequest | null>(null);
  const [value, setValue] = useState('');

  useEffect(() => {
    openPrompt = (next) => {
      setValue(next.initial);
      setReq(next);
    };
    return () => {
      openPrompt = null;
    };
  }, []);

  const close = (result: string | null) => {
    req?.resolve(result);
    setReq(null);
  };

  return (
    <Modal visible={Boolean(req)} transparent animationType="fade" onRequestClose={() => close(null)}>
      <View style={styles.backdrop}>
        <View style={[styles.card, { backgroundColor: theme.background }]}>
          <ThemedText type="smallBold">{req?.title}</ThemedText>
          <TextInput
            value={value}
            onChangeText={setValue}
            autoFocus
            style={[
              styles.input,
              {
                color: theme.text,
                backgroundColor: theme.backgroundElement,
                borderColor: theme.backgroundSelected,
              },
            ]}
          />
          <View style={styles.actions}>
            <Pressable onPress={() => close(null)} style={styles.action}>
              <ThemedText>Cancel</ThemedText>
            </Pressable>
            <Pressable
              onPress={() => close(value.trim() ? value.trim() : null)}
              style={styles.action}
            >
              <ThemedText type="linkPrimary">OK</ThemedText>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    padding: Spacing.four,
  },
  card: {
    borderRadius: 14,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: Spacing.three,
    paddingVertical: 12,
    fontSize: 16,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.three,
  },
  action: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.two,
  },
});
