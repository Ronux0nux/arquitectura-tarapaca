// Ejemplo básico de conexión y uso de SQLite con better-sqlite3
const Database = require('better-sqlite3');

// Crea o abre la base de datos local (archivo: data.db)
const db = new Database('data.db');

// Crea una tabla de ejemplo si no existe
const createTable = `CREATE TABLE IF NOT EXISTS proveedores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL,
  contacto TEXT
);`;
db.exec(createTable);

// Inserta un proveedor de ejemplo
const insert = db.prepare('INSERT INTO proveedores (nombre, contacto) VALUES (?, ?)');
insert.run('Proveedor Ejemplo', 'contacto@ejemplo.com');

// Consulta todos los proveedores
const proveedores = db.prepare('SELECT * FROM proveedores').all();
console.log('Proveedores:', proveedores);

// Cierra la base de datos
// db.close(); // Descomenta si quieres cerrar la conexión al final
