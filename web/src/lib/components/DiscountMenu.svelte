<script lang="ts">
  import type { Product } from '$lib/db';

  let { product, onapply, onclose }: {
    product: Product;
    onapply: (pct: number) => void;
    onclose: () => void;
  } = $props();

  let customMode = $state(false);
  let customPct = $state('');

  const opts = [10, 20, 30];

  function applyCustom() {
    const v = parseFloat(customPct);
    if (!isNaN(v) && v > 0 && v < 100) onapply(v);
  }

  function onkey(e: KeyboardEvent) {
    if (e.key === 'Escape') onclose();
  }
</script>

<svelte:window onkeydown={onkey} />

<div
  class="scrim"
  onclick={onclose}
  onkeydown={onkey}
  role="button"
  tabindex="-1"
  aria-label="Cerrar menú de descuento"
>
  <div class="menu" onclick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" tabindex="-1" onkeydown={onkey}>
    <span style="font-size: 32px;">{product.emoji}</span>
    <span style="font-weight: 700; font-size: var(--text-lg); color: var(--text-primary);">{product.name}</span>
    <span style="font-size: var(--text-sm); color: var(--text-secondary); margin-bottom: 12px;">Precio normal: {product.price.toFixed(2)}€</span>

    {#if !customMode}
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; width: 100%;">
        {#each opts as pct}
          <button class="opt tap-scale" onclick={() => onapply(pct)}>
            <span style="font-weight: 800; font-size: var(--text-xl); color: var(--accent-amber);">-{pct}%</span>
            <span style="font-size: var(--text-sm); color: var(--text-secondary);">{(product.price * (1 - pct / 100)).toFixed(2)}€</span>
          </button>
        {/each}
        <button class="opt tap-scale" onclick={() => (customMode = true)}>
          <span style="font-weight: 800; font-size: var(--text-xl); color: var(--accent-blue);">%</span>
          <span style="font-size: var(--text-sm); color: var(--text-secondary);">Custom</span>
        </button>
      </div>
    {:else}
      <div style="display: flex; gap: 8px; width: 100%;">
        <input
          type="number"
          min="1" max="99"
          bind:value={customPct}
          placeholder="% dto."
          style="flex: 1; padding: 12px; border-radius: var(--radius-sm); border: 1px solid var(--border); background: var(--surface); color: var(--text-primary); font-size: var(--text-base);"
        />
        <button class="confirm tap-scale" onclick={applyCustom}>OK</button>
      </div>
    {/if}
  </div>
</div>

<style>
  .scrim {
    position: fixed; inset: 0; z-index: 50;
    background: rgba(0,0,0,0.5);
    display: flex; align-items: center; justify-content: center;
    animation: fadeIn 150ms ease;
  }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  .menu {
    background: var(--bg-elevated);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-md);
    padding: 24px;
    width: min(320px, 86vw);
    display: flex; flex-direction: column; align-items: center;
    animation: popIn 200ms cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  @keyframes popIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
  .opt {
    display: flex; flex-direction: column; align-items: center; gap: 2px;
    padding: 14px; border-radius: var(--radius-sm);
    background: var(--surface); border: 1px solid var(--border);
  }
  .confirm {
    padding: 12px 20px; border-radius: var(--radius-sm); border: none;
    background: var(--accent-blue); color: white; font-weight: 700;
  }
</style>
