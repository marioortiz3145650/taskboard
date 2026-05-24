import { create } from 'zustand';

interface SyncState {
  isSyncing: boolean;
  lastSyncAt: number | null;
  errorMessage: string | null;
  setSyncing: (isSyncing: boolean) => void;
  setLastSyncAt: (timestamp: number) => void;
  setErrorMessage: (errorMessage: string | null) => void;
}

export const useSyncStore = create<SyncState>((set) => ({
  isSyncing: false,
  lastSyncAt: null,
  errorMessage: null,
  setSyncing: (isSyncing) => set({ isSyncing }),
  setLastSyncAt: (lastSyncAt) => set({ lastSyncAt }),
  setErrorMessage: (errorMessage) => set({ errorMessage }),
}));
