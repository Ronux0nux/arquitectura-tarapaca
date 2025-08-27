// Script para convertir contraseñas de usuarios existentes a hash bcrypt
const Database = require('better-sqlite3');
const bcrypt = require('bcrypt');

const db = new Database('data.db');
const users = db.prepare('SELECT id, password FROM users').all();

for (const user of users) {
  if (user.password && !user.password.startsWith('$2b$')) { // Si no está hasheada
    const hash = bcrypt.hashSync(user.password, 10);
    db.prepare('UPDATE users SET password = ? WHERE id = ?').run(hash, user.id);
    console.log(`Usuario ${user.id} actualizado.`);
  }
}

console.log('✅ Contraseñas convertidas a hash.');
