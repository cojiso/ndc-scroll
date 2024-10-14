// src/store/ndc9LoadingStore.ts
import { writable } from 'svelte/store';

interface LoadingState {
  logs: string[];
}

function createNDC9LoadingStore() {
  const { subscribe, update } = writable<LoadingState>({
    logs: [],
  });

  return {
    subscribe,
    addLog: (log: string) => update(state => ({ ...state, logs: [...state.logs, log] })),
    reset: () => update(() => ({ logs: [] })),
  };
}

export const ndc9LoadingStore = createNDC9LoadingStore();