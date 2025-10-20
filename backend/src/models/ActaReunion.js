// Modelo ActaReunion usando PostgreSQL con estructura según el script SQL
const pool = require('../db');

const parseAsistencia = (data) => {
  if (!data) return [];
  if (typeof data === 'string') {
    try {
      return JSON.parse(data);
    } catch (e) {
      return [];
    }
  }
  return Array.isArray(data) ? data : [];
};

module.exports = {
  create: async (data) => {
    console.log('🔍 DEBUG - Datos RAW recibidos:', JSON.stringify(data, null, 2));
    
    // Validar que objetivo no esté vacío
    const objetivo = (data.objetivo || data.objetivoReunion || data.objetivo_reunion || '').trim();
    
    console.log('🎯 DEBUG - Objetivo final:', objetivo);
    console.log('🎯 DEBUG - Objetivo está vacío?:', objetivo === '');
    
    if (!objetivo) {
      throw new Error('El objetivo de la reunión es requerido');
    }
    
    console.log('📝 DEBUG - Creando acta con objetivo:', objetivo);
    
    const res = await pool.query(
      `INSERT INTO "actas_reunion" (
        "entidad", "fecha", "lugar", "hora_inicio", "hora_termino", "objetivo_reunion", "temas_tratados", "acuerdos", "asistencia", "projects_id", "users_id", "created_at", "updated_at"
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW()
      ) RETURNING *`,
      [
        data.entidad || '',
        data.fecha || new Date().toISOString().split('T')[0],
        data.lugar || '',
        data.horaInicio || data.hora_inicio || '00:00',
        data.horaTermino || data.hora_termino || '00:00',
        objetivo,
        data.temasTratados || data.temas_tratados || '',
        data.acuerdos || '',
        JSON.stringify(data.asistencia || []),
        data.proyectoId || data.projects_id,
        data.userId || data.users_id || 1
      ]
    );
    
    const result = res.rows[0];
    if (result) {
      result.asistencia = parseAsistencia(result.asistencia);
    }
    return result;
  },

  findAll: async () => {
    const res = await pool.query('SELECT * FROM "actas_reunion" ORDER BY id DESC');
    return res.rows.map(a => ({
      ...a,
      asistencia: parseAsistencia(a.asistencia)
    }));
  },

  findById: async (id) => {
    const res = await pool.query('SELECT * FROM "actas_reunion" WHERE id = $1', [id]);
    const a = res.rows[0] || null;
    if (a) {
      a.asistencia = parseAsistencia(a.asistencia);
    }
    return a;
  },

  findByProject: async (proyectoId) => {
    const res = await pool.query(
      'SELECT * FROM "actas_reunion" WHERE "projects_id" = $1 ORDER BY id DESC',
      [proyectoId]
    );
    return res.rows.map(a => ({
      ...a,
      asistencia: parseAsistencia(a.asistencia)
    }));
  },

  update: async (id, data) => {
    const objetivo = (data.objetivo || data.objetivoReunion || data.objetivo_reunion || '').trim();
    
    await pool.query(
      `UPDATE "actas_reunion" SET 
        "entidad" = $1, 
        "fecha" = $2, 
        "lugar" = $3, 
        "hora_inicio" = $4, 
        "hora_termino" = $5, 
        "objetivo_reunion" = $6, 
        "temas_tratados" = $7, 
        "acuerdos" = $8, 
        "asistencia" = $9,
        "updated_at" = NOW()
        WHERE id = $10`,
      [
        data.entidad || '',
        data.fecha || new Date().toISOString().split('T')[0],
        data.lugar || '',
        data.horaInicio || data.hora_inicio || '00:00',
        data.horaTermino || data.hora_termino || '00:00',
        objetivo || '',
        data.temasTratados || data.temas_tratados || '',
        data.acuerdos || '',
        JSON.stringify(data.asistencia || []),
        id
      ]
    );
    return await module.exports.findById(id);
  },

  delete: async (id) => {
    await pool.query('DELETE FROM "actas_reunion" WHERE id = $1', [id]);
  }
};
