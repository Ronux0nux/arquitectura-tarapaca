// Script para insertar usuarios supervisores de ejemplo en SQLite
// Ejecutar con: node insertSupervisores.js

const bcrypt = require('bcrypt');
const Database = require('better-sqlite3');
const db = new Database('data.db');

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
    rol: 'supervisor',
    password: 'admin123'
  },
  {
    nombre: 'Romina Marcoleta',
    email: 'romina.marcoleta@aceleratarapaka.cl',
    rol: 'administrador',
    password: 'admin123'
  },
  {
    nombre: 'José Miguel Astudillo',
    email: 'jose.astudillo@aceleratarapaka.cl',
    rol: 'supervisor',
    password: 'supervisor123'
  }
];

function insertSupervisores() {
  // Crear tabla si no existe
  db.prepare(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT,
    email TEXT,
    rol TEXT,
    password TEXT
  )`).run();

  // Verificar si ya existen supervisores
  const existing = db.prepare("SELECT COUNT(*) as count FROM users WHERE rol IN ('supervisor','administrador','coordinador de especialidades')").get();
  if (existing.count > 0) {
    console.log('🟡 Ya existen supervisores en la base de datos SQLite.');
    return;
  }

  const supervisores = [
    { nombre: 'Monica Rodriguez', email: 'monica.rodriguez@aceleratarapaka.cl', rol: 'supervisor', password: 'supervisor123' },
    { nombre: 'Cecilia Garcia', email: 'cecilia.garcia@aceleratarapaka.cl', rol: 'supervisor', password: 'supervisor123' },
    { nombre: 'Carlos Marcoleta', email: 'carlos.marcoleta@aceleratarapaka.cl', rol: 'supervisor', password: 'supervisor123' },
    { nombre: 'Jose Miguel Astudillo', email: 'arq@aceleratarapaka.cl', rol: 'coordinador', password: 'coordinador123' }
  ];

  for (const s of supervisores) {
    const hash = bcrypt.hashSync(s.password, 10);
    db.prepare('INSERT INTO users (nombre, email, rol, password) VALUES (?, ?, ?, ?)').run(s.nombre, s.email, s.rol, hash);
    console.log(`Insertado: ${s.nombre}`);
  }
  console.log('🎉 Todos los supervisores han sido insertados exitosamente en SQLite');
}

insertSupervisores();
