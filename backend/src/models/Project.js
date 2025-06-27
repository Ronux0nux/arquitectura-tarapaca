const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  codigo: { type: String, required: true, unique: true },
  estado: { 
    type: String, 
    enum: ['Planificación', 'En ejecución', 'Finalizado'], 
    default: 'Planificación' 
  },
  fechaInicio: { type: Date, required: true },
  fechaTermino: { type: Date, required: true },
  subjefe: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  equipo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  ubicacion: { type: String },
  descripcion: { type: String },
  archivoCotizacion: { type: String }, // Ruta al archivo Excel si se sube
  creadoEn: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Project', projectSchema);
