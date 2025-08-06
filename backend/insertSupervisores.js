// Script para insertar usuarios supervisores de ejemplo
// Ejecutar con: node insertSupervisores.js

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();
const User = require('./src/models/User');

// Conectar a MongoDB usando la misma URI que el backend
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/arquitectura-tarapaca';

mongoose.connect(MONGODB_URI)
.then(() => console.log('✅ Conectado a MongoDB'))
.catch(err => console.error('❌ Error conectando a MongoDB:', err));

const supervisoresEjemplo = [
  {
    nombre: 'Mónica Rodríguez',
    email: 'monica.rodriguez@aceleratarapaka.cl',
    rol: 'supervisor',
    password: 'supervisor123'
  },
  {
    nombre: 'Cecilia García',
    email: 'cecilia.garcia@aceleratarapaka.cl',
    rol: 'supervisor',
    password: 'supervisor123'
  },
  {
    nombre: 'Carlos Marcoleta',
    email: 'carlos.marcoleta@aceleratarapaka.cl',
    rol: 'administrador',
    password: 'admin123'
  },
  {
    nombre: 'José Miguel Astudillo',
    email: 'jose.astudillo@aceleratarapaka.cl',
    rol: 'coordinador de especialidades',
    password: 'coordinador123'
  }
];

async function insertSupervisores() {
  try {
    // Verificar si ya existen usuarios
    const existingUsers = await User.find({ rol: { $in: ['supervisor', 'administrador', 'coordinador de especialidades'] } });
    
    if (existingUsers.length > 0) {
      console.log('🟡 Ya existen supervisores en la base de datos:');
      existingUsers.forEach(user => {
        console.log(`   - ${user.nombre} (${user.rol})`);
      });
      process.exit(0);
    }

    console.log('🚀 Insertando usuarios supervisores...');

    for (const supervisorData of supervisoresEjemplo) {
      const { nombre, email, rol, password } = supervisorData;
      
      // Encriptar contraseña
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      // Crear usuario
      const newUser = new User({
        nombre,
        email,
        rol,
        passwordHash
      });

      await newUser.save();
      console.log(`✅ Usuario creado: ${nombre} (${rol})`);
    }

    console.log('🎉 Todos los supervisores han sido insertados exitosamente');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error insertando supervisores:', error);
    process.exit(1);
  }
}

// Ejecutar la función
insertSupervisores();
