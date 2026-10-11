import {
  AppState,
  type AppStateStatus,
} from 'react-native';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

type VaultContextValue = {
  pin: string | null;
  isUnlocked: boolean;
  unlock: (pin: string) => void;
  lock: () => void;
};

const VaultContext = createContext<VaultContextValue | null>(null);

export function VaultProvider({ children }: { children: ReactNode }) {
  const [pin, setPin] = useState<string | null>(null);

  const lock = useCallback(() => setPin(null), []);
  const unlock = useCallback((next: string) => setPin(next), []);

  useEffect(() => {
    const onChange = (state: AppStateStatus) => {
      if (state === 'background' || state === 'inactive') {
        setPin(null);
      }
    };
    const sub = AppState.addEventListener('change', onChange);
    return () => sub.remove();
  }, []);

  const value = useMemo(
    () => ({
      pin,
      isUnlocked: Boolean(pin),
      unlock,
      lock,
    }),
    [pin, unlock, lock],
  );

  return <VaultContext.Provider value={value}>{children}</VaultContext.Provider>;
}

export function useVault() {
  const ctx = useContext(VaultContext);
  if (!ctx) throw new Error('useVault must be used within VaultProvider');
  return ctx;
}
