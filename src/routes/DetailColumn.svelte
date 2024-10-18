<!-- src/routes/DetailColumn.svelte -->

<script lang="ts">
  import { onMount, createEventDispatcher } from 'svelte';
  import VirtualScroll from "svelte-virtual-scroll-list";
  import { ndc9Store } from '../store/ndc9Store';
  import { detailHistoryStore } from '../store/detailHistoryStore';
  import type { NDC9Item } from '../lib/ndc9';
  import { ChevronUp } from 'lucide-svelte';

  const dispatch = createEventDispatcher();

  let detailHistory: string[] = [];
  let ndc9Items: NDC9Item[] = [];
  let virtualScroll: VirtualScroll;
  let showJumpIcon = false;

  // Lifecycle hooks
  onMount(() => {
    const unsubscribeHistory = detailHistoryStore.subscribe(value => {
      detailHistory = value;
      showJumpIcon = virtualScroll?.getOffset() > 0;
    });
    const unsubscribeNDC9 = ndc9Store.subscribe(value => ndc9Items = value);

    return () => {
      unsubscribeHistory();
      unsubscribeNDC9();
    };
  });

  // Event handlers
  function scrollToTop() {
    virtualScroll?.scrollToIndex(0);
    showJumpIcon = false;
  }

  function handleTop() {
    showJumpIcon = false;
  }

  function handleItemClick(id: string) {
    const item = getItemById(id);
    if (item) {
      dispatch('selectItem', { item, scrollTo: true });
    }
  }

  function handleIndexedTermClick(term: string) {
    dispatch('searchIndexedTerm', term);
  }

  // Utility functions
  function getItemById(id: string): NDC9Item | undefined {
    return ndc9Items.find(item => item['@id'] === id);
  }

  function estimateCardHeight(id: string): number {
    const item = getItemById(id);
    if (!item) return 300;

    let height = 200;
    height += item.prefLabel.length > 50 ? 50 : 0;
    height += item['skos:note'] ? 50 : 0;
    height += item['ndcv:indexedTerm'] ? (Array.isArray(item['ndcv:indexedTerm']) ? item['ndcv:indexedTerm'].length * 30 : 30) : 0;
    height += item['dct:isPartOf'] ? 50 : 0;
    return height;
  }

  function renderItem(id: string) {
    const item = getItemById(id);
    return item ? { id, content: item } : null;
  }

  // Computed values
  $: virtualItems = detailHistory.map(renderItem).filter(Boolean);

  // Type definitions and constants
  type NDCType = 'ndcv:MainClass' | 'ndcv:Division' | 'ndcv:Section' | 'skos:Concept' | 'skos:Collection' | 'ndcv:Variant';

  const typeMapping: Record<NDCType, string> = {
    'ndcv:MainClass': '類目（第1次区分）',
    'ndcv:Division': '綱目（第2次区分）',
    'ndcv:Section': '要目（第3次区分）',
    'skos:Concept': '細目（機械生成した分類項目）',
    'skos:Collection': '中間見出し・範囲項目',
    'ndcv:Variant': '二者択一項目'
  };

  function getTypeName(type: string): string {
    return (type in typeMapping) ? typeMapping[type as NDCType] : type;
  }

  function extractNDLSHNumber(id: string): string {
    return id.match(/\d+$/)?.[0] || '';
  }
</script>

<div class="detail-column-content">
  {#if showJumpIcon}
    <button class="jump-icon" on:click={scrollToTop} aria-label="最新の項目を表示">
      <ChevronUp />
    </button>
  {/if}
  <VirtualScroll
    bind:this={virtualScroll}
    data={virtualItems}
    key="id"
    let:data
    on:top={handleTop}
  >
    <div class="card">
      <h2>{data.content.prefLabel}</h2>
      {#if data.content['skos:notation']}
        <p class="notation">{data.content['skos:notation']}</p>
      {/if}
      {#if data.content['@type']}
        <p><strong>種類:</strong>
          {#if Array.isArray(data.content['@type'])}
            {data.content['@type'].map(getTypeName).join(', ')}
          {:else}
            {getTypeName(data.content['@type'])}
          {/if}
        </p>
      {/if}
      {#if data.content['skos:broader']}
        <p>
          <strong>上位分類項目:</strong>
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
      {#if data.content['dct:isPartOf']}
        {@const parentId = data.content['dct:isPartOf']['@id']}
        {@const parentItem = getItemById(parentId)}
        <p>
          <strong>階層情報（親資料URI）:</strong>
          <button class="link-button" on:click={() => handleItemClick(parentId)}>
            {parentItem ? parentItem.prefLabel : parentId}
          </button>
        </p>
      {/if}
      {#if data.content['skos:narrower']}
        <p><strong>下位分類項目:</strong></p>
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
          <strong>注記:</strong>
          <ul>
            {#each Array.isArray(data.content['skos:note']) ? data.content['skos:note'] : [data.content['skos:note']] as note}
              <li>{note}</li>
            {/each}
          </ul>
        </div>
      {/if}
      {#if data.content['ndcv:indexedTerm']}
        <div class="indexed-terms">
          <strong>索引語:</strong>
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
      {#if data.content['skos:relatedMatch']}
        <div class="related-ndlsh">
          <strong>関連NDLSH:</strong>
          <div class="ndlsh-tags">
            {#each Array.isArray(data.content['skos:relatedMatch']) ? data.content['skos:relatedMatch'] : [data.content['skos:relatedMatch']] as relatedMatch}
              {@const ndlshNumber = extractNDLSHNumber(relatedMatch['@id'])}
              <a 
                href="https://ndlsearch.ndl.go.jp/search?cs=bib&q-subject={ndlshNumber}" 
                target="_blank" 
                rel="noopener noreferrer"
                class="ndlsh-tag"
              >
                {ndlshNumber}
              </a>
            {/each}
          </div>
        </div>
      {/if}
    </div>
  </VirtualScroll>
</div>

<style>
  .detail-column-content {
    height: 100%;
    position: relative;
  }

  .jump-icon {
    position: absolute;
    top: 10px;
    left: 50%;
    transform: translateX(-50%);
    background-color: var(--color-primary);
    color: var(--color-background);
    border: none;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.2);
    transition: all 0.3s ease;
    z-index: 10;
  }

  .jump-icon:hover {
    transform: translate(-50%, -2px);
    background-color: var(--color-primary-dark);
  }

  .card {
    background: var(--color-background);
    border: 1px solid var(--color-border);
    border-radius: 4px;
    padding: 15px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
    margin: 10px 8px;
  }

  .card h2 {
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
    font-size: var(--font-size-base);
    cursor: pointer;
    padding: 0;
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

  .related-ndlsh {
    margin-top: 10px;
  }

  .related-ndlsh a {
    color: var(--color-primary);
    text-decoration: none;
  }

  .related-ndlsh a:hover {
    text-decoration: underline;
  }

  .ndlsh-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    margin-top: 4px;
  }

  .ndlsh-tag {
    display: inline-block;
    background-color: var(--color-secondary-light);
    color: var(--color-text);
    padding: 2px 6px;
    border-radius: 3px;
    font-size: var(--font-size-small);
    text-decoration: none;
    transition: all 0.3s ease;
  }

  .ndlsh-tag:hover {
    transform: translateY(-2px);
    text-decoration: none;
  }
</style>