<script lang="ts">
  import type { PageData } from './$types';
  import GalleryGrid from '$lib/components/GalleryGrid.svelte';
  
  let { data }: { data: PageData & { images: string[] } } = $props();
</script>

<GalleryGrid images={data.images || []} />