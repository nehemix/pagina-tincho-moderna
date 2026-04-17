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

  // Permite cerrar la imagen presionando la tecla ESC
  const handleKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') closeImage();
  };
</script>

<!-- Escucha eventos del teclado para la tecla ESC -->
<svelte:window onkeydown={handleKeydown} />

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
    transition: transform 0.4s ease, box-shadow 0.4s ease;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
  }
  
  .gallery-item {
    overflow: hidden;
    border-radius: 8px;
  }
  
  .gallery-img:hover { 
    transform: scale(1.05); 
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.6);
  }
  
  .error-msg { color: white; text-align: center; padding: 50px; }
  .lightbox-backdrop {
    position: fixed; inset: 0; background: rgba(0, 0, 0, 0.9);
    display: flex; align-items: center; justify-content: center; z-index: 4000;
  }
  .expanded-img { max-width: 90%; max-height: 90%; object-fit: contain; }
  
  /* Diseño mejorado del botón X */
  .close-btn { 
    position: fixed; /* Fijo al viewport para que no se mueva */
    top: 20px; 
    right: 30px; 
    width: 50px; 
    height: 50px; 
    background: rgba(255, 255, 255, 0.15); /* Fondo semitransparente */
    border: 1px solid rgba(255, 255, 255, 0.2); 
    color: white; 
    font-size: 2.5rem; 
    font-weight: 300; 
    border-radius: 50%; 
    cursor: pointer; 
    display: flex; 
    justify-content: center; 
    align-items: center; 
    padding: 0; 
    backdrop-filter: blur(5px); /* Efecto cristal para contraste en fotos claras */
    transition: background 0.3s, transform 0.3s; 
    z-index: 4010; 
  }
  .close-btn:hover { 
    background: rgba(255, 255, 255, 0.3);
    transform: scale(1.1); /* Leve animación */
  }

  /* Ajustes Responsive para móviles */
  @media (max-width: 768px) {
    .close-btn { top: 15px; right: 15px; width: 40px; height: 40px; font-size: 2rem; }
    .expanded-img { max-width: 95%; max-height: 85%; }
  }
</style>