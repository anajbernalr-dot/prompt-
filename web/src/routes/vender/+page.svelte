<script lang="ts">
  import BreakEvenBar from '$lib/components/BreakEvenBar.svelte';
  import ProductCard from '$lib/components/ProductCard.svelte';
  import DiscountMenu from '$lib/components/DiscountMenu.svelte';
  import SalesFeed from '$lib/components/SalesFeed.svelte';
  import { products } from '$lib/stores/products.svelte';
  import { sales } from '$lib/stores/sales.svelte';
  import { room } from '$lib/stores/room.svelte';
  import type { Product } from '$lib/db';

  let discountTarget = $state<Product | null>(null);

  async function sell(p: Product, discountPct = 0) {
    const finalPrice = +(p.price * (1 - discountPct / 100)).toFixed(2);
    await sales.add({
      productId: p.id!,
      productName: p.name,
      emoji: p.emoji,
      originalPrice: p.price,
      finalPrice,
      discountPct,
      cost: p.cost,
      timestamp: new Date(),
      roomCode: room.code ?? 'SIN-SALA',
    });
    if (navigator.vibrate) navigator.vibrate(15);
  }
</script>

<div style="padding: 16px; display: flex; flex-direction: column; gap: 16px;">
  <BreakEvenBar />

  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
    {#each products.active as p (p.id)}
      <ProductCard
        product={p}
        onsale={(prod) => sell(prod)}
        ondiscount={(prod) => (discountTarget = prod)}
      />
    {/each}
  </div>

  {#if products.active.length === 0}
    <div style="text-align: center; padding: 40px 0; color: var(--text-tertiary);">
      <div style="font-size: 40px;">📦</div>
      <p>Sin productos. Añádelos en Ajustes.</p>
    </div>
  {/if}

  <SalesFeed />
</div>

{#if discountTarget}
  <DiscountMenu
    product={discountTarget}
    onapply={(pct) => { sell(discountTarget!, pct); discountTarget = null; }}
    onclose={() => (discountTarget = null)}
  />
{/if}
