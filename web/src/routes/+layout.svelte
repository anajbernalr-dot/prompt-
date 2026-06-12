<script lang="ts">
  import '../app.css';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import BottomNav from '$lib/components/BottomNav.svelte';
  import { room } from '$lib/stores/room.svelte';
  import { products } from '$lib/stores/products.svelte';
  import { sales } from '$lib/stores/sales.svelte';

  let { children } = $props();
  let ready = $state(false);

  onMount(async () => {
    await Promise.all([room.load(), products.load(), sales.load()]);
    ready = true;
    if (!room.current && $page.url.pathname !== '/onboarding') {
      goto('/onboarding');
    }
  });

  const showChrome = $derived($page.url.pathname !== '/onboarding');
</script>

{#if ready}
  {#if showChrome}
    <header>
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 18px;">📊</span>
        <span style="font-weight: 700; font-size: var(--text-base); color: var(--text-primary);">PopUp</span>
        {#if room.code}
          <span class="room-badge">{room.code}</span>
        {/if}
      </div>
      <a href="/settings" aria-label="Ajustes" style="font-size: 20px; text-decoration: none; opacity: {$page.url.pathname === '/settings' ? 1 : 0.6};">⚙️</a>
    </header>
  {/if}

  <main class:with-chrome={showChrome}>
    {#key $page.url.pathname}
      <div class="page-enter">
        {@render children()}
      </div>
    {/key}
  </main>

  {#if showChrome}
    <BottomNav />
  {/if}
{:else}
  <div style="height: 100dvh; display: flex; align-items: center; justify-content: center;">
    <span style="font-size: 32px;">📊</span>
  </div>
{/if}

<style>
  header {
    position: sticky; top: 0; z-index: 30;
    display: flex; justify-content: space-between; align-items: center;
    padding: 12px 16px;
    padding-top: calc(12px + env(safe-area-inset-top));
    background: var(--bg-primary);
    border-bottom: 1px solid var(--border);
  }
  .room-badge {
    font-size: var(--text-xs);
    font-weight: 600;
    color: var(--accent-blue);
    background: color-mix(in srgb, var(--accent-blue) 12%, transparent);
    border-radius: 999px;
    padding: 2px 10px;
  }
  main {
    min-height: 100dvh;
    background: var(--bg-secondary);
  }
  main.with-chrome {
    min-height: calc(100dvh - 110px);
    padding-bottom: 80px;
  }
</style>
