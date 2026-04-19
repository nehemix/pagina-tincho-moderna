import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { dbApi } from '$lib/lowdb';

export const actions: Actions = {
	default: async ({ cookies }) => {
		const sessionId = cookies.get('admin_session');

		if (sessionId) {
			// 1. Borramos la sesión específica del archivo db.json
			await dbApi.deleteSession(sessionId);
			// 2. Eliminamos la cookie del navegador
			cookies.delete('admin_session', { path: '/' });
		}

		throw redirect(302, '/admin/login');
	}
};