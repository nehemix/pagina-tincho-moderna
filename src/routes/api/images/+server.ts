import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import fs from 'fs/promises';
import path from 'path';
import { dbApi } from '$lib/lowdb';

// Las imágenes se guardarán en la carpeta `static/images`
const UPLOAD_DIR = 'static/images';

// Función para obtener todos los archivos de un directorio de forma recursiva
async function getFiles(dir: string): Promise<string[]> {
    try {
        const dirents = await fs.readdir(dir, { withFileTypes: true });
        const files = await Promise.all(
            dirents.map((dirent) => {
                const res = path.resolve(dir, dirent.name);
                return dirent.isDirectory() ? getFiles(res) : res;
            })
        );
        return Array.prototype.concat(...files);
    } catch (e: any) {
        // Si el directorio no existe, lo creamos y devolvemos un array vacío.
        if (e.code === 'ENOENT') {
            await fs.mkdir(dir, { recursive: true });
            return [];
        }
        throw e;
    }
}

// GET /api/images -> Devuelve una lista de todas las imágenes
export const GET: RequestHandler = async ({ url, setHeaders }) => {
    // Implementamos stale-while-revalidate para caché avanzado: sirve al instante, actualiza de fondo
    setHeaders({
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400'
    });

    try {
        const baseDir = path.resolve(UPLOAD_DIR);
        await fs.mkdir(baseDir, { recursive: true }); // Asegura que el directorio base exista

        const folderFilter = url.searchParams.get('folder')?.toLowerCase();
        const limitParam = url.searchParams.get('limit');
        const pageParam = url.searchParams.get('page');
        const limit = limitParam ? parseInt(limitParam, 10) : 0;
        const page = pageParam ? parseInt(pageParam, 10) : 1;
        
        // Escaneo selectivo: Solo leer el directorio solicitado en lugar de escanear todo el disco
        let searchDir = baseDir;
        if (folderFilter) {
            const safeFolder = path.normalize(folderFilter).replace(/^(\.\.[\/\\])+/, '');
            searchDir = path.join(baseDir, safeFolder);
        }

        let allFiles: string[] = [];
        try {
            allFiles = await getFiles(searchDir);
        } catch (err) {
            allFiles = []; // Si la carpeta solicitada no existe, no rompemos la app
        }

        // Filtra por extensiones de imagen y formatea las rutas para la web
        let images = allFiles
            .filter(file => /\.(jpg|jpeg|png|webp|gif|avif|svg)$/i.test(file))
            .map(file => path.relative(path.resolve('static'), file).replace(/\\/g, '/'))
            .map(file => `/${file}`); // Asegura que la ruta empiece con '/'

        if (folderFilter) {
            images = images.filter(img => img.toLowerCase().includes(`/${folderFilter}/`));
        }

        // Obtener orden desde lowdb
        const order = await dbApi.getImageOrder();
        
        if (order.length > 0) {
            images.sort((a, b) => {
                const indexA = order.indexOf(a);
                const indexB = order.indexOf(b);
                if (indexA === -1 && indexB === -1) return a.localeCompare(b);
                if (indexA === -1) return 1; // Elementos nuevos van al final
                if (indexB === -1) return -1;
                return indexA - indexB;
            });
        }

        const total = images.length;

        // Aplicar paginación real a nivel backend para no saturar la red con JSONs inmensos
        if (limit > 0) {
            const startIndex = (page - 1) * limit;
            images = images.slice(startIndex, startIndex + limit);
        }

        return json({ success: true, images, total, page, limit });
    } catch (e: any) {
        console.error("Error al leer el directorio de imágenes:", e);
        return json({ success: false, error: 'No se pudo leer el directorio de imágenes.' }, { status: 500 });
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
        
        // Medida de seguridad para evitar que se escriba fuera del directorio de imágenes
        const safeBaseFolder = baseFolder ? path.normalize(baseFolder).replace(/^(\.\.[\/\\])+/, '') : '';

        for (const upload of validUploads) {
            const fullRelativePath = path.join(safeBaseFolder, upload.relativePath);
            const safeRelativePath = path.normalize(fullRelativePath).replace(/^(\.\.[\/\\])+/, '');
            const finalPath = path.join(UPLOAD_DIR, safeRelativePath);

            // Asegura que todo el árbol de directorios destino exista
            await fs.mkdir(path.dirname(finalPath), { recursive: true });

            const buffer = Buffer.from(await upload.file.arrayBuffer());
            await fs.writeFile(finalPath, buffer);
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

        // Limpieza de rutas para evitar subida fuera del directorio
        const safeOldFolder = path.normalize(oldFolder).replace(/^(\.\.[\/\\])+/, '');
        const safeNewFolder = path.normalize(newFolder).replace(/^(\.\.[\/\\])+/, '');
        
        const oldPath = path.join(UPLOAD_DIR, safeOldFolder);
        const newPath = path.join(UPLOAD_DIR, safeNewFolder);

        // Renombramos la ruta base en lowdb para las imágenes afectadas
        const oldDbPattern = `/${safeOldFolder}/`;
        const newDbPattern = `/${safeNewFolder}/`;
        await dbApi.renameImageFolderInOrder(oldDbPattern, newDbPattern);

        await fs.rename(oldPath, newPath);
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
            
            // Actualizar arreglo de orden en lowdb
            await dbApi.updateImageOrder(body.order);
            
            return json({ success: true, message: 'Orden guardado con éxito.' });
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
            const safeFolderPath = path.normalize(body.folderPath).replace(/^(\.\.[\/\\])+/, '');
            const dirPath = path.join('static', 'images', safeFolderPath);
            
            // Eliminar registros afectados en lowdb
            await dbApi.removeFolderFromOrder(`/${safeFolderPath}/`);
            
            await fs.rm(dirPath, { recursive: true, force: true });
            return json({ success: true, message: `Carpeta "${safeFolderPath}" y su contenido eliminados.` });
        }

        // Acepta un array de rutas o una sola ruta (para compatibilidad)
        const pathsToDelete: string[] = body.imagePaths || (body.imagePath ? [body.imagePath] : []);

        if (pathsToDelete.length === 0) {
            throw error(400, 'No se han proporcionado rutas de imágenes para eliminar.');
        }

        let deletedCount = 0;
        
        // Eliminar metadata de lowdb
        await dbApi.removeImagesFromOrder(pathsToDelete);

        for (const imgPath of pathsToDelete) {
            // Medida de seguridad para evitar que se borren archivos fuera de `static`
            const filePath = path.join('static', imgPath);
            const safePath = path.normalize(filePath);
            
            if (!safePath.startsWith('static' + path.sep)) {
                 console.warn('Intento de borrar archivo no permitido:', safePath);
                 continue;
            }

            try {
                await fs.unlink(safePath);
                deletedCount++;
            } catch (err: any) {
                if (err.code !== 'ENOENT') throw err; // Si el error no es "no existe", lo lanzamos
            }
        }

        return json({ success: true, message: `${deletedCount} imagen(es) eliminada(s) con éxito.` });
    } catch (e: any) {
        console.error("Error al borrar el archivo:", e);
        return json({ success: false, error: e.message || 'Ocurrió un error desconocido.' }, { status: 500 });
    }
};
