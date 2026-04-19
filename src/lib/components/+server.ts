import { galleryConfig } from '../../gallery';

export const GET = async ({ url }) => {
    const siteUrl = 'https://tudominio.com'; // Cambia esto por tu dominio real
    
    const pages = [
        '',
        '/foto-360',
        ...galleryConfig.categories.map(cat => `/categoria/${cat.id}`)
    ];

    const sitemap = `
        <?xml version="1.0" encoding="UTF-8" ?>
        <urlset
            xmlns="https://www.sitemaps.org/schemas/sitemap/0.9"
            xmlns:xhtml="https://www.w3.org/1999/xhtml"
            xmlns:mobile="https://www.google.com/schemas/sitemap-mobile/1.0"
            xmlns:news="https://www.google.com/schemas/sitemap-news/0.9"
            xmlns:image="https://www.google.com/schemas/sitemap-image/1.1"
            xmlns:video="https://www.google.com/schemas/sitemap-video/1.1"
        >
            ${pages.map(page => `
                <url>
                    <loc>${siteUrl}${page}</loc>
                    <changefreq>monthly</changefreq>
                    <priority>${page === '' ? '1.0' : '0.8'}</priority>
                </url>
            `).join('')}
        </urlset>`.trim();

    return new Response(sitemap, {
        headers: {
            'Content-Type': 'application/xml',
            'Cache-Control': 'max-age=0, s-maxage=3600'
        }
    });
};