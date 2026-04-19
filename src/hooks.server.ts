import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
    const response = await resolve(event);

    // 1. HTTP Strict Transport Security (HSTS)
    // Fuerza conexiones HTTPS estrictas por 1 año, incluye subdominios y permite registro preload
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');

    // 2. Aislamiento Cross-Origin (COOP, COEP, CORP)
    // Previene ataques de canal lateral (ej. Spectre) aislando el contexto de navegación
    response.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
    response.headers.set('Cross-Origin-Embedder-Policy', 'unsafe-none');
    response.headers.set('Cross-Origin-Resource-Policy', 'same-origin');

    // 3. Prevención de Clickjacking (Compatibilidad legacy)
    // Previene que la página sea embebida en iframes maliciosos. 
    // Se complementa con 'frame-ancestors' en la CSP.
    response.headers.set('X-Frame-Options', 'DENY');

    // 4. Prevención de MIME-type sniffing
    // Evita que el navegador intente adivinar el tipo de contenido y ejecute scripts accidentalmente
    response.headers.set('X-Content-Type-Options', 'nosniff');

    // 5. Referrer Policy
    // Protege la privacidad de la URL evitando enviar la ruta completa a orígenes externos
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

    return response;
};