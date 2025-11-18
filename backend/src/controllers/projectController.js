const Project = require('../models/Project');
const Cotizacion = require('../models/Cotizacion');
const OrdenCompra = require('../models/OrdenCompra');

// Obtener todos los proyectos
exports.getProjects = async (req, res) => {
  try {
    const projects = await Project.findAll();
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Buscar proyectos con filtros
exports.searchProjects = (req, res) => {
  try {
    const { id, nombre, codigo, fechaInicio, fechaTermino } = req.query;
    let projects = Project.findAll();
    if (id) projects = projects.filter(p => p.id == id);
    if (nombre) projects = projects.filter(p => p.nombre.toLowerCase().includes(nombre.toLowerCase()));
    if (codigo) projects = projects.filter(p => p.codigo.toLowerCase().includes(codigo.toLowerCase()));
    if (fechaInicio) projects = projects.filter(p => new Date(p.fechaInicio) >= new Date(fechaInicio));
    if (fechaTermino) projects = projects.filter(p => new Date(p.fechaTermino) <= new Date(fechaTermino));
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Crear nuevo proyecto
exports.createProject = async (req, res) => {
  try {
    const result = await Project.create(req.body);
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Obtener un proyecto por ID
exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Proyecto no encontrado' });
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Obtener resumen completo de materiales por proyecto
exports.getProjectMaterialSummary = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar que el proyecto existe
    const project = await Project.findById(id).populate('subencargado', 'nombre email');
    if (!project) {
      return res.status(404).json({ error: 'Proyecto no encontrado' });
    }

    // Obtener cotizaciones del proyecto
    const cotizaciones = await Cotizacion.find({ proyectoId: id })
      .populate('proveedorId', 'nombre contacto')
      .populate('insumoId', 'nombre unidad')
      .sort({ creadoEn: -1 });

    // Obtener órdenes de compra del proyecto
    const ordenesCompra = await OrdenCompra.find({ proyectoId: id })
      .populate('proveedorId', 'nombre contacto')
      .populate('cotizacionId')
      .sort({ creadoEn: -1 });

    // Calcular resúmenes
    const resumenCotizaciones = {
      total: cotizaciones.length,
      pendientes: cotizaciones.filter(c => c.estado === 'Pendiente').length,
      aprobadas: cotizaciones.filter(c => c.estado === 'Aprobada').length,
      compradas: cotizaciones.filter(c => c.estado === 'Comprada').length,
      rechazadas: cotizaciones.filter(c => c.estado === 'Rechazada').length,
      montoTotal: cotizaciones.reduce((sum, c) => sum + (c.cantidad * c.precioUnitario), 0)
    };

    const resumenOrdenes = {
      total: ordenesCompra.length,
      pendientes: ordenesCompra.filter(o => o.estado === 'Pendiente').length,
      aprobadas: ordenesCompra.filter(o => o.estado === 'Aprobada').length,
      recibidas: ordenesCompra.filter(o => o.estado === 'Recibida').length,
      canceladas: ordenesCompra.filter(o => o.estado === 'Cancelada').length,
      montoTotal: ordenesCompra.reduce((sum, o) => sum + o.montoNeto, 0)
    };

    // Materiales más cotizados
    const materialesCotizados = {};
    cotizaciones.forEach(c => {
      if (!materialesCotizados[c.nombreMaterial]) {
        materialesCotizados[c.nombreMaterial] = {
          nombre: c.nombreMaterial,
          unidad: c.unidad,
          totalCotizaciones: 0,
          cantidadTotal: 0,
          precioPromedio: 0,
          mejorPrecio: null,
          proveedores: new Set()
        };
      }
      
      const material = materialesCotizados[c.nombreMaterial];
      material.totalCotizaciones++;
      material.cantidadTotal += c.cantidad;
      material.proveedores.add(c.proveedorId?.nombre || 'Sin proveedor');
      
      if (!material.mejorPrecio || c.precioUnitario < material.mejorPrecio) {
        material.mejorPrecio = c.precioUnitario;
      }
    });

    // Convertir Set a Array y calcular precio promedio
    Object.values(materialesCotizados).forEach(material => {
      material.proveedores = Array.from(material.proveedores);
      const preciosTotal = cotizaciones
        .filter(c => c.nombreMaterial === material.nombre)
        .reduce((sum, c) => sum + c.precioUnitario, 0);
      material.precioPromedio = preciosTotal / material.totalCotizaciones;
    });

    res.json({
      proyecto: project,
      cotizaciones: {
        lista: cotizaciones,
        resumen: resumenCotizaciones
      },
      ordenesCompra: {
        lista: ordenesCompra,
        resumen: resumenOrdenes
      },
      materialesMasCotizados: Object.values(materialesCotizados)
        .sort((a, b) => b.totalCotizaciones - a.totalCotizaciones)
        .slice(0, 10)
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Actualizar proyecto
exports.updateProject = async (req, res) => {
  try {
    const updated = await Project.update(req.params.id, req.body);
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Eliminar proyecto
exports.deleteProject = async (req, res) => {
  try {
    await Project.delete(req.params.id);
    res.json({ message: 'Proyecto eliminado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Vincular proveedor a proyecto
exports.linkProviderToProject = (req, res) => {
  try {
    const { id } = req.params;
    const { providerId } = req.body;
    // Buscar proyecto
    const project = require('../models/Project').findById(id);
    if (!project) return res.status(404).json({ error: 'Proyecto no encontrado' });
    // Buscar proveedor
    const provider = require('../models/Provider').findById(providerId);
    if (!provider) return res.status(404).json({ error: 'Proveedor no encontrado' });
    // Relación: agregamos el proveedor al array equipo del proyecto
    const equipo = Array.isArray(project.equipo) ? project.equipo : [];
    // Evitar duplicados
    if (equipo.find(p => p.id === provider.id)) {
      return res.status(400).json({ error: 'Proveedor ya vinculado a este proyecto' });
    }
    equipo.push({ id: provider.id, nombre: provider.nombre, email: provider.email });
    // Actualizar proyecto
    require('../models/Project').update(id, { ...project, equipo });
    res.json({ message: 'Proveedor vinculado correctamente', equipo });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ==================== GESTIÓN DE HITOS ====================

exports.getProjectHitos = async (req, res) => {
  try {
    const pool = require('../db');
    const result = await pool.query(
      'SELECT * FROM hitos_proyecto WHERE proyecto_id = $1 ORDER BY orden, fecha_programada',
      [req.params.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createHito = async (req, res) => {
  try {
    const pool = require('../db');
    const { nombre, descripcion, fecha_programada, porcentaje_peso, es_critico, responsable } = req.body;
    const result = await pool.query(
      `INSERT INTO hitos_proyecto (proyecto_id, nombre, descripcion, fecha_programada, porcentaje_peso, es_critico, responsable)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [req.params.id, nombre, descripcion, fecha_programada, porcentaje_peso || 0, es_critico || false, responsable]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updateHito = async (req, res) => {
  try {
    const pool = require('../db');
    const { hitoId } = req.params;
    const { nombre, descripcion, fecha_programada, fecha_inicio_real, fecha_fin_real, porcentaje_peso, estado, es_critico, notas } = req.body;
    const result = await pool.query(
      `UPDATE hitos_proyecto 
       SET nombre = COALESCE($1, nombre),
           descripcion = COALESCE($2, descripcion),
           fecha_programada = COALESCE($3, fecha_programada),
           fecha_inicio_real = COALESCE($4, fecha_inicio_real),
           fecha_fin_real = COALESCE($5, fecha_fin_real),
           porcentaje_peso = COALESCE($6, porcentaje_peso),
           estado = COALESCE($7, estado),
           es_critico = COALESCE($8, es_critico),
           notas = COALESCE($9, notas)
       WHERE id = $10 AND proyecto_id = $11
       RETURNING *`,
      [nombre, descripcion, fecha_programada, fecha_inicio_real, fecha_fin_real, porcentaje_peso, estado, es_critico, notas, hitoId, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Hito no encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteHito = async (req, res) => {
  try {
    const pool = require('../db');
    await pool.query('DELETE FROM hitos_proyecto WHERE id = $1 AND proyecto_id = $2', [req.params.hitoId, req.params.id]);
    res.json({ message: 'Hito eliminado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ==================== GESTIÓN DE GASTOS ====================

exports.getProjectGastos = async (req, res) => {
  try {
    const pool = require('../db');
    const result = await pool.query(
      'SELECT * FROM gastos_proyecto WHERE proyecto_id = $1 ORDER BY fecha DESC',
      [req.params.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createGasto = async (req, res) => {
  try {
    const pool = require('../db');
    const { categoria, concepto, descripcion, monto, fecha, proveedor_id, factura_numero, metodo_pago, aprobado } = req.body;
    const result = await pool.query(
      `INSERT INTO gastos_proyecto (proyecto_id, categoria, concepto, descripcion, monto, fecha, proveedor_id, factura_numero, metodo_pago, aprobado)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [req.params.id, categoria, concepto, descripcion, monto, fecha || new Date(), proveedor_id, factura_numero, metodo_pago, aprobado || false]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updateGasto = async (req, res) => {
  try {
    const pool = require('../db');
    const { gastoId } = req.params;
    const { categoria, concepto, descripcion, monto, fecha, aprobado, notas } = req.body;
    const result = await pool.query(
      `UPDATE gastos_proyecto 
       SET categoria = COALESCE($1, categoria),
           concepto = COALESCE($2, concepto),
           descripcion = COALESCE($3, descripcion),
           monto = COALESCE($4, monto),
           fecha = COALESCE($5, fecha),
           aprobado = COALESCE($6, aprobado),
           notas = COALESCE($7, notas)
       WHERE id = $8 AND proyecto_id = $9
       RETURNING *`,
      [categoria, concepto, descripcion, monto, fecha, aprobado, notas, gastoId, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Gasto no encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteGasto = async (req, res) => {
  try {
    const pool = require('../db');
    await pool.query('DELETE FROM gastos_proyecto WHERE id = $1 AND proyecto_id = $2', [req.params.gastoId, req.params.id]);
    res.json({ message: 'Gasto eliminado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ==================== GESTIÓN DE ARCHIVOS ====================

exports.getProjectArchivos = async (req, res) => {
  try {
    const pool = require('../db');
    const result = await pool.query(
      'SELECT * FROM archivos_proyecto WHERE proyecto_id = $1 ORDER BY fecha_subida DESC',
      [req.params.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.uploadArchivo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se subió ningún archivo' });
    }

    const pool = require('../db');
    const { categoria, descripcion } = req.body;
    
    const result = await pool.query(
      `INSERT INTO archivos_proyecto (
        proyecto_id, nombre, nombre_original, ruta, tamanio, tipo, categoria, descripcion
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [
        req.params.id,
        req.file.filename,
        req.file.originalname,
        req.file.path,
        req.file.size,
        req.file.mimetype,
        categoria || 'Otros',
        descripcion || ''
      ]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.downloadArchivo = async (req, res) => {
  try {
    const pool = require('../db');
    const result = await pool.query(
      'SELECT * FROM archivos_proyecto WHERE id = $1 AND proyecto_id = $2',
      [req.params.archivoId, req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Archivo no encontrado' });
    }
    
    const archivo = result.rows[0];
    const fs = require('fs');
    const path = require('path');
    
    // Verificar que el archivo existe
    if (!fs.existsSync(archivo.ruta)) {
      return res.status(404).json({ error: 'Archivo no encontrado en el servidor' });
    }
    
    // Enviar archivo
    res.download(archivo.ruta, archivo.nombre_original);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteArchivo = async (req, res) => {
  try {
    const pool = require('../db');
    const fs = require('fs');
    
    // Obtener info del archivo antes de eliminarlo
    const result = await pool.query(
      'SELECT * FROM archivos_proyecto WHERE id = $1 AND proyecto_id = $2',
      [req.params.archivoId, req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Archivo no encontrado' });
    }
    
    const archivo = result.rows[0];
    
    // Eliminar archivo físico si existe
    if (fs.existsSync(archivo.ruta)) {
      fs.unlinkSync(archivo.ruta);
    }
    
    // Eliminar registro de BD
    await pool.query('DELETE FROM archivos_proyecto WHERE id = $1', [req.params.archivoId]);
    
    res.json({ message: 'Archivo eliminado correctamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ==================== GESTIÓN DE ALERTAS ====================

exports.getProjectAlertas = async (req, res) => {
  try {
    const pool = require('../db');
    const result = await pool.query(
      'SELECT * FROM alertas_proyecto WHERE proyecto_id = $1 ORDER BY fecha_generacion DESC',
      [req.params.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.resolverAlerta = async (req, res) => {
  try {
    const pool = require('../db');
    const { alertaId } = req.params;
    const { notas_resolucion } = req.body;
    const result = await pool.query(
      `UPDATE alertas_proyecto 
       SET resuelta = true,
           fecha_resolucion = NOW(),
           notas_resolucion = $1
       WHERE id = $2 AND proyecto_id = $3
       RETURNING *`,
      [notas_resolucion, alertaId, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Alerta no encontrada' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ==================== DASHBOARD ====================

exports.getProjectDashboard = async (req, res) => {
  try {
    const pool = require('../db');
    
    // Datos generales del proyecto
    const proyectoRes = await pool.query('SELECT * FROM projects WHERE id = $1', [req.params.id]);
    if (proyectoRes.rows.length === 0) return res.status(404).json({ error: 'Proyecto no encontrado' });
    const proyecto = proyectoRes.rows[0];
    proyecto.equipo = JSON.parse(proyecto.equipo || '[]');
    
    // Hitos
    const hitosRes = await pool.query(
      'SELECT estado, COUNT(*) as cantidad FROM hitos_proyecto WHERE proyecto_id = $1 GROUP BY estado',
      [req.params.id]
    );
    
    // Gastos por categoría
    const gastosRes = await pool.query(
      'SELECT categoria, SUM(monto) as total FROM gastos_proyecto WHERE proyecto_id = $1 AND aprobado = true GROUP BY categoria',
      [req.params.id]
    );
    
    // Alertas activas
    const alertasRes = await pool.query(
      'SELECT nivel, COUNT(*) as cantidad FROM alertas_proyecto WHERE proyecto_id = $1 AND resuelta = false GROUP BY nivel',
      [req.params.id]
    );
    
    // Archivos por categoría
    const archivosRes = await pool.query(
      'SELECT categoria, COUNT(*) as cantidad FROM archivos_proyecto WHERE proyecto_id = $1 GROUP BY categoria',
      [req.params.id]
    );
    
    res.json({
      proyecto,
      hitos: hitosRes.rows,
      gastos: gastosRes.rows,
      alertas: alertasRes.rows,
      archivos: archivosRes.rows
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};