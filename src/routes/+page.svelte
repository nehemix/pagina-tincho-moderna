<script lang="ts">
  import { onMount } from 'svelte';
  
  // Definimos exactamente las 3 imágenes en el orden solicitado
  const heroImages = [
    '/producto/foto4.webp',
    '/industria/foto-1.webp',
    '/producto/foto30.webp'
  ];
  
  // Usamos el estado de Svelte 5 para llevar el control de la imagen actual
  let currentIndex = $state(0);

  onMount(() => {
    // Cambiamos de imagen automáticamente cada 5 segundos (5000 milisegundos)
    const interval = setInterval(() => {
      currentIndex = (currentIndex + 1) % heroImages.length;
    }, 5000);

    // Limpiamos el intervalo al salir de la página
    return () => clearInterval(interval);
  });
</script>

<section class="hero-slideshow">
  {#each heroImages as imagen, index}
    <img 
      src={imagen} 
      alt="Fotografía destacada de Martín Mangudo" 
      class="slide"
      class:active={index === currentIndex}
    />
  {/each}
  
  <!-- Capa oscura para que el texto del Navbar se lea bien siempre -->
  <div class="overlay"></div>
</section>

<style>
  .hero-slideshow {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
    z-index: -1; /* Envía el fondo por detrás de todo el contenido */
    background-color: var(--bg-dark);
    overflow: hidden;
  }
  .slide {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover; /* Cubre toda la pantalla sin distorsionar */
    opacity: 0;
    transition: opacity 2s ease-in-out; /* Efecto de fundido (fade) de 2 segundos */
  }
  .slide.active {
    opacity: 1; /* Solo la imagen activa se hace visible */
  }
  .overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.4); /* Oscurece la foto 40% */
  }
</style>
