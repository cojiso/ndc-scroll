<!-- src/routes/NDCListColumn.svelte -->

<script lang="ts">
  import { onMount, createEventDispatcher } from 'svelte';
  import { ndc9Store } from '../store/ndc9Store';
  import type { NDC9Item } from '../lib/ndc9';
  import { ChevronDown } from 'lucide-svelte';

  const dispatch = createEventDispatcher();

  export let selectedItem: NDC9Item | null = null;
  export let scrollToSelected = false;

  let ndc9Items: NDC9Item[] = [];
  let stickyItems: NDC9Item[] = [];
  let containerElement: HTMLElement;
  let stickyHeader: HTMLElement;
  let lastUpdateTime = 0;
  let lastStickyItems: string[] = [];
  let updateQueued = false;
  const DEBOUNCE_THRESHOLD = 100;
  let ndcSearchQuery = '';
  let inputElement: HTMLInputElement;
  let depthFilter: number | typeof Infinity = Infinity;
  let filterType: 'layer' | 'level' = 'layer';

  ndc9Store.subscribe(value => {
    ndc9Items = value;
  });

  onMount(() => {
    ndc9Store.loadData();
  });

  $: if (selectedItem && scrollToSelected) {
    console.log('NDCListColumn: Scrolling to selected item', selectedItem);
    scrollToItem(selectedItem);
    scrollToSelected = false;
  }

  function scrollToItem(item: NDC9Item) {
    console.log('NDCListColumn: Attempting to scroll to item', item);
    const element = document.getElementById(item['@id']);
    if (element) {
      console.log('NDCListColumn: Element found, scrolling');
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      console.log('NDCListColumn: Element not found');
    }
  }

  $: {
    const formattedValue = formatNDCInput(ndcSearchQuery);
    if (formattedValue !== ndcSearchQuery) {
      ndcSearchQuery = formattedValue;
      // カーソル位置の調整
      setTimeout(() => {
        const cursorPos = inputElement.selectionStart || 0;
        const dotPosition = formattedValue.indexOf('.');
        inputElement.setSelectionRange(
          cursorPos + (dotPosition !== -1 && cursorPos > dotPosition ? 1 : 0),
          cursorPos + (dotPosition !== -1 && cursorPos > dotPosition ? 1 : 0)
        );
      }, 0);
    }
  }

  $: {
    const matchedItem = ndc9Items.find(item => item['skos:notation'] === ndcSearchQuery);
    if (matchedItem) {
      scrollToItem(matchedItem);
    }
  }

  function handleJumpClick() {
    const matchedItem = ndc9Items.find(item => item['skos:notation'] === ndcSearchQuery);
    if (matchedItem) {
      dispatch('selectItem', { item: matchedItem, scrollTo: true });
    }
  }

  function formatNDCInput(input: string): string {
    const numbers = input.replace(/[^0-9]/g, '');
    if (numbers.length > 3) {
      return numbers.slice(0, 3) + '.' + numbers.slice(3);
    }
    return numbers;
  }

  function handleScroll() {
    if (!updateQueued) {
      updateQueued = true;
      requestAnimationFrame(updateStickyHeader);
    }
  }

  function updateStickyHeader() {
    updateQueued = false;
    const currentTime = Date.now();
    
    if (currentTime - lastUpdateTime < DEBOUNCE_THRESHOLD) {
      requestAnimationFrame(updateStickyHeader);
      return;
    }

    if (!stickyHeader || !containerElement) return;

    const stickyBottom = stickyHeader.getBoundingClientRect().bottom;
    const visibleIndex = binarySearch(stickyBottom);
    if (visibleIndex === -1) return;

    const visibleItem = ndc9Items[visibleIndex];
    const newStickyItems = visibleItem.ancestors;

    const newStickyItemIds = newStickyItems.map(id => id);
    if (!areArraysEqual(newStickyItemIds, lastStickyItems)) {
      stickyItems = newStickyItems
        .map(id => ndc9Items.find(item => item['@id'] === id))
        .filter((item): item is NDC9Item => item !== undefined)
        .sort((a, b) => a.depth - b.depth);

      lastStickyItems = newStickyItemIds;
      lastUpdateTime = currentTime;
    }
  }

  function binarySearch(targetPosition: number): number {
    let low = 0;
    let high = ndc9Items.length - 1;

    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      const element = document.getElementById(ndc9Items[mid]['@id']);
      if (!element) return -1;

      const rect = element.getBoundingClientRect();
      const itemCenter = (rect.top + rect.bottom) / 2;

      if (itemCenter <= targetPosition && rect.bottom > targetPosition) {
        return mid;
      } else if (itemCenter > targetPosition) {
        high = mid - 1;
      } else {
        low = mid + 1;
      }
    }

    return low > 0 ? low - 1 : 0;
  }

  function areArraysEqual(arr1: string[], arr2: string[]): boolean {
    if (arr1.length !== arr2.length) return false;
    return arr1.every((value, index) => value === arr2[index]);
  }

  function getIndentStyle(depth: number): string {
    return `padding-left: ${depth * 20}px;`;
  }

  function handleItemClick(item: NDC9Item) {
    console.log('ndccolumn: dispatch Item selected', item['@id']);
    dispatch('selectItem', { item, scrollTo: false });
  }

  function getNotationDigits(notation: string): number {
    return notation.replace(/[^0-9]/g, '').length;
  }

  $: filteredItems = ndc9Items.filter(item => {
    if (depthFilter === Infinity) return true;
    if (filterType === 'layer') {
      return item.depth <= (depthFilter as number);
    } else {
      return getNotationDigits(item['skos:notation']) <= (depthFilter as number) + 1;
    }
  });

  function handleDepthFilterChange(event: Event) {
    const selectedValue = (event.target as HTMLSelectElement).value;
    depthFilter = selectedValue === 'infinity' ? Infinity : parseInt(selectedValue, 10);
  }

  function handleFilterTypeChange(event: Event) {
    filterType = (event.target as HTMLSelectElement).value as 'layer' | 'level';
  }
