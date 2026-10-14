import { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ActionSheetItem = {
  label: string;
  onPress?: () => void;
  destructive?: boolean;
  cancel?: boolean;
};

type SheetRequest = {
  title: string;
  actions: ActionSheetItem[];
};

let openSheet: ((req: SheetRequest) => void) | null = null;

/** Imperative action sheet — use instead of Alert.alert for long action lists (Android truncates). */
export function showActionSheet(title: string, actions: ActionSheetItem[]) {
  if (!openSheet) return;
  openSheet({ title, actions });
}

export function ActionSheetHost() {
  const theme = useTheme();
  const [req, setReq] = useState<SheetRequest | null>(null);

  useEffect(() => {
    openSheet = (next) => setReq(next);
    return () => {
      openSheet = null;
    };
  }, []);

  const close = () => setReq(null);

  const run = (action: ActionSheetItem) => {
    close();
    // Defer so the modal unmounts before nested alerts/prompts
    Promise.resolve().then(() => action.onPress?.());
  };

  const items = req?.actions ?? [];
  const cancel = items.find((a) => a.cancel);
  const primary = items.filter((a) => !a.cancel);

  return (
    <Modal
      visible={Boolean(req)}
      transparent
      animationType="fade"
      onRequestClose={close}
    >
      <View style={styles.root}>
        <Pressable style={styles.backdrop} onPress={close} accessibilityRole="button" />
        <View style={[styles.sheet, { backgroundColor: theme.background }]}>
          <ThemedText type="smallBold" numberOfLines={2} style={styles.title}>
            {req?.title}
          </ThemedText>
          <ScrollView style={styles.list} bounces={false}>
            {primary.map((action) => (
              <Pressable
                key={action.label}
                onPress={() => run(action)}
                style={({ pressed }) => [
                  styles.row,
                  {
                    backgroundColor: pressed ? theme.backgroundSelected : theme.backgroundElement,
                  },
                ]}
              >
                <ThemedText
                  style={action.destructive ? styles.destructive : undefined}
                >
                  {action.label}
                </ThemedText>
              </Pressable>
            ))}
          </ScrollView>
          {cancel ? (
            <Pressable
              onPress={() => run(cancel)}
              style={({ pressed }) => [
                styles.cancel,
                {
                  backgroundColor: pressed ? theme.backgroundSelected : theme.backgroundElement,
                },
              ]}
            >
              <ThemedText type="smallBold">{cancel.label}</ThemedText>
            </Pressable>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.five,
    gap: Spacing.two,
    maxHeight: '70%',
  },
  title: {
    marginBottom: Spacing.one,
    paddingHorizontal: Spacing.one,
  },
  list: {
    flexGrow: 0,
  },
  row: {
    paddingVertical: 14,
    paddingHorizontal: Spacing.three,
    borderRadius: 12,
    marginBottom: Spacing.one,
  },
  cancel: {
    paddingVertical: 14,
    paddingHorizontal: Spacing.three,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: Spacing.one,
  },
  destructive: {
    color: '#D94841',
  },
});
