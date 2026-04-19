import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { dbApi } from '$lib/lowdb';

// Endpoint de logout seguro
export const POST: RequestHandler = async ({ locals, cookies }) => {
	// 1. Invalidar la sesión en la base de datos para que no pueda ser reusada
	if (locals.session) {
		await dbApi.deleteSession(locals.session.id);
	}

	// 2. Eliminar la cookie fuertemente
	cookies.delete('admin_session', { path: '/' });
	locals.user = null;
	locals.session = null;

	throw redirect(302, '/admin/login');
};