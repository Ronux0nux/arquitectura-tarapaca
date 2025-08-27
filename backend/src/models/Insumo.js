const pool = require('../db');

module.exports = {
  create: async (data) => {
    const res = await pool.query(
      'INSERT INTO insumos (nombre, unidad, precioactual, precioreferencia, proveedorid) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [data.nombre, data.unidad, data.precioActual, data.precioReferencia, data.proveedorId]
    );
    return res.rows[0];
  },
  findAll: async () => {
    const res = await pool.query('SELECT * FROM insumos');
    return res.rows;
  },
  findById: async (id) => {
    const res = await pool.query('SELECT * FROM insumos WHERE id = $1', [id]);
    return res.rows[0] || null;
  },
  update: async (id, data) => {
    await pool.query(
      'UPDATE insumos SET nombre = $1, unidad = $2, precioactual = $3, precioreferencia = $4, proveedorid = $5 WHERE id = $6',
      [data.nombre, data.unidad, data.precioActual, data.precioReferencia, data.proveedorId, id]
    );
    return await module.exports.findById(id);
  },
  delete: async (id) => {
    await pool.query('DELETE FROM insumos WHERE id = $1', [id]);
  },
};
