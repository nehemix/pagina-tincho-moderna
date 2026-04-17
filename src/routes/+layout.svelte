<script lang="ts">
  import "$lib/styles/app.css";
  import Navbar from "$lib/components/Navbar.svelte";
  import WhatsAppButton from "$lib/components/WhatsAppButton.svelte";

  let { children } = $props();
</script>

<Navbar /> 

<main>
  {@render children()}
</main>

<WhatsAppButton phone="541159264895" />