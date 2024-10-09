<!-- src/routes/DetailColumn.svelte -->

<script lang="ts">
  import { onMount, createEventDispatcher } from 'svelte';
  import VirtualScroll from "svelte-virtual-scroll-list";
  import { ndc9Store } from '../store/ndc9Store';
  import { detailHistoryStore } from '../store/detailHistoryStore';
  import type { NDC9Item } from '../lib/ndc9';

  const dispatch = createEventDispatcher();

  let detailHistory: string[] = [];
  let ndc9Items: NDC9Item[] = [];

  onMount(() => {
    const unsubscribeHistory = detailHistoryStore.subscribe(value => {
      console.log('DetailColumn: detailHistory updated', value);
      detailHistory = value;
    });

    const unsubscribeNDC9 = ndc9Store.subscribe(value => {
      ndc9Items = value;
    });

    return () => {
      unsubscribeHistory();
      unsubscribeNDC9();
    };
  });

  function getItemById(id: string): NDC9Item | undefined {
    return ndc9Items.find(item => item['@id'] === id);
  }

  function handleIndexedTermClick(term: string) {
    // SearchColumnのsearch-barに入力を反映させるイベントをディスパッチ
    dispatch('searchIndexedTerm', term);
  }

  function estimateCardHeight(id: string): number {
    const item = getItemById(id);
    if (!item) return 300; // デフォルトの高さ

    let height = 200; // 基本の高さ
    height += item.prefLabel.length > 50 ? 50 : 0;
    height += item['skos:note'] ? 50 : 0;
    height += item['ndcv:indexedTerm'] ? (Array.isArray(item['ndcv:indexedTerm']) ? item['ndcv:indexedTerm'].length * 30 : 30) : 0;
    return height;
  }

  function renderItem(id: string) {
    const item = getItemById(id);
    if (!item) return null;

    return {
      id: id,
      content: item
    };
  }

  $: virtualItems = detailHistory.map(renderItem).filter(item => item !== null);

  function handleItemClick(id: string) {
    const item = getItemById(id);
    if (item) {
      dispatch('selectItem', { item, scrollTo: true });
    }
  }
</script>

<div class="detail-column">
  <VirtualScroll
    data={virtualItems}
    key="id"
    let:data
  >
        <div class="card">
          <h2>{data.content.prefLabel}</h2>
          {#if data.content['skos:notation']}
            <p class="notation">{data.content['skos:notation']}</p>
          {/if}
          {#if data.content['@type']}
            <p><strong>Type:</strong> {Array.isArray(data.content['@type']) ? data.content['@type'].join(', ') : data.content['@type']}</p>
          {/if}
          {#if data.content['skos:broader']}
            <p>
              <strong>Broader:</strong>
              {#if typeof data.content['skos:broader'] === 'string'}
                {@const broaderId = data.content['skos:broader']}
                {@const broaderItem = getItemById(broaderId)}
                <button class="link-button" on:click={() => handleItemClick(broaderId)}>
                  {broaderItem ? broaderItem.prefLabel : broaderId}
                </button>
              {:else}
                {@const broaderId = data.content['skos:broader']['@id']}
                {@const broaderItem = getItemById(broaderId)}
                <button class="link-button" on:click={() => handleItemClick(broaderId)}>
                  {broaderItem ? broaderItem.prefLabel : broaderId}
                </button>
              {/if}
            </p>
          {/if}
          {#if data.content['skos:narrower']}
            <p><strong>Narrower:</strong></p>
            <ul>
              {#each Array.isArray(data.content['skos:narrower']) ? data.content['skos:narrower'] : [data.content['skos:narrower']] as narrower}
                {#if typeof narrower === 'string'}
                  {@const narrowerId = narrower}
                  {@const narrowerItem = getItemById(narrowerId)}
                  <li>
                    <button class="link-button" on:click={() => handleItemClick(narrowerId)}>
                      {narrowerItem ? narrowerItem.prefLabel : narrowerId}
                    </button>
                  </li>
                {:else}
                  {@const narrowerId = narrower['@id']}
                  {@const narrowerItem = getItemById(narrowerId)}
                  <li>
                    <button class="link-button" on:click={() => handleItemClick(narrowerId)}>
                      {narrowerItem ? narrowerItem.prefLabel : narrowerId}
                    </button>
                  </li>
                {/if}
              {/each}
            </ul>
          {/if}
          {#if data.content['skos:note']}
            <div class="notes">
              <strong>Notes:</strong>
              <ul>
                {#each Array.isArray(data.content['skos:note']) ? data.content['skos:note'] : [data.content['skos:note']] as note}
                  <li>{note}</li>
                {/each}
              </ul>
            </div>
          {/if}
          {#if data.content['ndcv:indexedTerm']}
            <div class="indexed-terms">
              <strong>Indexed Terms:</strong>
              <ul>
                {#each Array.isArray(data.content['ndcv:indexedTerm']) ? data.content['ndcv:indexedTerm'] : [data.content['ndcv:indexedTerm']] as term}
                  <li>
                    <button on:click={() => handleIndexedTermClick(term['xl:literalForm'])}>
                      {term['xl:literalForm']} ({term['ndl:transcription']})
                    </button>
                  </li>
                {/each}
              </ul>
            </div>
          {/if}
        </div>
  </VirtualScroll>
</div>

<style>
  .detail-column {
    height: 100%;
    overflow-y: auto;
  }

  .card {
    background: white;
    border: 1px solid #ccc;
    border-radius: 4px;
    padding: 15px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
    margin-bottom: 10px;
  }

  h2 {
    margin-top: 0;
    color: var(--color-text);
  }

  .notation {
    font-weight: bold;
    color: var(--color-secondary);
  }

  .notes, .indexed-terms {
    margin-top: 10px;
  }

  ul {
    padding-left: 20px;
  }

  li {
    font-size: var(--font-size-base);
  }

  .indexed-terms ul {
    list-style-type: none;
    padding-left: 0;
  }

  .indexed-terms li {
    display: flex;
    align-items: flex-start;
    margin-bottom: 5px;
  }

  .indexed-terms li::before {
    content: "•";
    margin-right: 5px;
    line-height: 1.5;
  }

  .indexed-terms button {
    background: none;
    border: none;
    color: var(--color-primary);
    cursor: pointer;
    padding: 0;
    font-size: inherit;
    text-align: left;
    line-height: 1.5;
  }

  .indexed-terms button:hover {
    color: var(--color-primary-dark);
  }

  .link-button {
    background: none;
    border: none;
    color: var(--color-primary);
    cursor: pointer;
    padding: 0;
    font: inherit;
  }

  .link-button:hover, 
  .link-button:focus {
    color: var(--color-primary-dark);
    text-decoration: none;
  }
</style>