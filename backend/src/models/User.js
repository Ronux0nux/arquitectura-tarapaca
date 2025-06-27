const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  rol: { type: String, enum: ['Admin', 'Coordinador', 'Especialistas'], default: 'Especialista' },
  passwordHash: { type: String, required: true },
  proyectos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Project' }],
  fechaRegistro: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', userSchema);
