const mongoose = require('mongoose');

const ordenCompraSchema = new mongoose.Schema({
  // Relación con proyecto y cotización
  proyectoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  cotizacionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cotizacion' },
  
  // Información básica de la orden
  numeroOrden: { type: String, unique: true },
  comprador: { type: String, required: true },
  fecha: { type: Date, default: Date.now },
  proveedor: { type: String, required: true },
  proveedorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Provider' },
  
  // Estado y moneda
  estado: { 
    type: String, 
    enum: ['Pendiente', 'Aprobada', 'En proceso', 'Recibida', 'Cancelada'], 
    default: 'Pendiente' 
  },
  moneda: { type: String, default: 'CLP' },
  conversionRate: { type: Number, default: 1 },
  
  // Montos
  montoBruto: { type: Number, required: true },
  descuento: { type: Number, default: 0 },
  impuestos: { type: Number, default: 0 },
  montoNeto: { type: Number },
  
  // Tipo y detalles
  tipoOrden: { 
    type: String, 
    enum: ['Materiales', 'Servicios', 'Equipos', 'Otros'], 
    default: 'Materiales' 
  },
  
  // Fechas importantes
  fechaEntregaEstimada: { type: Date },
  fechaEntregaReal: { type: Date },
  
  // Observaciones
  observaciones: { type: String },
  condicionesPago: { type: String },
  
  // Metadatos
  creadoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  creadoEn: { type: Date, default: Date.now },
  actualizadoEn: { type: Date, default: Date.now }
});

// Middleware para calcular monto neto antes de guardar
ordenCompraSchema.pre('save', function(next) {
  this.montoNeto = this.montoBruto - this.descuento + this.impuestos;
  this.actualizadoEn = new Date();
  next();
});

module.exports = mongoose.model('OrdenCompra', ordenCompraSchema);
