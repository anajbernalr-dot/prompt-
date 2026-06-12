<script lang="ts">
  import { theme, type ThemePref } from '$lib/stores/theme.svelte';

  const opts: { value: ThemePref; label: string }[] = [
    { value: 'system', label: 'Sistema' },
    { value: 'light', label: 'Claro' },
    { value: 'dark', label: 'Oscuro' },
  ];
</script>

<div class="seg" role="radiogroup" aria-label="Tema">
  {#each opts as o}
    <button
      class:active={theme.pref === o.value}
      onclick={() => theme.set(o.value)}
      role="radio"
      aria-checked={theme.pref === o.value}
    >{o.label}</button>
  {/each}
</div>

<style>
  .seg {
    display: flex;
    background: var(--surface-2);
    border-radius: var(--radius-sm);
    padding: 3px;
    gap: 2px;
  }
  button {
    flex: 1;
    padding: 8px 0;
    border: none;
    border-radius: 8px;
    background: transparent;
    color: var(--text-secondary);
    font-size: var(--text-sm);
    font-weight: 600;
    transition: all 180ms cubic-bezier(0.4, 0, 0.2, 1);
  }
  button.active {
    background: var(--bg-elevated);
    color: var(--text-primary);
    box-shadow: var(--shadow-sm);
  }
</style>
