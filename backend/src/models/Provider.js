// models/Provider.js

// Modelo Provider usando PostgreSQL
const pool = require('../db');

module.exports = {
  create: async (data) => {
    const res = await pool.query(
      'INSERT INTO providers (nombre, rut, direccion, telefono, email, sitioweb, rubros) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [data.nombre, data.rut, data.direccion, data.telefono, data.email, data.sitioweb || data.sitioWeb, JSON.stringify(data.rubros || [])]
    );
    return res.rows[0];
  },
  findAll: async () => {
    const res = await pool.query('SELECT * FROM providers');
    return res.rows.map(p => ({ ...p, rubros: JSON.parse(p.rubros || '[]') }));
  },
  findById: async (id) => {
    const res = await pool.query('SELECT * FROM providers WHERE id = $1', [id]);
    const p = res.rows[0];
    if (!p) return null;
    p.rubros = JSON.parse(p.rubros || '[]');
    return p;
  },
  update: async (id, data) => {
    await pool.query(
      'UPDATE providers SET nombre = $1, rut = $2, direccion = $3, telefono = $4, email = $5, sitioweb = $6, rubros = $7 WHERE id = $8',
      [data.nombre, data.rut, data.direccion, data.telefono, data.email, data.sitioweb || data.sitioWeb, JSON.stringify(data.rubros || []), id]
    );
    return await module.exports.findById(id);
  },
  delete: async (id) => {
    await pool.query('DELETE FROM providers WHERE id = $1', [id]);
  },
};
