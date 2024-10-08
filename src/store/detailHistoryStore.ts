// src/store/detailHistoryStore.ts

import { writable } from 'svelte/store';

function createDetailHistoryStore() {
  const { subscribe, update } = writable<string[]>([]);

  return {
    subscribe,
    addItem: (id: string) => update(items => {
      console.log('detailHistoryStore addItem:',items);
      if (items[0] === id) return items; // 既に最新の項目の場合は何もしない
      return [id, ...items.filter(item => item !== id)];
    }),
    removeItem: (id: string) => update(items => items.filter(item => item !== id)),
  };
}

export const detailHistoryStore = createDetailHistoryStore();