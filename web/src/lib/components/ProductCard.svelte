<script lang="ts">
  import type { Product } from '$lib/db';

  let { product, onsale, ondiscount }: {
    product: Product;
    onsale: (p: Product) => void;
    ondiscount: (p: Product) => void;
  } = $props();

  let holdTimer: ReturnType<typeof setTimeout> | null = null;
  let held = false;

  function down() {
    held = false;
    holdTimer = setTimeout(() => { held = true; ondiscount(product); }, 500);
  }
  function up() {
    if (holdTimer) clearTimeout(holdTimer);
    if (!held) onsale(product);
  }
  function cancel() {
    if (holdTimer) clearTimeout(holdTimer);
  }
</script>

<button
  class="card tap-scale"
  onpointerdown={down}
  onpointerup={up}
  onpointerleave={cancel}
  oncontextmenu={(e) => e.preventDefault()}
  aria-label={`Vender ${product.name} a ${product.price.toFixed(2)} euros`}
>
  <span style="font-size: 40px; line-height: 1;">{product.emoji}</span>
  <span style="font-size: var(--text-sm); font-weight: 600; color: var(--text-primary); text-align: center;">{product.name}</span>
  <span style="font-size: var(--text-lg); font-weight: 800; color: var(--accent-green);">{product.price.toFixed(2)}€</span>
</button>

<style>
  .card {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 20px 12px;
    background: var(--bg-elevated);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-sm);
    min-height: 130px;
    user-select: none;
    touch-action: manipulation;
  }
</style>
