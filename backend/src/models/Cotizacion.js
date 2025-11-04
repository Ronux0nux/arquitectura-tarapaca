// Modelo Cotizacion usando PostgreSQL
const pool = require('../db');

module.exports = {
  create: async (data) => {
    console.log('🔷 Cotizacion.create() LLAMADO');
    console.log('🔷 Datos recibidos:', data);
    
    const proyectoId = data.proyectoId || data.projects_id;
    const insumoId = data.insumoId || data.insumos_id || null;
    const proveedorId = data.proveedorId || data.providers_id || null;
    const userId = data.userId || data.users_id || 1; // Default a 1 si no viene
    const nombreMaterial = data.nombreMaterial || data.nombre_material;
    const unidad = data.unidad || 'un';
    const cantidad = data.cantidad || 1;
    const precioUnitario = data.precioUnitario || data.precio_unitario || 0;
    const estado = data.estado || 'pendiente';
    const detalles = data.detalles || '';
    const observaciones = data.observaciones || '';
    
    console.log('🔷 Parámetros parsed:');
    console.log('  - proyectoId:', proyectoId);
    console.log('  - nombreMaterial:', nombreMaterial);
    console.log('  - cantidad:', cantidad);
    console.log('  - precioUnitario:', precioUnitario);
    console.log('  - estado:', estado);
    
    if (!proyectoId) {
      throw new Error('proyectoId es requerido en Cotizacion.create()');
    }
    
    if (!nombreMaterial) {
      throw new Error('nombreMaterial es requerido en Cotizacion.create()');
    }
    
    // 🆕 OBTENER SIGUIENTE ID
    const idResult = await pool.query('SELECT nextval(\'cotizaciones_seq\'::regclass) AS next_id');
    const id = idResult.rows[0].next_id;
    
    console.log('🔷 ID Generado:', id);
    
    // 🆕 INCLUIR ID EN EL INSERT
    // Intentamos insertar incluyendo campos de auditoría si están disponibles en la tabla.
    try {
      const res = await pool.query(
        `INSERT INTO cotizaciones (id, projects_id, insumos_id, providers_id, users_id, nombre_material, unidad, cantidad, precio_unitario, estado, detalles, observaciones, created_by, updated_by, created_at, updated_at) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW()) RETURNING *`,
        [id, proyectoId, insumoId, proveedorId, userId, nombreMaterial, unidad, cantidad, precioUnitario, estado, detalles, observaciones, data.created_by || userId, data.updated_by || userId]
      );

      console.log('✅ Cotización insertada en BD (con auditoría):');
      console.log('✅ ID:', res.rows[0].id);
      console.log('✅ ProyectoID:', res.rows[0].projects_id);
      console.log('✅ Fila completa:', res.rows[0]);

      return res.rows[0];
    } catch (err) {
      // Si la tabla no contiene las columnas de auditoría, caemos al INSERT simple
      console.warn('⚠️ Inserción con auditoría falló (fallback):', err.message);
      const res = await pool.query(
        `INSERT INTO cotizaciones (id, projects_id, insumos_id, providers_id, users_id, nombre_material, unidad, cantidad, precio_unitario, estado, detalles, observaciones, created_at, updated_at) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW()) RETURNING *`,
        [id, proyectoId, insumoId, proveedorId, userId, nombreMaterial, unidad, cantidad, precioUnitario, estado, detalles, observaciones]
      );

      console.log('✅ Cotización insertada en BD (sin auditoría):');
      return res.rows[0];
    }
  },
  findAll: async () => {
    const res = await pool.query('SELECT *, cantidad * (precio_unitario::numeric) AS precio_total FROM cotizaciones ORDER BY created_at DESC');
    return res.rows;
  },
  findById: async (id) => {
    const res = await pool.query('SELECT *, cantidad * (precio_unitario::numeric) AS precio_total FROM cotizaciones WHERE id = $1', [id]);
    return res.rows[0] || null;
  },
  findByProject: async (proyectoId) => {
    const res = await pool.query(
      'SELECT *, cantidad * (precio_unitario::numeric) AS precio_total FROM cotizaciones WHERE projects_id = $1 ORDER BY created_at DESC',
      [proyectoId]
    );
    return res.rows;
  },
  update: async (id, data) => {
    const updates = [];
    const values = [];
    let paramCount = 1;
    
    if (data.nombre_material || data.nombreMaterial) {
      updates.push(`nombre_material = $${paramCount++}`);
      values.push(data.nombre_material || data.nombreMaterial);
    }
    if (data.cantidad !== undefined) {
      updates.push(`cantidad = $${paramCount++}`);
      values.push(data.cantidad);
    }
    if (data.precio_unitario || data.precioUnitario) {
      updates.push(`precio_unitario = $${paramCount++}`);
      values.push(data.precio_unitario || data.precioUnitario);
    }
    if (data.estado) {
      updates.push(`estado = $${paramCount++}`);
      values.push(data.estado);
    }
    if (data.detalles) {
      updates.push(`detalles = $${paramCount++}`);
      values.push(data.detalles);
    }
    if (data.observaciones) {
      updates.push(`observaciones = $${paramCount++}`);
      values.push(data.observaciones);
    }
    // auditoría: updated_by
    if (data.updated_by) {
      updates.push(`updated_by = $${paramCount++}`);
      values.push(data.updated_by);
    }
    
    updates.push(`updated_at = NOW()`);
    values.push(id);
    
    if (updates.length > 1) {
      await pool.query(`UPDATE cotizaciones SET ${updates.join(', ')} WHERE id = $${paramCount}`, values);
    }
    
    return await module.exports.findById(id);
  },
  delete: async (id) => {
    await pool.query('DELETE FROM cotizaciones WHERE id = $1', [id]);
  },
  approveMany: async (ids, approvedBy = null) => {
    // Normalizar IDs a array de enteros (si vienen como strings)
    const intIds = ids.map(id => Number.isInteger(id) ? id : parseInt(id, 10)).filter(n => !Number.isNaN(n));
    if (intIds.length === 0) return [];

    try {
      // Usar un único parámetro tipo array para mayor robustez
      if (approvedBy) {
        const res = await pool.query(
          `UPDATE cotizaciones SET estado = 'aprobado', updated_at = NOW(), approved_by = $2, approved_at = NOW() WHERE id = ANY($1::int[]) RETURNING *`,
          [intIds, approvedBy]
        );
        // registrar para debug
        console.log(`🔔 approveMany: aprobadas ${res.rowCount} filas (approvedBy=${approvedBy})`);
        return res.rows;
      } else {
        const res = await pool.query(
          `UPDATE cotizaciones SET estado = 'aprobado', updated_at = NOW() WHERE id = ANY($1::int[]) RETURNING *`,
          [intIds]
        );
        console.log(`🔔 approveMany: aprobadas ${res.rowCount} filas (approvedBy=null)`);
        return res.rows;
      }
    } catch (err) {
      console.error('❌ approveMany error:', err && err.message);
      // Intentar fallback con placeholders individuales
      const placeholders = intIds.map((_, i) => `$${i + 1}`).join(',');
      const res = await pool.query(
        `UPDATE cotizaciones SET estado = 'aprobado', updated_at = NOW() WHERE id IN (${placeholders}) RETURNING *`,
        intIds
      );
      console.log(`🔔 approveMany (fallback): aprobadas ${res.rowCount} filas`);
      return res.rows;
    }
  },
  // Aprobar una cotización individualmente y registrar approver
  approveOne: async (id, approvedBy = null) => {
    const intId = Number.isInteger(id) ? id : parseInt(id, 10);
    if (Number.isNaN(intId)) return null;
    try {
      if (approvedBy) {
        const res = await pool.query(
          `UPDATE cotizaciones SET estado = 'aprobado', updated_at = NOW(), approved_by = $2, approved_at = NOW() WHERE id = $1 RETURNING *`,
          [intId, approvedBy]
        );
        console.log(`🔔 approveOne: id=${intId} aprobado por ${approvedBy}`);
        return res.rows[0];
      } else {
        const res = await pool.query(
          `UPDATE cotizaciones SET estado = 'aprobado', updated_at = NOW() WHERE id = $1 RETURNING *`,
          [intId]
        );
        console.log(`🔔 approveOne: id=${intId} aprobado (approvedBy=null)`);
        return res.rows[0];
      }
    } catch (err) {
      console.error('❌ approveOne error:', err && err.message);
      const res = await pool.query(`UPDATE cotizaciones SET estado = 'aprobado', updated_at = NOW() WHERE id = $1 RETURNING *`, [intId]);
      return res.rows[0];
    }
  },
  rejectMany: async (ids) => {
    const placeholders = ids.map((_, i) => `$${i + 1}`).join(',');
    const res = await pool.query(
      `UPDATE cotizaciones SET estado = 'rechazado', updated_at = NOW() WHERE id IN (${placeholders}) RETURNING *`,
      ids
    );
    return res.rows;
  },
  // Obtener solo cotizaciones aprobadas por proyecto
  getApprovedByProject: async (proyectoId) => {
    const res = await pool.query(
      "SELECT *, cantidad * (precio_unitario::numeric) AS precio_total FROM cotizaciones WHERE projects_id = $1 AND estado = 'aprobado' ORDER BY created_at DESC",
      [proyectoId]
    );
    return res.rows;
  },
  // Obtener línea de auditoría para una cotización
  getAuditTrail: async (id) => {
    const res = await pool.query('SELECT id, users_id, created_at, updated_at, created_by, updated_by, approved_by, approved_at FROM cotizaciones WHERE id = $1', [id]);
    return res.rows[0] || null;
  },
};
