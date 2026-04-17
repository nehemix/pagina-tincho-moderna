import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
	server: {
		watch: {
			// Ignoramos la carpeta de imágenes para que Vite no reinicie
			// el servidor de desarrollo cada vez que subas un archivo.
			ignored: ['**/static/images/**']
		}
	}
});
