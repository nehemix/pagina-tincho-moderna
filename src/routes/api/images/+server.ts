import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import path from 'path';
import { dbApi } from '$lib/lowdb';
import { Storage } from '@google-cloud/storage';
import { env } from '$env/dynamic/private';

// Configuración de Google Cloud Storage
// Asegúrate de definir estas variables en tu archivo .env
const storage = new Storage({
    projectId: env.GCP_PROJECT_ID,
    credentials: {
        client_email: env.GCP_CLIENT_EMAIL,
        // Reemplaza los saltos de línea escapados si vienen del .env
        private_key: env.GCP_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }
});

const BUCKET_NAME = env.GCS_BUCKET_NAME || 'tu-bucket-de-imagenes';
const bucket = storage.bucket(BUCKET_NAME);
const GCS_PUBLIC_URL = env.CDN_PUBLIC_URL || `https://storage.googleapis.com/${BUCKET_NAME}`;

// GET /api/images -> Devuelve una lista de todas las imágenes
export const GET: RequestHandler = async ({ url, setHeaders }) => {
    // Desactivamos la caché agresiva de 1 hora porque ahora el orden y el slider de inicio
    // son dinámicos (vienen de la base de datos) y deben reflejarse al instante en el frontend.
    setHeaders({
        'Cache-Control': 'no-cache, no-store, must-revalidate'
    });

    try {
        const folderFilter = url.searchParams.get('folder')?.toLowerCase();
        const limitParam = url.searchParams.get('limit');
        const pageParam = url.searchParams.get('page');
        const limit = limitParam ? parseInt(limitParam, 10) : 0;
        const page = pageParam ? parseInt(pageParam, 10) : 1;
        
        // Interceptamos la petición de 'inicio' para devolver la lista guardada en la base de datos
        if (folderFilter === 'inicio') {
            const sliderImages = await dbApi.getSliderImages();
            // Transformamos las rutas a URLs públicas de GCS si no son links externos
            const sliderUrls = sliderImages.map(p => p.startsWith('http') ? p : `${GCS_PUBLIC_URL}${p}`);
            return json({ success: true, images: sliderUrls, total: sliderImages.length, page, limit });
        }

        let searchPrefix = 'images/';
        if (folderFilter) {
            const safeFolder = path.normalize(folderFilter).replace(/^(\.\.[\/\\])+/, '').replace(/\\/g, '/');
            searchPrefix = `images/${safeFolder}/`;
        }

        // Obtener los archivos de GCS
        const [files] = await bucket.getFiles({ prefix: searchPrefix });

        // Filtra por extensiones de imagen y mantiene un formato de ruta local (ej. /images/...)
        let imagesPaths = files
            .map(file => file.name)
            .filter(name => /\.(jpg|jpeg|png|webp|gif|avif|svg)$/i.test(name))
            .map(name => `/${name}`); 

        if (folderFilter) {
            imagesPaths = imagesPaths.filter(img => img.toLowerCase().includes(`/${folderFilter}/`));
        }

        // Obtener orden desde lowdb
        const order = await dbApi.getImageOrder();
        const folderOrder = await dbApi.getFolderOrder();
        
        if (order.length > 0) {
            imagesPaths.sort((a, b) => {
                const indexA = order.indexOf(a);
                const indexB = order.indexOf(b);
                if (indexA === -1 && indexB === -1) return a.localeCompare(b);
                if (indexA === -1) return 1; // Elementos nuevos van al final
                if (indexB === -1) return -1;
                return indexA - indexB;
            });
        }

        const total = imagesPaths.length;

        // Aplicar paginación real a nivel backend para no saturar la red con JSONs inmensos
        if (limit > 0) {
            const startIndex = (page - 1) * limit;
            imagesPaths = imagesPaths.slice(startIndex, startIndex + limit);
        }

        // Convertir las rutas a URLs de GCS o Cloudflare CDN justo antes de enviarlas al cliente
        const imagesUrls = imagesPaths.map(p => `${GCS_PUBLIC_URL}${p}`);

        return json({ success: true, images: imagesUrls, folderOrder, total, page, limit });
    } catch (e: any) {
        console.error("Error al obtener imágenes de GCS:", e);
        return json({ success: false, error: 'No se pudieron obtener las imágenes del Bucket.' }, { status: 500 });
    }
};

// POST /api/images -> Sube una o más imágenes
export const POST: RequestHandler = async ({ request }) => {
    try {
        const data = await request.formData();
        const files = data.getAll('files') as File[];
        const paths = data.getAll('paths') as string[];
        const baseFolder = (data.get('folder') as string) || '';

        // Filtramos archivos vacíos o directorios puros que envían algunos navegadores (0 bytes)
        // y asociamos cada archivo válido con su ruta para que no se desincronicen.
        const validUploads = [];
        for (let i = 0; i < files.length; i++) {
            const isAvif = files[i].name.toLowerCase().endsWith('.avif') || files[i].type === 'image/avif';
            if (files[i].size > 0 && isAvif) {
                validUploads.push({
                    file: files[i],
                    relativePath: (paths && paths[i]) ? paths[i] : files[i].name
                });
            }
        }

        if (validUploads.length === 0) {
            return json({ success: false, error: 'No se han subido archivos válidos. Solo se permite formato AVIF.' }, { status: 400 });
        }
        
        const safeBaseFolder = baseFolder ? path.normalize(baseFolder).replace(/^(\.\.[\/\\])+/, '').replace(/\\/g, '/') : '';

        for (const upload of validUploads) {
            const safeRelativePath = path.normalize(upload.relativePath).replace(/^(\.\.[\/\\])+/, '').replace(/\\/g, '/');
            const finalPath = `images/${safeBaseFolder ? safeBaseFolder + '/' : ''}${safeRelativePath}`;

            const file = bucket.file(finalPath);
            const buffer = Buffer.from(await upload.file.arrayBuffer());
            
            await file.save(buffer, {
                resumable: false,
                metadata: {
                    contentType: upload.file.type,
                    cacheControl: 'public, max-age=31536000',
                }
            });
        }

        return json({ success: true, message: `${validUploads.length} imagen(es) subida(s) con éxito.` });
    } catch (e: any) {
        console.error("Error al subir el archivo:", e);
        return json({ success: false, error: e.message || 'Ocurrió un error desconocido.' }, { status: 500 });
    }
};

