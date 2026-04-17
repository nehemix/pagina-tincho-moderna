import type { PageLoad } from './$types';
import { autoLoadImages } from '$lib/config/loader';

export const load: PageLoad = async ({ fetch }) => {
    try {
        const images = await autoLoadImages('personales', fetch);
        return { images };
    } catch (error) {
        console.error("Error cargando imágenes personales:", error);
        return { images: [], error: "No se pudieron cargar las imágenes personales." };
    }
};