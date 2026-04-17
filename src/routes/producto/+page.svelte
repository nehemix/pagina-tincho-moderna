<script lang="ts">
  import GalleryGrid from '$lib/components/GalleryGrid.svelte';
  let { data } = $props();
</script>

{#if data.error}
  <p class="error-msg">{data.error}</p>
{:else}
  <GalleryGrid images={data.images} />
{/if}

<style>
  .error-msg { color: white; text-align: center; padding: 120px 20px; }
</style>
