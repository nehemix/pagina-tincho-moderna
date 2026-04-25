<script lang="ts">
  import { fade, scale } from 'svelte/transition';

  // Props con Svelte 5 Runes
  let { 
    images = [],
    title,
    sensitivity = 10 
  } = $props<{ 
    images: string[],
    title: string,
    sensitivity?: number 
  }>();

  // Estados reactivos (Runes)
  let totalFrames = $derived(images.length);
  let currentIndex = $state(0);
  let isDragging = $state(false);
  let startX = $state(0);
  let isExpanded = $state(false); // Estado para controlar el modal

  // --- Lógica de Interacción ---
  function handleStart(e: MouseEvent | TouchEvent) {
    e.preventDefault(); // Previene comportamientos extraños del navegador
    isDragging = true;
    startX = 'touches' in e ? e.touches[0].clientX : e.clientX;
  }

  function handleMove(e: MouseEvent | TouchEvent) {
    if (!isDragging) return;
    const currentX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const diff = startX - currentX;

    if (Math.abs(diff) > sensitivity) {
      const direction = diff > 0 ? -1 : 1;
      currentIndex = (currentIndex + direction + totalFrames) % totalFrames;
      startX = currentX;
    }
  }

  const stopDragging = () => isDragging = false;
  const closeLightbox = () => { isExpanded = false; isDragging = false; };

  // Bloqueo estructural del scroll de la página al abrir el modal 360
  $effect(() => {
    if (isExpanded) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  });
  
  // Cierre con teclado
  const handleKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') closeLightbox();
  };
</script>

<svelte:window onkeydown={handleKeydown} />

<svelte:head>
  {#if isExpanded}
    {#each images as img}
      <link rel="preload" as="image" href={img} />
    {/each}
  {/if}
</svelte:head>

<div class="grid-card">
  <div class="static-container" tabindex="0" role="button" aria-label="Abrir vista 360" onclick={() => isExpanded = true} onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && (isExpanded = true)}>
    <img 
      src={images[0]} 
      alt="Vista previa 360 de {title}" 
      class="static-img" 
      loading="lazy" 
    />
    <div class="overlay"><span>🔍 Tocar para girar</span></div>
  </div>
</div>

{#if isExpanded}
  <div class="lightbox-backdrop" role="dialog" aria-modal="true" transition:fade={{ duration: 200 }} onclick={closeLightbox}>
    
    <button class="close-btn" onclick={closeLightbox} aria-label="Cerrar">×</button>

    <div 
      class="viewer-container"
      transition:scale={{ duration: 300, start: 0.95 }}
      onmousedown={handleStart}
      ontouchstart={handleStart}
      onmousemove={handleMove}
      ontouchmove={handleMove}
      onmouseup={stopDragging}
      onmouseleave={stopDragging}
      ontouchend={stopDragging}
      onclick={(e) => e.stopPropagation()} // Evita que se cierre al tocar el visor
    >
      <img 
        src={images[currentIndex]} 
        alt="Giro 360 de {title}" 
        class="interactive-img"
        draggable="false"
        loading="eager"
      />
      
      <div class="hint">Arrastrá para girar</div>
    </div>
  </div>
{/if}

<style>
  /* --- Estilos Grilla (Estática) --- */
  .grid-card { display: flex; flex-direction: column; align-items: center; }
  
  .static-container {
    width: 100%;
    aspect-ratio: 1/1;
    background: transparent; /* Antes #000 */
    border: none;            /* Antes 1px solid */
    overflow: hidden;
    cursor: zoom-in;
    position: relative;
    outline: none;
  }
  .static-container:focus-visible {
    box-shadow: 0 0 0 3px var(--primary-green);
  }
  .static-container:hover { border-color: #555; }

  .static-img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s; }
  .static-container:hover .static-img { transform: scale(1.03); }

  .overlay {
    position: absolute; inset: 0; 
    display: flex; align-items: center; justify-content: center;
    opacity: 0; transition: opacity 0.3s;
  }
  .static-container:hover .overlay { opacity: 1; }
  .overlay span { background: rgba(0,0,0,0.7); color: white; padding: 5px 15px; border-radius: 20px; font-size: 0.8rem; }

  .title { color: #ccc; margin-top: 10px; font-size: 0.9rem; font-weight: bold; }

  /* --- Estilos Lightbox (Interactivo) --- */
  .lightbox-backdrop {
    position: fixed; inset: 0; background: rgba(0, 0, 0, 0.95);
    display: flex; align-items: center; justify-content: center;
    z-index: 4000; cursor: zoom-out;
  }

  .viewer-container {
    width: 90vmin; 
    height: 90vmin; 
    max-width: 850px; 
    max-height: 850px;
    background: transparent; /* Antes #000 */
    border: none;            /* Antes 1px solid */
    box-shadow: none;        /* Borramos la sombra */
    position: relative;
    touch-action: none;
  }
  .viewer-container:active { cursor: grabbing; }

  .interactive-img {
    width: 100%; height: 100%; object-fit: contain;
    pointer-events: none; /* Evita que el navegador intente arrastrar la imagen */
    
    /* SOLUCIÓN AL RESALTADO AZUL */
    -webkit-user-select: none; /* Safari/Chrome */
    user-select: none; /* Estándar */
    -webkit-touch-callout: none; /* iOS Safari */
  }

  .hint {
    position: absolute; bottom: 15px; left: 50%; transform: translateX(-50%);
    background: rgba(0,0,0,0.6); color: white; padding: 5px 15px;
    border-radius: 20px; font-size: 0.75rem; pointer-events: none;
  }

  .close-btn {
    position: fixed; 
    top: 20px; 
    right: 30px; 
    width: 50px; 
    height: 50px; 
    background: rgba(255, 255, 255, 0.15);
    border: 1px solid rgba(255, 255, 255, 0.2); 
    color: white; 
    font-size: 2.5rem; 
    font-weight: 300; 
    border-radius: 50%; 
    cursor: pointer; 
    display: flex; 
    justify-content: center; 
    align-items: center; 
    padding: 0 0 4px 0; /* Ajuste óptico para centrar la X verticalmente */
    line-height: 1;
    box-sizing: border-box;
    backdrop-filter: blur(5px);
    transition: background 0.3s, transform 0.3s; 
    z-index: 4010; 
  }
  .close-btn:hover { 
    background: rgba(255, 255, 255, 0.3);
    transform: scale(1.1); 
  }

  /* Ajustes Responsive para móviles */
  @media (max-width: 768px) {
    .close-btn { top: 15px; right: 15px; width: 40px; height: 40px; font-size: 2rem; }
  }
</style>