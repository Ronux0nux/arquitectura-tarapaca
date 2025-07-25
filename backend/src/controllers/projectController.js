const Project = require('../models/Project');
const Cotizacion = require('../models/Cotizacion');
const OrdenCompra = require('../models/OrdenCompra');

// Obtener todos los proyectos
exports.getProjects = async (req, res) => {
  try {
    const projects = await Project.find().populate('equipo').populate('subencargado');
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Buscar proyectos con filtros
exports.searchProjects = async (req, res) => {
  try {
    const { id, nombre, codigo, fechaInicio, fechaTermino } = req.query;
    let query = {};

    // Buscar por ID
    if (id) {
      query._id = id;
    }

    // Buscar por nombre (búsqueda parcial, insensible a mayúsculas)
    if (nombre) {
      query.nombre = { $regex: nombre, $options: 'i' };
    }

    // Buscar por código (búsqueda parcial, insensible a mayúsculas)
    if (codigo) {
      query.codigo = { $regex: codigo, $options: 'i' };
    }

    // Buscar por fecha de inicio
    if (fechaInicio) {
      query.fechaInicio = { $gte: new Date(fechaInicio) };
    }

    // Buscar por fecha de término
    if (fechaTermino) {
      query.fechaTermino = { $lte: new Date(fechaTermino) };
    }

    const projects = await Project.find(query).populate('equipo').populate('subencargado');
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Crear nuevo proyecto
exports.createProject = async (req, res) => {
  try {
    const nuevoProyecto = new Project(req.body);
    await nuevoProyecto.save();
    res.status(201).json(nuevoProyecto);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener un proyecto por ID
exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate('equipo').populate('partidasApu.insumos.insumoId');
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
    const actualizado = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(actualizado);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Eliminar proyecto
exports.deleteProject = async (req, res) => {
  try {
    await Project.findByIdAndDelete(req.params.id);
    res.json({ mensaje: 'Proyecto eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};