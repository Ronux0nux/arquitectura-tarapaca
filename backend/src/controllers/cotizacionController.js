const Cotizacion = require('../models/Cotizacion');
const Project = require('../models/Project');

// Obtener todas las cotizaciones
exports.getCotizaciones = async (req, res) => {
  try {
    const cotizaciones = await Cotizacion.find()
      .populate('proyectoId', 'nombre codigo')
      .populate('proveedorId', 'nombre contacto')
      .populate('insumoId', 'nombre unidad')
      .populate('creadoPor', 'nombre email')
      .sort({ creadoEn: -1 });
    res.json(cotizaciones);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Obtener cotizaciones por proyecto
exports.getCotizacionesByProject = async (req, res) => {
  try {
    const { proyectoId } = req.params;
    const cotizaciones = await Cotizacion.find({ proyectoId })
      .populate('proveedorId', 'nombre contacto')
      .populate('insumoId', 'nombre unidad')
      .populate('creadoPor', 'nombre email')
      .sort({ creadoEn: -1 });
    
    // Calcular resumen de cotizaciones
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
    const { 
      proyectoId, insumoId, partidaId, proveedorId, 
      nombreMaterial, unidad, cantidad, precioUnitario,
      validezOferta, detalles, observaciones, creadoPor 
    } = req.body;
    
    // Verificar que el proyecto existe
    const proyecto = await Project.findById(proyectoId);
    if (!proyecto) {
      return res.status(404).json({ error: 'Proyecto no encontrado' });
    }
    
    const newCotizacion = new Cotizacion({
      proyectoId, insumoId, partidaId, proveedorId,
      nombreMaterial, unidad, cantidad, precioUnitario,
      validezOferta, detalles, observaciones, creadoPor
    });
    
    await newCotizacion.save();
    
    // Poblar los datos antes de enviar la respuesta
    await newCotizacion.populate([
      { path: 'proyectoId', select: 'nombre codigo' },
      { path: 'proveedorId', select: 'nombre contacto' },
      { path: 'insumoId', select: 'nombre unidad' },
      { path: 'creadoPor', select: 'nombre email' }
    ]);
    
    res.status(201).json(newCotizacion);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getCotizacionById = async (req, res) => {
  try {
    const cotizacion = await Cotizacion.findById(req.params.id)
      .populate('proyectoId', 'nombre codigo')
      .populate('proveedorId', 'nombre contacto')
      .populate('insumoId', 'nombre unidad')
      .populate('creadoPor', 'nombre email');
    if (!cotizacion) return res.status(404).json({ error: 'Cotización no encontrada' });
    res.json(cotizacion);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateCotizacion = async (req, res) => {
  try {
    const updatedCotizacion = await Cotizacion.findByIdAndUpdate(
      req.params.id,
      { ...req.body, actualizadoEn: new Date() },
      { new: true }
    ).populate([
      { path: 'proyectoId', select: 'nombre codigo' },
      { path: 'proveedorId', select: 'nombre contacto' },
      { path: 'insumoId', select: 'nombre unidad' },
      { path: 'creadoPor', select: 'nombre email' }
    ]);
    
    if (!updatedCotizacion) {
      return res.status(404).json({ error: 'Cotización no encontrada' });
    }
    
    res.json(updatedCotizacion);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Aprobar cotización
exports.aprobarCotizacion = async (req, res) => {
  try {
    const cotizacion = await Cotizacion.findByIdAndUpdate(
      req.params.id,
      { estado: 'Aprobada', actualizadoEn: new Date() },
      { new: true }
    ).populate([
      { path: 'proyectoId', select: 'nombre codigo' },
      { path: 'proveedorId', select: 'nombre contacto' }
    ]);
    
    if (!cotizacion) {
      return res.status(404).json({ error: 'Cotización no encontrada' });
    }
    
    res.json({ message: 'Cotización aprobada exitosamente', cotizacion });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Rechazar cotización
exports.rechazarCotizacion = async (req, res) => {
  try {
    const { observaciones } = req.body;
    const cotizacion = await Cotizacion.findByIdAndUpdate(
      req.params.id,
      { 
        estado: 'Rechazada', 
        observaciones: observaciones || cotizacion.observaciones,
        actualizadoEn: new Date() 
      },
      { new: true }
    ).populate([
      { path: 'proyectoId', select: 'nombre codigo' },
      { path: 'proveedorId', select: 'nombre contacto' }
    ]);
    
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
    const cotizacion = await Cotizacion.findByIdAndDelete(req.params.id);
    if (!cotizacion) {
      return res.status(404).json({ error: 'Cotización no encontrada' });
    }
    res.json({ message: 'Cotización eliminada exitosamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
