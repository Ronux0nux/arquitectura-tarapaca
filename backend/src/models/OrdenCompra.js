// Modelo OrdenCompra usando PostgreSQL
const pool = require('../db');

module.exports = {
  create: async (data) => {
    const montoNeto = (data.montoBruto || 0) - (data.descuento || 0) + (data.impuestos || 0);
    const res = await pool.query(
      `INSERT INTO ordenes_compra (proyectoId, cotizacionId, numeroOrden, comprador, proveedor, proveedorId, estado, moneda, conversionRate, montoBruto, descuento, impuestos, montoNeto, tipoOrden, fechaEntregaEstimada, fechaEntregaReal, observaciones, condicionesPago, creadoPor)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
      RETURNING *`,
      [data.proyectoId, data.cotizacionId, data.numeroOrden, data.comprador, data.proveedor, data.proveedorId, data.estado || 'Pendiente', data.moneda || 'CLP', data.conversionRate || 1, data.montoBruto, data.descuento || 0, data.impuestos || 0, montoNeto, data.tipoOrden || 'Materiales', data.fechaEntregaEstimada, data.fechaEntregaReal, data.observaciones, data.condicionesPago, data.creadoPor]
    );
    return res.rows[0];
  },
  findAll: async () => {
    const res = await pool.query('SELECT * FROM ordenes_compra');
    return res.rows;
  },
  findById: async (id) => {
    const res = await pool.query('SELECT * FROM ordenes_compra WHERE id = $1', [id]);
    return res.rows[0] || null;
  },
  update: async (id, data) => {
    await pool.query(
      `UPDATE ordenes_compra SET proyectoId = $1, cotizacionId = $2, numeroOrden = $3, comprador = $4, proveedor = $5, proveedorId = $6, estado = $7, moneda = $8, conversionRate = $9, montoBruto = $10, descuento = $11, impuestos = $12, montoNeto = $13, tipoOrden = $14, fechaEntregaEstimada = $15, fechaEntregaReal = $16, observaciones = $17, condicionesPago = $18, creadoPor = $19, actualizadoEn = (NOW())
      WHERE id = $20`,
      [data.proyectoId, data.cotizacionId, data.numeroOrden, data.comprador, data.proveedor, data.proveedorId, data.estado, data.moneda, data.conversionRate, data.montoBruto, data.descuento, data.impuestos, montoNeto, data.tipoOrden, data.fechaEntregaEstimada, data.fechaEntregaReal, data.observaciones, data.condicionesPago, data.creadoPor, id]
    );
    return await module.exports.findById(id);
  },
  delete: async (id) => {
    await pool.query('DELETE FROM ordenes_compra WHERE id = $1', [id]);
  },
};