</script>

<div class="ndc-column">
  <div class="ndc-search">
    <div class="filter-controls">
      <div class="select-wrapper left">
        <select on:change={handleDepthFilterChange}>
          <option value="infinity" class="infinity-option">∞</option>
          <option value="0">1</option>
          <option value="1">2</option>
          <option value="2">3</option>
          <option value="3">4</option>
          <option value="4">5</option>
        </select>
        <ChevronDown size={12} class="chevron-icon" />
      </div>
      <div class="select-wrapper right">
        <select on:change={handleFilterTypeChange}>
          <option value="layer">層</option>
          <option value="level">次</option>
        </select>
        <ChevronDown size={12} class="chevron-icon" />
      </div>
    </div>
    <input 
      bind:this={inputElement}
      bind:value={ndcSearchQuery}
      type="tel"
      inputmode="numeric"
      placeholder="NDC番号検索"
    >
    <button on:click={handleJumpClick}>Jump</button>
  </div>
  <div class="ndc-container" bind:this={containerElement} on:scroll={handleScroll}>
    <div class="sticky-header" bind:this={stickyHeader}>
      {#each stickyItems as item (item['@id'])}
        <div 
          class="sticky-item"
          style={getIndentStyle(item.depth)}
        >
          {#if item['skos:notation']}
            <span class="item-notation">{item['skos:notation']}</span>
          {/if}
          <span class="item-label">{item.prefLabel}</span>
        </div>
      {/each}
    </div>
    <div class="ndc-list">
      {#each filteredItems as item (item['@id'])}
      <div 
        class="ndc-item"
        style={getIndentStyle(item.depth)}
        id={item['@id']}
        on:click={() => handleItemClick(item)}
        on:keydown={(e) => e.key === 'Enter' && handleItemClick(item)}
        tabindex="0"
        role="button"
      >
        {#if item['skos:notation']}
          <span class="item-notation">{item['skos:notation']}</span>
        {/if}
        <span class="item-label">{item.prefLabel}</span>
      </div>
      {/each}
    </div>
  </div>
</div>

<style>
  .ndc-column {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .ndc-search {
    margin-bottom: var(--spacing-small);
    display: flex;
    gap: 6px;
    position: relative;
  }

  .ndc-search input {
    flex-grow: 1;
    padding: var(--spacing-small);
    font-size: var(--font-size-base);
    border: 1px solid var(--color-secondary);
    border-radius: 4px;
  }

  .ndc-search button {
    padding: var(--spacing-small) var(--spacing-medium);
    font-size: var(--font-size-base);
    cursor: pointer;
    background-color: var(--color-primary);
    color: var(--color-background);
    border: none;
    border-radius: 4px;
    transition: all 0.3s ease;
  }

  .ndc-search button:hover {
    transform: translateY(-2px);
    background-color: var(--color-primary-dark);
  }

  .ndc-container {
    flex: 1;
    overflow-y: auto;
    position: relative;
  }

  .sticky-header {
    position: sticky;
    top: 0;
    background-color: var(--color-background);
    z-index: 10;
    transition: transform 0.3s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .sticky-item, .ndc-item {
    padding: 6px 4px;
    font-size: var(--font-size-base);
  }

  .filter-controls {
    display: flex;
    border: 1px solid var(--color-secondary);
    border-radius: 4px;
    overflow: hidden;
  }

  .select-wrapper {
    position: relative;
    display: inline-block;
  }

  .select-wrapper select {
    height: 100%;
    padding: var(--spacing-small);
    padding-right: 24px;
    font-size: var(--font-size-base);
    border: none;
    background-color: var(--color-background);
    cursor: pointer;
    appearance: none;
    -webkit-appearance: none;
    -moz-appearance: none;
  }

  .select-wrapper :global(svg) {
    position: absolute;
    right: 6px;
    top: 50%;
    transform: translateY(-50%);
    pointer-events: none;
  }

  .select-wrapper :global(.chevron-icon) {
    position: absolute;
    right: 8px;
    top: 50%;
    transform: translateY(-50%);
    pointer-events: none;
    color: var(--color-secondary);
  }

  .select-wrapper.left {
    border-right: 1px solid var(--color-secondary);
  }

  .select-wrapper.left select {
    font-weight: bold;
    padding-left: 16px;
  }

  .select-wrapper select option.infinity-option {
    font-size: 1.6em;
  }

  .ndc-item:focus {
    border-radius: 4px;
    box-shadow: 0 0 0 3px rgba(var(--color-primary), 0.3);
    background-color: var(--color-secondary-light);
  }

  .ndc-item:hover {
    background-color: var(--color-hover);
  }

  .item-notation {
    font-weight: bold;
    margin-right: 6px;
  }

  .item-label {
    flex-grow: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
</style>