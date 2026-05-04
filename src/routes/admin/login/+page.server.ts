import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { dbApi } from '$lib/lowdb';

declare const Bun: any;

// Almacén en memoria para limitar los intentos de inicio de sesión por IP (Rate Limiting)
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>();
const MAX_ATTEMPTS = 5; // Máximo de intentos permitidos
const LOCKOUT_TIME_MS = 15 * 60 * 1000; // 15 minutos de bloqueo

// 1. Evitamos que alguien que ya inició sesión pueda volver a ver el login
export const load: PageServerLoad = async ({ locals }) => {
	if (locals.user) {
		throw redirect(302, '/admin');
	}
	return {};
};

// 2. Lógica backend que procesa el formulario
export const actions: Actions = {
	login: async ({ request, cookies, getClientAddress }) => {
		let ip = 'unknown';
		try {
			ip = getClientAddress();
		} catch (e) {
			// Si probamos en localhost sin pasar por el proxy (Cloudflare), la cabecera CF-Connecting-IP no existirá y SvelteKit arrojará error
			ip = '127.0.0.1';
		}
		const now = Date.now();
		const attempt = loginAttempts.get(ip);

		// Verificamos si la IP está bloqueada por demasiados intentos
		if (attempt) {
			if (attempt.count >= MAX_ATTEMPTS) {
				if (now - attempt.lastAttempt < LOCKOUT_TIME_MS) {
					const minutesLeft = Math.ceil((LOCKOUT_TIME_MS - (now - attempt.lastAttempt)) / 60000);
					return fail(429, { error: `Demasiados intentos fallidos. Inténtalo de nuevo en ${minutesLeft} minutos.` });
				} else {
					// Resetear intentos si ya pasó el tiempo de bloqueo
					loginAttempts.delete(ip);
				}
			}
		}

		const data = await request.formData();
		const usuario = data.get('usuario');
		const password = data.get('password');

		// Función auxiliar para registrar intento fallido y aplicar demora (Timing Attacks mitigation)
		const recordFailedAttempt = async () => {
			const currentAttempt = loginAttempts.get(ip) || { count: 0, lastAttempt: now };
			loginAttempts.set(ip, { count: currentAttempt.count + 1, lastAttempt: Date.now() });
			await new Promise((resolve) => setTimeout(resolve, Math.random() * 300 + 100));
		};

		// Validación básica
		if (typeof usuario !== 'string' || typeof password !== 'string' || !usuario || !password) {
			await recordFailedAttempt();
			return fail(400, { error: 'Credenciales inválidas.' });
		}

		const user = await dbApi.getUserByUsername(usuario.trim());

		// Mitigación de Timing Attacks (ataques de tiempo):
		// Demoramos la respuesta aleatoriamente si el usuario no existe
		if (!user) {
			await recordFailedAttempt();
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
			await recordFailedAttempt();
			return fail(400, { error: 'Credenciales inválidas.' });
		}

		// Login exitoso: limpiamos los intentos fallidos para esta IP
		loginAttempts.delete(ip);

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
			secure: true, // <-- En producción, al usar HTTPS con Cloudflare, debe ser true
			maxAge: 60 * 60 * 24 * 7 // 7 días
		});

		// Redirigir al panel de administración
		throw redirect(302, '/admin');
	}
};