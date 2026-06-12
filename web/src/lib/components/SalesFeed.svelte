<script lang="ts">
  import { sales } from '$lib/stores/sales.svelte';
</script>

{#if sales.last5.length > 0}
  <div class="feed">
    <span class="title">Últimas ventas</span>
    {#each sales.last5 as s (s.id)}
      <div class="row">
        <span style="font-size: 20px;">{s.emoji}</span>
        <div style="flex: 1; min-width: 0;">
          <div style="font-size: var(--text-sm); font-weight: 600; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">{s.productName}</div>
          <div style="font-size: var(--text-xs); color: var(--text-tertiary);">{new Date(s.timestamp).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</div>
        </div>
        <div style="text-align: right;">
          {#if s.discountPct > 0}
            <span style="font-size: var(--text-xs); color: var(--accent-amber); text-decoration: line-through; margin-right: 6px;">{s.originalPrice.toFixed(2)}€</span>
          {/if}
          <span style="font-size: var(--text-base); font-weight: 700; color: var(--accent-green);">{s.finalPrice.toFixed(2)}€</span>
        </div>
      </div>
    {/each}
  </div>
{/if}

<style>
  .feed {
    background: var(--bg-elevated);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    padding: 14px 16px;
    display: flex; flex-direction: column; gap: 10px;
    max-height: 260px;
    overflow-y: auto;
  }
  .title {
    font-size: var(--text-xs);
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--text-secondary);
  }
  .row { display: flex; align-items: center; gap: 10px; }
</style>
