const mongoose = require('mongoose');

const insumoSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  unidad: String,
  precioActual: Number,
  precioReferencia: Number, // Precio de referencia para comparación
  proveedorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Provider' }
});

module.exports = mongoose.model('Insumo', insumoSchema);
