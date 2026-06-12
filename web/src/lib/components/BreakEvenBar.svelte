<script lang="ts">
  import { sales } from '$lib/stores/sales.svelte';
  import { room } from '$lib/stores/room.svelte';
  import { netAfterFees, breakEvenProgress, netProfit } from '$lib/utils/financials';

  const net = $derived(netAfterFees(sales.grossRevenue, room.feePct));
  const target = $derived(room.breakEvenTarget);
  const progress = $derived(breakEvenProgress(net, target));
  const profit = $derived(netProfit(net, target));
  const achieved = $derived(progress >= 100);
  const remaining = $derived(Math.max(target - net, 0));

  let flashing = $state(false);
  let prevAchieved = false;
  $effect(() => {
    if (achieved && !prevAchieved && sales.loaded) {
      flashing = true;
      setTimeout(() => (flashing = false), 1500);
    }
    prevAchieved = achieved;
  });
</script>

{#if flashing}
  <div class="milestone-flash"></div>
{/if}

<div class="bar-card" style="background: var(--bg-elevated); border: 1px solid var(--border); border-radius: var(--radius-lg); box-shadow: var(--shadow-sm); padding: 16px;">
  <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 10px;">
    <span style="font-size: var(--text-xs); font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: var(--text-secondary);">Break-even</span>
    <span style="font-size: var(--text-sm); font-weight: 600; color: {achieved ? 'var(--accent-green)' : 'var(--text-secondary)'};">
      {achieved ? '✅ Break-even superado' : `Faltan ${remaining.toFixed(2)}€`}
    </span>
  </div>

  <div style="height: 10px; background: var(--surface-2); border-radius: 999px; overflow: hidden;">
    <div
      class="fill"
      class:achieved
      style="width: {progress}%; height: 100%; border-radius: 999px;"
    ></div>
  </div>

  <div style="display: flex; justify-content: space-between; margin-top: 6px;">
    <span style="font-size: var(--text-xs); color: var(--text-tertiary);">{net.toFixed(2)}€ netos</span>
    <span style="font-size: var(--text-xs); color: var(--text-tertiary);">{target.toFixed(0)}€</span>
  </div>

  {#if achieved}
    <div style="margin-top: 10px; display: inline-flex; align-items: center; gap: 6px; background: rgba(var(--accent-green-rgb), 0.12); border-radius: 999px; padding: 4px 12px;">
      <span style="font-size: var(--text-sm); font-weight: 700; color: var(--accent-green);">Beneficio Neto: +{profit.toFixed(2)}€</span>
    </div>
  {/if}
</div>

<style>
  .fill {
    background: linear-gradient(90deg, var(--accent-amber), #FFC04D);
    transition: width 600ms cubic-bezier(0.4, 0, 0.2, 1), background 400ms ease;
  }
  .fill.achieved {
    background: linear-gradient(90deg, var(--accent-green), var(--accent-green));
    box-shadow: 0 0 12px rgba(var(--accent-green-rgb), 0.5);
  }
</style>
