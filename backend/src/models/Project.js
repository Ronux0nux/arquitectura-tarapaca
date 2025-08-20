// Modelo Project usando better-sqlite3
const Database = require('better-sqlite3');
const db = new Database('data.db');

// Crear tabla si no existe
db.exec(`CREATE TABLE IF NOT EXISTS projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL,
  codigo TEXT NOT NULL UNIQUE,
  estado TEXT DEFAULT 'Planificación',
  fechaInicio TEXT NOT NULL,
  fechaTermino TEXT NOT NULL,
  subencargado INTEGER,
  equipo TEXT,
  ubicacion TEXT,
  descripcion TEXT,
  archivoCotizacion TEXT,
  creadoEn TEXT DEFAULT (datetime('now'))
)`);

module.exports = {
  update: (id, data) => {
    const stmt = db.prepare(`UPDATE projects SET nombre = ?, codigo = ?, estado = ?, fechaInicio = ?, fechaTermino = ?, subencargado = ?, equipo = ?, ubicacion = ?, descripcion = ?, archivoCotizacion = ? WHERE id = ?`);
    return stmt.run(
      data.nombre,
      data.codigo,
      data.estado || 'Planificación',
      data.fechaInicio,
      data.fechaTermino,
      data.subencargado,
      JSON.stringify(data.equipo || []),
      data.ubicacion,
      data.descripcion,
      data.archivoCotizacion,
      id
    );
  },
  create: (data) => {
    const stmt = db.prepare(`INSERT INTO projects (nombre, codigo, estado, fechaInicio, fechaTermino, subencargado, equipo, ubicacion, descripcion, archivoCotizacion) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    return stmt.run(data.nombre, data.codigo, data.estado || 'Planificación', data.fechaInicio, data.fechaTermino, data.subencargado, JSON.stringify(data.equipo || []), data.ubicacion, data.descripcion, data.archivoCotizacion);
  },
  findAll: () => {
    const stmt = db.prepare(`SELECT * FROM projects`);
    return stmt.all().map(p => ({ ...p, equipo: JSON.parse(p.equipo || '[]') }));
  },
  findById: (id) => {
    const stmt = db.prepare(`SELECT * FROM projects WHERE id = ?`);
    const p = stmt.get(id);
    if (!p) return null;
    p.equipo = JSON.parse(p.equipo || '[]');
    return p;
  },
  // Agrega más métodos según necesidad
};
