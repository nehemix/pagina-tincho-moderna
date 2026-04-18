import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch }) => {
    try {
        const res = await fetch('/api/images');
        if (!res.ok) return { heroImages: [] };
        
        const { images } = await res.json();
        const heroImages = images.filter((img: string) => img.includes('/images/inicio/'));
        return { heroImages };
    } catch (error) {
        return { heroImages: [] };
    }
};