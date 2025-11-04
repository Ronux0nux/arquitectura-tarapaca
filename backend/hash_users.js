// Script para convertir contraseñas de usuarios existentes a hash bcrypt y guardarlas en PostgreSQL
// Uso: desde la carpeta `backend` ejecutar: `node hash_users.js`
// Requiere que las variables de entorno para la conexión a PostgreSQL estén disponibles
// (se reutiliza `backend/src/db.js` que carga dotenv).

const pool = require('./src/db');
const bcrypt = require('bcrypt');

const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS, 10) || 10;

async function main() {
	console.log('Iniciando proceso de hash de contraseñas (PostgreSQL)');

	try {
		const res = await pool.query('SELECT id, password FROM users');
		const users = res.rows;
		console.log(`Usuarios leídos: ${users.length}`);

		let changed = 0;
		let skipped = 0;
		let errored = 0;

		for (const u of users) {
			const id = u.id;
			const pwd = u.password || '';

			if (!pwd) {
				console.warn(`Usuario id=${id} tiene contraseña vacía, se omite`);
				skipped++;
				continue;
			}

			// Detectar si ya está en formato bcrypt (empieza con $2a$/$2b$/$2y$)
			if (/^\$2[aby]\$/.test(pwd)) {
				// Ya hasheada
				skipped++;
				continue;
			}

			try {
				const hash = await bcrypt.hash(pwd, SALT_ROUNDS);
				await pool.query('UPDATE users SET password = $1 WHERE id = $2', [hash, id]);
				changed++;
				console.log(`Hasheada contraseña usuario id=${id}`);
			} catch (err) {
				console.error(`Error hasheando/actualizando id=${id}:`, err.message || err);
				errored++;
			}
		}

		console.log('Proceso finalizado. Resumen:');
		console.log(`  Total leídos: ${users.length}`);
		console.log(`  Actualizadas (hasheadas): ${changed}`);
		console.log(`  Omitidas (ya hasheadas o vacías): ${skipped}`);
		console.log(`  Errores: ${errored}`);
	} catch (err) {
		console.error('Error al leer/actualizar usuarios:', err.message || err);
		process.exitCode = 2;
	} finally {
		// Cerrar pool
		try {
			await pool.end();
		} catch (e) {
			// ignore
		}
	}
}

if (require.main === module) {
	main().catch(err => {
		console.error('Error no controlado:', err);
		process.exit(1);
	});
}

