<script lang="ts">
  let { phone } = $props();
</script>

<a 
  href="https://wa.me/{phone}" 
  class="whatsapp-float" 
  target="_blank" 
  rel="noopener noreferrer"
  aria-label="Chat en WhatsApp"
>
  <img src="/WhatsApp.svg" alt="WhatsApp" />
</a>

<style>
  .whatsapp-float {
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 999;
    width: 70px;
    height: 70px;
    background-color: #25D366;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
    transition: transform 0.3s ease;
  }
  .whatsapp-float:hover { transform: scale(1.1); }
  .whatsapp-float img { width: 50px; height: 50px; }
</style>