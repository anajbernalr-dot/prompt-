<script lang="ts">
  import { goto } from '$app/navigation';
  import ThemeToggle from '$lib/components/ThemeToggle.svelte';
  import { room } from '$lib/stores/room.svelte';
  import { products } from '$lib/stores/products.svelte';
  import { sales } from '$lib/stores/sales.svelte';
  import { generateCSV, generatePDFReport } from '$lib/utils/export';

  let feePctInput = $state(Math.round((room.current?.festivalFeePct ?? 0.18) * 100));
  let targetInput = $state(room.current?.breakEvenTarget ?? 250);
  let confirmEnd = $state(false);

  async function saveFee() {
    const v = Math.min(Math.max(feePctInput, 0), 50);
    feePctInput = v;
    await room.update({ festivalFeePct: v / 100 });
  }
  async function saveTarget() {
    await room.update({ breakEvenTarget: Math.max(targetInput, 0) });
  }

  async function addProduct() {
    await products.add({ name: 'Nuevo producto', emoji: '🛍️', price: 1, cost: 0.5, isActive: true });
  }

  async function leaveRoom() {
    await room.leave();
    goto('/onboarding');
  }

  async function endEvent() {
    await sales.clear();
    confirmEnd = false;
  }

  function exportPdf() {
    generatePDFReport(sales.all, {
      roomCode: room.code ?? 'SIN-SALA',
      eventName: room.current?.eventName ?? 'Evento',
      feePct: room.feePct,
      breakEvenTarget: room.breakEvenTarget,
    });
  }
</script>

