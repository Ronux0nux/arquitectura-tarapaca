const ActaReunion = require('../models/ActaReunion');
const Project = require('../models/Project');

// Obtener todas las actas de reunión
exports.getActas = async (req, res) => {
  try {
    const actas = await ActaReunion.find()
      .populate('proyectoId', 'nombre codigo')
      .populate('creadoPor', 'nombre email')
      .sort({ fecha: -1 });
    res.json(actas);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Obtener actas por proyecto
exports.getActasByProject = async (req, res) => {
  try {
    const { proyectoId } = req.params;
    const actas = await ActaReunion.find({ proyectoId })
      .populate('proyectoId', 'nombre codigo')
      .populate('creadoPor', 'nombre email')
      .sort({ fecha: -1 });
    res.json(actas);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Crear nueva acta de reunión
exports.createActa = async (req, res) => {
  try {
    const nuevaActa = new ActaReunion(req.body);
    await nuevaActa.save();
    
    // Poblar los datos para la respuesta
    await nuevaActa.populate('proyectoId', 'nombre codigo');
    await nuevaActa.populate('creadoPor', 'nombre email');
    
    res.status(201).json(nuevaActa);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener un acta por ID
exports.getActaById = async (req, res) => {
  try {
    const acta = await ActaReunion.findById(req.params.id)
      .populate('proyectoId', 'nombre codigo descripcion ubicacion')
      .populate('creadoPor', 'nombre email');
    
    if (!acta) return res.status(404).json({ error: 'Acta no encontrada' });
    res.json(acta);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Actualizar acta
exports.updateActa = async (req, res) => {
  try {
    const actualizada = await ActaReunion.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true }
    )
    .populate('proyectoId', 'nombre codigo')
    .populate('creadoPor', 'nombre email');
    
    res.json(actualizada);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Eliminar acta
exports.deleteActa = async (req, res) => {
  try {
    await ActaReunion.findByIdAndDelete(req.params.id);
    res.json({ mensaje: 'Acta eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Buscar actas con filtros
exports.searchActas = async (req, res) => {
  try {
    const { proyectoId, entidad, fecha, fechaInicio, fechaFin } = req.query;
    let query = {};

    // Filtrar por proyecto
    if (proyectoId) {
      query.proyectoId = proyectoId;
    }

    // Filtrar por entidad
    if (entidad) {
      query.entidad = { $regex: entidad, $options: 'i' };
    }

    // Filtrar por fecha específica
    if (fecha) {
      const fechaBusqueda = new Date(fecha);
      const siguienteDia = new Date(fechaBusqueda);
      siguienteDia.setDate(siguienteDia.getDate() + 1);
      
      query.fecha = {
        $gte: fechaBusqueda,
        $lt: siguienteDia
      };
    }

    // Filtrar por rango de fechas
    if (fechaInicio && fechaFin) {
      query.fecha = {
        $gte: new Date(fechaInicio),
        $lte: new Date(fechaFin)
      };
    } else if (fechaInicio) {
      query.fecha = { $gte: new Date(fechaInicio) };
    } else if (fechaFin) {
      query.fecha = { $lte: new Date(fechaFin) };
    }

    const actas = await ActaReunion.find(query)
      .populate('proyectoId', 'nombre codigo')
      .populate('creadoPor', 'nombre email')
      .sort({ fecha: -1 });
    
    res.json(actas);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
