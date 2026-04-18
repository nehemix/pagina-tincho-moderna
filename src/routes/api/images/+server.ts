import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import fs from 'fs/promises';
import path from 'path';

// Las imágenes se guardarán en la carpeta `static/images`
const UPLOAD_DIR = 'static/images';
const ORDER_FILE = 'data/image-order.json';

async function getOrderData(): Promise<string[]> {
    try {
        await fs.mkdir(path.dirname(ORDER_FILE), { recursive: true });
        const content = await fs.readFile(ORDER_FILE, 'utf-8');
        return JSON.parse(content);
    } catch (e: any) {
        return [];
    }
}

async function saveOrderData(order: string[]) {
    await fs.mkdir(path.dirname(ORDER_FILE), { recursive: true });
    await fs.writeFile(ORDER_FILE, JSON.stringify(order, null, 2));
}

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
export const GET: RequestHandler = async () => {
    try {
        const baseDir = path.resolve(UPLOAD_DIR);
        await fs.mkdir(baseDir, { recursive: true }); // Asegura que el directorio base exista

        const allFiles = await getFiles(baseDir);
        
        // Filtra por extensiones de imagen y formatea las rutas para la web
        const images = allFiles
            .filter(file => /\.(jpg|jpeg|png|webp|gif|avif|svg)$/i.test(file))
            .map(file => path.relative(path.resolve('static'), file).replace(/\\/g, '/'))
            .map(file => `/${file}`); // Asegura que la ruta empiece con '/'

        const order = await getOrderData();
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

        return json({ success: true, images });
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
            if (files[i].size > 0) {
                validUploads.push({
                    file: files[i],
                    relativePath: (paths && paths[i]) ? paths[i] : files[i].name
                });
            }
        }

        if (validUploads.length === 0) {
            return json({ success: false, error: 'No se han subido archivos válidos.' }, { status: 400 });
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
            await saveOrderData(body.order);
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
            await fs.rm(dirPath, { recursive: true, force: true });
            return json({ success: true, message: `Carpeta "${safeFolderPath}" y su contenido eliminados.` });
        }

        // Acepta un array de rutas o una sola ruta (para compatibilidad)
        const pathsToDelete: string[] = body.imagePaths || (body.imagePath ? [body.imagePath] : []);

        if (pathsToDelete.length === 0) {
            throw error(400, 'No se han proporcionado rutas de imágenes para eliminar.');
        }

        let deletedCount = 0;
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
