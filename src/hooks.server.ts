import type { Handle } from '@sveltejs/kit';
import { dbApi } from '$lib/lowdb';

export const handle: Handle = async ({ event, resolve }) => {
	const sessionId = event.cookies.get('admin_session');

	if (!sessionId) {
		event.locals.user = null;
		return resolve(event);
	}

	const session = await dbApi.getSession(sessionId);

	// Si la sesión no existe o ya expiró
	if (!session || session.expiresAt < Date.now()) {
		event.cookies.delete('admin_session', { path: '/' });
		event.locals.user = null;
		return resolve(event);
	}

	const user = await dbApi.getUserById(session.userId);

	if (!user) {
		event.cookies.delete('admin_session', { path: '/' });
		event.locals.user = null;
		return resolve(event);
	}

	// Sesión válida: asignamos el usuario a locals para que toda la app lo conozca
	event.locals.user = { id: user.id, username: user.username };

	return resolve(event);
};