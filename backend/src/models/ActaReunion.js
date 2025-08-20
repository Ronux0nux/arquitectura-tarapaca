// Modelo ActaReunion usando better-sqlite3
const Database = require('better-sqlite3');
const db = new Database('data.db');

// Crear tabla si no existe
db.exec(`CREATE TABLE IF NOT EXISTS actas_reunion (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  proyectoId INTEGER NOT NULL,
  entidad TEXT NOT NULL,
  fecha TEXT NOT NULL,
  lugar TEXT NOT NULL,
  horaInicio TEXT NOT NULL,
  horaTermino TEXT NOT NULL,
  objetivoReunion TEXT NOT NULL,
  temasTratados TEXT NOT NULL,
  acuerdos TEXT NOT NULL,
  asistencia TEXT,
  creadoPor INTEGER NOT NULL,
  fechaCreacion TEXT DEFAULT (datetime('now'))
)`);

module.exports = {
  update: (id, data) => {
    const stmt = db.prepare(`UPDATE actas_reunion SET entidad = ?, fecha = ?, lugar = ?, horaInicio = ?, horaTermino = ?, objetivoReunion = ?, temasTratados = ?, acuerdos = ?, asistencia = ?, creadoPor = ? WHERE id = ?`);
    stmt.run(
      data.entidad,
      data.fecha,
      data.lugar,
      data.horaInicio,
      data.horaTermino,
      data.objetivoReunion,
      data.temasTratados,
      data.acuerdos,
      JSON.stringify(data.asistencia || []),
      data.creadoPor,
      id
    );
    return module.exports.findById(id);
  },
  db,
  create: (data) => {
    const stmt = db.prepare(`INSERT INTO actas_reunion (proyectoId, entidad, fecha, lugar, horaInicio, horaTermino, objetivoReunion, temasTratados, acuerdos, asistencia, creadoPor) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    return stmt.run(data.proyectoId, data.entidad, data.fecha, data.lugar, data.horaInicio, data.horaTermino, data.objetivoReunion, data.temasTratados, data.acuerdos, JSON.stringify(data.asistencia || []), data.creadoPor);
  },
  findAll: () => {
    const stmt = db.prepare(`SELECT * FROM actas_reunion`);
    return stmt.all().map(a => ({ ...a, asistencia: JSON.parse(a.asistencia || '[]') }));
  },
  findById: (id) => {
    const stmt = db.prepare(`SELECT * FROM actas_reunion WHERE id = ?`);
    const a = stmt.get(id);
    if (!a) return null;
    a.asistencia = JSON.parse(a.asistencia || '[]');
    return a;
  },
  findByProject: (proyectoId) => {
    const stmt = db.prepare(`SELECT * FROM actas_reunion WHERE proyectoId = ?`);
    return stmt.all(proyectoId).map(a => ({ ...a, asistencia: JSON.parse(a.asistencia || '[]') }));
  },
  update: (id, data) => {
    const stmt = db.prepare(`UPDATE actas_reunion SET entidad = ?, fecha = ?, lugar = ?, horaInicio = ?, horaTermino = ?, objetivoReunion = ?, temasTratados = ?, acuerdos = ?, asistencia = ?, creadoPor = ? WHERE id = ?`);
    stmt.run(data.entidad, data.fecha, data.lugar, data.horaInicio, data.horaTermino, data.objetivoReunion, data.temasTratados, data.acuerdos, JSON.stringify(data.asistencia || []), data.creadoPor, id);
    return module.exports.findById(id);
  },
  delete: (id) => {
    const stmt = db.prepare(`DELETE FROM actas_reunion WHERE id = ?`);
    stmt.run(id);
  }
};
