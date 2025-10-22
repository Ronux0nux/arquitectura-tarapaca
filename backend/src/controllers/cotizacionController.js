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
exports.getCotizacionesByProject = async (req, res) => {
  try {
    const { proyectoId } = req.params;
    
    if (!proyectoId || proyectoId === 'undefined') {
      return res.status(400).json({ error: 'ID de proyecto requerido' });
    }

    console.log(`📦 Buscando cotizaciones para proyecto: ${proyectoId}`);
    
    // Usar nuevo método del modelo que filtra en BD
    const cotizaciones = await Cotizacion.findByProject(proyectoId);
    
    console.log(`📦 Cotizaciones encontradas: ${cotizaciones.length}`);
    
    // Calcular resumen
    const resumen = {
      total: cotizaciones.length,
      pendientes: cotizaciones.filter(c => c.estado === 'pendiente').length,
      aprobadas: cotizaciones.filter(c => c.estado === 'aprobado').length,
      rechazadas: cotizaciones.filter(c => c.estado === 'rechazado').length,
      montoTotal: cotizaciones.reduce((sum, c) => {
        const cantidad = parseInt(c.cantidad || 0);
        // Precio viene como money type, puede tener $
        const precio = typeof c.precio_unitario === 'string' 
          ? parseFloat(c.precio_unitario.replace(/[$,]/g, '')) 
          : parseFloat(c.precio_unitario || 0);
        return sum + (cantidad * precio);
      }, 0)
    };

    res.json({ 
      cotizaciones: cotizaciones || [],
      resumen 
    });
  } catch (err) {
    console.error('❌ Error al obtener cotizaciones por proyecto:', err.message);
    res.status(500).json({ error: err.message });
  }
};

// Crear nueva cotización
exports.createCotizacion = async (req, res) => {
  try {
    console.log('📬 POST /api/cotizaciones RECIBIDO');
    console.log('📬 Body completo:', JSON.stringify(req.body, null, 2));
    console.log('📬 Campos disponibles:', Object.keys(req.body));
    console.log('📬 Headers:', req.headers);
    
    // Validar campos requeridos
    const { proyectoId, nombreMaterial } = req.body;
    
    console.log('🔍 Validando:');
    console.log('  - proyectoId:', proyectoId, 'tipo:', typeof proyectoId);
    console.log('  - nombreMaterial:', nombreMaterial, 'tipo:', typeof nombreMaterial);
    
    if (!proyectoId || proyectoId === 'undefined' || isNaN(proyectoId)) {
      console.warn('⚠️ ProyectoId inválido:', proyectoId);
      return res.status(400).json({ error: `proyectoId es requerido y debe ser número. Recibido: ${proyectoId}` });
    }
    
    if (!nombreMaterial) {
      console.warn('⚠️ Nombre de material faltante');
      return res.status(400).json({ error: `nombreMaterial es requerido. Recibido: ${nombreMaterial}` });
    }
    
    console.log('✅ Campos validados, procediendo a crear...');
    
    const result = await Cotizacion.create(req.body);
    
    console.log('✅ Cotización creada exitosamente:');
    console.log('✅ ID:', result.id);
    console.log('✅ ProyectoID:', result.projects_id);
    console.log('✅ Material:', result.nombre_material);
    console.log('✅ Cantidad:', result.cantidad);
    console.log('✅ Precio unitario:', result.precio_unitario);
    
    res.status(201).json(result);
  } catch (err) {
    console.error('❌ ERROR en createCotizacion:', err.message);
    console.error('❌ Stack:', err.stack);
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
exports.aprobarCotizacion = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Cotizacion.update(id, { estado: 'aprobado' });
    res.json({ 
      message: 'Cotización aprobada exitosamente',
      cotizacion: updated 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Rechazar cotización
exports.rechazarCotizacion = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Cotizacion.update(id, { estado: 'rechazado' });
    res.json({ 
      message: 'Cotización rechazada',
      cotizacion: updated 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Aprobar múltiples cotizaciones
exports.approveMateriales = async (req, res) => {
  try {
    const { cotizacionIds } = req.body;
    
    if (!cotizacionIds || !Array.isArray(cotizacionIds) || cotizacionIds.length === 0) {
      return res.status(400).json({ error: 'Debe proporcionar un array de IDs de cotizaciones' });
    }

    console.log(`✅ Aprobando ${cotizacionIds.length} cotizaciones:`, cotizacionIds);
    
    // Usar el método del modelo para actualizar múltiples
    const updated = await Cotizacion.approveMany(cotizacionIds);

    res.json({ 
      message: `${updated.length} cotizaciones aprobadas exitosamente`,
      count: updated.length,
      cotizaciones: updated
    });
  } catch (err) {
    console.error('❌ Error al aprobar cotizaciones:', err.message);
    res.status(500).json({ error: err.message });
  }
};

// Rechazar múltiples cotizaciones
exports.rejectMateriales = async (req, res) => {
  try {
    const { cotizacionIds } = req.body;
    
    if (!cotizacionIds || !Array.isArray(cotizacionIds) || cotizacionIds.length === 0) {
      return res.status(400).json({ error: 'Debe proporcionar un array de IDs de cotizaciones' });
    }

    console.log(`🔴 Rechazando ${cotizacionIds.length} cotizaciones:`, cotizacionIds);
    
    // Usar el método del modelo para actualizar múltiples
    const updated = await Cotizacion.rejectMany(cotizacionIds);

    res.json({ 
      message: `${updated.length} cotizaciones rechazadas`,
      count: updated.length,
      cotizaciones: updated
    });
  } catch (err) {
    console.error('❌ Error al rechazar cotizaciones:', err.message);
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
