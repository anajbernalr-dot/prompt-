<script lang="ts">
  import { products } from '$lib/stores/products.svelte';
  import { sales } from '$lib/stores/sales.svelte';
  import { room } from '$lib/stores/room.svelte';
  import { netAfterFees, panicFloorPrice, maxDiscount } from '$lib/utils/financials';

  const net = $derived(netAfterFees(sales.grossRevenue, room.feePct));
  const remaining = $derived(Math.max(room.breakEvenTarget - net, 0));
  const past = $derived(remaining <= 0);

  async function sellAtFloor(p: (typeof products.active)[number]) {
    const floor = panicFloorPrice(p.cost);
    const pct = +(((p.price - floor) / p.price) * 100).toFixed(1);
    await sales.add({
      productId: p.id!,
      productName: p.name,
      emoji: p.emoji,
      originalPrice: p.price,
      finalPrice: floor,
      discountPct: pct,
      cost: p.cost,
      timestamp: new Date(),
      roomCode: room.code ?? 'SIN-SALA',
    });
    if (navigator.vibrate) navigator.vibrate([20, 40, 20]);
  }
</script>

<div style="padding: 16px; display: flex; flex-direction: column; gap: 16px;">
  <div class="warn panic-pulse">
    <span style="font-size: 28px;">🚨</span>
    <div>
      <div style="font-weight: 800; font-size: var(--text-lg); color: var(--accent-red);">Modo Pánico</div>
      <div style="font-size: var(--text-sm); color: var(--text-secondary); margin-top: 2px;">
        {#if past}
          Ya superaste el break-even. Cualquier venta por encima del precio suelo es beneficio puro.
        {:else}
          Aún necesitas <strong style="color: var(--text-primary);">{remaining.toFixed(2)}€</strong> netos para cubrir tu inversión. Estos son tus precios mínimos sin perder dinero.
        {/if}
      </div>
    </div>
  </div>

  <div class="list">
    {#each products.active as p (p.id)}
      {@const floor = panicFloorPrice(p.cost)}
      {@const maxd = maxDiscount(p.price, p.cost)}
      <div class="row">
        <span style="font-size: 26px;">{p.emoji}</span>
        <div style="flex: 1; min-width: 0;">
          <div style="font-weight: 600; font-size: var(--text-base); color: var(--text-primary);">{p.name}</div>
          <div style="font-size: var(--text-sm); margin-top: 2px; display: flex; align-items: center; gap: 6px;">
            <span style="color: var(--text-secondary);">{p.price.toFixed(2)}€</span>
            <span style="color: var(--text-tertiary);">→</span>
            <span style="font-weight: 700; color: var(--accent-red);">{floor.toFixed(2)}€</span>
            <span style="font-size: var(--text-xs); color: var(--accent-amber); font-weight: 600;">máx -{maxd}%</span>
          </div>
        </div>
        <button class="floor-btn tap-scale" onclick={() => sellAtFloor(p)}>
          Aplicar precio suelo
        </button>
      </div>
    {/each}
  </div>
</div>

<style>
  .warn {
    display: flex; gap: 14px; align-items: flex-start;
    background: var(--bg-elevated);
    border: 2px solid var(--accent-red);
    border-radius: var(--radius-lg);
    padding: 18px;
  }
  .list {
    background: var(--bg-elevated);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-sm);
    overflow: hidden;
  }
  .row {
    display: flex; align-items: center; gap: 12px;
    padding: 14px 16px;
    border-bottom: 1px solid var(--border);
  }
  .row:last-child { border-bottom: none; }
  .floor-btn {
    border: none;
    background: color-mix(in srgb, var(--accent-red) 14%, transparent);
    color: var(--accent-red);
    font-size: var(--text-xs);
    font-weight: 700;
    border-radius: 999px;
    padding: 8px 12px;
    white-space: nowrap;
  }
</style>
