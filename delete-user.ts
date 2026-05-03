import fs from 'fs/promises';
import path from 'path';

async function deleteUser() {
	const usernameToDelete = 'martin'; // Cambia esto por el nombre de usuario a borrar

	// Ruta directa a la base de datos
	const dbPath = path.resolve('data', 'db.json');

	try {
		const fileData = await fs.readFile(dbPath, 'utf-8');
		const db = JSON.parse(fileData);

		if (!db.users || db.users.length === 0) {
			console.log('⚠️ No hay usuarios en la base de datos.');
			return;
		}

		const initialCount = db.users.length;
		db.users = db.users.filter((u: any) => u.username !== usernameToDelete);

		if (db.users.length < initialCount) {
			await fs.writeFile(dbPath, JSON.stringify(db, null, 2));
			console.log(`✅ Usuario (${usernameToDelete}) eliminado con éxito de la base de datos.`);
		} else {
			console.log(`⚠️ No se encontró ningún usuario con el nombre de usuario: ${usernameToDelete}`);
		}
	} catch (err) {
		console.error('Error inesperado al intentar borrar el usuario:', err);
	}
}

deleteUser().catch(console.error);