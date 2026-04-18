<script lang="ts">
  import { onMount } from 'svelte';
  import type { PageData } from './$types';
  
  let { data }: { data: PageData } = $props();
  
  const heroImages = data.heroImages || [];
  
  // Usamos el estado de Svelte 5 para llevar el control de la imagen actual
  let currentIndex = $state(0);

  onMount(() => {
    if (heroImages.length <= 1) return; // No inicia el slider si hay 0 o 1 sola foto

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

  <!-- Contenido Central de Impacto -->
  <div class="hero-content">
    <h1>Capturando la esencia<br>de cada detalle</h1>
    <p>Fotografía Profesional & Creación de Contenido</p>
    <a href="/producto" class="btn-cta">VER PORTAFOLIO</a>
  </div>
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

  /* --- Diseño de Interfaz y Espaciado Central --- */
  .hero-content {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 10;
    text-align: center;
    width: 90%;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px; /* Espaciado aireado entre elementos */
  }
  .hero-content h1 {
    font-family: 'Lato', sans-serif;
    font-size: clamp(2rem, 5vw, 4.5rem);
    font-weight: 300;
    letter-spacing: 1px;
    margin: 0;
    text-shadow: 0 4px 15px rgba(0, 0, 0, 0.8); /* Asegura contraste sobre fotos blancas */
    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.4); /* Sombra más suave para no engrosar la letra fina */
    line-height: 1.1;
  }
  .hero-content p {
    font-family: system-ui, -apple-system, sans-serif;
    font-size: clamp(1rem, 2.5vw, 1.4rem);
    color: #e0e0e0;
    font-weight: 300;
    letter-spacing: 1px;
    margin: 0 0 15px 0;
    text-shadow: 0 2px 8px rgba(0, 0, 0, 0.8);
  }
  .btn-cta {
    display: inline-block;
    padding: 15px 45px;
    color: white;
    text-decoration: none;
    font-family: system-ui, -apple-system, sans-serif;
    font-size: 1rem;
    font-weight: 600;
    letter-spacing: 2px;
    border: 2px solid var(--primary-green);
    border-radius: 50px; /* Botón ovalado elegante */
    background: rgba(0, 0, 0, 0.2);
    backdrop-filter: blur(4px);
    box-shadow: 0 0 20px rgba(11, 102, 35, 0.4); /* Resplandor iluminado verde */
    transition: all 0.4s ease;
  }
  .btn-cta:hover {
    background: var(--primary-green);
    box-shadow: 0 0 30px rgba(11, 102, 35, 0.8);
    transform: translateY(-3px);
  }
</style>
