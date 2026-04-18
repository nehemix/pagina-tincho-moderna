<script lang="ts">
  import ThreeSixtyViewer from '$lib/components/ThreeSixtyViewer.svelte';
  import type { PageData } from './$types';
  let { data } = $props();
</script>

{#if data.error}
  <p class="error-msg">{data.error}</p>
{:else if data.spins.length === 0}
  <p class="error-msg">No se encontraron imágenes 360°.</p>
{:else}
  <div class="sirv-grid">
    {#each data.spins as spin}
      <!-- Pasamos el array de imágenes directamente al componente -->
      <ThreeSixtyViewer images={spin.images} title={spin.title} />
    {/each}
  </div>
{/if}

<style>
  .sirv-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 15px;
    padding: 175px 20px 40px; /* Ajuste para compensar el navbar más bajo */
  }

  @media (min-width: 768px) {
    .sirv-grid {
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 30px;
    }
  }

  @media (min-width: 1100px) {
    .sirv-grid {
      padding-top: 120px; /* Restaura el espacio original en PC */
    }
  }
  .error-msg { color: white; text-align: center; padding: 120px 20px; }
</style>