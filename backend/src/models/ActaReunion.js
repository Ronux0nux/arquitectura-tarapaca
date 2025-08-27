// Modelo ActaReunion usando PostgreSQL
const pool = require('../db');

module.exports = {
  create: async (data) => {
    const res = await pool.query(
      `INSERT INTO actas_reunion (
        proyectoId, entidad, fecha, lugar, horaInicio, horaTermino, objetivoReunion, temasTratados, acuerdos, asistencia, creadoPor,
        titulo, info_breve, proposito, descripcion, asistentes
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11,
        $12, $13, $14, $15, $16
      ) RETURNING *`,
      [
        data.proyectoId, data.entidad, data.fecha, data.lugar, data.horaInicio, data.horaTermino, data.objetivoReunion, data.temasTratados, data.acuerdos, JSON.stringify(data.asistencia || []), data.creadoPor,
        data.titulo, data.info_breve, data.proposito, data.descripcion, JSON.stringify(data.asistentes || [])
      ]
    );
    return res.rows[0];
  },
  findAll: async () => {
    const res = await pool.query('SELECT * FROM actas_reunion');
    return res.rows.map(a => ({ ...a, asistencia: JSON.parse(a.asistencia || '[]') }));
  },
  findById: async (id) => {
    const res = await pool.query('SELECT * FROM actas_reunion WHERE id = $1', [id]);
    const a = res.rows[0] || null;
    if (a) {
      a.asistencia = JSON.parse(a.asistencia || '[]');
    }
    return a;
  },
  findByProject: async (proyectoId) => {
    const res = await pool.query('SELECT * FROM actas_reunion WHERE proyectoId = $1', [proyectoId]);
    return res.rows.map(a => ({ ...a, asistencia: JSON.parse(a.asistencia || '[]') }));
  },
  update: async (id, data) => {
    await pool.query(
      `UPDATE actas_reunion SET 
        entidad = $1, fecha = $2, lugar = $3, horaInicio = $4, horaTermino = $5, objetivoReunion = $6, temasTratados = $7, acuerdos = $8, asistencia = $9, creadoPor = $10,
        titulo = $11, info_breve = $12, proposito = $13, descripcion = $14, asistentes = $15
        WHERE id = $16`,
      [
        data.entidad, data.fecha, data.lugar, data.horaInicio, data.horaTermino, data.objetivoReunion, data.temasTratados, data.acuerdos, JSON.stringify(data.asistencia || []), data.creadoPor,
        data.titulo, data.info_breve, data.proposito, data.descripcion, JSON.stringify(data.asistentes || []), id
      ]
    );
    return await module.exports.findById(id);
  },
  delete: async (id) => {
    await pool.query('DELETE FROM actas_reunion WHERE id = $1', [id]);
  },
};
