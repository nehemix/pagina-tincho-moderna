import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

// Middleware de Autenticación: Protege todas las rutas bajo /admin (excepto si lo manejas en el load específico)
export const load: LayoutServerLoad = async ({ locals, url }) => {
	// Permitimos el acceso a la página de login
	if (!locals.user && !url.pathname.startsWith('/admin/login')) {
		throw redirect(302, '/admin/login');
	}

	return { user: locals.user };
};