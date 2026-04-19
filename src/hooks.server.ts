import type { Handle } from '@sveltejs/kit';
import { dbApi } from '$lib/lowdb';

export const handle: Handle = async ({ event, resolve }) => {
	const sessionId = event.cookies.get('admin_session');

	if (!sessionId) {
		event.locals.user = null;
		event.locals.session = null;
		return resolve(event);
	}

	const session = await dbApi.getSession(sessionId);
	let user = null;

	if (session) {
		user = await dbApi.getUserById(session.userId);
	}

	// Verificaciones de Seguridad: ¿Existe la sesión? ¿Existe el usuario? ¿La sesión caducó?
	if (!session || !user || Date.now() >= session.expiresAt) {
		if (session) await dbApi.deleteSession(sessionId); // Limpiamos la BD si caducó
		event.cookies.delete('admin_session', { path: '/' });
		event.locals.user = null;
		event.locals.session = null;
	} else {
		event.locals.session = session;
		event.locals.user = { id: user.id, username: user.username }; // Asignamos sin la contraseña hasheada
	}

	return resolve(event);
};