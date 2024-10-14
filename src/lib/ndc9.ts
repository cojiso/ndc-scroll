// src/lib/ndc9.ts

import { ndc9LoadingStore } from '../store/ndc9LoadingStore';

export interface NDC9Item {
  '@id': string;
  '@type'?: string | string[];
  'rdfs:label'?: string;
  'skos:notation': string;
  'skos:prefLabel': {
    '@value': string;
    '@language': string;
  } | {
    '@value': string;
    '@language': string;
  }[];
  'prefLabel': string;
  'skos:broader'?: { '@id': string } | string;
  'dct:isPartOf'?: { '@id': string };
  'skos:narrower'?: { '@id': string } | { '@id': string }[];
  'dct:isVersionOf'?: { '@id': string };
  'skos:note'?: string | string[];
  'ndcv:indexedTerm'?: {
    'xl:literalForm': string;
    'ndl:transcription': string;
  } | {
    'xl:literalForm': string;
    'ndl:transcription': string;
  }[];
  'rdfs:seeAlso'?: { '@id': string } | { '@id': string }[];
  'skos:relatedMatch'?: { '@id': string } | { '@id': string }[];
  depth: number;
  ancestors: string[];
  searchTerms: string[]; // 新しく追加
}

export function parseNDC9Data(jsonData: any): NDC9Item[] {
  const startTime = performance.now();
  
  ndc9LoadingStore.addLog('Started parsing NDC9 data');

  if (!jsonData['@graph']) {
    throw new Error('Invalid NDC9 data structure');
  }
  
  const itemMap = new Map<string, NDC9Item>();
  
  // First pass: Create basic items and populate the map
  ndc9LoadingStore.addLog('Processing items');
  jsonData['@graph'].forEach((item: any) => {
    if (item['@id'] !== 'ndc9:' && item['skos:notation']) {
      try {
        const processedItem = processItem(item);
        itemMap.set(processedItem['@id'], processedItem);
      } catch (error) {
        console.error(`Error processing item: ${item['@id']}`, error);
      }
    }
  });

  // Second pass: Calculate ancestors and depth for all items
  ndc9LoadingStore.addLog('Calculating ancestors and depths');
  itemMap.forEach(item => {
    if (item.ancestors.length === 0) {
      calculateAncestors(item, itemMap);
    }
  });

  const endTime = performance.now();
  const duration = endTime - startTime;
  ndc9LoadingStore.addLog(`Finished parsing NDC9 data in ${duration.toFixed(2)}ms`);

  return Array.from(itemMap.values());
}

function processItem(item: any): NDC9Item {
  const processedItem: NDC9Item = {
    '@id': item['@id'],
    '@type': item['@type'],
    'rdfs:label': item['rdfs:label'],
    'skos:notation': item['skos:notation'],
    'skos:prefLabel': item['skos:prefLabel'],
    'prefLabel': getPrefLabel(item['skos:prefLabel']),
    'skos:broader': item['skos:broader'],
    'dct:isPartOf': item['dct:isPartOf'],
    'skos:narrower': item['skos:narrower'],
    'dct:isVersionOf': item['dct:isVersionOf'],
    'skos:note': item['skos:note'],
    'ndcv:indexedTerm': item['ndcv:indexedTerm'],
    'rdfs:seeAlso': item['rdfs:seeAlso'],
    'skos:relatedMatch': item['skos:relatedMatch'],
    depth: 0,
    ancestors: [],
    searchTerms: []
  };

  // 検索用の文字列リストを作成
  processedItem.searchTerms = [
    processedItem.prefLabel,
    processedItem['skos:notation'] || '',
    ...getIndexedTerms(processedItem['ndcv:indexedTerm'])
  ].filter(Boolean);

  return processedItem;
}

function getIndexedTerms(indexedTerm: any): string[] {
  if (!indexedTerm) return [];
  
  const terms = Array.isArray(indexedTerm) ? indexedTerm : [indexedTerm];
  
  return terms.flatMap(term => [
    term['xl:literalForm'],
    term['ndl:transcription']
  ]).filter(Boolean);
}

function calculateAncestors(item: NDC9Item, itemMap: Map<string, NDC9Item>): void {
  if (item.ancestors.length > 0) {
    return; // Already calculated
  }

  const ancestors: string[] = [];
  let currentItem: NDC9Item | undefined = item;
  let depth = 0;

  while (currentItem) {
    let parentId: string | undefined;

    if (currentItem['skos:broader']) {
      parentId = typeof currentItem['skos:broader'] === 'string'
        ? currentItem['skos:broader']
        : currentItem['skos:broader']['@id'];
    } else if (currentItem['dct:isPartOf']) {
      parentId = currentItem['dct:isPartOf']['@id'];
    }

    if (!parentId) break;

    ancestors.unshift(parentId);
    depth++;

    currentItem = itemMap.get(parentId);
    if (!currentItem) {
      console.warn(`Parent item not found: ${parentId}`);
      break;
    }

    // If the parent's ancestors are already calculated, use them
    if (currentItem.ancestors.length > 0) {
      ancestors.unshift(...currentItem.ancestors);
      depth += currentItem.depth;
      break;
    }
  }

  item.ancestors = ancestors;
  item.depth = depth;
}

function getPrefLabel(prefLabel: any): string {
  if (typeof prefLabel === 'string') return prefLabel;
  if (Array.isArray(prefLabel)) {
    const jaLabel = prefLabel.find((label: any) => label['@language'] === 'ja');
    return jaLabel ? jaLabel['@value'] : prefLabel[0]['@value'];
  }
  if (typeof prefLabel === 'object' && prefLabel['@value']) {
    return prefLabel['@value'];
  }
  return '';
}