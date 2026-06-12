<script lang="ts">
  import { page } from '$app/stores';

  const tabs = [
    { href: '/vender', icon: '⚡', label: 'Vender' },
    { href: '/stats', icon: '📊', label: 'Stats' },
    { href: '/sala', icon: '🏛️', label: 'Sala' },
    { href: '/panic', icon: '🚨', label: 'Pánico', panic: true },
  ];
</script>

<nav>
  {#each tabs as tab}
    {@const active = $page.url.pathname === tab.href}
    <a href={tab.href} class:active class:panic={tab.panic} aria-current={active ? 'page' : undefined}>
      <span class="icon" style={tab.panic ? 'font-size: 24px;' : ''}>{tab.icon}</span>
      <span class="label">{tab.label}</span>
      <span class="dot" class:visible={active}></span>
    </a>
  {/each}
</nav>

<style>
  nav {
    position: fixed; bottom: 0; left: 0; right: 0; z-index: 40;
    display: flex;
    background: var(--bg-elevated);
    border-top: 1px solid var(--border);
    padding-bottom: env(safe-area-inset-bottom);
    backdrop-filter: blur(20px);
  }
  a {
    flex: 1;
    display: flex; flex-direction: column; align-items: center; gap: 2px;
    padding: 10px 0 8px;
    text-decoration: none;
    color: var(--text-tertiary);
    transition: color 150ms ease;
  }
  a.active { color: var(--accent-blue); }
  a.panic { color: var(--accent-red); }
  .icon { font-size: 21px; line-height: 1; }
  .label { font-size: var(--text-xs); font-weight: 600; }
  .dot {
    width: 4px; height: 4px; border-radius: 999px;
    background: currentColor; opacity: 0;
    transition: opacity 150ms ease;
  }
  .dot.visible { opacity: 1; }
</style>
