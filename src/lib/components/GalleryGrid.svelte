<script lang="ts">
  import { fade, scale, fly } from 'svelte/transition';

  let { images } = $props<{ images: string[] }>();
  let selectedImage = $state<string | null>(null);

  const closeImage = () => { selectedImage = null; };

  // Lógica de navegación estructural
  let selectedIndex = $derived(selectedImage ? images.indexOf(selectedImage) : -1);
  
  // Dirección de la animación: 1 para derecha, -1 para izquierda
  let slideDirection = $state(1);

  const nextImage = (e?: Event) => {
    if (e) e.stopPropagation();
    slideDirection = 1;
    if (selectedIndex < images.length - 1) selectedImage = images[selectedIndex + 1];
    else selectedImage = images[0];
  };

  const prevImage = (e?: Event) => {
    if (e) e.stopPropagation();
    slideDirection = -1;
    if (selectedIndex > 0) selectedImage = images[selectedIndex - 1];
    else selectedImage = images[images.length - 1];
  };

  // Controles de teclado extendidos
  const handleKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') closeImage();
    if (selectedImage && e.key === 'ArrowRight') nextImage();
    if (selectedImage && e.key === 'ArrowLeft') prevImage();
  };

  // Lógica de navegación táctil (Swipe)
  let touchStartX = 0;
  let touchEndX = 0;

  const handleTouchStart = (e: TouchEvent) => {
    touchStartX = e.changedTouches[0].screenX;
    touchEndX = touchStartX; // Reseteamos para distinguir clics de swipes
  };

  const handleTouchEnd = (e: TouchEvent) => {
    touchEndX = e.changedTouches[0].screenX;
    const swipeThreshold = 50; // Distancia mínima en píxeles para considerar el gesto
    if (touchStartX - touchEndX > swipeThreshold) nextImage();
    else if (touchEndX - touchStartX > swipeThreshold) prevImage();
  };

  // Bloqueo estructural del scroll de la página al abrir el modal
  $effect(() => {
    if (selectedImage) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  });
</script>

<!-- Escucha eventos del teclado para la tecla ESC -->
<svelte:window onkeydown={handleKeydown} />

{#if images.length > 0}
  <!-- {#key} obliga a recrear el contenedor si cambian las fotos, repitiendo la animación -->
  {#key images}
    <div class="gallery-row">
      {#each images as src}
        <div 
          class="gallery-item" 
          tabindex="0" 
          role="button" 
          aria-label="Abrir imagen"
          onclick={() => (selectedImage = src)}
          onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectedImage = src; } }}>
          <img 
            {src} 
            alt="Portfolio" 
            class="gallery-img" 
            loading="lazy" 
          />
        </div>
      {/each}
    </div>
  {/key}
{:else}
  <div class="error-msg">
    <p>No se encontraron fotos para esta categoría.</p>
  </div>
{/if}

{#if selectedImage}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
  <div 
    class="lightbox-backdrop" 
    role="dialog" 
    aria-modal="true" 
    tabindex="-1" 
    transition:fade={{ duration: 200 }} 
    onclick={() => { if (Math.abs(touchStartX - touchEndX) < 50) closeImage(); }}
    ontouchstart={handleTouchStart}
    ontouchend={handleTouchEnd}
  >
    <button class="close-btn" onclick={closeImage} aria-label="Cerrar">&times;</button>
    
    <!-- Controles de navegación -->
    <button class="nav-btn prev" onclick={prevImage} aria-label="Imagen anterior">&#10094;</button>
    <button class="nav-btn next" onclick={nextImage} aria-label="Imagen siguiente">&#10095;</button>

    <!-- {#key} fuerza a Svelte a re-renderizar y reproducir animaciones al cambiar la variable -->
    {#key selectedImage}
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
      <img 
        src={selectedImage} 
        alt="Imagen ampliada" 
        class="expanded-img"
        onclick={(e) => e.stopPropagation()}
        in:fly={{ x: 100 * slideDirection, duration: 300 }}
        out:fly={{ x: -100 * slideDirection, duration: 300 }}
      />
    {/key}
  </div>
{/if}

<style>
  .gallery-row {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 10px;
    /* Efecto de entrada idéntico al de la sección Contacto */
    animation: slideInFromTop 1s ease-out forwards;
    opacity: 0;
    transform: translateY(-50px);
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

  .gallery-item {
    width: calc(50% - 5px); /* 2 columnas en móviles */
    overflow: hidden;
    border-radius: 8px;
    outline: none;
  }

  @media (min-width: 768px) {
    .gallery-row {
      gap: 20px;
    }
    .gallery-item {
      width: calc(33.333% - 13.33px); /* 3 columnas en tablets */
    }
  }

  @media (min-width: 1100px) {
    .gallery-item {
      width: calc(25% - 15px); /* 4 columnas en PC */
    }
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
  
  .gallery-item:focus-visible {
    box-shadow: 0 0 0 3px var(--primary-green);
  }
  
  .gallery-img:hover { 
    transform: scale(1.05); 
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.6);
  }
  
  .error-msg { color: white; text-align: center; padding: 50px; }
  .lightbox-backdrop {
    position: fixed; inset: 0; background: rgba(0, 0, 0, 0.95);
    display: grid; place-items: center; z-index: 4000;
    /* Bloquea gestos nativos del navegador como el zoom por doble tap */
    touch-action: none;
    user-select: none;
  }
  .expanded-img { 
    max-width: 90vw; 
    max-height: 90vh; 
    object-fit: contain; 
    /* Ambos elementos (entrante y saliente) ocuparán la misma celda de la grilla */
    grid-area: 1 / 1; 
  }
  
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
  
  /* Estructura de los botones de navegación */
  .nav-btn {
    position: fixed;
    top: 50%;
    transform: translateY(-50%);
    width: 50px;
    height: 50px;
    background: rgba(255, 255, 255, 0.15);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: white;
    font-size: 1.5rem;
    border-radius: 50%;
    cursor: pointer;
    backdrop-filter: blur(5px);
    transition: background 0.3s;
    z-index: 4010;
  }
  .nav-btn:hover { background: rgba(255, 255, 255, 0.3); }
  .nav-btn.prev { left: 20px; }
  .nav-btn.next { right: 20px; }

  /* Ajustes Responsive para móviles */
  @media (max-width: 768px) {
    .close-btn { top: 15px; right: 15px; width: 40px; height: 40px; font-size: 2rem; }
    .nav-btn { width: 40px; height: 40px; font-size: 1.2rem; }
    .nav-btn.prev { left: 10px; }
    .nav-btn.next { right: 10px; }
    .expanded-img { max-width: 95%; max-height: 85%; }
  }
</style>