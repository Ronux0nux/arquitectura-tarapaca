const Cotizacion = require('../models/Cotizacion');
const Project = require('../models/Project');

// Obtener todas las cotizaciones
exports.getCotizaciones = async (req, res) => {
  try {
    const cotizaciones = await Cotizacion.findAll();
    res.json(cotizaciones);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Obtener cotizaciones por proyecto
exports.getCotizacionesByProject = (req, res) => {
  try {
    const { proyectoId } = req.params;
    const cotizaciones = Cotizacion.findAll().filter(c => c.proyectoId == proyectoId);
    const resumen = {
      total: cotizaciones.length,
      pendientes: cotizaciones.filter(c => c.estado === 'Pendiente').length,
      aprobadas: cotizaciones.filter(c => c.estado === 'Aprobada').length,
      compradas: cotizaciones.filter(c => c.estado === 'Comprada').length,
      montoTotal: cotizaciones.reduce((sum, c) => sum + (c.cantidad * c.precioUnitario), 0)
    };
    res.json({ cotizaciones, resumen });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Crear nueva cotización
exports.createCotizacion = async (req, res) => {
  try {
    const result = await Cotizacion.create(req.body);
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getCotizacionById = async (req, res) => {
  try {
    const cotizacion = await Cotizacion.findById(req.params.id);
    if (!cotizacion) return res.status(404).json({ error: 'Cotización no encontrada' });
    res.json(cotizacion);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateCotizacion = async (req, res) => {
  try {
    const updated = await Cotizacion.update(req.params.id, req.body);
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Aprobar cotización
exports.aprobarCotizacion = (req, res) => {
  try {
    const stmt = Cotizacion.db.prepare(`UPDATE cotizaciones SET estado = 'Aprobada', actualizadoEn = datetime('now') WHERE id = ?`);
    stmt.run(req.params.id);
    const cotizacion = Cotizacion.findById(req.params.id);
    if (!cotizacion) {
      return res.status(404).json({ error: 'Cotización no encontrada' });
    }
    res.json({ message: 'Cotización aprobada exitosamente', cotizacion });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Rechazar cotización
exports.rechazarCotizacion = (req, res) => {
  try {
    const { observaciones } = req.body;
    const stmt = Cotizacion.db.prepare(`UPDATE cotizaciones SET estado = 'Rechazada', observaciones = ?, actualizadoEn = datetime('now') WHERE id = ?`);
    stmt.run(observaciones, req.params.id);
    const cotizacion = Cotizacion.findById(req.params.id);
    if (!cotizacion) {
      return res.status(404).json({ error: 'Cotización no encontrada' });
    }
    res.json({ message: 'Cotización rechazada', cotizacion });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteCotizacion = async (req, res) => {
  try {
    await Cotizacion.delete(req.params.id);
    res.json({ message: 'Cotización eliminada' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