export const PUT: RequestHandler = async ({ request }) => {
    try {
        const { oldFolder, newFolder } = await request.json();
        if (!oldFolder || !newFolder) throw error(400, 'Faltan parámetros para renombrar.');

        const safeOldFolder = path.normalize(oldFolder).replace(/^(\.\.[\/\\])+/, '').replace(/\\/g, '/');
        const safeNewFolder = path.normalize(newFolder).replace(/^(\.\.[\/\\])+/, '').replace(/\\/g, '/');
        
        const oldPrefix = `images/${safeOldFolder}/`;
        const newPrefix = `images/${safeNewFolder}/`;

        // Renombramos la ruta base en lowdb para las imágenes afectadas
        const oldDbPattern = `/${oldPrefix}`;
        const newDbPattern = `/${newPrefix}`;
        await dbApi.renameImageFolderInOrder(oldDbPattern, newDbPattern);

        // En GCS no hay "renombrar carpeta", se debe copiar y eliminar cada objeto
        const [files] = await bucket.getFiles({ prefix: oldPrefix });
        for (const file of files) {
            const newName = file.name.replace(oldPrefix, newPrefix);
            await file.copy(bucket.file(newName));
            await file.delete();
        }
        
        return json({ success: true, message: 'Carpeta renombrada con éxito.' });
    } catch (e: any) {
        console.error("Error al renombrar la carpeta:", e);
        return json({ success: false, error: e.message || 'Error desconocido' }, { status: 500 });
    }
};

// PATCH /api/images -> Guarda el orden personalizado de las imágenes
export const PATCH: RequestHandler = async ({ request }) => {
    try {
        const body = await request.json();
        if (body.order && Array.isArray(body.order)) {
            // Normalizamos las rutas quitando la URL del CDN/GCS
            const normalizedOrder = body.order.map((p: string) => p.replace(GCS_PUBLIC_URL, ''));
            await dbApi.updateImageOrder(normalizedOrder);
            
            return json({ success: true, message: 'Orden guardado con éxito.' });
        }
        if (body.sliderImages && Array.isArray(body.sliderImages)) {
            const normalizedSlider = body.sliderImages.map((p: string) => p.replace(GCS_PUBLIC_URL, ''));
            await dbApi.updateSliderImages(normalizedSlider);
            return json({ success: true, message: 'Slider actualizado con éxito.' });
        }
        if (body.folderOrder && Array.isArray(body.folderOrder)) {
            await dbApi.updateFolderOrder(body.folderOrder);
            return json({ success: true, message: 'Orden de carpetas actualizado con éxito.' });
        }
        throw error(400, 'Formato de orden inválido.');
    } catch (e: any) {
        console.error("Error al guardar el orden:", e);
        return json({ success: false, error: e.message || 'Error desconocido' }, { status: 500 });
    }
};

// DELETE /api/images -> Borra una o múltiples imágenes, O una carpeta completa
export const DELETE: RequestHandler = async ({ request }) => {
    try {
        const body = await request.json();

        // NUEVO: Si se recibe una ruta de carpeta, la borramos entera
        if (body.folderPath) {
            const safeFolderPath = path.normalize(body.folderPath).replace(/^(\.\.[\/\\])+/, '').replace(/\\/g, '/');
            const dirPrefix = `images/${safeFolderPath}/`;
            
            // Eliminar registros afectados en lowdb
            await dbApi.removeFolderFromOrder(`/${dirPrefix}`);
            
            await bucket.deleteFiles({ prefix: dirPrefix });
            return json({ success: true, message: `Carpeta "${safeFolderPath}" y su contenido eliminados.` });
        }

        // Acepta un array de rutas o una sola ruta (para compatibilidad)
        let pathsToDelete: string[] = body.imagePaths || (body.imagePath ? [body.imagePath] : []);

        if (pathsToDelete.length === 0) {
            throw error(400, 'No se han proporcionado rutas de imágenes para eliminar.');
        }
        
        // Normalizar a rutas relativas sin la URL pública
        pathsToDelete = pathsToDelete.map(p => p.replace(GCS_PUBLIC_URL, ''));

        let deletedCount = 0;
        
        await dbApi.removeImagesFromOrder(pathsToDelete);

        for (const imgPath of pathsToDelete) {
            const gcsPath = imgPath.replace(/^\//, ''); // Quita el '/' inicial
            
            if (!gcsPath.startsWith('images/')) {
                 console.warn('Intento de borrar archivo no permitido:', gcsPath);
                 continue;
            }

            try {
                await bucket.file(gcsPath).delete({ ignoreNotFound: true });
                deletedCount++;
            } catch (err: any) {
                console.error(`Error borrando ${gcsPath}:`, err);
            }
        }

        return json({ success: true, message: `${deletedCount} imagen(es) eliminada(s) con éxito.` });
    } catch (e: any) {
        console.error("Error al borrar el archivo:", e);
        return json({ success: false, error: e.message || 'Ocurrió un error desconocido.' }, { status: 500 });
    }
};
