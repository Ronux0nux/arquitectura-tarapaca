const mongoose = require('mongoose');

const cotizacionSchema = new mongoose.Schema({
  proyectoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  partidaId: { type: String }, // O puedes usar ObjectId si relacionas a otra colección
  proveedorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Provider' },
  precioUnitario: Number,
  detalles: String
});

module.exports = mongoose.model('Cotizacion', cotizacionSchema);
