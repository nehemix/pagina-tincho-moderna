import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import fs from 'fs/promises';
import path from 'path';

export const GET: RequestHandler = async ({ params }) => {
    const imagePath = params.path;
    if (!imagePath) {
        throw error(404, 'Imagen no encontrada');
    }

    // Rutas absolutas para ubicar el archivo y mayor seguridad
    const basePath = path.resolve('static', 'images');
    const fullPath = path.resolve(basePath, imagePath);

    // Prevenir ataques de Path Traversal (asegurar que no intente leer fuera de static/images)
    if (!fullPath.startsWith(basePath)) {
        throw error(403, 'Acceso denegado');
    }

    try {
        const data = await fs.readFile(fullPath);
        
        // Determinar el Content-Type para que el navegador lo renderice como imagen
        let ext = path.extname(fullPath).toLowerCase();
        let contentType = 'application/octet-stream';
        
        if (ext === '.avif') contentType = 'image/avif';
        else if (ext === '.webp') contentType = 'image/webp';
        else if (ext === '.png') contentType = 'image/png';
        else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
        else if (ext === '.gif') contentType = 'image/gif';
        else if (ext === '.svg') contentType = 'image/svg+xml';

        return new Response(data, {
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=86400' // Cachear por 1 día
            }
        });
    } catch (err) {
        throw error(404, 'Imagen no encontrada');
    }
};