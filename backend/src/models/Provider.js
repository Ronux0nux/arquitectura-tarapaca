// models/Provider.js

// Modelo Provider usando better-sqlite3
const Database = require('better-sqlite3');
const db = new Database('data.db');

// Crear tabla si no existe
db.exec(`CREATE TABLE IF NOT EXISTS providers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL,
  rut TEXT,
  direccion TEXT,
  telefono TEXT,
  email TEXT,
  sitioWeb TEXT,
  rubros TEXT,
  fechaRegistro TEXT DEFAULT (datetime('now'))
)`);

module.exports = {
  create: (data) => {
    const stmt = db.prepare(`INSERT INTO providers (nombre, rut, direccion, telefono, email, sitioWeb, rubros) VALUES (?, ?, ?, ?, ?, ?, ?)`);
    return stmt.run(data.nombre, data.rut, data.direccion, data.telefono, data.email, data.sitioWeb, JSON.stringify(data.rubros || []));
  },
  findAll: () => {
    const stmt = db.prepare(`SELECT * FROM providers`);
    return stmt.all().map(p => ({ ...p, rubros: JSON.parse(p.rubros || '[]') }));
  },
  findById: (id) => {
    const stmt = db.prepare(`SELECT * FROM providers WHERE id = ?`);
    const p = stmt.get(id);
    if (!p) return null;
    p.rubros = JSON.parse(p.rubros || '[]');
    return p;
  },
  // Agrega más métodos según necesidad
};
