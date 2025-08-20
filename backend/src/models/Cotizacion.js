// Modelo Cotizacion usando better-sqlite3
const Database = require('better-sqlite3');
const db = new Database('data.db');

// Crear tabla si no existe
db.exec(`CREATE TABLE IF NOT EXISTS cotizaciones (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  proyectoId INTEGER,
  insumoId INTEGER,
  partidaId TEXT,
  proveedorId INTEGER,
  nombreMaterial TEXT NOT NULL,
  unidad TEXT NOT NULL,
  cantidad REAL NOT NULL,
  precioUnitario REAL NOT NULL,
  fechaCotizacion TEXT DEFAULT (datetime('now')),
  validezOferta TEXT,
  estado TEXT DEFAULT 'Pendiente',
  detalles TEXT,
  observaciones TEXT,
  creadoPor INTEGER,
  creadoEn TEXT DEFAULT (datetime('now')),
  actualizadoEn TEXT DEFAULT (datetime('now'))
)`);

module.exports = {
  create: (data) => {
    const stmt = db.prepare(`INSERT INTO cotizaciones (proyectoId, insumoId, partidaId, proveedorId, nombreMaterial, unidad, cantidad, precioUnitario, validezOferta, estado, detalles, observaciones, creadoPor) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    return stmt.run(data.proyectoId, data.insumoId, data.partidaId, data.proveedorId, data.nombreMaterial, data.unidad, data.cantidad, data.precioUnitario, data.validezOferta, data.estado || 'Pendiente', data.detalles, data.observaciones, data.creadoPor);
  },
  findAll: () => {
    const stmt = db.prepare(`SELECT *, cantidad * precioUnitario AS precioTotal FROM cotizaciones`);
    return stmt.all();
  },
  findById: (id) => {
    const stmt = db.prepare(`SELECT *, cantidad * precioUnitario AS precioTotal FROM cotizaciones WHERE id = ?`);
    return stmt.get(id);
  },
  // Agrega más métodos según necesidad
};
