<!-- src/components/HoverMenu.svelte -->
<script lang="ts">
  import { fly, slide } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';
  import { Home, Info, Github } from 'lucide-svelte';

  let isOpen = false;

  const menuItems = [
    { name: 'about', icon: Info, url: '/about' },
    { name: 'creators home', icon: Home, url: 'https://orbit.supply' },
    { name: 'github', icon: Github, url: 'https://github.com' },
  ];

  function toggleMenu() {
    isOpen = !isOpen;
  }
</script>

<div class="menu-container">
  {#if isOpen}
    <div class="menu-items" transition:slide={{duration: 300, easing: quintOut}}>
      {#each menuItems as item}
        <a href={item.url} class="menu-item" transition:fly={{y: 20, duration: 300, delay: 100}}>
          <svelte:component this={item.icon} size={20} />
          <span>{item.name}</span>
        </a>
      {/each}
    </div>
  {/if}
  <button class="menu-title" on:click={toggleMenu}>
    NDC9Scroll
  </button>
</div>

<style>
  .menu-container {
    position: fixed;
    right: 20px;
    bottom: 20px;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    z-index: 1000;
  }

  .menu-title {
    background-color: var(--color-primary);
    color: white;
    border: none;
    border-radius: 30px;
    padding: 10px 20px;
    font-size: 1.2em;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  }

  .menu-title:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
  }

  .menu-items {
    background-color: white;
    border-radius: 10px;
    padding: 10px;
    margin-bottom: 10px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  }

  .menu-item {
    display: flex;
    align-items: center;
    padding: 10px;
    color: var(--color-text);
    text-decoration: none;
    transition: all 0.2s ease;
  }

  .menu-item:hover {
    background-color: var(--color-hover);
    border-radius: 5px;
    transform: translateX(-2px);
    box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.05);
  }

  .menu-item span {
    margin-left: 10px;
  }
</style>