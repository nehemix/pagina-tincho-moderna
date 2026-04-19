<script lang="ts">
    let {
        title = 'Fotógrafo Profesional en Buenos Aires | Martin Mangudo',
        description = 'Servicios de fotografía profesional en Buenos Aires, Argentina. Especialista en productos, fotografía 360°, retratos corporativos e industria.',
        url = 'https://www.tudominio.com/',
        image = 'https://www.tudominio.com/images/seo-banner.jpg'
    }: {
        title?: string;
        description?: string;
        url?: string;
        image?: string;
    } = $props();

    // Schema markup para SEO Local y de Negocio
    const schemaLD = {
        "@context": "https://schema.org",
        "@type": "PhotographyBusiness",
        "name": "Martin Mangudo Fotografía",
        "image": image,
        "description": description,
        "url": url,
        "telephone": "+54 9 11 0000-0000", // TODO: Cambiar por tu teléfono real
        "address": {
            "@type": "PostalAddress",
            "addressLocality": "Buenos Aires",
            "addressRegion": "CABA",
            "addressCountry": "AR"
        },
        "priceRange": "$$"
    };
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
    
    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image" />
    <meta property="twitter:url" content={url} />
    <meta property="twitter:title" content={title} />
    <meta property="twitter:description" content={description} />
    <meta property="twitter:image" content={image} />

    <!-- JSON-LD para SEO Local -->
    <script type="application/ld+json">
        {@html JSON.stringify(schemaLD)}
    </script>
</svelte:head>