<script lang="ts">
  import { goto } from '$app/navigation';
  import { room, generateRoomCode, CODE_RE } from '$lib/stores/room.svelte';

  let code = $state('');
  let error = $state('');
  let mode = $state<'join' | 'create'>('join');
  let eventName = $state('');

  const formatted = $derived(code.toUpperCase().trim());

  async function join() {
    error = '';
    if (!CODE_RE.test(formatted)) {
      error = 'Formato inválido. Ejemplo: BAZAR-VERDE-2026';
      return;
    }
    await room.join(formatted);
    goto('/vender');
  }

  async function create() {
    const newCode = generateRoomCode();
    await room.join(newCode, { isOrganizer: true, eventName: eventName.trim() || 'Mi evento' });
    goto('/vender');
  }
</script>

<div class="wrap">
  <div class="card page-enter">
    <span style="font-size: 48px;">📊</span>
    <h1 style="font-size: var(--text-2xl); font-weight: 800; margin: 12px 0 4px; letter-spacing: -0.02em;">PopUp Analytics</h1>
    <p style="font-size: var(--text-sm); color: var(--text-secondary); margin: 0 0 24px; text-align: center;">
      Finanzas en tiempo real para tu puesto
    </p>

    {#if room.code}
      <div class="badge">Sala actual: {room.code}</div>
      <button class="primary tap-scale" onclick={() => goto('/vender')}>Continuar</button>
    {:else if mode === 'join'}
      <input
        type="text"
        bind:value={code}
        placeholder="BAZAR-VERDE-2026"
        autocapitalize="characters"
        autocomplete="off"
        spellcheck="false"
        style="text-transform: uppercase;"
        onkeydown={(e) => e.key === 'Enter' && join()}
      />
      {#if error}<span class="error">{error}</span>{/if}
      <button class="primary tap-scale" onclick={join}>Unirse al evento</button>
      <button class="link" onclick={() => (mode = 'create')}>Soy organizador — crear sala nueva</button>
    {:else}
      <input type="text" bind:value={eventName} placeholder="Nombre del evento" />
      <button class="primary tap-scale" onclick={create}>Crear sala y generar código</button>
      <button class="link" onclick={() => (mode = 'join')}>← Tengo un código</button>
    {/if}
  </div>
</div>

<style>
  .wrap {
    min-height: 100dvh;
    display: flex; align-items: center; justify-content: center;
    padding: 20px;
    background: var(--bg-secondary);
  }
  .card {
    background: var(--bg-elevated);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-md);
    padding: 32px 28px;
    width: min(380px, 100%);
    display: flex; flex-direction: column; align-items: center;
  }
  input {
    width: 100%; padding: 14px; text-align: center;
    font-size: var(--text-lg); font-weight: 600; letter-spacing: 0.04em;
    border: 1px solid var(--border); border-radius: var(--radius-sm);
    background: var(--surface); color: var(--text-primary);
    margin-bottom: 12px;
  }
  input:focus { outline: 2px solid var(--accent-blue); border-color: transparent; }
  .primary {
    width: 100%; padding: 14px; border: none;
    background: var(--accent-blue); color: white;
    font-weight: 700; font-size: var(--text-base);
    border-radius: var(--radius-sm);
  }
  .link {
    margin-top: 14px; background: none; border: none;
    color: var(--accent-blue); font-size: var(--text-sm); font-weight: 600;
  }
  .error { font-size: var(--text-xs); color: var(--accent-red); margin-bottom: 10px; }
  .badge {
    font-size: var(--text-sm); font-weight: 700; color: var(--accent-blue);
    background: color-mix(in srgb, var(--accent-blue) 12%, transparent);
    border-radius: 999px; padding: 6px 16px; margin-bottom: 16px;
  }
</style>
