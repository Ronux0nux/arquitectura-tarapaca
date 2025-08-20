const Cotizacion = require('../models/Cotizacion');
const Project = require('../models/Project');

// Obtener todas las cotizaciones
exports.getCotizaciones = (req, res) => {
  try {
    const cotizaciones = Cotizacion.findAll();
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
exports.createCotizacion = (req, res) => {
  try {
    const result = Cotizacion.create(req.body);
    res.status(201).json({ id: result.lastInsertRowid, ...req.body });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getCotizacionById = (req, res) => {
  try {
    const cotizacion = Cotizacion.findById(req.params.id);
    if (!cotizacion) return res.status(404).json({ error: 'Cotización no encontrada' });
    res.json(cotizacion);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateCotizacion = (req, res) => {
  try {
    const stmt = Cotizacion.db.prepare(`UPDATE cotizaciones SET proyectoId = ?, insumoId = ?, partidaId = ?, proveedorId = ?, nombreMaterial = ?, unidad = ?, cantidad = ?, precioUnitario = ?, validezOferta = ?, estado = ?, detalles = ?, observaciones = ?, creadoPor = ?, actualizadoEn = datetime('now') WHERE id = ?`);
    stmt.run(req.body.proyectoId, req.body.insumoId, req.body.partidaId, req.body.proveedorId, req.body.nombreMaterial, req.body.unidad, req.body.cantidad, req.body.precioUnitario, req.body.validezOferta, req.body.estado, req.body.detalles, req.body.observaciones, req.body.creadoPor, req.params.id);
    const updated = Cotizacion.findById(req.params.id);
    if (!updated) {
      return res.status(404).json({ error: 'Cotización no encontrada' });
    }
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

exports.deleteCotizacion = (req, res) => {
  try {
    const stmt = Cotizacion.db.prepare(`DELETE FROM cotizaciones WHERE id = ?`);
    stmt.run(req.params.id);
    res.json({ message: 'Cotización eliminada exitosamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
