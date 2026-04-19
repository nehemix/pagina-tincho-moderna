<script lang="ts">
    let {
        title = 'Fotógrafo Profesional | Martin Mangudo Fotografía',
        description = 'Servicios de fotografía profesional: producto, 360°, retratos e industria.',
        url = 'https://immediately-forbes-memo-shopzilla.trycloudflare.com/',
        image = 'https://tudominio.com/images/seo-banner.jpg'
    }: {
        title?: string;
        description?: string;
        url?: string;
        image?: string;
    } = $props();
</script>

<svelte:head>
    <!-- Primary Meta Tags -->
    <title>{title}</title>
    <meta name="title" content={title} />
    <meta name="description" content={description} />

    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website" />
    <meta property="og:url" content={url} />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:image" content={image} />
    
    <!-- Añadir JSON-LD para SEO Local aquí (ver sección SEO Local) -->
</svelte:head>