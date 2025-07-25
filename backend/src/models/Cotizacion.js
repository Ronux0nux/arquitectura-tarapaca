const mongoose = require('mongoose');

const cotizacionSchema = new mongoose.Schema({
  proyectoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  insumoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Insumo' },
  partidaId: { type: String }, // Para partidas específicas del proyecto
  proveedorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Provider', required: true },
  
  // Detalles del material/insumo
  nombreMaterial: { type: String, required: true },
  unidad: { type: String, required: true },
  cantidad: { type: Number, required: true },
  precioUnitario: { type: Number, required: true },
  
  // Información adicional
  fechaCotizacion: { type: Date, default: Date.now },
  validezOferta: { type: Date }, // Hasta cuándo es válida la cotización
  estado: { 
    type: String, 
    enum: ['Pendiente', 'Aprobada', 'Rechazada', 'Comprada'], 
    default: 'Pendiente' 
  },
  detalles: { type: String },
  observaciones: { type: String },
  
  // Metadatos
  creadoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  creadoEn: { type: Date, default: Date.now },
  actualizadoEn: { type: Date, default: Date.now }
});

// Calcular precio total antes de guardar
cotizacionSchema.virtual('precioTotal').get(function() {
  return this.cantidad * this.precioUnitario;
});

// Asegurar que las virtuals se incluyan en JSON
cotizacionSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Cotizacion', cotizacionSchema);
