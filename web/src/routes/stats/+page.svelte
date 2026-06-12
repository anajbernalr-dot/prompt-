<script lang="ts">
  import StatCard from '$lib/components/StatCard.svelte';
  import { sales } from '$lib/stores/sales.svelte';
  import { room } from '$lib/stores/room.svelte';
  import { netAfterFees, ticketAverage } from '$lib/utils/financials';

  const gross = $derived(sales.grossRevenue);
  const fee = $derived(gross * room.feePct);
  const net = $derived(netAfterFees(gross, room.feePct));
  const avg = $derived(ticketAverage(sales.all));
  const top = $derived(sales.topProducts(5));
  const maxRev = $derived(top.length ? top[0].revenue : 1);
</script>

<div style="padding: 16px; display: flex; flex-direction: column; gap: 16px;">
  <h1 style="font-size: var(--text-xl); font-weight: 700; margin: 0;">Estadísticas</h1>

  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
    <StatCard label="Transacciones" value={String(sales.count)} />
    <StatCard label="Ticket medio" value="{avg.toFixed(2)}€" />
    <StatCard label="Comisión festival" value="-{fee.toFixed(2)}€" color="var(--accent-red)" sub="{(room.feePct * 100).toFixed(0)}% del bruto" />
    <StatCard label="Dinero limpio" value="{net.toFixed(2)}€" color="var(--accent-green)" />
  </div>

  {#if top.length > 0}
    <section class="card">
      <span class="section-title">Top productos</span>
      {#each top as t (t.name)}
        <div style="display: flex; flex-direction: column; gap: 4px;">
          <div style="display: flex; justify-content: space-between; font-size: var(--text-sm);">
            <span style="font-weight: 600; color: var(--text-primary);">{t.emoji} {t.name}</span>
            <span style="color: var(--text-secondary);">{t.revenue.toFixed(2)}€ · {t.count} uds</span>
          </div>
          <div style="height: 8px; background: var(--surface-2); border-radius: 999px; overflow: hidden;">
            <div style="width: {(t.revenue / maxRev) * 100}%; height: 100%; background: var(--accent-blue); border-radius: 999px; transition: width 600ms cubic-bezier(0.4, 0, 0.2, 1);"></div>
          </div>
        </div>
      {/each}
    </section>
  {/if}

  <section class="card">
    <span class="section-title">Desglose financiero</span>
    <div class="frow"><span>Ingresos brutos</span><span style="font-weight: 700;">{gross.toFixed(2)}€</span></div>
    <div class="frow"><span>Comisión festival ({(room.feePct * 100).toFixed(0)}%)</span><span style="font-weight: 700; color: var(--accent-red);">-{fee.toFixed(2)}€</span></div>
    <div class="frow total"><span>Dinero limpio</span><span style="font-weight: 800; color: var(--accent-green);">{net.toFixed(2)}€</span></div>
  </section>
</div>

<style>
  .card {
    background: var(--bg-elevated);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-sm);
    padding: 16px;
    display: flex; flex-direction: column; gap: 12px;
  }
  .section-title {
    font-size: var(--text-xs); font-weight: 600;
    letter-spacing: 0.06em; text-transform: uppercase;
    color: var(--text-secondary);
  }
  .frow {
    display: flex; justify-content: space-between;
    font-size: var(--text-base); color: var(--text-secondary);
  }
  .frow.total {
    border-top: 1px solid var(--border);
    padding-top: 12px;
    color: var(--text-primary);
  }
</style>
