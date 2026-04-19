import { JSONFilePreset } from 'lowdb/node';
import path from 'path';
import fs from 'fs/promises';

// 1. Definición de Tipos / Schema (Basado en la estructura que tenías con Prisma)
export interface Video {
    id: string;
    url: string;
    createdAt: string;
}

export interface Schema {
    videos: Video[];
    imageOrder: string[];
}

// 2. Valores por defecto si el archivo no existe o está vacío
const defaultData: Schema = {
    videos: [],
    imageOrder: []
};

// 3. Configuración de ruta segura
const DB_DIR = path.resolve('data');
const DB_FILE = path.join(DB_DIR, 'db.json');

let dbInstance: Awaited<ReturnType<typeof JSONFilePreset<Schema>>> | null = null;

// Inicialización Singleton para evitar múltiples lecturas concurrentes del archivo base
export async function getDb() {
    if (!dbInstance) {
        try {
            // Asegurar que el directorio 'data' exista para evitar errores ENOENT
            await fs.mkdir(DB_DIR, { recursive: true });
        } catch (error) {
            console.error('Error creando el directorio de la base de datos:', error);
        }
        dbInstance = await JSONFilePreset<Schema>(DB_FILE, defaultData);
    }
    return dbInstance;
}

// 4. Exportar métodos CRUD unificados y limpios
export const dbApi = {
    // GET: Obtener todos los videos
    getVideos: async (): Promise<Video[]> => {
        const db = await getDb();
        return db.data.videos;
    },

    // ADD: Insertar un nuevo video
    addVideo: async (video: Video): Promise<void> => {
        const db = await getDb();
        // db.update muta y guarda automáticamente previniendo condiciones de carrera
        await db.update(({ videos }) => {
            videos.push(video);
        });
    },

    // UPDATE: Actualizar un registro existente
    updateVideo: async (id: string, updatedData: Partial<Video>): Promise<void> => {
        const db = await getDb();
        await db.update(({ videos }) => {
            const index = videos.findIndex(v => v.id === id);
            if (index !== -1) videos[index] = { ...videos[index], ...updatedData };
        });
    },

    // DELETE: Eliminar un registro
    deleteVideo: async (id: string): Promise<void> => {
        const db = await getDb();
        await db.update((data) => {
            data.videos = data.videos.filter(v => v.id !== id);
        });
    },

    // --- IMÁGENES ---

    // GET: Obtener el orden de las imágenes
    getImageOrder: async (): Promise<string[]> => {
        const db = await getDb();
        return db.data.imageOrder;
    },

    // UPDATE: Reemplazar todo el orden de las imágenes
    updateImageOrder: async (newOrder: string[]): Promise<void> => {
        const db = await getDb();
        await db.update((data) => {
            data.imageOrder = newOrder;
        });
    },

    // UPDATE: Renombrar carpeta en las rutas de las imágenes guardadas
    renameImageFolderInOrder: async (oldPattern: string, newPattern: string): Promise<void> => {
        const db = await getDb();
        await db.update((data) => {
            data.imageOrder = data.imageOrder.map(path => path.replace(oldPattern, newPattern));
        });
    },

    // DELETE: Eliminar imágenes específicas del orden guardado
    removeImagesFromOrder: async (pathsToDelete: string[]): Promise<void> => {
        const db = await getDb();
        await db.update((data) => {
            data.imageOrder = data.imageOrder.filter(path => !pathsToDelete.includes(path));
        });
    },

    // DELETE: Eliminar todas las imágenes de una carpeta del orden guardado
    removeFolderFromOrder: async (folderPattern: string): Promise<void> => {
        const db = await getDb();
        await db.update((data) => {
            data.imageOrder = data.imageOrder.filter(path => !path.includes(folderPattern));
        });
    }
};