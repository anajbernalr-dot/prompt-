<script lang="ts">
  import { room } from '$lib/stores/room.svelte';
  import { sales } from '$lib/stores/sales.svelte';
  import { netAfterFees, breakEvenProgress } from '$lib/utils/financials';

  // Mock stands until real multi-device sync exists. Own stand is computed live.
  const ownNet = $derived(netAfterFees(sales.grossRevenue, room.feePct));
  const ownProgress = $derived(breakEvenProgress(ownNet, room.breakEvenTarget));

  const mockStands = [
    { name: 'Arepas La Reina', progress: 134, revenue: 412.5 },
    { name: 'Vintage Vinyl Co.', progress: 88, revenue: 198.0 },
    { name: 'Cerámica Luna', progress: 64, revenue: 156.4 },
    { name: 'Craft Beer Bros', progress: 41, revenue: 240.8 },
    { name: 'Joyería Sol', progress: 22, revenue: 61.0 },
  ];

  const stands = $derived([
    { name: 'Tu puesto', progress: ownProgress, revenue: sales.grossRevenue, own: true },
    ...mockStands.map((s) => ({ ...s, own: false })),
  ]);

  const totalRevenue = $derived(stands.reduce((s, x) => s + x.revenue, 0));
  const green = $derived(stands.filter((s) => s.progress >= 100).length);
  const amber = $derived(stands.filter((s) => s.progress >= 50 && s.progress < 100).length);
  const red = $derived(stands.filter((s) => s.progress < 50).length);

  function dotColor(p: number) {
    return p >= 100 ? 'var(--accent-green)' : p >= 50 ? 'var(--accent-amber)' : 'var(--accent-red)';
  }
</script>

<div style="padding: 16px; display: flex; flex-direction: column; gap: 16px;">
  <div>
    <h1 style="font-size: var(--text-xl); font-weight: 700; margin: 0;">Sala · Vista Organizador</h1>
    <p style="margin: 4px 0 0; font-size: var(--text-sm); color: var(--text-secondary);">
      {room.code ?? 'Sin sala'} · {stands.length} puestos · {totalRevenue.toFixed(2)}€ total
    </p>
  </div>

  <div style="display: flex; gap: 8px;">
    <span class="chip" style="color: var(--accent-green); background: rgba(var(--accent-green-rgb), 0.12);">🟢 {green} en verde</span>
    <span class="chip" style="color: var(--accent-amber); background: color-mix(in srgb, var(--accent-amber) 14%, transparent);">🟡 {amber} en marcha</span>
    <span class="chip" style="color: var(--accent-red); background: color-mix(in srgb, var(--accent-red) 12%, transparent);">🔴 {red} en riesgo</span>
  </div>

  <div class="list">
    {#each stands as s (s.name)}
      <div class="row" class:own={s.own}>
        <span class="dot" style="background: {dotColor(s.progress)};"></span>
        <div style="flex: 1; min-width: 0;">
          <div style="font-weight: 600; font-size: var(--text-base); color: var(--text-primary);">
            {s.name}{#if s.own}<span style="font-size: var(--text-xs); color: var(--accent-blue); margin-left: 6px;">TÚ</span>{/if}
          </div>
          <div style="font-size: var(--text-xs); color: var(--text-tertiary);">Break-even {Math.round(s.progress)}%</div>
        </div>
        <span style="font-weight: 700; font-size: var(--text-base); color: var(--text-primary);">{s.revenue.toFixed(2)}€</span>
      </div>
    {/each}
  </div>

  <p style="font-size: var(--text-xs); color: var(--text-tertiary); text-align: center; margin: 0;">
    Los datos se sincronizan en tiempo real cuando el dispositivo tiene conexión
  </p>
</div>

<style>
  .chip {
    font-size: var(--text-xs); font-weight: 600;
    border-radius: 999px; padding: 5px 10px;
    white-space: nowrap;
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
  .row.own { background: color-mix(in srgb, var(--accent-blue) 6%, transparent); }
  .dot { width: 10px; height: 10px; border-radius: 999px; flex-shrink: 0; }
</style>
