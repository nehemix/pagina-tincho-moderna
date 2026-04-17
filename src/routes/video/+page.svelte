<script lang="ts">
  const videoIds = ['kS2b262TttU', 't4_rkyjRe9E', 'uES_GFSVgy0', 'Y_7MHl5Ky8o', 'o5NehblkvRU'];
</script>

<section class="container">
  <div class="video-grid">
    {#each videoIds as id}
      <div class="video-item">
        <a href="https://youtu.be/{id}" target="_blank">
          <img 
            src="https://img.youtube.com/vi/{id}/maxresdefault.jpg" 
            alt="Video Portfolio" 
            loading="lazy" 
          />
        </a>
      </div>
    {/each}
  </div>
</section>

<style>
  .video-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 20px;
    padding: 100px 20px;
  }
  .video-item img {
    width: 100%;
    border-radius: 10px;
    transition: var(--transition-smooth);
  }
  .video-item img:hover { transform: scale(1.05); filter: brightness(1.1); }
</style>