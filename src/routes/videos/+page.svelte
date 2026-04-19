<script lang="ts">
  import type { PageData } from './$types';
  let { data }: { data: PageData & { videos: { id: string }[] } } = $props();
</script>

<svelte:head>
  <link rel="preconnect" href="https://i.ytimg.com" crossorigin="anonymous" />
  <link rel="dns-prefetch" href="https://i.ytimg.com" />
</svelte:head>

<section class="container videos-section">

  {#if data.videos && data.videos.length > 0}
    {#key data.videos}
      <div class="video-grid">
        {#each data.videos as video}
          <div class="video-item">
            <a href="https://youtu.be/{video.id}" target="_blank" rel="noopener noreferrer">
              <picture>
                <source srcset="https://i.ytimg.com/vi_webp/{video.id}/hqdefault.webp" type="image/webp">
                <img 
                  src="https://i.ytimg.com/vi/{video.id}/hqdefault.jpg" 
                  alt="Video Portfolio" 
                  loading="lazy" 
                  decoding="async"
                  width="480"
                  height="360"
                />
              </picture>
              <div class="play-icon">▶</div>
            </a>
          </div>
        {/each}
      </div>
    {/key}
  {:else}
    <p class="empty-msg">Aún no se han agregado videos a la galería.</p>
  {/if}
</section>

<style>
  .videos-section {
    padding: 20px 20px 60px;
    margin-top: 100px; /* Unificado con la distancia de galerías */
    max-width: 1200px;
    margin-left: auto;
    margin-right: auto;
  }

  /* Ajuste para Tablet: El navbar apilado ocupa más espacio, bajamos el contenido */
  @media (min-width: 768px) and (max-width: 1199px) {
    .videos-section {
      margin-top: 160px;
    }
  }
  .page-title {
    text-align: center;
    color: var(--primary-green, #1b732a);
    font-size: 2.5rem;
    margin-bottom: 40px;
  }
  .video-grid {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 10px;
    animation: slideInFromTop 1s ease-out forwards;
    opacity: 0;
    transform: translateY(-50px);
    will-change: transform, opacity;
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

  @media (min-width: 768px) {
    .video-grid {
      gap: 20px;
    }
  }

  .video-item {
    width: calc(50% - 5px); /* 2 columnas en móviles */
    position: relative;
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 0 4px 10px rgba(0,0,0,0.5);
    aspect-ratio: 16 / 9;
  }

  @media (min-width: 768px) {
    .video-item {
      width: calc(50% - 10px); /* 2 columnas en tablets/laptops */
    }
  }

  @media (min-width: 1100px) {
    .video-item {
      width: calc(33.333% - 13.33px); /* 3 columnas máximo en PC */
    }
  }

  .video-item a {
    display: block;
    width: 100%;
    height: 100%;
  }
  .video-item img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transition: var(--transition-smooth, all 0.3s ease);
  }
  .video-item:hover img { transform: scale(1.05); filter: brightness(0.8); }
  .play-icon {
    position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
    font-size: 3rem; color: white; opacity: 0.8; pointer-events: none;
    transition: all 0.3s ease;
  }
  .video-item:hover .play-icon { opacity: 1; transform: translate(-50%, -50%) scale(1.1); color: var(--primary-green, #1b732a); }
  .empty-msg { color: #aaa; text-align: center; padding: 50px 20px; font-size: 1.2rem; }
</style>