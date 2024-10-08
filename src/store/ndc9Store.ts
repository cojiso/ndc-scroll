// src/store/ndc9Store.ts

import { writable } from 'svelte/store';
import type { NDC9Item } from '../lib/ndc9';
import { parseNDC9Data } from '../lib/ndc9';

function createNDC9Store() {
  const { subscribe, set } = writable<NDC9Item[]>([]);

  return {
    subscribe,
    loadData: async () => {
      try {
        const response = await fetch('/ndc9.json');
        const jsonData = await response.json();
        const parsedData = parseNDC9Data(jsonData);
        set(parsedData);
      } catch (error) {
        console.error('Failed to load NDC9 data:', error);
      }
    }
  };
}

export const ndc9Store = createNDC9Store();