<!-- ndc-list/src/routes/+page.svelte -->

<script lang="ts">
  import { onMount } from 'svelte';
  import { ndc9Store } from '../store/ndc9Store';

  onMount(() => {
    ndc9Store.loadData();
  });
</script>

<svelte:head>
  <title>NDC9 Browser</title>
</svelte:head>

<main>
  <slot />
</main>

<style>
  main {
    width: 100%;
    height: 100vh;
  }
</style>