const XLSX = require('xlsx');
const fs = require('fs');
const OrdenCompra = require('../models/OrdenCompra');
const Cotizacion = require('../models/Cotizacion');
const Project = require('../models/Project');

// Subir órdenes de compra desde Excel
exports.uploadOrdenCompra = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se subió ningún archivo' });
    }

    const workbook = XLSX.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const sheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    for (const row of sheet) {
      await OrdenCompra.create({
        comprador: row["comprador"],
        fecha: new Date(row["fecha"]),
        proveedor: row["proveedor"],
        estado: row["estado"] || 'Pendiente',
        moneda: row["monedaOC"] || 'CLP',
        conversionRate: parseFloat(row["conversionrate"]) || 1,
        montoBruto: parseFloat(row["montooc_bruto"]) || 0,
        tipoOrden: row["tipoorden"] || 'Materiales'
      });
    }

    fs.unlinkSync(req.file.path);

    res.json({ message: 'Órdenes de compra cargadas exitosamente', rows: sheet.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Obtener todas las órdenes de compra
exports.getOrdenesCompra = async (req, res) => {
  try {
    const ordenes = await OrdenCompra.find()
      .populate('proyectoId', 'nombre codigo')
      .populate('cotizacionId')
      .populate('proveedorId', 'nombre contacto')
      .populate('creadoPor', 'nombre email')
      .sort({ creadoEn: -1 });
    res.json(ordenes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Obtener órdenes de compra por proyecto
exports.getOrdenesCompraByProject = async (req, res) => {
  try {
    const { proyectoId } = req.params;
    const ordenes = await OrdenCompra.find({ proyectoId })
      .populate('cotizacionId')
      .populate('proveedorId', 'nombre contacto')
      .populate('creadoPor', 'nombre email')
      .sort({ creadoEn: -1 });
    
    // Calcular resumen
    const resumen = {
      total: ordenes.length,
      pendientes: ordenes.filter(o => o.estado === 'Pendiente').length,
      aprobadas: ordenes.filter(o => o.estado === 'Aprobada').length,
      recibidas: ordenes.filter(o => o.estado === 'Recibida').length,
      montoTotal: ordenes.reduce((sum, o) => sum + o.montoNeto, 0)
    };
    
    res.json({ ordenes, resumen });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Crear nueva orden de compra
exports.createOrdenCompra = async (req, res) => {
  try {
    const {
      proyectoId, cotizacionId, numeroOrden, comprador, proveedor, proveedorId,
      montoBruto, descuento, impuestos, tipoOrden, fechaEntregaEstimada,
      observaciones, condicionesPago, creadoPor
    } = req.body;

    // Verificar que el proyecto existe
    const proyecto = await Project.findById(proyectoId);
    if (!proyecto) {
      return res.status(404).json({ error: 'Proyecto no encontrado' });
    }

    // Si se basa en una cotización, actualizar su estado
    if (cotizacionId) {
      await Cotizacion.findByIdAndUpdate(cotizacionId, { estado: 'Comprada' });
    }

    const newOrden = new OrdenCompra({
      proyectoId, cotizacionId, numeroOrden, comprador, proveedor, proveedorId,
      montoBruto, descuento, impuestos, tipoOrden, fechaEntregaEstimada,
      observaciones, condicionesPago, creadoPor
    });

    await newOrden.save();
    
    // Poblar los datos antes de enviar la respuesta
    await newOrden.populate([
      { path: 'proyectoId', select: 'nombre codigo' },
      { path: 'cotizacionId' },
      { path: 'proveedorId', select: 'nombre contacto' },
      { path: 'creadoPor', select: 'nombre email' }
    ]);

    res.status(201).json(newOrden);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Crear orden de compra desde cotización
exports.createOrdenFromCotizacion = async (req, res) => {
  try {
    const { cotizacionId } = req.params;
    const { numeroOrden, comprador, fechaEntregaEstimada, observaciones, condicionesPago, creadoPor } = req.body;

    const cotizacion = await Cotizacion.findById(cotizacionId).populate('proveedorId');
    if (!cotizacion) {
      return res.status(404).json({ error: 'Cotización no encontrada' });
    }

    if (cotizacion.estado !== 'Aprobada') {
      return res.status(400).json({ error: 'La cotización debe estar aprobada para generar una orden de compra' });
    }

    const newOrden = new OrdenCompra({
      proyectoId: cotizacion.proyectoId,
      cotizacionId: cotizacion._id,
      numeroOrden,
      comprador,
      proveedor: cotizacion.proveedorId.nombre,
      proveedorId: cotizacion.proveedorId._id,
      montoBruto: cotizacion.cantidad * cotizacion.precioUnitario,
      tipoOrden: 'Materiales',
      fechaEntregaEstimada,
      observaciones: observaciones || cotizacion.observaciones,
      condicionesPago,
      creadoPor
    });

    await newOrden.save();
    
    // Actualizar estado de la cotización
    await Cotizacion.findByIdAndUpdate(cotizacionId, { estado: 'Comprada' });

    await newOrden.populate([
      { path: 'proyectoId', select: 'nombre codigo' },
      { path: 'cotizacionId' },
      { path: 'proveedorId', select: 'nombre contacto' }
    ]);

    res.status(201).json(newOrden);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Obtener orden de compra por ID
exports.getOrdenCompraById = async (req, res) => {
  try {
    const orden = await OrdenCompra.findById(req.params.id)
      .populate('proyectoId', 'nombre codigo')
      .populate('cotizacionId')
      .populate('proveedorId', 'nombre contacto')
      .populate('creadoPor', 'nombre email');
    
    if (!orden) {
      return res.status(404).json({ error: 'Orden de compra no encontrada' });
    }
    
    res.json(orden);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Actualizar orden de compra
exports.updateOrdenCompra = async (req, res) => {
  try {
    const updatedOrden = await OrdenCompra.findByIdAndUpdate(
      req.params.id,
      { ...req.body, actualizadoEn: new Date() },
      { new: true }
    ).populate([
      { path: 'proyectoId', select: 'nombre codigo' },
      { path: 'cotizacionId' },
      { path: 'proveedorId', select: 'nombre contacto' }
    ]);
    
    if (!updatedOrden) {
      return res.status(404).json({ error: 'Orden de compra no encontrada' });
    }
    
    res.json(updatedOrden);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Marcar orden como recibida
exports.marcarComoRecibida = async (req, res) => {
  try {
    const { fechaEntregaReal, observaciones } = req.body;
    
    const orden = await OrdenCompra.findByIdAndUpdate(
      req.params.id,
      { 
        estado: 'Recibida',
        fechaEntregaReal: fechaEntregaReal || new Date(),
        observaciones: observaciones || orden.observaciones,
        actualizadoEn: new Date()
      },
      { new: true }
    ).populate([
      { path: 'proyectoId', select: 'nombre codigo' },
      { path: 'proveedorId', select: 'nombre contacto' }
    ]);
    
    if (!orden) {
      return res.status(404).json({ error: 'Orden de compra no encontrada' });
    }
    
    res.json({ message: 'Orden marcada como recibida', orden });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Eliminar orden de compra
exports.deleteOrdenCompra = async (req, res) => {
  try {
    const orden = await OrdenCompra.findByIdAndDelete(req.params.id);
    if (!orden) {
      return res.status(404).json({ error: 'Orden de compra no encontrada' });
    }
    
    // Si había una cotización asociada, cambiar su estado de vuelta a Aprobada
    if (orden.cotizacionId) {
      await Cotizacion.findByIdAndUpdate(orden.cotizacionId, { estado: 'Aprobada' });
    }
    
    res.json({ message: 'Orden de compra eliminada exitosamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
