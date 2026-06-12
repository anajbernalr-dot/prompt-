<script lang="ts">
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { room } from '$lib/stores/room.svelte';

  onMount(() => {
    goto(room.current ? '/vender' : '/onboarding', { replaceState: true });
  });
</script>
