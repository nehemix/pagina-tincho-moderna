import fs from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';

declare const Bun: any;

async function createAdmin() {
	const args = process.argv.slice(2);
	
	const username = process.env.ADMIN_USER || args[0];
	const password = process.env.ADMIN_PASSWORD || args[1];

	if (!username || !password) {
		console.error('❌ Error: Faltan credenciales.');
		console.error('👉 Uso seguro: ADMIN_USER=usuario ADMIN_PASSWORD=clave bun run create-admin.ts');
		console.error('👉 Uso CLI: bun run create-admin.ts <usuario> <contraseña>');
		process.exit(1);
	}


	console.log('Hasheando contraseña...');
	const passwordHash = await Bun.password.hash(password);

	const user = {
		id: randomUUID(),
		username,
		passwordHash,
	};

	// Ruta directa a la base de datos para evitar problemas de importación y caché
	const dbPath = path.resolve('data', 'db.json');

	try {
		// Leemos la base de datos actual directamente
		const fileData = await fs.readFile(dbPath, 'utf-8');
		// Si el archivo está vacío, inicializamos la estructura completa por defecto
		const db = fileData.trim() ? JSON.parse(fileData) : { videos: [], imageOrder: [], folderOrder: [], sliderImages: [], users: [], sessions: [] };

		// Por si la base de datos es antigua y aún no tiene el array de users
		if (!db.users) db.users = [];

		const existingUser = db.users.find((u: any) => u.username === username);
		
		if (!existingUser) {
			db.users.push(user);
			await fs.writeFile(dbPath, JSON.stringify(db, null, 2));
			console.log(`✅ Usuario administrador (${username}) creado con éxito.`);
		} else {
			console.log(`⚠️ El usuario ${username} ya existe en la base de datos.`);
		}
	} catch (err: any) {
		// Si el archivo db.json aún no existe, lo creamos desde cero
		if (err.code === 'ENOENT') {
			await fs.mkdir(path.resolve('data'), { recursive: true });
			const newDb = { videos: [], imageOrder: [], folderOrder: [], sliderImages: [], users: [user], sessions: [] };
			await fs.writeFile(dbPath, JSON.stringify(newDb, null, 2));
			console.log(`✅ Base de datos inicializada y usuario (${username}) creado con éxito.`);
		} else {
			console.error('Error inesperado:', err);
		}
	}
}

createAdmin().catch(console.error);