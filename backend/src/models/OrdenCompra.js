const mongoose = require('mongoose');

const ordenCompraSchema = new mongoose.Schema({
  comprador: String,
  fecha: String,
  proveedor: String,
  estado: String,
  moneda: String,
  conversionRate: Number,
  montoBruto: Number,
  tipoOrden: String
});

module.exports = mongoose.model('OrdenCompra', ordenCompraSchema);
