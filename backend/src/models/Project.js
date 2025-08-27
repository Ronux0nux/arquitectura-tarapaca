// Modelo Project usando PostgreSQL
const pool = require('../db');

module.exports = {
  create: async (data) => {
    const res = await pool.query(
      'INSERT INTO projects (nombre, codigo, estado, fechaInicio, fechaTermino, subencargado, equipo, ubicacion, descripcion, archivoCotizacion) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *',
      [data.nombre, data.codigo, data.estado || 'Planificación', data.fechaInicio, data.fechaTermino, data.subencargado, JSON.stringify(data.equipo || []), data.ubicacion, data.descripcion, data.archivoCotizacion]
    );
    return res.rows[0];
  },
  findAll: async () => {
    const res = await pool.query('SELECT * FROM projects');
    return res.rows.map(p => ({ ...p, equipo: JSON.parse(p.equipo || '[]') }));
  },
  findById: async (id) => {
    const res = await pool.query('SELECT * FROM projects WHERE id = $1', [id]);
    const p = res.rows[0];
    if (!p) return null;
    p.equipo = JSON.parse(p.equipo || '[]');
    return p;
  },
  update: async (id, data) => {
    await pool.query(
      'UPDATE projects SET nombre = $1, codigo = $2, estado = $3, fechaInicio = $4, fechaTermino = $5, subencargado = $6, equipo = $7, ubicacion = $8, descripcion = $9, archivoCotizacion = $10 WHERE id = $11',
      [data.nombre, data.codigo, data.estado || 'Planificación', data.fechaInicio, data.fechaTermino, data.subencargado, JSON.stringify(data.equipo || []), data.ubicacion, data.descripcion, data.archivoCotizacion, id]
    );
    return await module.exports.findById(id);
  },
  delete: async (id) => {
    await pool.query('DELETE FROM projects WHERE id = $1', [id]);
  },
};
