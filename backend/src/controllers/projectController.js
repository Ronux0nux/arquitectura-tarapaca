const Project = require('../models/Project');
const Cotizacion = require('../models/Cotizacion');
const OrdenCompra = require('../models/OrdenCompra');

// Obtener todos los proyectos
exports.getProjects = (req, res) => {
  try {
    const projects = Project.findAll();
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
exports.createProject = (req, res) => {
  try {
    const result = Project.create(req.body);
    res.status(201).json({ id: result.lastInsertRowid, ...req.body });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener un proyecto por ID
exports.getProjectById = (req, res) => {
  try {
    const project = Project.findById(req.params.id);
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
exports.updateProject = (req, res) => {
  try {
    const stmt = Project.db.prepare(`UPDATE projects SET nombre = ?, codigo = ?, estado = ?, fechaInicio = ?, fechaTermino = ?, subencargado = ?, equipo = ?, ubicacion = ?, descripcion = ?, archivoCotizacion = ? WHERE id = ?`);
    stmt.run(req.body.nombre, req.body.codigo, req.body.estado, req.body.fechaInicio, req.body.fechaTermino, req.body.subencargado, JSON.stringify(req.body.equipo || []), req.body.ubicacion, req.body.descripcion, req.body.archivoCotizacion, req.params.id);
    const actualizado = Project.findById(req.params.id);
    res.json(actualizado);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Eliminar proyecto
exports.deleteProject = (req, res) => {
  try {
    const stmt = Project.db.prepare(`DELETE FROM projects WHERE id = ?`);
    stmt.run(req.params.id);
    res.json({ mensaje: 'Proyecto eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};