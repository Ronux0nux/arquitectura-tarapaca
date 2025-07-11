const mongoose = require('mongoose');

const actaReunionSchema = new mongoose.Schema({
  proyectoId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Project', 
    required: true 
  },
  entidad: { 
    type: String, 
    required: true 
  },
  fecha: { 
    type: Date, 
    required: true 
  },
  horaInicio: { 
    type: String, 
    required: true 
  },
  horaTermino: { 
    type: String, 
    required: true 
  },
  objetivoReunion: { 
    type: String, 
    required: true 
  },
  temasTratados: { 
    type: String, 
    required: true 
  },
  acuerdos: { 
    type: String, 
    required: true 
  },
  participantes: [{ 
    type: String 
  }],
  creadoPor: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  fechaCreacion: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('ActaReunion', actaReunionSchema);
