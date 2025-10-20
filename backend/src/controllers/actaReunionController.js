const ActaReunion = require('../models/ActaReunion');

// Obtener todas las actas de reunión
exports.getActas = async (req, res) => {
  try {
    const actas = await ActaReunion.findAll();
    res.json(actas);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Obtener actas por proyecto
exports.getActasByProject = async (req, res) => {
  try {
    const { proyectoId } = req.params;
    const actas = await ActaReunion.findByProject(proyectoId);
    res.json(actas);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Crear nueva acta de reunión
exports.createActa = async (req, res) => {
  try {
    const result = await ActaReunion.create(req.body);
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Obtener un acta por ID
exports.getActaById = async (req, res) => {
  try {
    const acta = await ActaReunion.findById(req.params.id);
    if (!acta) return res.status(404).json({ error: 'Acta de reunión no encontrada' });
    res.json(acta);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Actualizar acta
exports.updateActa = async (req, res) => {
  try {
    const updated = await ActaReunion.update(req.params.id, req.body);
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Eliminar acta
exports.deleteActa = async (req, res) => {
  try {
    await ActaReunion.delete(req.params.id);
    res.json({ message: 'Acta de reunión eliminada' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Buscar actas con filtros
exports.searchActas = async (req, res) => {
  try {
    const { proyectoId, entidad, fecha, fechaInicio, fechaFin } = req.query;
    let query = 'SELECT * FROM actas_reunion WHERE 1=1';
    let params = [];
    let paramCount = 1;

    // Filtrar por proyecto
    if (proyectoId) {
      query += ` AND projects_id = $${paramCount}`;
      params.push(proyectoId);
      paramCount++;
    }

    // Filtrar por entidad
    if (entidad) {
      query += ` AND entidad ILIKE $${paramCount}`;
      params.push(`%${entidad}%`);
      paramCount++;
    }

    // Filtrar por fecha específica
    if (fecha) {
      query += ` AND fecha = $${paramCount}`;
      params.push(fecha);
      paramCount++;
    }

    // Filtrar por rango de fechas
    if (fechaInicio && fechaFin) {
      query += ` AND fecha BETWEEN $${paramCount} AND $${paramCount + 1}`;
      params.push(fechaInicio);
      params.push(fechaFin);
      paramCount += 2;
    } else if (fechaInicio) {
      query += ` AND fecha >= $${paramCount}`;
      params.push(fechaInicio);
      paramCount++;
    } else if (fechaFin) {
      query += ` AND fecha <= $${paramCount}`;
      params.push(fechaFin);
      paramCount++;
    }

    query += ' ORDER BY fecha DESC';

    const ActaReunion = require('../models/ActaReunion');
    const pool = require('../db');
    const result = await pool.query(query, params);
    
    const actas = result.rows.map(a => ({
      ...a,
      asistencia: a.asistencia ? (typeof a.asistencia === 'string' ? JSON.parse(a.asistencia) : a.asistencia) : []
    }));
    
    res.json(actas);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
