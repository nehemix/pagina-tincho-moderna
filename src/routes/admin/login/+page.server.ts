import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { dbApi } from '$lib/lowdb';

declare const Bun: any;

// 1. Evitamos que alguien que ya inició sesión pueda volver a ver el login
export const load: PageServerLoad = async ({ locals }) => {
	if (locals.user) {
		throw redirect(302, '/admin');
	}
	return {};
};

// 2. Lógica backend que procesa el formulario
export const actions: Actions = {
	login: async ({ request, cookies }) => {
		const data = await request.formData();
		const usuario = data.get('usuario');
		const password = data.get('password');

		// Validación básica
		if (typeof usuario !== 'string' || typeof password !== 'string' || !usuario || !password) {
			return fail(400, { error: 'Credenciales inválidas.' });
		}

		const user = await dbApi.getUserByUsername(usuario.trim());

		// Mitigación de Timing Attacks (ataques de tiempo):
		// Demoramos la respuesta aleatoriamente si el usuario no existe
		if (!user) {
			await new Promise((resolve) => setTimeout(resolve, Math.random() * 300 + 100));
			return fail(400, { error: 'Credenciales inválidas.' });
		}

		// Verificación de resiliencia: Comprobar que la API de Bun está disponible
		if (typeof Bun === 'undefined') {
			console.error("❌ ERROR FATAL DE ENTORNO: SvelteKit se está ejecutando en Node.js en lugar de Bun.");
			console.error("👉 Para solucionar esto, detén el servidor y vuelve a iniciarlo con: bun --bun run dev");
			return fail(500, { error: 'Error interno del servidor. Entorno de ejecución incorrecto.' });
		}

		// Verificar contraseña usando el hash Argon2id (nativo de Bun)
		const isPasswordValid = await Bun.password.verify(password, user.passwordHash);

		if (!isPasswordValid) {
			await new Promise((resolve) => setTimeout(resolve, Math.random() * 300 + 100));
			return fail(400, { error: 'Credenciales inválidas.' });
		}

		// Mantenimiento: limpiar sesiones expiradas y cerrar sesiones previas del usuario
		await dbApi.cleanExpiredSessions();
		await dbApi.deleteUserSessions(user.id);

		// Crear la sesión en lowdb
		const sessionId = crypto.randomUUID();
		await dbApi.addSession({
			id: sessionId,
			userId: user.id,
			expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 7 // 7 días
		});

		// Establecer la cookie blindada
		cookies.set('admin_session', sessionId, {
			path: '/',
			httpOnly: true,
			sameSite: 'strict',
			secure: false, // <-- Forzamos a falso para permitir HTTP temporalmente
			maxAge: 60 * 60 * 24 * 7 // 7 días
		});

		// Redirigir al panel de administración
		throw redirect(302, '/admin');
	}
};