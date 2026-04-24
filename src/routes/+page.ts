import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch }) => {
	try {
		// Pedimos específicamente las imágenes del slider que ahora vienen de la base de datos
		const res = await fetch('/api/images?folder=inicio');
		if (!res.ok) return { heroImages: [] };

		const { images } = await res.json();
		return { heroImages: images };
	} catch (error) {
		return { heroImages: [] };
	}
};