<!-- ndc-list/src/routes/+page.svelte -->

<script lang="ts">
  import '../app.css';
  import { onMount } from 'svelte';
  import { writable } from 'svelte/store';
  import { fly } from 'svelte/transition';
  import SearchColumn from './SearchColumn.svelte';
  import NDCListColumn from './NDCListColumn.svelte';
  import DetailColumn from './DetailColumn.svelte';
  import type { NDC9Item } from '../lib/ndc9';
  import { detailHistoryStore } from '../store/detailHistoryStore';
  import { ndc9Store } from '../store/ndc9Store';

  let isMobile: boolean;
  let activeColumn: 'search' | 'list' | 'detail' = 'list';
  let touchStartX: number;
  let touchEndX: number;
  let selectedItem: NDC9Item | null = null;
  let scrollToSelected = false;
  let searchQuery = writable('');

  onMount(() => {
    const mediaQuery = window.matchMedia('(max-width: 768px)');
    isMobile = mediaQuery.matches;
    mediaQuery.addListener(handleMediaQueryChange);
    ndc9Store.loadData();
  });

  function handleMediaQueryChange(e: MediaQueryListEvent) {
    isMobile = e.matches;
  }

  function handleTouchStart(e: TouchEvent) {
    touchStartX = e.touches[0].clientX;
  }

  function handleTouchMove(e: TouchEvent) {
    touchEndX = e.touches[0].clientX;
  }

  function handleTouchEnd() {
    const SWIPE_THRESHOLD = 100;
    const delta = touchEndX - touchStartX;

    if (Math.abs(delta) > SWIPE_THRESHOLD) {
      if (delta > 0 && activeColumn !== 'search') {
        activeColumn = activeColumn === 'list' ? 'search' : 'list';
      } else if (delta < 0 && activeColumn !== 'detail') {
        activeColumn = activeColumn === 'list' ? 'detail' : 'list';
      }
    }
  }

  function setActiveColumn(column: 'search' | 'list' | 'detail') {
    activeColumn = column;
  }

  function handleSelectItem(event: CustomEvent<{ item: NDC9Item, scrollTo: boolean }>) {
    console.log('Layout: handleSelectItem called', event.detail);
    selectedItem = event.detail.item;
    scrollToSelected = event.detail.scrollTo;
    detailHistoryStore.addItem(event.detail.item['@id']);
    setActiveColumn('detail');

    // NDCListColumnの項目にフォーカスする
    if (event.detail.scrollTo) {
      const element = document.getElementById(event.detail.item['@id']);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.focus();
      }
    }
  }

  function handleSearchIndexedTerm(event: CustomEvent<string>) {
    searchQuery.set(event.detail);
    setActiveColumn('search');
  }
</script>

<svelte:head>
  <title>NDC9 List</title>
</svelte:head>

<main class="layout" class:mobile={isMobile} on:touchstart={handleTouchStart} on:touchmove={handleTouchMove} on:touchend={handleTouchEnd}>
  {#if !isMobile || activeColumn === 'search'}
    <div class="column search-column" class:active={activeColumn === 'search'} transition:fly="{{ x: -100, duration: 300 }}">
      <SearchColumn on:selectItem={handleSelectItem} searchQuery={$searchQuery} />
    </div>
  {/if}
  
  {#if !isMobile || activeColumn === 'list'}
    <div class="column ndc-list-column" class:active={activeColumn === 'list'} transition:fly="{{ x: activeColumn === 'search' ? 100 : -100, duration: 300 }}">
      <NDCListColumn 
        bind:selectedItem 
        bind:scrollToSelected
        on:selectItem={handleSelectItem} 
      />
    </div>
  {/if}
  
  {#if !isMobile || activeColumn === 'detail'}
    <div class="column detail-column" class:active={activeColumn === 'detail'} transition:fly="{{ x: 100, duration: 300 }}">
      <DetailColumn on:searchIndexedTerm={handleSearchIndexedTerm} on:selectItem={handleSelectItem} />
    </div>
  {/if}
</main>

<style>
  .layout {
    display: flex;
    height: 100vh;
    overflow: hidden;
  }

  .column {
    flex: 1;
    overflow-y: hidden;
    transition: all 0.3s ease;
  }

  .ndc-list-column {
    box-shadow: -5px 0 10px rgba(0, 0, 0, 0.1);
  }

  .mobile .column {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 100%;
  }

  .mobile .column:not(.active) {
    transform: translateX(-100%);
  }

  .search-column {
    background-color: #ffffff;
  }

  .ndc-list-column {
    background-color: #ffffff;
  }

  .detail-column {
    background-color: #ffffff;
  }

  @media (max-width: 768px) {
    .column {
      flex: 1;
    }
  }
</style>