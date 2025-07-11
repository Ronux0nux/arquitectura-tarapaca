const mongoose = require('mongoose');

const participanteSchema = new mongoose.Schema({
  nombre: { 
    type: String, 
    required: true 
  },
  apellido: { 
    type: String, 
    required: true 
  },
  entidad: { 
    type: String, 
    required: true 
  },
  cargo: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    required: true 
  },
  telefono: { 
    type: String, 
    required: true 
  }
});

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
  lugar: { 
    type: String, 
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
  asistencia: [participanteSchema],
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
