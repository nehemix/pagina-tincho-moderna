import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import fs from 'fs/promises';
import path from 'path';

// Guardaremos los enlaces de video en un archivo JSON en la raíz del proyecto
const DATA_FILE = 'data/videos.json';

async function getVideosData() {
    try {
        await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
        const content = await fs.readFile(DATA_FILE, 'utf-8');
        return JSON.parse(content);
    } catch (e: any) {
        if (e.code === 'ENOENT') return []; // Si no existe el archivo, devuelve un arreglo vacío
        throw e;
    }
}

async function saveVideosData(data: any) {
    await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
}

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
        const videos = await getVideosData();
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

        const videos = await getVideosData();
        if (videos.some((v: any) => v.id === id)) {
            throw error(400, 'Este video ya ha sido agregado.');
        }

        videos.push({ id, url });
        await saveVideosData(videos);

        return json({ success: true, message: 'Video agregado con éxito.', videos });
    } catch (e: any) {
        if (e.status) return json({ success: false, error: e.body.message }, { status: e.status });
        return json({ success: false, error: e.message || 'Error desconocido' }, { status: 500 });
    }
};

export const DELETE: RequestHandler = async ({ request }) => {
    try {
        const { id } = await request.json();
        if (!id) throw error(400, 'Falta el ID del video.');

        let videos = await getVideosData();
        videos = videos.filter((v: any) => v.id !== id);
        await saveVideosData(videos);

        return json({ success: true, message: 'Video eliminado de la galería.' });
    } catch (e: any) {
        if (e.status) return json({ success: false, error: e.body.message }, { status: e.status });
        return json({ success: false, error: e.message || 'Error desconocido' }, { status: 500 });
    }
};