// src/store/ndc9Store.ts

import { writable } from 'svelte/store';
import { parseNDC9Data, type NDC9Item } from '../lib/ndc9';
import { ndc9LoadingStore } from './ndc9LoadingStore';

function createNDC9Store() {
  const { subscribe, set } = writable<NDC9Item[]>([]);

  return {
    subscribe,
    loadData: async () => {
      try {
        // const response = await fetch('/ndc9.json');
        ndc9LoadingStore.addLog('Fetching NDC9 data');
        // const response = await fetch('../../../../check/ndc9.json');
        const response = await fetch('https://gist.githubusercontent.com/cojiso/0eba279374d15c6d77dc4ae6c8535c4a/raw/ndc9.json');
        const jsonData = await response.json();
        ndc9LoadingStore.addLog('NDC9 data fetched, starting to parse');
        const parsedData = parseNDC9Data(jsonData);
        set(parsedData);
      } catch (error) {
        console.error('Failed to load NDC9 data:', error);
        ndc9LoadingStore.addLog(`Error: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  };
}

export const ndc9Store = createNDC9Store();