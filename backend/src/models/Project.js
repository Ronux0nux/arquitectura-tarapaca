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
    const res = await pool.query(`
      SELECT 
        p.*,
        COUNT(DISTINCT h.id) as total_hitos,
        COUNT(DISTINCT CASE WHEN h.estado = 'Completado' THEN h.id END) as hitos_completados,
        COUNT(DISTINCT g.id) as total_gastos,
        COUNT(DISTINCT a.id) as total_archivos,
        COUNT(DISTINCT al.id) FILTER (WHERE al.resuelta = false) as alertas_activas
      FROM projects p
      LEFT JOIN hitos_proyecto h ON p.id = h.proyecto_id
      LEFT JOIN gastos_proyecto g ON p.id = g.proyecto_id AND g.aprobado = true
      LEFT JOIN archivos_proyecto a ON p.id = a.proyecto_id
      LEFT JOIN alertas_proyecto al ON p.id = al.proyecto_id
      GROUP BY p.id
      ORDER BY p.id DESC
    `);
    return res.rows.map(p => ({ ...p, equipo: JSON.parse(p.equipo || '[]') }));
  },
  findById: async (id) => {
    const res = await pool.query(`
      SELECT 
        p.*,
        COUNT(DISTINCT h.id) as total_hitos,
        COUNT(DISTINCT CASE WHEN h.estado = 'Completado' THEN h.id END) as hitos_completados,
        COUNT(DISTINCT g.id) as total_gastos,
        COUNT(DISTINCT a.id) as total_archivos,
        COUNT(DISTINCT al.id) FILTER (WHERE al.resuelta = false) as alertas_activas
      FROM projects p
      LEFT JOIN hitos_proyecto h ON p.id = h.proyecto_id
      LEFT JOIN gastos_proyecto g ON p.id = g.proyecto_id AND g.aprobado = true
      LEFT JOIN archivos_proyecto a ON p.id = a.proyecto_id
      LEFT JOIN alertas_proyecto al ON p.id = al.proyecto_id
      WHERE p.id = $1
      GROUP BY p.id
    `, [id]);
    const p = res.rows[0];
    if (!p) return null;
    p.equipo = JSON.parse(p.equipo || '[]');
    
    // Obtener hitos del proyecto
    const hitosRes = await pool.query(
      'SELECT * FROM hitos_proyecto WHERE proyecto_id = $1 ORDER BY orden, fecha_programada',
      [id]
    );
    p.hitos = hitosRes.rows;
    
    // Obtener gastos recientes
    const gastosRes = await pool.query(
      'SELECT * FROM gastos_proyecto WHERE proyecto_id = $1 ORDER BY fecha DESC LIMIT 10',
      [id]
    );
    p.gastos = gastosRes.rows;
    
    // Obtener alertas activas
    const alertasRes = await pool.query(
      'SELECT * FROM alertas_proyecto WHERE proyecto_id = $1 AND resuelta = false ORDER BY fecha_generacion DESC',
      [id]
    );
    p.alertas = alertasRes.rows;
    
    // Obtener archivos
    const archivosRes = await pool.query(
      'SELECT * FROM archivos_proyecto WHERE proyecto_id = $1 ORDER BY fecha_subida DESC',
      [id]
    );
    p.archivos = archivosRes.rows;
    
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
