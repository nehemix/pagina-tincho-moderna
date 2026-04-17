import type { PageLoad } from './$types';
import { autoLoadImages } from '$lib/config/loader';

export const load: PageLoad = async ({ fetch }) => {
    try {
        // El loader se encarga de llamar a la API y filtrar por la carpeta 'industria'
        const images = await autoLoadImages('industria', fetch);
        return { images };
    } catch (error) {
        console.error("Error cargando imágenes de industria:", error);
        return { images: [], error: "No se pudieron cargar las imágenes de industria." };
    }
};