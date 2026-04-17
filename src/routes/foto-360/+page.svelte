<script lang="ts">
  import ThreeSixtyViewer from '$lib/components/ThreeSixtyViewer.svelte';
  import { galleryConfig } from '$lib/config/gallery';
</script>

<div class="sirv-grid">
  {#each galleryConfig.threeSixtySpins as spin}
    <ThreeSixtyViewer 
      path={spin.path}
      prefix={spin.prefix}
      totalFrames={spin.frames}
      extension={spin.extension}
      title={spin.title} 
    />
  {/each}
</div>

<style>
  .sirv-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 30px;
    padding: 120px 20px;
  }
</style>