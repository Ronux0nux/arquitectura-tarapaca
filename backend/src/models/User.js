// Modelo User usando better-sqlite3
const Database = require('better-sqlite3');
const db = new Database('data.db');

// Crear tabla si no existe
db.exec(`CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  rol TEXT DEFAULT 'usuario',
  password TEXT NOT NULL,
  proyectos TEXT,
  fechaRegistro TEXT DEFAULT (datetime('now'))
)`);

module.exports = {
  create: (data) => {
    const stmt = db.prepare(`INSERT INTO users (nombre, email, rol, password, proyectos) VALUES (?, ?, ?, ?, ?)`);
    return stmt.run(data.nombre, data.email, data.rol || 'usuario', data.password, JSON.stringify(data.proyectos || []));
  },
  findAll: () => {
    const stmt = db.prepare(`SELECT * FROM users`);
    return stmt.all().map(u => ({ ...u, proyectos: JSON.parse(u.proyectos || '[]') }));
  },
  findById: (id) => {
    const stmt = db.prepare(`SELECT * FROM users WHERE id = ?`);
    const u = stmt.get(id);
    if (!u) return null;
    u.proyectos = JSON.parse(u.proyectos || '[]');
    return u;
  },
  // Agrega más métodos según necesidad
};