<div style="padding: 16px; display: flex; flex-direction: column; gap: 16px;">
  <h1 style="font-size: var(--text-xl); font-weight: 700; margin: 0;">Ajustes</h1>

  <!-- Room -->
  <section class="card">
    <span class="title">Sala actual</span>
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <span style="font-weight: 700; font-size: var(--text-lg); color: var(--accent-blue);">{room.code ?? '—'}</span>
      <button class="danger-ghost tap-scale" onclick={leaveRoom}>Salir del evento</button>
    </div>
    <label class="field">
      <span>Comisión festival (%)</span>
      <input type="number" min="0" max="50" bind:value={feePctInput} onchange={saveFee} />
    </label>
    <label class="field">
      <span>Objetivo break-even (€)</span>
      <input type="number" min="0" bind:value={targetInput} onchange={saveTarget} />
    </label>
  </section>

  <!-- Theme -->
  <section class="card">
    <span class="title">Apariencia</span>
    <ThemeToggle />
  </section>

  <!-- Products -->
  <section class="card">
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <span class="title" style="margin: 0;">Catálogo ({products.all.length})</span>
      <button class="add tap-scale" onclick={addProduct}>+ Añadir</button>
    </div>
    {#each products.all as p (p.id)}
      <div class="prod-row">
        <input class="emoji" type="text" maxlength="4" value={p.emoji} onchange={(e) => products.update(p.id!, { emoji: e.currentTarget.value })} aria-label="Emoji" />
        <input class="name" type="text" value={p.name} onchange={(e) => products.update(p.id!, { name: e.currentTarget.value })} aria-label="Nombre" />
        <input class="num" type="number" step="0.1" min="0" value={p.price} onchange={(e) => products.update(p.id!, { price: +e.currentTarget.value })} aria-label="Precio" />
        <input class="num" type="number" step="0.1" min="0" value={p.cost} onchange={(e) => products.update(p.id!, { cost: +e.currentTarget.value })} aria-label="Coste" />
        <button class="trash tap-scale" onclick={() => products.remove(p.id!)} aria-label="Eliminar {p.name}">🗑️</button>
      </div>
    {/each}
    <div style="display: flex; gap: 8px; font-size: var(--text-xs); color: var(--text-tertiary); padding: 0 4px;">
      <span style="width: 44px;"></span><span style="flex: 1;">Nombre</span><span style="width: 64px;">Precio</span><span style="width: 64px;">Coste</span><span style="width: 32px;"></span>
    </div>
  </section>

  <!-- Export -->
  <section class="card">
    <span class="title">Exportar</span>
    <div style="display: flex; gap: 10px;">
      <button class="export tap-scale" onclick={() => generateCSV(sales.all, room.code ?? 'SIN-SALA')}>📄 Exportar CSV</button>
      <button class="export tap-scale" onclick={exportPdf}>📑 Exportar PDF</button>
    </div>
  </section>

  <!-- Danger -->
  <section class="card" style="border-color: color-mix(in srgb, var(--accent-red) 40%, transparent);">
    <span class="title" style="color: var(--accent-red);">Zona peligrosa</span>
    <button class="danger tap-scale" onclick={() => (confirmEnd = true)}>Finalizar evento</button>
  </section>
</div>

{#if confirmEnd}
  <div class="scrim" role="dialog" aria-modal="true">
    <div class="modal">
      <span style="font-size: 32px;">⚠️</span>
      <h2 style="font-size: var(--text-lg); font-weight: 700; margin: 8px 0 4px;">¿Finalizar evento?</h2>
      <p style="font-size: var(--text-sm); color: var(--text-secondary); margin: 0 0 16px; text-align: center;">
        Se borrarán todas las ventas ({sales.count}). Exporta antes si las necesitas.
      </p>
      <div style="display: flex; gap: 10px; width: 100%;">
        <button class="export tap-scale" style="flex: 1;" onclick={() => (confirmEnd = false)}>Cancelar</button>
        <button class="danger tap-scale" style="flex: 1;" onclick={endEvent}>Borrar todo</button>
      </div>
    </div>
  </div>
{/if}

<style>
  .card {
    background: var(--bg-elevated);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-sm);
    padding: 16px;
    display: flex; flex-direction: column; gap: 12px;
  }
  .title {
    font-size: var(--text-xs); font-weight: 600;
    letter-spacing: 0.06em; text-transform: uppercase;
    color: var(--text-secondary);
  }
  .field { display: flex; justify-content: space-between; align-items: center; gap: 12px; font-size: var(--text-sm); color: var(--text-secondary); }
  .field input {
    width: 90px; padding: 8px 10px; text-align: right;
    border: 1px solid var(--border); border-radius: var(--radius-sm);
    background: var(--surface); color: var(--text-primary); font-size: var(--text-base);
  }
  .prod-row { display: flex; gap: 8px; align-items: center; }
  .prod-row input {
    padding: 8px; border: 1px solid var(--border); border-radius: var(--radius-sm);
    background: var(--surface); color: var(--text-primary); font-size: var(--text-sm);
  }
  .emoji { width: 44px; text-align: center; }
  .name { flex: 1; min-width: 0; }
  .num { width: 64px; text-align: right; }
  .trash { width: 32px; background: none; border: none; font-size: 16px; }
  .add {
    border: none; background: color-mix(in srgb, var(--accent-blue) 12%, transparent);
    color: var(--accent-blue); font-weight: 700; font-size: var(--text-sm);
    border-radius: 999px; padding: 6px 14px;
  }
  .export {
    flex: 1; border: 1px solid var(--border); background: var(--surface);
    color: var(--text-primary); font-weight: 600; font-size: var(--text-sm);
    border-radius: var(--radius-sm); padding: 12px;
  }
  .danger {
    border: none; background: var(--accent-red); color: white;
    font-weight: 700; font-size: var(--text-sm);
    border-radius: var(--radius-sm); padding: 12px;
  }
  .danger-ghost {
    border: 1px solid color-mix(in srgb, var(--accent-red) 40%, transparent);
    background: none; color: var(--accent-red);
    font-weight: 600; font-size: var(--text-xs);
    border-radius: 999px; padding: 6px 12px;
  }
  .scrim {
    position: fixed; inset: 0; z-index: 60;
    background: rgba(0,0,0,0.5);
    display: flex; align-items: center; justify-content: center;
  }
  .modal {
    background: var(--bg-elevated); border: 1px solid var(--border);
    border-radius: var(--radius-lg); box-shadow: var(--shadow-md);
    padding: 24px; width: min(320px, 86vw);
    display: flex; flex-direction: column; align-items: center;
  }
</style>
