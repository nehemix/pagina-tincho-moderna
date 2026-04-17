<script lang="ts">
  import { fade, scale } from 'svelte/transition';

  let { categoryId } = $props<{ categoryId: string }>();
  let selectedImage = $state<string | null>(null);

  // 1. Escaneamos TODO lo que hay en static de forma automática
  const allModules = import.meta.glob('/static/**/*.{webp,jpg,jpeg,png}', { 
    eager: true, 
    query: '?url', 
    import: 'default' 
  });
  
  // 2. Filtramos solo los que están en la carpeta que coincide con categoryId
  const images = Object.values(allModules)
    .map((path: any) => path.replace('/static', ''))
    .filter(path => path.includes(`/${categoryId}/`));

  const closeImage = () => { selectedImage = null; };
</script>

{#if images.length > 0}
  <div class="gallery-row">
    {#each images as src}
      <div class="gallery-item">
        <img 
          {src} 
          alt="Portfolio" 
          class="gallery-img" 
          loading="lazy" 
          onclick={() => (selectedImage = src)} 
        />
      </div>
    {/each}
  </div>
{:else}
  <div class="error-msg">
    <p>No se encontraron fotos en: <strong>static/{categoryId}/</strong></p>
  </div>
{/if}

{#if selectedImage}
  <div class="lightbox-backdrop" transition:fade={{ duration: 200 }} onclick={closeImage}>
    <button class="close-btn" onclick={closeImage} aria-label="Cerrar">&times;</button>
    
    <img 
      src={selectedImage} 
      alt="Imagen ampliada" 
      class="expanded-img"
      onclick={(e) => e.stopPropagation()}
      transition:scale={{ duration: 300, start: 0.9 }}
    />
  </div>
{/if}

<style>
  .gallery-row {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 15px;
    padding: 20px;
  }
  .gallery-img {
    width: 100%;
    aspect-ratio: 1/1;
    object-fit: cover;
    border-radius: 8px;
    cursor: zoom-in;
    transition: transform 0.3s ease;
  }
  .gallery-img:hover { transform: scale(1.02); }
  .error-msg { color: white; text-align: center; padding: 50px; }
  .lightbox-backdrop {
    position: fixed; inset: 0; background: rgba(0, 0, 0, 0.9);
    display: flex; align-items: center; justify-content: center; z-index: 2000;
  }
  .expanded-img { max-width: 90%; max-height: 90%; object-fit: contain; }
  .close-btn { position: absolute; top: 20px; right: 30px; background: none; border: none; color: white; font-size: 3rem; cursor: pointer; }
</style>