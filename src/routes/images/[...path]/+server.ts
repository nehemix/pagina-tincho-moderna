import { readFile, stat } from 'fs/promises';
import { join } from 'path';
import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

const IMAGES_DIR = join(process.cwd(), 'static/images');

export const GET: RequestHandler = async ({ params }) => {
	const filePath = join(IMAGES_DIR, params.path);

	if (!filePath.startsWith(IMAGES_DIR)) {
		throw error(403, 'Forbidden');
	}

	try {
		const fileStat = await stat(filePath);
		if (!fileStat.isFile()) {
			throw error(404, 'Not found');
		}

		const data = await readFile(filePath);
		const ext = filePath.split('.').pop()?.toLowerCase();
		const contentTypes: Record<string, string> = {
			avif: 'image/avif',
			webp: 'image/webp',
			jpg: 'image/jpeg',
			jpeg: 'image/jpeg',
			png: 'image/png',
			gif: 'image/gif',
			svg: 'image/svg+xml'
		};

		return new Response(data, {
			headers: {
				'Content-Type': contentTypes[ext || ''] || 'application/octet-stream',
				'Cache-Control': 'public, max-age=86400',
				'Content-Length': data.length.toString()
			}
		});
	} catch {
		throw error(404, 'Not found');
	}
};
