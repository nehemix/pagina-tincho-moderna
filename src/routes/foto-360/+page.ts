import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch }) => {
    try {
        const res = await fetch('/api/images');
        if (!res.ok) {
            const errorText = await res.text();
            throw new Error(`La respuesta del servidor no fue OK (${res.status}): ${errorText}`);
        }
        const { images } = await res.json();
        
        // Filtramos las imágenes que pertenecen a la carpeta 360
        const threeSixtyImages = images.filter((img: string) => img.includes('/images/360/'));

        // Agrupamos dinámicamente por carpeta (cada carpeta es un "spin")
        const spinsMap = new Map<string, any>();
        threeSixtyImages.forEach((img: string) => {
            const parts = img.split('/');
            parts.pop(); // quitamos el archivo para quedarnos con la ruta de la carpeta
            const folderName = parts[parts.length - 1];
            
            if (folderName === '360') return; // Ignoramos fotos sueltas directamente en la raíz /360/

            if (!spinsMap.has(folderName)) {
                spinsMap.set(folderName, {
                    id: folderName,
                    title: folderName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                    images: []
                });
            }
            spinsMap.get(folderName).images.push(img);
        });

        // Convertimos a array y ordenamos las imágenes naturalmente (para que 'foto2.jpg' vaya antes que 'foto10.jpg')
        const activeSpins = Array.from(spinsMap.values()).map(spin => {
            spin.images.sort((a: string, b: string) => {
                // Solución robusta para Docker:
                // En contenedores (como Alpine Linux), Node.js muchas veces no incluye full-icu (datos de internacionalización).
                // Esto provoca que localeCompare con { numeric: true } falle y ordene las fotos como 1, 10, 2, 3...
                // Para garantizar que la animación 360 no salte ni gire al revés, extraemos el número del frame manualmente.
                const aMatch = a.match(/\d+/g);
                const bMatch = b.match(/\d+/g);
                
                if (aMatch && bMatch) {
                    // Usamos el último número encontrado en la ruta del archivo (ej: frame_12.jpg -> 12)
                    const numA = parseInt(aMatch[aMatch.length - 1], 10);
                    const numB = parseInt(bMatch[bMatch.length - 1], 10);
                    
                    if (numA !== numB) return numA - numB;
                }
                return a.localeCompare(b);
            });
            return spin;
        });

        return { spins: activeSpins };
    } catch (error) {
        console.error("Error cargando imágenes 360:", error);
        return { spins: [], error: "No se pudieron cargar las imágenes 360°." };
    }
};