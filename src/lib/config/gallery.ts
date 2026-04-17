// src/lib/config/gallery.ts
export interface ThreeSixtySpin {
  id: string;
  title: string;
  frames: number;
  extension: string;
  path: string;
  prefix: string;
}

export interface Category {
  id: string;
  title: string;
}

export interface GalleryConfig {
  categories: Category[];
  threeSixtySpins: ThreeSixtySpin[];
}

export const galleryConfig: GalleryConfig = {
  categories: [
    // El 'id' tiene que ser igual al nombre de la carpeta en /static
    { id: 'producto', title: 'Producto' }, 
    { id: 'industria', title: 'Industria' },
    { id: 'retratos', title: 'Retratos' },
    { id: 'personales', title: 'Personales' }
  ],
  threeSixtySpins: [
    { id: 'anteojos', title: 'Anteojos', frames: 30, extension: 'webp', path: '/360/anteojos/', prefix: 'img_0_0_' },
    { id: 'avion', title: 'Avión', frames: 30, extension: 'webp', path: '/360/avion/', prefix: 'img_0_0_' },
    { id: 'bolso', title: 'Bolso', frames: 29, extension: 'webp', path: '/360/bolso/', prefix: 'img_0_0_' },
    { id: 'bota', title: 'Bota de Seguridad', frames: 29, extension: 'webp', path: '/360/bota/', prefix: 'img_0_0_' },
    { id: 'casco', title: 'Casco', frames: 29, extension: 'webp', path: '/360/casco/', prefix: 'img_0_0_' },
    { id: 'crema', title: 'Crema', frames: 30, extension: 'webp', path: '/360/crema/', prefix: 'img_0_0_' },
    { id: 'guante', title: 'Guante de Protección', frames: 29, extension: 'webp', path: '/360/guante/', prefix: 'img_0_0_' },
    { id: 'navaja', title: 'Navaja', frames: 29, extension: 'webp', path: '/360/navaja/', prefix: 'img_0_0_' },
    { id: 'reel', title: 'Reel de Pesca', frames: 30, extension: 'webp', path: '/360/reel/', prefix: 'img_0_0_' },
    { id: 'vaso', title: 'Vaso Térmico', frames: 29, extension: 'webp', path: '/360/vaso/', prefix: 'img_0_0_' },
    { id: 'zapatilla', title: 'Zapatilla Deportiva', frames: 28, extension: 'webp', path: '/360/zapatilla/', prefix: 'img_0_0_' }
  ]
};