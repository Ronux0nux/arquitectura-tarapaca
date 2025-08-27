// Modelo Cotizacion usando PostgreSQL
const pool = require('../db');

module.exports = {
  create: async (data) => {
    const res = await pool.query(
      `INSERT INTO cotizaciones (proyectoId, insumoId, partidaId, proveedorId, nombreMaterial, unidad, cantidad, precioUnitario, validezOferta, estado, detalles, observaciones, creadoPor) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *`,
      [data.proyectoId, data.insumoId, data.partidaId, data.proveedorId, data.nombreMaterial, data.unidad, data.cantidad, data.precioUnitario, data.validezOferta, data.estado || 'Pendiente', data.detalles, data.observaciones, data.creadoPor]
    );
    return res.rows[0];
  },
  findAll: async () => {
    const res = await pool.query('SELECT *, cantidad * precioUnitario AS precioTotal FROM cotizaciones');
    return res.rows;
  },
  findById: async (id) => {
    const res = await pool.query('SELECT *, cantidad * precioUnitario AS precioTotal FROM cotizaciones WHERE id = $1', [id]);
    return res.rows[0] || null;
  },
  update: async (id, data) => {
    await pool.query(
      `UPDATE cotizaciones SET proyectoId = $1, insumoId = $2, partidaId = $3, proveedorId = $4, nombreMaterial = $5, unidad = $6, cantidad = $7, precioUnitario = $8, validezOferta = $9, estado = $10, detalles = $11, observaciones = $12, creadoPor = $13, actualizadoEn = (datetime('now'))
      WHERE id = $14`,
      [data.proyectoId, data.insumoId, data.partidaId, data.proveedorId, data.nombreMaterial, data.unidad, data.cantidad, data.precioUnitario, data.validezOferta, data.estado, data.detalles, data.observaciones, data.creadoPor, id]
    );
    return await module.exports.findById(id);
  },
  delete: async (id) => {
    await pool.query('DELETE FROM cotizaciones WHERE id = $1', [id]);
  },
};
