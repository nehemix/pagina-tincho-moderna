<script lang="ts">
  import "$lib/styles/app.css";
  import Navbar from "$lib/components/Navbar.svelte";
  import WhatsAppButton from "$lib/components/WhatsAppButton.svelte";
  import twitterPreviewImage from "$lib/assets/twitter.png";

  let { children } = $props();

  // Las meta tags de Open Graph necesitan una URL absoluta (con https://...)
  const siteUrl = 'https://martin.nehemi.online';
  const absoluteImageUrl = `${siteUrl}${twitterPreviewImage}`;
</script>

<svelte:head>
  <!-- Título que se ve en la pestaña del navegador -->
  <title>Martín Mangudo - Fotografía Profesional</title>

  <!-- Meta Tags para SEO y Vistas Previas (Open Graph) -->
  <meta name="description" content="Fotografía Profesional & Creación de Contenido. Capturando la esencia de cada detalle." />
  
  <!-- Título de la tarjeta de vista previa -->
  <meta property="og:title" content="Martín Mangudo - Fotografía Profesional" />
  
  <!-- Descripción de la tarjeta -->
  <meta property="og:description" content="Capturando la esencia de cada detalle. Fotografía de producto, 360, industria, retratos y más." />
  
  <!-- ¡LA MÁS IMPORTANTE! La imagen para la vista previa -->
  <meta property="og:image" content={absoluteImageUrl} />
  
  <!-- La URL canónica de tu página -->
  <meta property="og:url" content={siteUrl} />
  
  <!-- Tipo de contenido -->
  <meta property="og:type" content="website" />
</svelte:head>

<Navbar /> 

<main>
  {@render children()}
</main>

<WhatsAppButton phone="541159264895" />