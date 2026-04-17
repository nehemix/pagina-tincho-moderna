// src/lib/config/loader.ts

// Le añadimos el parámetro "folder" para que la función nos devuelva las imágenes ya filtradas.
export const autoLoadImages = async (folder?: string, customFetch: typeof fetch = fetch): Promise<string[]> => {
  try {
    const res = await customFetch('/api/images');
    if (!res.ok) throw new Error(`Error de la API: ${res.status}`);
    
    const { images } = await res.json();
    let result = images || [];

    // Si le pasamos un nombre de carpeta, filtramos el array de imágenes
    if (folder) {
        result = result.filter((img: string) => img.toLowerCase().includes(`/${folder.toLowerCase()}/`));
    }
    
    return result;
  } catch (error) {
    console.error("Error cargando imágenes desde la API:", error);
    return [];
  }
};