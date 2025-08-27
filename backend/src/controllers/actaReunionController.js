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
