<!-- src/routes/LoadingAnimation.svelte -->

<script lang="ts">
  import { onMount } from 'svelte';
  import { ndc9LoadingStore } from '../store/ndc9LoadingStore';

  export let isLoading: boolean;
  let logs: string[] = [];

  onMount(() => {
    const unsubscribe = ndc9LoadingStore.subscribe(state => {
      logs = state.logs;
    });

    return unsubscribe;
  });
</script>

{#if isLoading}
  <div class="loading-container">
    <div class="book">
      {#each Array(14) as _, i}
        <div class="book-page" style="animation-delay: {i * 0.1}s;"></div>
      {/each}
    </div>
    <div class="loading-text">
      {#if logs.length > 0}
        <p>{logs[logs.length - 1]}</p>
      {:else}
        <p>Loading NDC9 Data...</p>
      {/if}
    </div>
  </div>
{/if}

<style>
  .loading-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    /* background-color: rgba(255, 255, 255, 0.9); */
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }

  .book {
    --book-width: 80px;
    width: var(--book-width);
    height: calc(var(--book-width) * 1.4142);
    position: relative;
    perspective: 1500px;
    transform: translateX(calc(var(--book-width) / -2));
  }

  .book-page {
    position: absolute;
    width: 100%;
    height: 100%;
    background-color: #f0f0f0;
    border: 1px solid #ddd;
    transform-origin: right center;
    animation: flip-page 4s infinite ease-in-out;
  }

  @keyframes flip-page {
    0%, 100% { 
      transform: rotateY(0deg);
      animation-timing-function: ease-in-out;
    }
    40% {
      transform: rotateY(180deg);
      animation-timing-function: ease-in-out;
    }
    50% {
      transform: rotateY(180deg);
      animation-timing-function: ease-in;
    }
    90% {
      transform: rotateY(5deg);
      animation-timing-function: ease-out;
    }
  }

  .book-page:nth-child(even) {
    background-color: #e8e8e8;
  }

  .loading-text {
    margin-top: 20px;
    font-size: 18px;
    color: #333;
    text-align: center;
  }
</style>