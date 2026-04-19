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
  {#key data.spins}
    <div class="sirv-grid">
      {#each data.spins as spin (spin.id)}
        <div class="sirv-item">
          <!-- Pasamos el array de imágenes directamente al componente -->
          <ThreeSixtyViewer images={spin.images} title={spin.title} />
        </div>
      {/each}
    </div>
  {/key}
{/if}

<style>
  .sirv-grid {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 15px;
    padding: 20px 20px 40px;
    margin-top: 100px; /* Unificado con la distancia de galerías */
    max-width: 1200px;
    margin-left: auto;
    margin-right: auto;
    animation: slideInFromTop 1s ease-out backwards;
  }

  /* Ajuste para Tablet: El navbar apilado ocupa más espacio, bajamos el contenido */
  @media (min-width: 768px) and (max-width: 1199px) {
    .sirv-grid {
      margin-top: 160px;
    }
  }

  @keyframes slideInFromTop {
    0% {
      opacity: 0;
      transform: translateY(-50px);
    }
    100% {
      opacity: 1;
      transform: translateY(0);
    }
  }
  .sirv-item {
    width: calc(50% - 7.5px); /* 2 columnas en móviles */
    border-radius: 8px;
    overflow: hidden;
  }

  @media (min-width: 768px) {
    .sirv-grid {
      gap: 30px;
    }
    .sirv-item {
      width: calc(33.333% - 20px); /* 3 columnas en tablets */
    }
  }

  @media (min-width: 1100px) {
    .sirv-item {
      width: calc(25% - 22.5px); /* 4 columnas en PC */
    }
  }
  .error-msg { color: white; text-align: center; padding: 120px 20px; }
</style>