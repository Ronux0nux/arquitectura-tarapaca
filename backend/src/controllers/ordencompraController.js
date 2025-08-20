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
exports.getOrdenesCompra = (req, res) => {
  try {
    const ordenes = OrdenCompra.findAll();
    res.json(ordenes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Obtener órdenes de compra por proyecto
exports.getOrdenesCompraByProject = (req, res) => {
  try {
    const { proyectoId } = req.params;
    const ordenes = OrdenCompra.findAll().filter(o => o.proyectoId == proyectoId);
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
exports.createOrdenCompra = (req, res) => {
  try {
    const result = OrdenCompra.create(req.body);
    res.status(201).json({ id: result.lastInsertRowid, ...req.body });
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
exports.getOrdenCompraById = (req, res) => {
  try {
    const orden = OrdenCompra.findById(req.params.id);
    if (!orden) {
      return res.status(404).json({ error: 'Orden de compra no encontrada' });
    }
    res.json(orden);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Actualizar orden de compra
exports.updateOrdenCompra = (req, res) => {
  try {
    const stmt = OrdenCompra.db.prepare(`UPDATE ordenes_compra SET proyectoId = ?, cotizacionId = ?, numeroOrden = ?, comprador = ?, proveedor = ?, proveedorId = ?, estado = ?, moneda = ?, conversionRate = ?, montoBruto = ?, descuento = ?, impuestos = ?, montoNeto = ?, tipoOrden = ?, fechaEntregaEstimada = ?, fechaEntregaReal = ?, observaciones = ?, condicionesPago = ?, creadoPor = ?, actualizadoEn = datetime('now') WHERE id = ?`);
    const montoNeto = (req.body.montoBruto || 0) - (req.body.descuento || 0) + (req.body.impuestos || 0);
    stmt.run(req.body.proyectoId, req.body.cotizacionId, req.body.numeroOrden, req.body.comprador, req.body.proveedor, req.body.proveedorId, req.body.estado, req.body.moneda, req.body.conversionRate, req.body.montoBruto, req.body.descuento, req.body.impuestos, montoNeto, req.body.tipoOrden, req.body.fechaEntregaEstimada, req.body.fechaEntregaReal, req.body.observaciones, req.body.condicionesPago, req.body.creadoPor, req.params.id);
    const updated = OrdenCompra.findById(req.params.id);
    if (!updated) {
      return res.status(404).json({ error: 'Orden de compra no encontrada' });
    }
    res.json(updated);
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
exports.deleteOrdenCompra = (req, res) => {
  try {
    const stmt = OrdenCompra.db.prepare(`DELETE FROM ordenes_compra WHERE id = ?`);
    stmt.run(req.params.id);
    res.json({ message: 'Orden de compra eliminada exitosamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
