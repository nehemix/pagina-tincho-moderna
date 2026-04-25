import { error } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import fs from 'fs/promises';
import path from 'path';

export const GET = async ({ params }: RequestEvent) => {
    try {
        // params.file contiene la ruta solicitada después de /images/ 
        // (Ejemplo: "ChatGPT_Image_26_mar_...avif" o "subcarpeta/foto.png")
        const fileName = (params as Record<string, string>).file || '';
        const safePath = path.normalize(fileName).replace(/^(\.\.[\/\\])+/, '');
        
        // Construimos la ruta absoluta al archivo real en static/images
        const filePath = path.resolve('static', 'images', safePath);
        
        // Leemos el archivo en tiempo real. Si no existe, el catch devolverá 404.
        const file = await fs.readFile(filePath);
        
        // Determinamos el formato para enviar el Content-Type correcto al navegador
        const ext = path.extname(filePath).toLowerCase();
        const contentTypes: Record<string, string> = {
            '.avif': 'image/avif',
            
        };
        const contentType = contentTypes[ext] || 'application/octet-stream';

        return new Response(file, {
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=31536000'
            }
        });
    } catch (err) {
        throw error(404, 'Imagen no encontrada en el disco');
    }
};
