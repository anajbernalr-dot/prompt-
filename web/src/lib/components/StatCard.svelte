<script lang="ts">
  let { label, value, color = 'var(--text-primary)', sub = '' }: {
    label: string;
    value: string;
    color?: string;
    sub?: string;
  } = $props();
</script>

<div class="stat">
  <span class="label">{label}</span>
  <span class="value" style="color: {color};">{value}</span>
  {#if sub}<span class="sub">{sub}</span>{/if}
</div>

<style>
  .stat {
    background: var(--bg-elevated);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-sm);
    padding: 16px;
    display: flex; flex-direction: column; gap: 4px;
  }
  .label {
    font-size: var(--text-xs);
    font-weight: 600;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: var(--text-secondary);
  }
  .value { font-size: var(--text-2xl); font-weight: 800; letter-spacing: -0.02em; line-height: 1.1; }
  .sub { font-size: var(--text-xs); color: var(--text-tertiary); }
</style>
