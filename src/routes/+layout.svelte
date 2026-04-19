<script lang="ts">
  import "$lib/styles/app.css";
  import Navbar from "$lib/components/Navbar.svelte";
  import WhatsAppButton from "$lib/components/WhatsAppButton.svelte";
  import SEO from "$lib/components/SEO.svelte";

  let { children } = $props();
</script>

<!-- SEO global por defecto para todas las páginas -->
<SEO />

<Navbar /> 

<main>
  {@render children()}
</main>

<WhatsAppButton phone="541159264895" />