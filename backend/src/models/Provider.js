// models/Provider.js

const mongoose = require('mongoose');

const providerSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  rut: { type: String },
  direccion: { type: String },
  telefono: { type: String },
  email: { type: String },
  sitioWeb: { type: String },
  rubros: [{ type: String }], 
  fechaRegistro: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Provider', providerSchema);
