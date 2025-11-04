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
  const cotizacionesRaw = await Cotizacion.findByProject(proyectoId);

    console.log(`📦 Cotizaciones encontradas: ${cotizacionesRaw.length}`);

    // Normalizar cada cotización para el frontend: añadir 'status' en inglés y precio_total numérico
  const cotizaciones = cotizacionesRaw.map(c => {
      // estado en español -> status en inglés
      const estado = (c.estado || '').toString().toLowerCase();
      let status = 'unknown';
      if (estado === 'aprobado') status = 'approved';
      else if (estado === 'pendiente') status = 'pending';
      else if (estado === 'rechazado') status = 'rejected';

      // precio_total puede venir como string o numeric
      let precioTotal = 0;
      try {
        if (c.precio_total !== undefined && c.precio_total !== null) {
          precioTotal = typeof c.precio_total === 'string'
            ? parseFloat(c.precio_total.replace(/[$,]/g, ''))
            : Number(c.precio_total);
        } else {
          const cantidad = Number(c.cantidad || 0);
          const pu = typeof c.precio_unitario === 'string'
            ? parseFloat(c.precio_unitario.replace(/[$,]/g, ''))
            : Number(c.precio_unitario || 0);
          precioTotal = cantidad * pu;
        }
      } catch (e) {
        precioTotal = 0;
      }

      // Agregar estructura 'productos' esperada por el frontend (cada fila representa típicamente 1 producto)
      const producto = {
        id: c.id || `${c.id}_prod`,
        nombre: c.nombre_material || c.producto || c.nombre || 'Sin nombre',
        descripcion: c.nombre_material || c.descripcion || 'Sin descripción',
        cantidad: Number(c.cantidad || 0),
        unidad: c.unidad || 'un',
        precio: Number(c.precio_unitario || 0),
        categoria: c.categoria || 'Sin categoría',
        observaciones: c.observaciones || ''
      };

      return {
        ...c,
        status,
        estado,
        precio_total: precioTotal,
        precioTotal: precioTotal, // alias para frontend
        productos: [producto],
        proveedor: {
          id: c.providers_id || c.proveedor_id || null,
          nombre: c.proveedor_nombre || c.proveedor || null
        },
        fecha: c.created_at || c.fecha || null
      };
    });

    // Calcular resumen
    const resumen = {
      total: cotizaciones.length,
      pendientes: cotizaciones.filter(c => c.estado === 'pendiente').length,
      aprobadas: cotizaciones.filter(c => c.estado === 'aprobado').length,
      rechazadas: cotizaciones.filter(c => c.estado === 'rechazado').length,
      montoTotal: cotizaciones.reduce((sum, c) => sum + (Number(c.precio_total || c.precioTotal || 0)), 0)
    };

    const aprobadasList = cotizaciones.filter(c => c.status === 'approved');

    // Devolver en formato compatible: mantener 'success' y 'data',
    // pero también exponer 'cotizaciones' y 'resumen' en el nivel superior
    res.json({
      success: true,
      cotizaciones,
      resumen,
      aprobadas: aprobadasList,
      data: {
        cotizaciones,
        resumen,
        aprobadas: aprobadasList
      }
    });
  } catch (err) {
    console.error('❌ Error al obtener cotizaciones por proyecto:', err.message);
    res.status(500).json({ error: err.message });
  }
};

// Obtener solo cotizaciones aprobadas de un proyecto
exports.getAprobadasByProject = async (req, res) => {
  try {
    const { proyectoId } = req.params;
    if (!proyectoId || proyectoId === 'undefined') {
      return res.status(400).json({ error: 'ID de proyecto requerido' });
    }

    const cotizacionesRaw = await Cotizacion.getApprovedByProject(proyectoId);
    const cotizaciones = cotizacionesRaw.map(c => ({ ...c, status: 'approved', precioTotal: Number(c.precio_total || 0) }));

    res.json({ success: true, data: { cotizaciones } });
  } catch (err) {
    console.error('❌ Error al obtener cotizaciones aprobadas por proyecto:', err.message);
    res.status(500).json({ error: err.message });
  }
};

// Obtener audit trail de una cotización
exports.getCotizacionAudit = async (req, res) => {
  try {
    const { id } = req.params;
    const audit = await Cotizacion.getAuditTrail(id);
    if (!audit) return res.status(404).json({ error: 'Cotización no encontrada' });
    res.json({ success: true, data: audit });
  } catch (err) {
    console.error('❌ Error obteniendo audit trail:', err.message);
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
    
  // Pasar información de auditoría si está disponible
  const payload = { ...req.body };
  if (req.user && req.user.id) payload.created_by = req.user.id;
  const result = await Cotizacion.create(payload);
    
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
    const payload = { ...req.body };
    if (req.user && req.user.id) payload.updated_by = req.user.id;
    const updated = await Cotizacion.update(req.params.id, payload);
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Aprobar cotización
exports.aprobarCotizacion = async (req, res) => {
  try {
    const { id } = req.params;
    const approvedBy = req.user && req.user.id ? req.user.id : null;
    const updated = await Cotizacion.approveOne(id, approvedBy);
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

    // Normalizar IDs a enteros
    const parsedIds = cotizacionIds.map(id => parseInt(id, 10)).filter(n => !Number.isNaN(n));
    if (parsedIds.length === 0) {
      return res.status(400).json({ error: 'No se proporcionaron IDs válidos' });
    }

    console.log(`✅ Aprobando ${parsedIds.length} cotizaciones:`, parsedIds);

    // Usar el método del modelo para actualizar múltiples y registrar quién aprobó
    const approvedBy = req.user && req.user.id ? req.user.id : null;
    const updated = await Cotizacion.approveMany(parsedIds, approvedBy);

    console.log(`✅ approveMateriales - filas actualizadas: ${updated.length}`);

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
