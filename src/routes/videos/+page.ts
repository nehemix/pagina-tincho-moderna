import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, depends }) => {
    // Informa a SvelteKit de la dependencia de esta API
    depends('api:videos');
    try {
        // El timestamp (?t=...) rompe la caché del navegador de forma definitiva
        const res = await fetch(`/api/videos?t=${Date.now()}`);
        if (!res.ok) throw new Error('Error al cargar videos');
        const data = await res.json();
        return { videos: data.videos || [] };
    } catch (error) {
        console.error("Error cargando videos:", error);
        return { videos: [] };
    }
};