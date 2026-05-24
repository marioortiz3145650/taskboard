import { create } from 'zustand';

export type TaskFilter = 'all' | 'completed' | 'pending';

interface UIState {
  filter: TaskFilter;
  setFilter: (filter: TaskFilter) => void;
}

export const useUIStore = create<UIState>((set) => ({
  filter: 'all',
  setFilter: (filter) => set({ filter }),
}));
