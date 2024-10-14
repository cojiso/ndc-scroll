<!-- src/routes/SearchColumn.svelte -->

<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { ndc9Store } from '../store/ndc9Store';
  import type { NDC9Item } from '../lib/ndc9';
  import { Search } from 'lucide-svelte';

  const dispatch = createEventDispatcher();

  export let searchQuery = '';
  let searchResults: NDC9Item[] = [];
  let searchInput: HTMLInputElement;

  $: {
    if (searchQuery) {
      searchResults = $ndc9Store.filter(item => 
        item.searchTerms.some(term => term.includes(searchQuery))
      );
    } else {
      searchResults = [];
    }
  }
  
  function handleItemSelect(item: NDC9Item) {
    dispatch('selectItem', { item, scrollTo: true });
  }

  function handleKeyDown(event: KeyboardEvent, item: NDC9Item) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleItemSelect(item);
    }
  }

  function getIndexedTerms(item: NDC9Item): string[] {
    if (!item['ndcv:indexedTerm']) return [];
    const terms = Array.isArray(item['ndcv:indexedTerm']) 
      ? item['ndcv:indexedTerm'] 
      : [item['ndcv:indexedTerm']];
    return terms.map(term => term['xl:literalForm']);
  }

  function focusInput() {
    searchInput.focus();
  }
</script>


<div class="search-column">
  <div class="search-bar">
    <button class="search-icon" on:click={focusInput} aria-label="検索">
      <Search size={18} color="var(--color-primary)" strokeWidth={4} />
    </button>
    <input 
      bind:this={searchInput}
      type="text" 
      bind:value={searchQuery} 
      placeholder="キーワード検索"
    >
  </div>
  <div class="search-results">
    {#each searchResults as item (item['@id'])}
      <button
        class="search-result-item"
        on:click={() => handleItemSelect(item)}
        on:keydown={(event) => handleKeyDown(event, item)}
        type="button"
      >
        <span class="item-notation">{item['skos:notation']}</span>
        <span class="item-label">{item.prefLabel}</span>
        <div class="item-indexed-terms">
          {#each getIndexedTerms(item) as term}
            <span class="indexed-term">{term}</span>
          {/each}
        </div>
      </button>
    {/each}
  </div>
</div>

<style>
  .search-column {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .search-icon {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .search-bar {
    display: flex;
    align-items: center;
    background-color: var(--color-background);
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
    padding: 0 var(--spacing-small);
    border: 1px solid var(--color-secondary);
    border-radius: 4px;
  }

  .search-bar input {
    flex-grow: 1;
    padding: var(--spacing-small);
    font-size: var(--font-size-base);
    border: none;
    outline: none;
    background-color: transparent;
  }

  .search-results {
    flex: 1;
    overflow-y: auto;
  }

  .search-result-item {
    display: block;
    width: 100%;
    padding: var(--spacing-small) 4px;
    text-align: left;
    background: none;
    border: none;
    cursor: pointer;
    font-size: var(--font-size-base);
    border-bottom: 1px solid var(--color-border);
  }

  .search-result-item:hover {
    background-color: var(--color-hover);
  }

  .item-notation {
    font-weight: bold;
    margin-right: 6px;
  }

  .item-indexed-terms {
    margin-top: 4px;
  }

  .indexed-term {
    display: inline-block;
    background-color: var(--color-secondary-light);
    padding: 2px 4px;
    margin: 2px;
    border-radius: 3px;
    font-size: var(--font-size-small);
  }
</style>