import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { dbApi } from '$lib/lowdb';

// Función para extraer el ID de un enlace de YouTube
function extractYouTubeId(url: string) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

export const GET: RequestHandler = async ({ setHeaders }) => {
    // Evitar que el navegador guarde la respuesta en caché
    setHeaders({
        'Cache-Control': 'no-cache, no-store, must-revalidate'
    });
    try {
        const videos = await dbApi.getVideos();
        return json({ success: true, videos });
    } catch (e: any) {
        return json({ success: false, error: 'No se pudo leer la base de datos de videos.' }, { status: 500 });
    }
};

export const POST: RequestHandler = async ({ request }) => {
    try {
        const { url } = await request.json();
        if (!url) throw error(400, 'Se requiere un enlace de YouTube.');

        const id = extractYouTubeId(url);
        if (!id) throw error(400, 'Enlace de YouTube no válido.');

        const videos = await dbApi.getVideos();
        const existingVideo = videos.find(v => v.id === id);
        if (existingVideo) {
            throw error(400, 'Este video ya ha sido agregado.');
        }

        const newVideo = { id, url, createdAt: new Date().toISOString() };
        await dbApi.addVideo(newVideo);

        return json({ success: true, message: 'Video agregado con éxito.', video: newVideo });
    } catch (e: any) {
        if (e.status) return json({ success: false, error: e.body.message }, { status: e.status });
        return json({ success: false, error: e.message || 'Error desconocido' }, { status: 500 });
    }
};

export const PATCH: RequestHandler = async ({ request }) => {
    try {
        const { videos } = await request.json();
        if (!videos || !Array.isArray(videos)) throw error(400, 'Formato inválido.');

        await dbApi.updateVideosOrder(videos);
        return json({ success: true, message: 'Orden de videos guardado.' });
    } catch (e: any) {
        return json({ success: false, error: e.message || 'Error desconocido' }, { status: 500 });
    }
};

export const DELETE: RequestHandler = async ({ request }) => {
    try {
        const { id } = await request.json();
        if (!id) throw error(400, 'Falta el ID del video.');

        await dbApi.deleteVideo(id);

        return json({ success: true, message: 'Video eliminado de la galería.' });
    } catch (e: any) {
        if (e.status) return json({ success: false, error: e.body.message }, { status: e.status });
        return json({ success: false, error: e.message || 'Error desconocido' }, { status: 500 });
    }
};