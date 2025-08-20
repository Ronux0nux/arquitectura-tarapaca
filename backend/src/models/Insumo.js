// Modelo Insumo usando better-sqlite3
const Database = require('better-sqlite3');
const db = new Database('data.db');

// Crear tabla si no existe
db.exec(`CREATE TABLE IF NOT EXISTS insumos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL,
  unidad TEXT,
  precioActual REAL,
  precioReferencia REAL,
  proveedorId INTEGER
)`);

module.exports = {
  create: (data) => {
    const stmt = db.prepare(`INSERT INTO insumos (nombre, unidad, precioActual, precioReferencia, proveedorId) VALUES (?, ?, ?, ?, ?)`);
    return stmt.run(data.nombre, data.unidad, data.precioActual, data.precioReferencia, data.proveedorId);
  },
  findAll: () => {
    const stmt = db.prepare(`SELECT * FROM insumos`);
    return stmt.all();
  },
  findById: (id) => {
    const stmt = db.prepare(`SELECT * FROM insumos WHERE id = ?`);
    return stmt.get(id);
  },
  // Agrega más métodos según necesidad
};
