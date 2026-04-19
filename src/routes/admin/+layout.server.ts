import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, url }) => {
	// Si intenta acceder a cualquier ruta en /admin (que no sea el login) y no hay sesión, lo expulsamos
	if (!locals.user && !url.pathname.startsWith('/admin/login')) {
		throw redirect(302, '/admin/login');
	}

	return { user: locals.user };
};